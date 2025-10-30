import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import DAFModule, { AudioDeviceInfo, DAF_EVENTS, DAFConfiguration, dafEventEmitter } from '../native-modules/DAFModule';

export interface UseDAFReturn {
  isDAFActive: boolean;
  isHeadphoneConnected: boolean;
  audioDeviceInfo: AudioDeviceInfo | null;
  isLoading: boolean;
  error: string | null;
  startDAF: (config: DAFConfiguration) => Promise<boolean>;
  stopDAF: () => Promise<boolean>;
  checkHeadphoneConnection: () => Promise<AudioDeviceInfo | null>;
  requestPermissions: () => Promise<boolean>;
  updateConfig: (config: Partial<DAFConfiguration>) => Promise<boolean>;
}

export const useDAF = (): UseDAFReturn => {
  const [isDAFActive, setIsDAFActive] = useState(false);
  const [isHeadphoneConnected, setIsHeadphoneConnected] = useState(false);
  const [audioDeviceInfo, setAudioDeviceInfo] = useState<AudioDeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check headphone connection
  const checkHeadphoneConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const deviceInfo = await DAFModule.checkHeadphoneConnection();
      setAudioDeviceInfo(deviceInfo);
      setIsHeadphoneConnected(deviceInfo.isHeadphoneConnected);
      
      return deviceInfo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check headphone connection';
      setError(errorMessage);
      console.error('Error checking headphone connection:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request audio permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const granted = await DAFModule.requestAudioPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Audio recording permission is required for delayed auditory feedback. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
      }
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      console.error('Error requesting permissions:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start DAF with configuration
  const startDAF = useCallback(async (config: DAFConfiguration): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // First check if headphones are connected
      const deviceInfo = await checkHeadphoneConnection();
      if (!deviceInfo?.isHeadphoneConnected) {
        Alert.alert(
          'Headphones Required',
          'External headphones are required for delayed auditory feedback to prevent audio feedback loops. Please connect your headphones and try again.',
          [
            { text: 'Check Again', onPress: checkHeadphoneConnection },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return false;
      }

      // Request permissions if needed
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        return false;
      }

      // Initialize DAF
      const initialized = await DAFModule.initializeDAF(config);
      if (!initialized) {
        throw new Error('Failed to initialize DAF');
      }

      // Start DAF
      const started = await DAFModule.startDAF();
      if (started) {
        setIsDAFActive(true);
        return true;
      } else {
        throw new Error('Failed to start DAF');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start DAF';
      setError(errorMessage);
      console.error('Error starting DAF:', err);
      
      Alert.alert(
        'DAF Error',
        errorMessage,
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkHeadphoneConnection, requestPermissions]);

  // Stop DAF
  const stopDAF = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const stopped = await DAFModule.stopDAF();
      if (stopped) {
        setIsDAFActive(false);
        return true;
      } else {
        throw new Error('Failed to stop DAF');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop DAF';
      setError(errorMessage);
      console.error('Error stopping DAF:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Live update configuration while active
  const updateConfig = useCallback(async (config: Partial<DAFConfiguration>): Promise<boolean> => {
    try {
      if (!isDAFActive) return true; // No-op if not active
      setIsLoading(true);
      setError(null);
      const updated = await DAFModule.updateDAFConfig(config);
      return !!updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update DAF config';
      setError(errorMessage);
      console.error('Error updating DAF config:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isDAFActive]);

  // Set up event listeners
  useEffect(() => {
    const deviceChangedListener = dafEventEmitter.addListener(
      DAF_EVENTS.AUDIO_DEVICE_CHANGED,
      (deviceInfo: AudioDeviceInfo) => {
        setAudioDeviceInfo(deviceInfo);
        setIsHeadphoneConnected(deviceInfo.isHeadphoneConnected);
        
        // If headphones are disconnected while DAF is active, show warning
        if (isDAFActive && !deviceInfo.isHeadphoneConnected) {
          Alert.alert(
            'Headphones Disconnected',
            'Your headphones have been disconnected. DAF will continue but may cause audio feedback.',
            [
              { text: 'Stop DAF', onPress: stopDAF },
              { text: 'Continue', style: 'cancel' }
            ]
          );
        }
      }
    );

    const dafStateListener = dafEventEmitter.addListener(
      DAF_EVENTS.DAF_STATE_CHANGED,
      (active: boolean) => {
        setIsDAFActive(active);
      }
    );

    const permissionListener = dafEventEmitter.addListener(
      DAF_EVENTS.PERMISSION_CHANGED,
      (granted: boolean) => {
        if (!granted && isDAFActive) {
          Alert.alert(
            'Permission Revoked',
            'Audio recording permission has been revoked. DAF will stop.',
            [{ text: 'OK', onPress: stopDAF }]
          );
        }
      }
    );

    // Initial check
    checkHeadphoneConnection();

    return () => {
      deviceChangedListener.remove();
      dafStateListener.remove();
      permissionListener.remove();
    };
  }, [isDAFActive, checkHeadphoneConnection, stopDAF]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isDAFActive) {
        // Fire and forget
        DAFModule.stopDAF().catch(() => {});
      }
    };
  }, [isDAFActive]);

  return {
    isDAFActive,
    isHeadphoneConnected,
    audioDeviceInfo,
    isLoading,
    error,
    startDAF,
    stopDAF,
    checkHeadphoneConnection,
    requestPermissions,
    updateConfig,
  };
};
