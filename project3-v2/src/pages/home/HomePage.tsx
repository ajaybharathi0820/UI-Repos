import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Save, ArrowRight } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { MaterialEntryForm } from './MaterialEntryForm';
import { MaterialEntryTable } from './MaterialEntryTable';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MaterialEntry, PolisherAssignmentRequest } from '../../types';
import { polishers, bagTypes } from '../../data/mockData';
import { generatePDFReport } from '../../utils/pdfGenerator';
import ApiService from '../../services/api';
import { useBluetoothScale } from '../../hooks/useBluetoothScale';

export function HomePage() {
  const [step, setStep] = useState<'select-polisher' | 'material-entry'>('select-polisher');
  const [selectedPolisherId, setSelectedPolisherId] = useState<string>('');
  const [selectedPolisher, setSelectedPolisher] = useState<{ id: string; name: string } | null>(null);
  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { enabled: scaleEnabled, setEnabled: setScaleEnabled, status: scaleStatus, weight: scaleWeight, isSupported: scaleSupported, error: scaleError } = useBluetoothScale();

  // Convert polishers to select options
  const polisherOptions = polishers.map(polisher => ({
    value: polisher.id.toString(),
    label: polisher.name,
  }));

  const handlePolisherChange = (value: string) => {
    setSelectedPolisherId(value);
  };

  const handleContinue = () => {
    const polisher = polishers.find(p => p.id.toString() === selectedPolisherId);
    if (polisher) {
      setSelectedPolisher({ id: polisher.id.toString(), name: polisher.name });
      setStep('material-entry');
      setEntries([]); // Clear any existing entries
    }
  };

  const handleBackToPolisherSelection = () => {
    setStep('select-polisher');
    setSelectedPolisher(null);
    setSelectedPolisherId('');
    setEntries([]);
  };

  const handleAddEntry = (newEntry: MaterialEntry) => {
    setEntries(prev => [newEntry, ...prev]);
  };

  const handleUpdateEntry = (updatedEntry: MaterialEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  const handleDeleteEntry = async (id: string) => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleSaveAll = async () => {
    if (entries.length === 0) {
      toast.error('No entries to save');
      return;
    }

    if (!selectedPolisher) {
      toast.error('No polisher selected');
      return;
    }

    setIsSaving(true);
    try {
      const requestData: PolisherAssignmentRequest = {
        polisherAssignment: {
          polisherId: selectedPolisher.id,
          polisherName: selectedPolisher.name,
          createdBy: 'ak',
          items: entries.map((entry) => ({
            productId: entry.itemCode,
            productCode: entry.itemCode,
            productName: entry.itemName,
            bagTypeId: entry.bagTypeId ?? (bagTypes.find((b) => b.type === entry.bagType)?.id?.toString() || ''),
            bagTypeName: entry.bagType,
            bagWeight: entry.bagWeight,
            dozens: entry.dozens,
            totalWeight: entry.grossWeight,
            productAvgWeight: entry.productAvgWeight,
            toleranceDiff: entry.toleranceDiff,
          })),
        },
      };

      await ApiService.savePolisherAssignment(requestData);

      toast.success(`Saved ${entries.length} entries for ${selectedPolisher.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save entries';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (entries.length === 0 || !selectedPolisher) {
      toast.error('No entries to generate report');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generatePDFReport(selectedPolisher, entries);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF report';
      toast.error(message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {step === 'select-polisher' ? (
          // Step 1: Polisher Selection
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Select Polisher</h2>
                <p className="text-gray-600">Choose a polisher to start adding material entries</p>
              </div>
              
              <div className="space-y-4">
                <Select
                  label="Polisher"
                  required
                  options={polisherOptions}
                  value={selectedPolisherId}
                  onChange={(e) => handlePolisherChange((e.target as HTMLSelectElement).value)}
                />
                
                <Button
                  onClick={handleContinue}
                  disabled={!selectedPolisherId}
                  className="w-full"
                  size="lg"
                >
                  <ArrowRight size={20} className="mr-2" />
                  Continue to Material Entry
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Step 2: Material Entry Form and Table
          <>
            {/* Polisher Info Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    Material Entry for: {selectedPolisher?.name}
                  </h2>
                  <p className="text-sm text-blue-700">Add material entries for this polisher</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleBackToPolisherSelection}
                  className="text-blue-700 hover:bg-blue-200"
                >
                  Change Polisher
                </Button>
              </div>
            </div>

            {/* BLE Scale Toggle + Status (desktop/tablet toolbar) */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={scaleEnabled}
                    onChange={(e) => setScaleEnabled(e.target.checked)}
                    disabled={!scaleSupported}
                  />
                  Use Bluetooth Scale
                </label>
                <span className="text-sm text-gray-500">
                  {!scaleSupported && 'Not supported in this browser'}
                  {scaleSupported && scaleStatus === 'idle' && 'Manual mode'}
                  {scaleSupported && scaleStatus === 'connecting' && 'Connecting…'}
                  {scaleSupported && scaleStatus === 'connected' && `Connected ${typeof scaleWeight === 'number' ? `· ${scaleWeight.toFixed(3)} kg` : ''}`}
                  {scaleSupported && scaleStatus === 'error' && 'Connection error'}
                </span>
              </div>
              {scaleError && (
                <span className="text-sm text-red-600">{scaleError}</span>
              )}
            </div>

            {/* Material Entry Form */}
            <MaterialEntryForm 
              selectedPolisher={selectedPolisher}
              onSubmit={handleAddEntry}
              scaleEnabled={scaleEnabled}
              scaleWeight={scaleWeight ?? undefined}
            />
            
            {/* Action Buttons */}
            {entries.length > 0 && (
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleGenerateReport}
                  loading={isGeneratingPDF}
                  variant="secondary"
                  className="px-6"
                  size="lg"
                >
                  <FileText size={20} className="mr-2" />
                  Generate Report
                </Button>
                <Button
                  onClick={handleSaveAll}
                  loading={isSaving}
                  className="px-8"
                  size="lg"
                >
                  <Save size={20} className="mr-2" />
                  Save All Entries ({entries.length})
                </Button>
              </div>
            )}
            
            {/* Material Entry Table */}
            <MaterialEntryTable 
              entries={entries} 
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
            />
          </>
        )}
      </div>
    </Layout>
  );
}