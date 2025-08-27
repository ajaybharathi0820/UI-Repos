import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { MaterialEntryForm } from './MaterialEntryForm';
import { MaterialEntryTable } from './MaterialEntryTable';
import { MaterialEntry } from '../../types';

export function HomePage() {
  const [entries, setEntries] = useState<MaterialEntry[]>([]);

  // Mock initial data
  useEffect(() => {
    const mockEntries: MaterialEntry[] = [
      {
        id: '1',
        itemCode: 'ITM-001',
        bagType: 'medium',
        dozens: 12,
        weight: 10.2,
        expectedWeight: 10.0,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        itemCode: 'ITM-002',
        bagType: 'large',
        dozens: 6,
        weight: 19.8,
        expectedWeight: 20.0,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    setEntries(mockEntries);
  }, []);

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

  return (
    <Layout>
      <div className="space-y-6">
        <MaterialEntryForm onSubmit={handleAddEntry} />
        <MaterialEntryTable 
          entries={entries} 
          onUpdate={handleUpdateEntry}
          onDelete={handleDeleteEntry}
        />
      </div>
    </Layout>
  );
}