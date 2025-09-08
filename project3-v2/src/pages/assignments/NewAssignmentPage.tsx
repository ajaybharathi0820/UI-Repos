import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileText, Save, ArrowRight } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { MaterialEntryForm } from '../home/MaterialEntryForm';
import { MaterialEntryTable } from '../home/MaterialEntryTable';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { MaterialEntry, PolisherAssignmentRequest, Polisher } from '../../types';
import { generatePDFReport } from '../../utils/pdfGenerator';
import ApiService from '../../services/api';
import { useBluetoothScale } from '../../hooks/useBluetoothScale';
import { useNavigate } from 'react-router-dom';

export default function NewAssignmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select-polisher' | 'material-entry'>('select-polisher');
  const [polishers, setPolishers] = useState<Polisher[]>([]);
  const [isLoadingPolishers, setIsLoadingPolishers] = useState(true);
  const [selectedPolisherId, setSelectedPolisherId] = useState<string>('');
  const [selectedPolisher, setSelectedPolisher] = useState<{ id: string; name: string } | null>(null);
  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { enabled: scaleEnabled, setEnabled: setScaleEnabled, status: scaleStatus, weight: scaleWeight, isSupported: scaleSupported, error: scaleError } = useBluetoothScale();

  // Load polishers on component mount
  useEffect(() => {
    const loadPolishers = async () => {
      try {
        setIsLoadingPolishers(true);
        const polishersData = await ApiService.getPolishers();
        setPolishers(polishersData);
      } catch (error) {
        console.error('Failed to load polishers:', error);
        toast.error('Failed to load polishers');
        setPolishers([]);
      } finally {
        setIsLoadingPolishers(false);
      }
    };

    loadPolishers();
  }, []);

  const polisherOptions = polishers.map(polisher => ({ 
    value: polisher.id, 
    label: `${polisher.firstName} ${polisher.lastName}` 
  }));

  const handlePolisherChange = (value: string) => setSelectedPolisherId(value);

  const handleContinue = () => {
    const polisher = polishers.find(p => p.id === selectedPolisherId);
    if (polisher) {
      setSelectedPolisher({ 
        id: polisher.id, 
        name: `${polisher.firstName} ${polisher.lastName}` 
      });
      setStep('material-entry');
      setEntries([]);
    }
  };

  const handleBackToPolisherSelection = () => {
    setStep('select-polisher');
    setSelectedPolisher(null);
    setSelectedPolisherId('');
    setEntries([]);
  };

  const handleAddEntry = (newEntry: MaterialEntry) => setEntries(prev => [newEntry, ...prev]);
  const handleUpdateEntry = (updatedEntry: MaterialEntry) => setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  const handleDeleteEntry = async (id: string) => { await new Promise(r => setTimeout(r, 300)); setEntries(prev => prev.filter(e => e.id !== id)); };

  const handleSaveAll = async () => {
    if (entries.length === 0) return toast.error('No entries to save');
    if (!selectedPolisher) return toast.error('No polisher selected');

    setIsSaving(true);
    try {
      const requestData: PolisherAssignmentRequest = {
        polisherAssignment: {
          polisherId: selectedPolisher.id,
          polisherName: selectedPolisher.name,
          items: entries.map((entry) => ({
            productId: entry.itemId || entry.itemCode, // Use itemId if available, fallback to itemCode
            productCode: entry.itemCode,
            productName: entry.itemName,
            bagTypeId: entry.bagTypeId || '', // Ensure we have the bag type ID
            bagTypeName: entry.bagType,
            bagWeight: entry.bagWeight,
            dozens: entry.dozens,
            totalWeight: entry.grossWeight,
            netWeight: entry.netWeight || (entry.grossWeight - (entry.bagWeight * entry.dozens)), // Calculate net weight
            avgWeight: entry.avgWeight || (entry.grossWeight / entry.dozens), // Calculate avg weight
            productAvgWeight: entry.productAvgWeight,
            toleranceDiff: entry.toleranceDiff,
          })),
        },
      };
      
      await ApiService.savePolisherAssignment(requestData);
      toast.success(`Saved ${entries.length} entries for ${selectedPolisher.name}`);
      navigate('/');
    } catch (e: any) {
      console.error('Failed to save assignment:', e);
      toast.error(e?.message ?? 'Failed to save entries');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (entries.length === 0 || !selectedPolisher) return toast.error('No entries to generate report');
    setIsGeneratingPDF(true);
    try { await generatePDFReport(selectedPolisher, entries); toast.success('PDF report generated successfully!'); }
    catch (e: any) { toast.error(e?.message ?? 'Failed to generate PDF report'); }
    finally { setIsGeneratingPDF(false); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {step === 'select-polisher' ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Polisher</h2>
                <p className="text-gray-600">Choose a polisher to start adding material entries</p>
              </div>
              
              {isLoadingPolishers ? (
                <div className="py-8">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading polishers...</p>
                </div>
              ) : polishers.length === 0 ? (
                <div className="py-8">
                  <p className="text-gray-500">No polishers found. Please add polishers first.</p>
                  <Button 
                    onClick={() => navigate('/manage/polisher')} 
                    variant="secondary" 
                    className="mt-4"
                  >
                    Manage Polishers
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    label="Polisher"
                    required
                    options={polisherOptions}
                    value={selectedPolisherId}
                    onChange={(e) => handlePolisherChange((e.target as HTMLSelectElement).value)}
                  />
                  <Button onClick={handleContinue} disabled={!selectedPolisherId} className="w-full" size="lg">
                    <ArrowRight size={20} className="mr-2" />
                    Continue to Material Entry
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">Material Entry for: {selectedPolisher?.name}</h2>
                  <p className="text-sm text-blue-700">Add material entries for this polisher</p>
                </div>
                <Button variant="ghost" onClick={handleBackToPolisherSelection} className="text-blue-700 hover:bg-blue-200">
                  Change Polisher
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4" checked={scaleEnabled} onChange={(e) => setScaleEnabled(e.target.checked)} disabled={!scaleSupported} />
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
              {scaleError && <span className="text-sm text-red-600">{scaleError}</span>}
            </div>

            <MaterialEntryForm selectedPolisher={selectedPolisher} onSubmit={handleAddEntry} scaleEnabled={scaleEnabled} scaleWeight={scaleWeight ?? undefined} />

            {entries.length > 0 && (
              <div className="flex justify-end space-x-4">
                <Button onClick={handleGenerateReport} loading={isGeneratingPDF} variant="secondary" className="px-6" size="lg">
                  <FileText size={20} className="mr-2" />
                  Generate Report
                </Button>
                <Button onClick={handleSaveAll} loading={isSaving} className="px-8" size="lg">
                  <Save size={20} className="mr-2" />
                  Save All Entries ({entries.length})
                </Button>
              </div>
            )}

            <MaterialEntryTable entries={entries} onUpdate={handleUpdateEntry} onDelete={handleDeleteEntry} />
          </>
        )}
      </div>
    </Layout>
  );
}
