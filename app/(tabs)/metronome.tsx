import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import bleModule, { DiscoveredDevice } from '@/native-modules/BLEModule';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected';

export default function MetronomeScreen() {
  const { t } = useTranslation();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<DiscoveredDevice | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [sendingValue, setSendingValue] = useState(false);

  // Check permissions and Bluetooth state on mount
  useEffect(() => {
    const init = async () => {
      const perms = await bleModule.requestPermissions();
      setPermissionsGranted(perms);

      if (perms) {
        const enabled = await bleModule.isBluetoothEnabled();
        setBluetoothEnabled(enabled);
      }
    };
    init();

    // Cleanup on unmount
    return () => {
      bleModule.stopScan();
    };
  }, []);

  const handleDeviceFound = useCallback((device: DiscoveredDevice) => {
    setDevices((prev) => {
      // Avoid duplicates
      if (prev.find((d) => d.id === device.id)) {
        return prev;
      }
      return [...prev, device];
    });
  }, []);

  const startScanning = async () => {
    if (!permissionsGranted) {
      const perms = await bleModule.requestPermissions();
      setPermissionsGranted(perms);
      if (!perms) return;
    }

    const enabled = await bleModule.isBluetoothEnabled();
    setBluetoothEnabled(enabled);
    if (!enabled) return;

    setDevices([]);
    setConnectionState('scanning');

    try {
      await bleModule.startScan(handleDeviceFound);
    } catch (error) {
      console.error('Scan error:', error);
      setConnectionState('disconnected');
    }
  };

  const stopScanning = () => {
    bleModule.stopScan();
    setConnectionState('disconnected');
  };

  const connectToDevice = async (device: DiscoveredDevice) => {
    setConnectionState('connecting');

    const success = await bleModule.connect(device.id);

    if (success) {
      setConnectionState('connected');
      setConnectedDevice(device);
    } else {
      setConnectionState('disconnected');
    }
  };

  const disconnectDevice = async () => {
    await bleModule.disconnect();
    setConnectionState('disconnected');
    setConnectedDevice(null);
  };

  const sendValue = async () => {
    setSendingValue(true);
    // Device expects value = BPM + 49, except 0 sends 0
    const valueToSend = sliderValue === 0 ? 0 : sliderValue + 49;
    await bleModule.sendValue(valueToSend);
    setSendingValue(false);
  };

  const adjustValue = (delta: number) => {
    setSliderValue((prev) => Math.max(0, Math.min(200, prev + delta)));
  };

  // Render disconnected state with scan button
  const renderDisconnectedState = () => (
    <ThemedView style={styles.stateContainer}>
      <View style={styles.iconContainer}>
        <IconSymbol name="dot.radiowaves.left.and.right" size={64} color="#D1D1D6" />
      </View>
      <ThemedText type="subtitle" style={styles.stateTitle}>
        {t('metronome.notConnected')}
      </ThemedText>
      <ThemedText style={styles.stateSubtitle}>
        {t('metronome.scanDescription')}
      </ThemedText>

      {!bluetoothEnabled && (
        <View style={styles.warningContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF9500" />
          <ThemedText style={styles.warningText}>
            {t('metronome.bluetoothDisabled')}
          </ThemedText>
        </View>
      )}

      {!permissionsGranted && (
        <View style={styles.warningContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF9500" />
          <ThemedText style={styles.warningText}>
            {t('metronome.permissionsRequired')}
          </ThemedText>
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={startScanning}
        activeOpacity={0.7}
      >
        <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
        <ThemedText style={styles.primaryButtonText}>
          {t('metronome.scanForDevices')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  // Render scanning state with device list
  const renderScanningState = () => (
    <ThemedView style={styles.stateContainer}>
      <View style={styles.scanningHeader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <ThemedText type="subtitle" style={styles.scanningTitle}>
          {t('metronome.scanning')}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={stopScanning}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.secondaryButtonText}>
          {t('metronome.stopScanning')}
        </ThemedText>
      </TouchableOpacity>

      {devices.length === 0 ? (
        <ThemedText style={styles.noDevicesText}>
          {t('metronome.searchingForDevices')}
        </ThemedText>
      ) : (
        <View style={styles.deviceList}>
          <ThemedText type="defaultSemiBold" style={styles.deviceListTitle}>
            {t('metronome.foundDevices')}
          </ThemedText>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.deviceItem}
              onPress={() => connectToDevice(device)}
              activeOpacity={0.7}
            >
              <View style={styles.deviceIcon}>
                <IconSymbol name="wave.3.right" size={24} color="#007AFF" />
              </View>
              <View style={styles.deviceInfo}>
                <ThemedText type="defaultSemiBold" style={styles.deviceName}>
                  {device.name}
                </ThemedText>
                <ThemedText style={styles.deviceRssi}>
                  {t('metronome.signalStrength')}: {device.rssi} dBm
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#D1D1D6" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ThemedView>
  );

  // Render connecting state
  const renderConnectingState = () => (
    <ThemedView style={styles.stateContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText type="subtitle" style={styles.connectingText}>
        {t('metronome.connecting')}
      </ThemedText>
    </ThemedView>
  );

  // Render connected state with slider
  const renderConnectedState = () => (
    <ThemedView style={styles.stateContainer}>
      <View style={styles.connectedHeader}>
        <View style={styles.connectedBadge}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
          <ThemedText style={styles.connectedBadgeText}>
            {t('metronome.connected')}
          </ThemedText>
        </View>
      </View>

      <View style={styles.deviceCard}>
        <View style={styles.deviceCardIcon}>
          <IconSymbol name="wave.3.right" size={32} color="#007AFF" />
        </View>
        <ThemedText type="subtitle" style={styles.deviceCardName}>
          {connectedDevice?.name}
        </ThemedText>
      </View>

      <View style={styles.sliderContainer}>
        <ThemedText type="defaultSemiBold" style={styles.sliderLabel}>
          {t('metronome.bpm')}
        </ThemedText>

        <View style={styles.sliderValueContainer}>
          <ThemedText type="title" style={styles.sliderValue}>
            {sliderValue}
          </ThemedText>
        </View>

        <View style={styles.sliderControls}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => adjustValue(-10)}
            activeOpacity={0.7}
          >
            <IconSymbol name="minus" size={24} color="#007AFF" />
          </TouchableOpacity>

          <View style={styles.sliderTrack}>
            <View
              style={[styles.sliderFill, { width: `${(sliderValue / 200) * 100}%` }]}
            />
          </View>

          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => adjustValue(10)}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.sliderLabels}>
          <ThemedText style={styles.sliderMinMax}>0</ThemedText>
          <ThemedText style={styles.sliderMinMax}>200</ThemedText>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, sendingValue && styles.buttonDisabled]}
        onPress={sendValue}
        activeOpacity={0.7}
        disabled={sendingValue}
      >
        {sendingValue ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
            <ThemedText style={styles.primaryButtonText}>
              {t('metronome.sendValue')}
            </ThemedText>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.disconnectButton}
        onPress={disconnectDevice}
        activeOpacity={0.7}
      >
        <IconSymbol name="xmark.circle" size={20} color="#FF3B30" />
        <ThemedText style={styles.disconnectButtonText}>
          {t('metronome.disconnect')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const renderContent = () => {
    switch (connectionState) {
      case 'disconnected':
        return renderDisconnectedState();
      case 'scanning':
        return renderScanningState();
      case 'connecting':
        return renderConnectingState();
      case 'connected':
        return renderConnectedState();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('metronome.title')}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('metronome.subtitle')}
          </ThemedText>
        </ThemedView>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  stateContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  warningText: {
    fontSize: 14,
    color: '#996600',
    marginLeft: 8,
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  scanningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  scanningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  noDevicesText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
  },
  deviceList: {
    width: '100%',
    marginTop: 16,
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 14,
    color: '#8E8E93',
  },
  connectingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 24,
  },
  connectedHeader: {
    marginBottom: 24,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8EC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  connectedBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
  },
  deviceCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
  },
  deviceCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E5F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceCardName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },
  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sliderValue: {
    fontSize: 64,
    lineHeight: 76,
    fontWeight: '700',
    color: '#007AFF',
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sliderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 64,
  },
  sliderMinMax: {
    fontSize: 14,
    color: '#8E8E93',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  disconnectButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

