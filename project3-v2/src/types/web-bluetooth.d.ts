// Minimal Web Bluetooth type declarations for TypeScript projects
// If DOM lib includes these already, this file is harmless.

interface Navigator {
  bluetooth?: {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    getDevices?: () => Promise<BluetoothDevice[]>;
  };
}

interface RequestDeviceOptions {
  filters?: Array<{
    services?: Array<number | string>;
    name?: string;
    namePrefix?: string;
  }>;
  optionalServices?: Array<number | string>;
  acceptAllDevices?: boolean;
}

interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: number | string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: number | string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<void>;
  addEventListener(type: 'characteristicvaluechanged', listener: (ev: Event) => any): void;
  removeEventListener(type: 'characteristicvaluechanged', listener: (ev: Event) => any): void;
}
