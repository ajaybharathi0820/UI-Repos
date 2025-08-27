import type { MaterialEntry } from '../types';
import '../css/PopupModal.css';

interface Props {
  entry: MaterialEntry;
  onClose: () => void;
  onRecheck: (entry: MaterialEntry) => void;
}

export default function PopupModal({ entry, onClose, onRecheck }: Props) {
  const tolerancePercentage = ((Math.abs(entry.toleranceDiff) / entry.avgWeight) * 100).toFixed(2);
  
  const handleAccept = () => {
    // Add the entry anyway (for cases where user wants to proceed despite tolerance)
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>
        
        <div className="modal-header">
          <div className="modal-icon">⚠️</div>
          <h3 className="modal-title">Tolerance Exceeded</h3>
        </div>

        <div className="modal-content">
          <div className="modal-alert">
            <p className="modal-alert-text">
              The weight tolerance for this entry exceeds the acceptable limit of 2%. 
              Please review the measurements below.
            </p>
          </div>

          <div className="entry-details">
            <div className="detail-item">
              <div className="detail-label">Item</div>
              <p className="detail-value">{entry.itemName}</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Item Code</div>
              <p className="detail-value">{entry.itemCode}</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Dozens</div>
              <p className="detail-value">{entry.dozens}</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Bag Type</div>
              <p className="detail-value">{entry.bagType}</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Total Weight</div>
              <p className="detail-value">{entry.totalWeight.toFixed(3)} kg</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Net Weight</div>
              <p className="detail-value">{entry.netWeight.toFixed(3)} kg</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Average Weight</div>
              <p className="detail-value">{entry.avgWeight.toFixed(3)} kg</p>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Tolerance Difference</div>
              <p className="detail-value highlight">
                {entry.toleranceDiff >= 0 ? '+' : ''}{entry.toleranceDiff.toFixed(3)} kg
                <br />
                <small>({tolerancePercentage}%)</small>
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn btn-close" onClick={onClose}>
            ✖️ Cancel
          </button>
          <button className="modal-btn btn-accept" onClick={handleAccept}>
            ✅ Accept Anyway
          </button>
          <button className="modal-btn btn-recheck" onClick={() => onRecheck(entry)}>
            🔄 Re-enter Data
          </button>
        </div>
      </div>
    </div>
  );
}