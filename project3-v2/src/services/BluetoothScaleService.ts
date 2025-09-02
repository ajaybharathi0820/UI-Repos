// Web Bluetooth Weight Scale Service integration
// Supports BLE Weight Scale Service (0x181D) and Weight Measurement (0x2A9D)

const WEIGHT_SCALE_SERVICE = 0x181d; // GATT Service: Weight Scale
const WEIGHT_MEASUREMENT_CHAR = 0x2a9d; // Characteristic: Weight Measurement

export type WeightReading = {
  kg: number; // normalized to kilograms
  raw: number; // raw unit as reported before normalization
  unit: 'kg' | 'lb';
  timestamp?: Date;
  stable?: boolean;
};

export type WeightListener = (reading: WeightReading) => void;

export class BluetoothScaleService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private measurementChar: BluetoothRemoteGATTCharacteristic | null = null;
  private listener: WeightListener | null = null;

  isSupported() {
    return typeof navigator !== 'undefined' && !!(navigator as any).bluetooth;
  }

  get connected() {
    return !!(this.device && this.device.gatt && this.device.gatt.connected);
  }

  async requestAndConnect(listener: WeightListener) {
    if (!this.isSupported()) throw new Error('Web Bluetooth not supported in this browser');

    this.listener = listener;

    // Request a BLE device advertising the Weight Scale Service
    this.device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ services: [WEIGHT_SCALE_SERVICE] }],
      optionalServices: [WEIGHT_SCALE_SERVICE],
    });

    if (!this.device) throw new Error('No device selected');

    this.device.addEventListener('gattserverdisconnected', this.onDisconnected);

    this.server = await this.device.gatt!.connect();

    const service = await this.server.getPrimaryService(WEIGHT_SCALE_SERVICE);
    this.measurementChar = await service.getCharacteristic(WEIGHT_MEASUREMENT_CHAR);

    await this.measurementChar.startNotifications();
    this.measurementChar.addEventListener('characteristicvaluechanged', this.onMeasurement);
  }

  private onMeasurement = (event: Event) => {
    const dv = (event.target as BluetoothRemoteGATTCharacteristic).value as DataView;
    const reading = parseWeightMeasurement(dv);
    if (reading && this.listener) this.listener(reading);
  };

  private onDisconnected = () => {
    // noop; hook can poll connected() or listen for status updates
  };

  async disconnect() {
    try {
      if (this.measurementChar) {
        this.measurementChar.removeEventListener('characteristicvaluechanged', this.onMeasurement);
        await this.measurementChar.stopNotifications().catch(() => {});
      }
      if (this.device?.gatt?.connected) this.device.gatt.disconnect();
    } finally {
      this.measurementChar = null;
      this.server = null;
      this.device = null;
      this.listener = null;
    }
  }
}

// Spec parsing for Weight Measurement (0x2A9D)
// Flags (byte 0):
// bit0: 0 = SI (kg), 1 = Imperial (lb)
// bit1: Time Stamp Present
// bit2: User ID Present
// bit3: BMI and Height Present
// Weight: uint16, resolution 0.005 kg when SI, 0.01 lb when Imperial
export function parseWeightMeasurement(view: DataView): WeightReading | null {
  if (!view || view.byteLength < 3) return null;
  let offset = 0;
  const flags = view.getUint8(offset); offset += 1;
  const isImperial = (flags & 0x01) === 0x01;

  const rawWeight = view.getUint16(offset, /*littleEndian*/ true); offset += 2;
  const unit: 'kg' | 'lb' = isImperial ? 'lb' : 'kg';

  // Resolution per spec
  const weight = isImperial ? rawWeight * 0.01 : rawWeight * 0.005; // lb or kg accordingly

  // Optional fields (ignored but advance offset for completeness)
  let timestamp: Date | undefined;
  if ((flags & 0x02) !== 0) {
    // year(2) month day hours minutes seconds
    if (view.byteLength >= offset + 7) {
      const year = view.getUint16(offset, true); offset += 2;
      const month = view.getUint8(offset++);
      const day = view.getUint8(offset++);
      const hours = view.getUint8(offset++);
      const minutes = view.getUint8(offset++);
      const seconds = view.getUint8(offset++);
      timestamp = new Date(year, Math.max(0, month - 1), day, hours, minutes, seconds);
    }
  }
  if ((flags & 0x04) !== 0) {
    // user id present
    if (view.byteLength >= offset + 1) offset += 1;
  }
  if ((flags & 0x08) !== 0) {
    // BMI(2) Height(2)
    if (view.byteLength >= offset + 4) offset += 4;
  }

  // Stability flag is not in 0x2A9D (some devices have manufacturer-specific fields). We'll mark stable if two decimals stop changing upstream (handled in hook).
  if (unit === 'kg') {
    return { kg: weight, raw: weight, unit, timestamp };
  } else {
    // convert lb to kg
    const kg = weight * 0.45359237;
    return { kg, raw: weight, unit, timestamp };
  }
}
