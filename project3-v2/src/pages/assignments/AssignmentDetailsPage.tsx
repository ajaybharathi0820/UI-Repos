import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import type { PolisherAssignment } from '../../types';
import ApiService from '../../services/api';
import { generatePDFReport } from '../../utils/pdfGenerator';

export default function AssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<PolisherAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadAssignment = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const assignmentData = await ApiService.getPolisherAssignmentById(id);
        setAssignment(assignmentData);
      } catch (error) {
        console.error('Failed to load assignment:', error);
        toast.error('Failed to load assignment details');
        setAssignment(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignment();
  }, [id]);

  const handleGenerateReport = async () => {
    if (!assignment) return;
    
    setIsGeneratingPDF(true);
    try {
      // Convert assignment to format expected by PDF generator
      const polisherInfo = { 
        id: assignment.polisherId, 
        name: assignment.polisherName 
      };
      
      const entries = assignment.items.map(item => ({
        id: item.id,
        itemCode: item.productCode,
        itemName: item.productName,
        bagType: item.bagTypeName,
        bagTypeId: item.bagTypeId,
        dozens: item.dozens,
        bagWeight: item.bagWeight,
        grossWeight: item.totalWeight,
        netWeight: item.netWeight,
        avgWeight: item.avgWeight,
        productAvgWeight: item.productAvgWeight,
        toleranceDiff: item.toleranceDiff,
      }));
      
      await generatePDFReport(polisherInfo, entries);
      toast.success('PDF report generated successfully!');
    } catch (e: any) {
      console.error('Failed to generate PDF:', e);
      toast.error(e?.message ?? 'Failed to generate PDF report');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!assignment) {
    return (
      <Layout>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-gray-700">Assignment not found.</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/')}>Back to Assignments</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment {assignment.id}</h1>
            <p className="text-gray-600">
              Polisher: <span className="font-medium">{assignment.polisherName}</span> · Date: {new Date(assignment.createdDate).toLocaleString()} · Created by: {assignment.createdBy}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/')}>Back</Button>
            <Button 
              variant="secondary" 
              onClick={handleGenerateReport}
              loading={isGeneratingPDF}
            >
              <FileText size={16} className="mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bag Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dozens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bag Wt (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Wt (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Wt (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Wt (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tolerance Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignment.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{item.productCode}</td>
                    <td className="px-6 py-3 text-gray-700">{item.productName}</td>
                    <td className="px-6 py-3 text-gray-700">{item.bagTypeName}</td>
                    <td className="px-6 py-3 text-gray-700">{item.dozens}</td>
                    <td className="px-6 py-3 text-gray-700">{item.bagWeight.toFixed(3)}</td>
                    <td className="px-6 py-3 text-gray-700">{item.totalWeight.toFixed(3)}</td>
                    <td className="px-6 py-3 text-gray-700">{item.netWeight.toFixed(3)}</td>
                    <td className="px-6 py-3 text-gray-700">{item.avgWeight.toFixed(3)}</td>
                    <td className="px-6 py-3 text-gray-700">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        Math.abs(item.toleranceDiff) <= 0.1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.toleranceDiff > 0 ? '+' : ''}{item.toleranceDiff.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))}
                {assignment.items.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={9}>No items in this assignment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
