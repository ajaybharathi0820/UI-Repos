import { Layout } from '../components/layout/Layout';
import { BluetoothScaleTest } from '../components/BluetoothScaleTest';

export function BluetoothTestPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bluetooth Scale Testing</h1>
          <p className="text-gray-600">
            Use this page to test your Bluetooth weight scale compatibility and functionality.
          </p>
        </div>
        
        <BluetoothScaleTest />
      </div>
    </Layout>
  );
}
