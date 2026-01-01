import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Characteristic, Device, State } from 'react-native-ble-plx';

export interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number | null;
}

export interface BLEModuleInterface {
  // Request Bluetooth permissions (required on Android)
  requestPermissions(): Promise<boolean>;

  // Check if Bluetooth is powered on
  isBluetoothEnabled(): Promise<boolean>;

  // Start scanning for devices with names starting with "HLK"
  startScan(onDeviceFound: (device: DiscoveredDevice) => void): Promise<void>;

  // Stop scanning
  stopScan(): void;

  // Connect to a device by ID
  connect(deviceId: string): Promise<boolean>;

  // Disconnect from the current device
  disconnect(): Promise<void>;

  // Send a value (0-100) to the connected device
  sendValue(value: number): Promise<boolean>;

  // Get connection status
  isConnected(): boolean;

  // Get connected device info
  getConnectedDevice(): DiscoveredDevice | null;
}

// Real BLE implementation using react-native-ble-plx
// Uses lazy initialization to avoid TurboModule timeout issues
class RealBLEModule implements BLEModuleInterface {
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private writableCharacteristic: Characteristic | null = null;

  // Lazy initialization - only create BleManager when first needed
  private getManager(): BleManager {
    if (!this.manager) {
      console.log('[BLE] Initializing BleManager...');
      this.manager = new BleManager();
    }
    return this.manager;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS permissions are handled via Info.plist
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
        if (Platform.Version >= 31) {
          const scanPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: 'Bluetooth Scan Permission',
              message: 'This app needs Bluetooth scan permission to find nearby devices.',
              buttonPositive: 'OK',
            }
          );
          const connectPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: 'Bluetooth Connect Permission',
              message: 'This app needs Bluetooth connect permission to connect to devices.',
              buttonPositive: 'OK',
            }
          );
          return (
            scanPermission === PermissionsAndroid.RESULTS.GRANTED &&
            connectPermission === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          // Android < 12 requires location permission for BLE scanning
          const locationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs location permission to scan for Bluetooth devices.',
              buttonPositive: 'OK',
            }
          );
          return locationPermission === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }

    return true;
  }

  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.getManager().state();
    return state === State.PoweredOn;
  }

  async startScan(onDeviceFound: (device: DiscoveredDevice) => void): Promise<void> {
    const manager = this.getManager();
    
    // Ensure Bluetooth is on
    const state = await manager.state();
    if (state !== State.PoweredOn) {
      throw new Error('Bluetooth is not powered on');
    }

    // Start scanning for all devices, filter by name prefix
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        return;
      }

      if (device && device.name && device.name.startsWith('HLK')) {
        onDeviceFound({
          id: device.id,
          name: device.name,
          rssi: device.rssi,
        });
      }
    });
  }

  stopScan(): void {
    // Use optional chaining since manager might not be initialized yet
    this.manager?.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      // Stop scanning before connecting
      this.stopScan();

      // Connect to the device
      const device = await this.getManager().connectToDevice(deviceId);
      this.connectedDevice = device;

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      const services = await device.services();

      // Find a writable characteristic
      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          // Check if characteristic is writable
          if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
            this.writableCharacteristic = char;
            console.log(
              `Found writable characteristic: ${char.uuid} in service ${service.uuid}`
            );
            return true;
          }
        }
      }

      console.warn('No writable characteristic found');
      return true; // Connected but no writable characteristic
    } catch (error) {
      console.error('Connection error:', error);
      this.connectedDevice = null;
      this.writableCharacteristic = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      this.connectedDevice = null;
      this.writableCharacteristic = null;
    }
  }

  async sendValue(value: number): Promise<boolean> {
    if (!this.connectedDevice || !this.writableCharacteristic) {
      console.error('Not connected or no writable characteristic');
      return false;
    }

    // Clamp value to 0-100
    const clampedValue = Math.max(0, Math.min(100, Math.round(value)));

    try {
      // Encode value as a single byte in base64 (React Native compatible)
      // btoa() works with strings, so convert the byte to a character first
      const data = btoa(String.fromCharCode(clampedValue));

      if (this.writableCharacteristic.isWritableWithResponse) {
        await this.writableCharacteristic.writeWithResponse(data);
      } else {
        await this.writableCharacteristic.writeWithoutResponse(data);
      }

      console.log(`Sent value: ${clampedValue}`);
      return true;
    } catch (error) {
      console.error('Write error:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  getConnectedDevice(): DiscoveredDevice | null {
    if (!this.connectedDevice) return null;
    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.name || 'Unknown',
      rssi: this.connectedDevice.rssi,
    };
  }
}

// Mock implementation for development/testing
class MockBLEModule implements BLEModuleInterface {
  private connected = false;
  private connectedDeviceInfo: DiscoveredDevice | null = null;
  private scanCallback: ((device: DiscoveredDevice) => void) | null = null;
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;

  async requestPermissions(): Promise<boolean> {
    console.log('[MockBLE] Permissions granted');
    return true;
  }

  async isBluetoothEnabled(): Promise<boolean> {
    console.log('[MockBLE] Bluetooth enabled');
    return true;
  }

  async startScan(onDeviceFound: (device: DiscoveredDevice) => void): Promise<void> {
    console.log('[MockBLE] Starting scan...');
    this.scanCallback = onDeviceFound;

    // Simulate finding devices after a delay
    const mockDevices: DiscoveredDevice[] = [
      { id: 'mock-hlk-001', name: 'HLK-Metronome-A', rssi: -45 },
      { id: 'mock-hlk-002', name: 'HLK-Haptic-B', rssi: -60 },
      { id: 'mock-hlk-003', name: 'HLK-Device-C', rssi: -72 },
    ];

    let index = 0;
    const emitDevice = () => {
      if (index < mockDevices.length && this.scanCallback) {
        this.scanCallback(mockDevices[index]);
        index++;
        this.scanTimeout = setTimeout(emitDevice, 800);
      }
    };

    this.scanTimeout = setTimeout(emitDevice, 500);
  }

  stopScan(): void {
    console.log('[MockBLE] Stopping scan');
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    this.scanCallback = null;
  }

  async connect(deviceId: string): Promise<boolean> {
    console.log(`[MockBLE] Connecting to ${deviceId}...`);
    this.stopScan();

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.connected = true;
    this.connectedDeviceInfo = {
      id: deviceId,
      name: deviceId.includes('001')
        ? 'HLK-Metronome-A'
        : deviceId.includes('002')
        ? 'HLK-Haptic-B'
        : 'HLK-Device-C',
      rssi: -50,
    };

    console.log(`[MockBLE] Connected to ${this.connectedDeviceInfo.name}`);
    return true;
  }

  async disconnect(): Promise<void> {
    console.log('[MockBLE] Disconnecting...');
    this.connected = false;
    this.connectedDeviceInfo = null;
  }

  async sendValue(value: number): Promise<boolean> {
    if (!this.connected) {
      console.error('[MockBLE] Not connected');
      return false;
    }

    const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
    console.log(`[MockBLE] Sent value: ${clampedValue}`);
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConnectedDevice(): DiscoveredDevice | null {
    return this.connectedDeviceInfo;
  }
}

// Use lazy initialization - do NOT create BleManager at module load time
// This prevents TurboModule timeout errors on app startup
const bleModule: BLEModuleInterface = new RealBLEModule();

// Log that module is ready (but BleManager is not yet created)
console.log('[BLE] Module ready (lazy initialization)');

export default bleModule;
