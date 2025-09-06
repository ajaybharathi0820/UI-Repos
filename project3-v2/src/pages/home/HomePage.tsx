import { useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';
import { mockAssignments } from '../../data/mockAssignments';
import { polishers } from '../../data/mockData';

type Status = 'all' | 'open' | 'in-progress' | 'completed';

export function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [polisherId, setPolisherId] = useState<string>('');
  const [status, setStatus] = useState<Status>('all');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const polisherOptions = useMemo(
    () => [{ value: '', label: 'All Polishers' }, ...polishers.map(p => ({ value: p.id.toString(), label: p.name }))],
    []
  );

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1 : null;

    return mockAssignments.filter(a => {
      if (polisherId && a.polisherId !== polisherId) return false;
      if (status !== 'all' && a.status !== status) return false;

      const ts = new Date(a.date).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inHeader =
          a.id.toLowerCase().includes(q) ||
          a.polisherName.toLowerCase().includes(q);
        const inItems = a.entries.some(e =>
          e.itemCode.toLowerCase().includes(q) ||
          e.itemName.toLowerCase().includes(q) ||
          e.bagType.toLowerCase().includes(q)
        );
        if (!inHeader && !inItems) return false;
      }

      return true;
    });
  }, [search, polisherId, status, from, to]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Polisher Assignments</h1>
            <p className="text-gray-600">Browse and search past assignments. Click a row to view details.</p>
          </div>
          <Button onClick={() => navigate('/assignments/new')} className="px-6" size="lg">
            New Assignment
          </Button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by assignment id, polisher, item…"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <Select
                label="Polisher"
                options={polisherOptions}
                value={polisherId}
                onChange={(e) => setPolisherId((e.target as HTMLSelectElement).value)}
              />
            </div>

            <div>
              <Select
                label="Status"
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus((e.target as HTMLSelectElement).value as Status)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              variant="secondary"
              onClick={() => { setSearch(''); setPolisherId(''); setStatus('all'); setFrom(''); setTo(''); }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Polisher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/assignments/${encodeURIComponent(a.id)}`)}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">{a.id}</td>
                    <td className="px-6 py-3 text-gray-700">{a.polisherName}</td>
                    <td className="px-6 py-3 text-gray-700">{new Date(a.date).toLocaleString()}</td>
                    <td className="px-6 py-3 text-gray-700">{a.entries.length}</td>
                    <td className="px-6 py-3">
                      <span
                        className={[
                          'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                          a.status === 'completed' ? 'bg-green-50 text-green-700' :
                          a.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-gray-100 text-gray-700',
                        ].join(' ')}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No assignments found.
                    </td>
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