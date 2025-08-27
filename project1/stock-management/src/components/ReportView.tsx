import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/ReportView.css';
import type { MaterialEntry } from '../types';

interface Props {
  polisherName: string;
  entries: MaterialEntry[];
}

export default function ReportView({ polisherName, entries }: Props) {
  const totalDozens = entries.reduce((sum, e) => sum + e.dozens, 0);
  const totalWeight = entries.reduce((sum, e) => sum + e.totalWeight, 0);
  const totalNet = entries.reduce((sum, e) => sum + e.netWeight, 0);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text(`Polisher Report: ${polisherName}`, 14, 20);

    autoTable(doc, {
      head: [['Item', 'Dozens', 'Total Weight', 'Net Weight', 'Avg/Dozen', 'Tolerance']],
      body: entries.map(e => [
        e.itemName,
        e.dozens,
        e.totalWeight.toFixed(2),
        e.netWeight.toFixed(2),
        e.avgWeight.toFixed(2),
        `${e.toleranceDiff.toFixed(2)}%`
      ]),
      foot: [['Total', totalDozens, totalWeight.toFixed(2), totalNet.toFixed(2), '', '']],
      startY: 30,
    });

    doc.save(`report_${polisherName}.pdf`);
  };

  return (
    <div className="report-view">
      <h2>Polisher: {polisherName}</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Dozens</th>
            <th>Total Weight</th>
            <th>Net Weight</th>
            <th>Avg/Dozen</th>
            <th>Diff </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.id}
              className={Math.abs(e.toleranceDiff) > 2 ? 'highlight' : ''}
            >
              <td>{e.itemName}</td>
              <td>{e.dozens}</td>
              <td>{e.totalWeight.toFixed(2)}</td>
              <td>{e.netWeight.toFixed(2)}</td>
              <td>{e.avgWeight.toFixed(2)}</td>
              <td>{e.toleranceDiff.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total</strong></td>
            <td>{totalDozens}</td>
            <td>{totalWeight.toFixed(2)}</td>
            <td>{totalNet.toFixed(2)}</td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>

      <button onClick={handleExport}>Export as PDF</button>
    </div>
  );
}
