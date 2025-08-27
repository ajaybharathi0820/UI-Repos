import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/ReportModal.css';
import type { MaterialEntry } from '../types';

interface Props {
  polisherName: string;
  entries: MaterialEntry[];
  onClose: () => void;
}

export default function ReportModal({ polisherName, entries, onClose }: Props) {
  const totalDozens = entries.reduce((sum, e) => sum + e.dozens, 0);
  const totalWeight = entries.reduce((sum, e) => sum + e.totalWeight, 0);
  const totalNet = entries.reduce((sum, e) => sum + e.netWeight, 0);
  const avgToleranceDeviation = entries.reduce((sum, e) => sum + Math.abs(e.toleranceDiff), 0) / entries.length;

  const getToleranceClass = (diff: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff > 0.05) return 'tolerance-high';
    if (absDiff > 0.02) return 'tolerance-medium';
    return 'tolerance-normal';
  };

  const formatNumber = (num: number, decimals: number = 3) => {
    return num.toFixed(decimals);
  };

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Raw Material Report', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Polisher: ${polisherName}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Total Entries: ${entries.length}`, 14, 42);

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Dozens: ${totalDozens}`, 14, 65);
    doc.text(`Total Weight: ${formatNumber(totalWeight)} kg`, 14, 71);
    doc.text(`Total Net Weight: ${formatNumber(totalNet)} kg`, 14, 77);
    doc.text(`Avg Tolerance Deviation: ${formatNumber(avgToleranceDeviation)} kg`, 14, 83);

    // Table
    autoTable(doc, {
      head: [['#', 'Item Code', 'Item Name', 'Dozens', 'Total Weight', 'Net Weight', 'Avg Weight', 'Tolerance']],
      body: entries.map((e, index) => [
        index + 1,
        e.itemCode,
        e.itemName,
        e.dozens,
        formatNumber(e.totalWeight),
        formatNumber(e.netWeight),
        formatNumber(e.avgWeight),
        `${e.toleranceDiff >= 0 ? '+' : ''}${formatNumber(e.toleranceDiff)}`
      ]),
      foot: [['Total', '', '', totalDozens, formatNumber(totalWeight), formatNumber(totalNet), '', '']],
      startY: 90,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: 0,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save(`material_report_${polisherName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-header">
          <h2 className="report-title">
            <span className="report-icon">📊</span>
            Material Report - {polisherName}
          </h2>
          <button className="report-close" onClick={onClose} aria-label="Close report">
            ✕
          </button>
        </div>

        <div className="report-content">
          {/* Summary Cards */}
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-label">Total Entries</div>
              <p className="summary-value">{entries.length}</p>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Dozens</div>
              <p className="summary-value">{totalDozens}</p>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Weight</div>
              <p className="summary-value">
                {formatNumber(totalWeight)} <span className="summary-unit">kg</span>
              </p>
            </div>
            <div className="summary-card">
              <div className="summary-label">Net Weight</div>
              <p className="summary-value">
                {formatNumber(totalNet)} <span className="summary-unit">kg</span>
              </p>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg Tolerance</div>
              <p className="summary-value">
                {formatNumber(avgToleranceDeviation)} <span className="summary-unit">kg</span>
              </p>
            </div>
          </div>

          {/* Data Table */}
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Code</th>
                  <th>Item Name</th>
                  <th>Bag Type</th>
                  <th>Dozens</th>
                  <th>Total Weight</th>
                  <th>Net Weight</th>
                  <th>Avg Weight</th>
                  <th>Tolerance</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, index) => (
                  <tr 
                    key={e.id} 
                    className={Math.abs(e.toleranceDiff) > 0.05 ? 'highlight' : ''}
                  >
                    <td>{index + 1}</td>
                    <td style={{ fontFamily: 'Monaco, monospace', fontWeight: 600 }}>{e.itemCode}</td>
                    <td style={{ textAlign: 'left', fontWeight: 500 }}>{e.itemName}</td>
                    <td>{e.bagType}</td>
                    <td>{e.dozens}</td>
                    <td>{formatNumber(e.totalWeight)}</td>
                    <td>{formatNumber(e.netWeight)}</td>
                    <td>{formatNumber(e.avgWeight)}</td>
                    <td className="tolerance-cell">
                      <span className={getToleranceClass(e.toleranceDiff)}>
                        {e.toleranceDiff >= 0 ? '+' : ''}{formatNumber(e.toleranceDiff)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><strong>{totalDozens}</strong></td>
                  <td><strong>{formatNumber(totalWeight)}</strong></td>
                  <td><strong>{formatNumber(totalNet)}</strong></td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="report-actions">
          <div className="report-info">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
          <div className="report-buttons">
            <button className="report-btn btn-cancel" onClick={onClose}>
              ✖️ Close
            </button>
            <button className="report-btn btn-export" onClick={handleExport}>
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}