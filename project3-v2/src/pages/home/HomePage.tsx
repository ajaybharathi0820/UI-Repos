import { useMemo, useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { PolisherAssignment, Polisher, User } from '../../types';
import ApiService from '../../services/api';

export function HomePage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<PolisherAssignment[]>([]);
  const [polishers, setPolishers] = useState<Polisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  
  const [search, setSearch] = useState('');
  const [polisherId, setPolisherId] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const polisherOptions = useMemo(
    () => [{ value: '', label: 'All Polishers' }, ...polishers.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))],
    [polishers]
  );

  // Helper to format date as YYYY-MM-DD
  const fmt = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Load polishers, users map, and initial assignments (default last month)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load polishers and users for mapping
        const [polishersData, users] = await Promise.all([
          ApiService.getPolishers(),
          ApiService.getUsers()
        ]);
        setPolishers(polishersData);
        const map: Record<string, string> = {};
        (users as User[]).forEach(u => { map[u.id] = `${u.firstName} ${u.lastName}`.trim(); });
        setUsersMap(map);
        
        // Default search: last month to today
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 1);
        const fromStr = fmt(fromDate);
        const toStr = fmt(toDate);
        setFrom(fromStr);
        setTo(toStr);
  await searchAssignments({ fromDate: fromStr, toDate: toStr });
        
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load data');
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const searchAssignments = async (criteria: any) => {
    try {
      setIsSearching(true);
      const toIso = (d: string, end = false) => {
        if (!d) return undefined;
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
          return end ? `${d}T23:59:59.999Z` : `${d}T00:00:00.000Z`;
        }
        return d;
      };
      const searchQuery = {
        criteria: {
          ...(criteria.polisherId && { polisherId: criteria.polisherId }),
          ...(criteria.fromDate && { fromDate: toIso(criteria.fromDate, false) }),
          ...(criteria.toDate && { toDate: toIso(criteria.toDate, true) }),
        }
      };
      
      const results = await ApiService.searchPolisherAssignments(searchQuery);
      setAssignments(results || []);
    } catch (error) {
      console.error('Failed to search assignments:', error);
      toast.error('Failed to search assignments');
      setAssignments([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    const criteria = {
      ...(polisherId && { polisherId }),
      ...(from && { fromDate: from }),
      ...(to && { toDate: to }),
    };
    searchAssignments(criteria);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPolisherId('');
    setFrom('');
    setTo('');
    searchAssignments({});
  };

  // Filter assignments based on search term (client-side for text search)
  const filteredAssignments = useMemo(() => {
    if (!search.trim()) return assignments;
    
    const query = search.trim().toLowerCase();
    return assignments.filter(assignment => {
      const inHeader = 
        assignment.id.toLowerCase().includes(query) ||
        assignment.polisherName.toLowerCase().includes(query);
        
      const inItems = assignment.items.some(item =>
        item.productCode.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query) ||
        item.bagTypeName.toLowerCase().includes(query)
      );
      
      return inHeader || inItems;
    });
  }, [assignments, search]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by polisher, item…"
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

          <div className="mt-3 flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={handleClearFilters}
              disabled={isSearching}
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleSearch}
              loading={isSearching}
            >
              Search
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Polisher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.map(assignment => (
                  <tr
                    key={assignment.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/assignments/${encodeURIComponent(assignment.id)}`)}
                  >
                    <td className="px-6 py-3 text-gray-700">{assignment.polisherName}</td>
                    <td className="px-6 py-3 text-gray-700">{new Date(assignment.createdDate).toLocaleString()}</td>
                    <td className="px-6 py-3 text-gray-700">{assignment.items.length}</td>
                    <td className="px-6 py-3 text-gray-700">{usersMap[assignment.createdBy] || assignment.createdBy}</td>
                  </tr>
                ))}

                {filteredAssignments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {isSearching ? 'Searching...' : 'No assignments found.'}
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