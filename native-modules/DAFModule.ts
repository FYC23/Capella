// import { NativeEventEmitter, NativeModules } from 'react-native';
// Commented out native module imports for mock implementation

export interface DAFConfiguration {
  delayTime: number; // milliseconds
  pitchShift: number; // semitones
  volume: number; // 0.0 to 1.0
}

export interface AudioDeviceInfo {
  isHeadphoneConnected: boolean;
  deviceType: 'headphone' | 'speaker' | 'bluetooth' | 'unknown';
  deviceName?: string;
}

export interface DAFModuleInterface {
  // Check if external headphones are connected
  checkHeadphoneConnection(): Promise<AudioDeviceInfo>;
  
  // Request audio permissions
  requestAudioPermissions(): Promise<boolean>;
  
  // Initialize DAF with configuration
  initializeDAF(config: DAFConfiguration): Promise<boolean>;
  
  // Start DAF processing
  startDAF(): Promise<boolean>;
  
  // Stop DAF processing
  stopDAF(): Promise<boolean>;
  
  // Update DAF configuration
  updateDAFConfig(config: Partial<DAFConfiguration>): Promise<boolean>;
  
  // Check if DAF is currently active
  isDAFActive(): Promise<boolean>;
  
  // Get current audio device info
  getCurrentAudioDevice(): Promise<AudioDeviceInfo>;
}

// Mock implementation for development
class MockDAFModule implements DAFModuleInterface {
  private isActive = false;
  private currentConfig: DAFConfiguration | null = null;
  private eventEmitter: any; // Mock event emitter
  private mockHeadphoneConnected = false; // Manual toggle for testing

  constructor() {
    // Mock event emitter that doesn't rely on native modules
    this.eventEmitter = {
      addListener: (eventName: string, callback: Function) => ({
        remove: () => console.log(`Removed listener for ${eventName}`)
      }),
      emit: (eventName: string, data: any) => {
        console.log(`Mock event emitted: ${eventName}`, data);
      }
    };
  }

  // Method to manually toggle headphone state for testing
  setMockHeadphoneState(connected: boolean) {
    this.mockHeadphoneConnected = connected;
    console.log(`Mock headphone state set to: ${connected ? 'connected' : 'disconnected'}`);
  }

  async checkHeadphoneConnection(): Promise<AudioDeviceInfo> {
    // Mock implementation - use manual toggle state
    // In real implementation, this would check actual audio routing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isHeadphoneConnected: this.mockHeadphoneConnected,
          deviceType: this.mockHeadphoneConnected ? 'headphone' : 'speaker',
          deviceName: this.mockHeadphoneConnected ? 'Mock Headphones' : undefined,
        });
      }, 500);
    });
  }

  async requestAudioPermissions(): Promise<boolean> {
    // Simulate permission request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Mock: always grant permission
      }, 300);
    });
  }

  async initializeDAF(config: DAFConfiguration): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentConfig = config;
        console.log('DAF initialized with config:', config);
        resolve(true);
      }, 200);
    });
  }

  async startDAF(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isActive = true;
        console.log('DAF started');
        // Emit state change event
        this.eventEmitter.emit('dafStateChanged', true);
        resolve(true);
      }, 300);
    });
  }

  async stopDAF(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isActive = false;
        console.log('DAF stopped');
        // Emit state change event
        this.eventEmitter.emit('dafStateChanged', false);
        resolve(true);
      }, 200);
    });
  }

  async updateDAFConfig(config: Partial<DAFConfiguration>): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.currentConfig) {
          this.currentConfig = { ...this.currentConfig, ...config };
          console.log('DAF config updated:', this.currentConfig);
        }
        resolve(true);
      }, 100);
    });
  }

  async isDAFActive(): Promise<boolean> {
    return Promise.resolve(this.isActive);
  }

  async getCurrentAudioDevice(): Promise<AudioDeviceInfo> {
    return this.checkHeadphoneConnection();
  }
}

// Use mock implementation if native module is not available
// const DAFModule = NativeModules.DAFModule || new MockDAFModule();
const DAFModule = new MockDAFModule(); // Force mock implementation for now

// Event emitter for audio device changes
// export const dafEventEmitter = new NativeEventEmitter(DAFModule);
// Mock event emitter that doesn't rely on native modules
export const dafEventEmitter = {
  addListener: (eventName: string, callback: Function) => ({
    remove: () => console.log(`Removed listener for ${eventName}`)
  }),
  emit: (eventName: string, data: any) => {
    console.log(`Mock event emitted: ${eventName}`, data);
  }
};

// Export the module with proper typing
const dafModule = DAFModule as DAFModuleInterface;

// Add debug method for testing
(dafModule as any).setMockHeadphoneState = (connected: boolean) => {
  (DAFModule as any).setMockHeadphoneState(connected);
};

export default dafModule;

// Event types
export const DAF_EVENTS = {
  AUDIO_DEVICE_CHANGED: 'audioDeviceChanged',
  DAF_STATE_CHANGED: 'dafStateChanged',
  PERMISSION_CHANGED: 'permissionChanged',
} as const;