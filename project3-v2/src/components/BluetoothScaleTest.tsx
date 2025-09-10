import React from 'react';
import { Bluetooth, Scale, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useBluetoothScale } from '../hooks/useBluetoothScale';
import { Button } from './ui/Button';

export function BluetoothScaleTest() {
  const { 
    enabled, 
    setEnabled, 
    status, 
    isConnected, 
    weight, 
    error, 
    isSupported 
  } = useBluetoothScale();

  const getStatusInfo = () => {
    switch (status) {
      case 'unsupported':
        return {
          icon: <AlertCircle className="text-red-500" size={20} />,
          text: 'Web Bluetooth not supported in this browser',
          color: 'text-red-600'
        };
      case 'connecting':
        return {
          icon: <Loader className="text-blue-500 animate-spin" size={20} />,
          text: 'Connecting to scale...',
          color: 'text-blue-600'
        };
      case 'connected':
        return {
          icon: <CheckCircle className="text-green-500" size={20} />,
          text: 'Connected to Bluetooth scale',
          color: 'text-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="text-red-500" size={20} />,
          text: error || 'Connection failed',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Bluetooth className="text-gray-500" size={20} />,
          text: 'Ready to connect',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Scale className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Bluetooth Scale Test</h2>
      </div>

      {/* Browser Support Check */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Browser Compatibility</h3>
        <div className="flex items-center space-x-2">
          {isSupported ? (
            <>
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-green-600">Web Bluetooth is supported</span>
            </>
          ) : (
            <>
              <AlertCircle className="text-red-500" size={16} />
              <span className="text-red-600">Web Bluetooth is not supported</span>
              <div className="mt-2 text-sm text-gray-600">
                Try using Chrome, Edge, or Opera browser
              </div>
            </>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Connection Status</h3>
        <div className="flex items-center space-x-2">
          {statusInfo.icon}
          <span className={statusInfo.color}>{statusInfo.text}</span>
        </div>
      </div>

      {/* Weight Reading */}
      {isConnected && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50">
          <h3 className="font-medium text-gray-900 mb-2">Weight Reading</h3>
          <div className="text-3xl font-bold text-blue-600">
            {weight !== null ? `${weight} kg` : 'Waiting for reading...'}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Step on the scale to see real-time weight updates
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-3">
        <Button
          onClick={() => setEnabled(!enabled)}
          disabled={!isSupported || status === 'connecting'}
          variant={enabled ? 'secondary' : 'primary'}
        >
          <Bluetooth size={16} className="mr-2" />
          {enabled ? 'Disconnect' : 'Connect Scale'}
        </Button>

        {status === 'error' && (
          <Button
            onClick={() => {
              setEnabled(false);
              setTimeout(() => setEnabled(true), 100);
            }}
            variant="secondary"
          >
            Retry Connection
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Make sure your Bluetooth scale is turned on and in pairing mode</li>
          <li>Click "Connect Scale" button</li>
          <li>Select your scale from the browser's device picker</li>
          <li>Step on the scale to see real-time weight readings</li>
          <li>Check if the weight updates smoothly and accurately</li>
        </ol>
      </div>

      {/* Troubleshooting */}
      {status === 'error' && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <h3 className="font-medium text-red-800 mb-2">Troubleshooting</h3>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>Ensure the scale supports Bluetooth GATT Weight Scale Service (0x181D)</li>
            <li>Try turning the scale off and on again</li>
            <li>Make sure no other devices are connected to the scale</li>
            <li>Check if the scale is in pairing/discoverable mode</li>
            <li>Try using a different browser (Chrome/Edge recommended)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
