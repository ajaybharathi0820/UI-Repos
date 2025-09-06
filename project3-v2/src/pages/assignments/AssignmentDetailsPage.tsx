import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockAssignments } from '../../data/mockAssignments';

export default function AssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const assignment = useMemo(() => mockAssignments.find(a => a.id === id), [id]);

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
              Polisher: <span className="font-medium">{assignment.polisherName}</span> · Date: {new Date(assignment.date).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/')}>Back</Button>
            <Button variant="secondary" onClick={() => { /* mock */ }}>Export PDF</Button>
            <Button onClick={() => navigate('/assignments/new')}>Reopen as New</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bag Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dozens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bag Wt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Wt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignment.entries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{e.itemCode}</td>
                    <td className="px-6 py-3 text-gray-700">{e.itemName}</td>
                    <td className="px-6 py-3 text-gray-700">{e.bagType}</td>
                    <td className="px-6 py-3 text-gray-700">{e.dozens}</td>
                    <td className="px-6 py-3 text-gray-700">{e.bagWeight}</td>
                    <td className="px-6 py-3 text-gray-700">{e.totalWeight.toFixed(3)}</td>
                  </tr>
                ))}
                {assignment.entries.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>No entries</td>
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
