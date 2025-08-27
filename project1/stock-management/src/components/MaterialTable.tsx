import type { MaterialEntry } from '../types';
import '../css/MaterialTable.css';

interface Props {
  entries: MaterialEntry[];
  onDelete: (id: number) => void;
}

export default function MaterialTable({ entries, onDelete }: Props) {
  const totalDozens = entries.reduce((sum, entry) => sum + entry.dozens, 0);
  const totalWeight = entries.reduce((sum, entry) => sum + entry.totalWeight, 0);
  const totalNetWeight = entries.reduce((sum, entry) => sum + entry.netWeight, 0);

  const getToleranceClass = (diff: number) => {
    if (diff > 0.01) return 'tolerance-positive';
    if (diff < -0.01) return 'tolerance-negative';
    return 'tolerance-neutral';
  };

  const formatNumber = (num: number, decimals: number = 3) => {
    return num.toFixed(decimals);
  };

  if (entries.length === 0) {
    return (
      <div className="material-table-container">
        <div className="table-empty">
          <div className="table-empty-icon">📋</div>
          <h3>No entries to display</h3>
          <p>Add your first material entry to see the data table.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="material-table-container animate-fade-in">
      <div className="table-header">
        <h3 className="table-title">Material Entries</h3>
        <div className="table-stats">
          <div className="stat-item">
            <span>📦</span>
            <span>{entries.length} entries</span>
          </div>
          <div className="stat-item">
            <span>🔢</span>
            <span>{totalDozens} dozens</span>
          </div>
          <div className="stat-item">
            <span>⚖️</span>
            <span>{formatNumber(totalWeight)} kg total</span>
          </div>
          <div className="stat-item">
            <span>📊</span>
            <span>{formatNumber(totalNetWeight)} kg net</span>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="material-table">
          <thead>
            <tr>
              <th className="col-index">#</th>
              <th className="col-item-code">Code</th>
              <th className="col-item-name">Item Name</th>
              <th className="col-bag-type">Bag Type</th>
              <th className="col-numeric">Bag Weight</th>
              <th className="col-numeric">Dozens</th>
              <th className="col-numeric">Total Weight</th>
              <th className="col-numeric">Net Weight</th>
              <th className="col-numeric">Avg Weight</th>
              <th className="col-tolerance">Tolerance</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td className="col-index">{index + 1}</td>
                <td className="col-item-code">{entry.itemCode}</td>
                <td className="col-item-name">{entry.itemName}</td>
                <td>{entry.bagType}</td>
                <td className="col-numeric">{formatNumber(entry.bagWeight)}</td>
                <td className="col-numeric">{entry.dozens}</td>
                <td className="col-numeric">{formatNumber(entry.totalWeight)}</td>
                <td className="col-numeric">{formatNumber(entry.netWeight)}</td>
                <td className="col-numeric">{formatNumber(entry.avgWeight)}</td>
                <td className="col-tolerance">
                  <span className={getToleranceClass(entry.toleranceDiff)}>
                    {entry.toleranceDiff >= 0 ? '+' : ''}{formatNumber(entry.toleranceDiff)}
                  </span>
                </td>
                <td className="col-actions">
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(entry.id)}
                    title="Delete entry"
                    aria-label={`Delete entry for ${entry.itemName}`}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}