import type { Polisher } from '../types';
import '../css/PolisherDropdown.css';

interface Props {
  polishers: Polisher[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function PolisherDropdown({ polishers, selectedId, onChange }: Props) {
  const hasSelection = selectedId && selectedId.trim() !== '';

  return (
    <div className="polisher-dropdown">
      <label htmlFor="polisher-select">Select Polisher</label>
      <div className={`polisher-select ${hasSelection ? 'has-selection' : ''}`}>
        <select 
          id="polisher-select"
          value={selectedId ?? ''} 
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Choose a polisher...</option>
          {polishers.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className={`polisher-status ${hasSelection ? 'selected' : 'unselected'}`}>
        <div className={`status-dot ${hasSelection ? 'selected' : 'unselected'}`}></div>
        {hasSelection ? `Selected: ${selectedId}` : 'No polisher selected'}
      </div>
    </div>
  );
}