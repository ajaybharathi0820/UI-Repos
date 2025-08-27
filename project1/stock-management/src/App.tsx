import MaterialTable from './components/MaterialTable';
import PolisherDropdown from './components/PolisherDropdown';
import EntryForm from './components/EntryForm';
import './App.css';
import { useState } from 'react';
import type { MaterialEntry } from './types';
import { items, polishers, bagTypes } from './data/masters';
import PopupModal from './components/PopupModal';
import ReportModal from './components/ReportModal';

function App() {
  const [polisher, setPolisher] = useState<string>('');
  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [modalEntry, setModalEntry] = useState<MaterialEntry | null>(null);
  const [formData, setFormData] = useState<Partial<MaterialEntry> | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleAddEntry = (entry: MaterialEntry) => {
    const toleranceLimit = entry.avgWeight * 0.02;
    if (Math.abs(entry.toleranceDiff) > toleranceLimit) {
      setModalEntry(entry);
    } else {
      setEntries(prev => [...prev, entry]);
    }
  };

  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
    if (confirmDelete) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleRecheck = (entry: MaterialEntry) => {
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    setFormData(entry);
    setModalEntry(null);
  };

  const handleCloseModal = () => {
    setModalEntry(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>
          <div className="header-icon">📦</div>
          Raw Material Management
        </h1>
        <div className="header-actions">
          {entries.length > 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowReport(true)}
            >
              📊 Generate Report
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-panel-content">
            <div className="control-row">
              <div className="polisher-section">
                <PolisherDropdown 
                  polishers={polishers} 
                  selectedId={polisher} 
                  onChange={setPolisher} 
                />
              </div>
            </div>
            
            {/* Entry Form */}
            <EntryForm 
              items={items} 
              bagTypes={bagTypes} 
              onAdd={handleAddEntry} 
              initialData={formData} 
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {entries.length > 0 ? (
            <div className="card animate-fade-in">
              <div className="card-header">
                <h2 className="card-title">Material Entries ({entries.length})</h2>
              </div>
              <div className="card-content">
                <MaterialTable entries={entries} onDelete={handleDelete} />
              </div>
            </div>
          ) : (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">📋</div>
              <h3>No entries yet</h3>
              <p>Start by selecting a polisher and adding your first material entry above.</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {modalEntry && (
          <PopupModal
            entry={modalEntry}
            onClose={handleCloseModal}
            onRecheck={handleRecheck}
          />
        )}

        {showReport && (
          <ReportModal
            polisherName={polisher}
            entries={entries}
            onClose={() => setShowReport(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;