import jsPDF from 'jspdf';
import { MaterialEntry } from '../types';

export async function generatePDFReport(
  polisher: { id: string; name: string },
  entries: MaterialEntry[]
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header – Polisher Name
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Poisher - '+polisher.name, 20, 20);

  // Date with label on right
  const currentDate = new Date().toLocaleDateString();
  pdf.setFontSize(12);
  const dateText = `Date: ${currentDate}`;
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, pageWidth - dateWidth - 20, 20);

  // Title
  // pdf.setFontSize(14);
  // pdf.setFont('helvetica', 'bold');
  // pdf.text('Material Entry Report', 20, 40);

  // Table headers
  const startY = 40;
  const rowHeight = 8;

  // NEW: Added S.No column (15 width)
  const colWidths = [15, 25, 25, 30, 20, 25, 25];

  const headers = [
    'S.No',
    'Item Code',
    'Item Name',
    'Bag Type',
    'Dozens',
    'Net (kg)',
    'Diff'
  ];

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');

  let currentX = 20;
  headers.forEach((header, index) => {
    pdf.text(header, currentX, startY);
    currentX += colWidths[index];
  });

  // Draw header underline
  pdf.line(20, startY + 2, pageWidth - 20, startY + 2);

  // Table data
  pdf.setFont('helvetica', 'normal');
  let currentY = startY + 10;

  entries.forEach((entry, index) => {
    if (currentY > pageHeight - 40) {
      pdf.addPage();
      currentY = 30;
    }

    currentX = 20;

    const rowData = [
      (index + 1).toString(),
      entry.itemCode,
      entry.itemName,
      entry.bagType,
      entry.dozens.toString(),
      entry.netWeight.toFixed(3),
      entry.toleranceDiff.toFixed(3)
    ];

    rowData.forEach((data, colIndex) => {
      const maxWidth = colWidths[colIndex] - 2;
      let text = data;
      if (pdf.getTextWidth(text) > maxWidth) {
        while (pdf.getTextWidth(text + '...') > maxWidth && text.length > 0) {
          text = text.slice(0, -1);
        }
        text += '...';
      }

      pdf.text(text, currentX, currentY);
      currentX += colWidths[colIndex];
    });

    currentY += rowHeight;
  });

  // ---------- TOTALS ROW ----------
  const totalDozens = entries.reduce((sum, entry) => sum + entry.dozens, 0);
  const totalNetWeight = entries.reduce((sum, entry) => sum + entry.netWeight, 0);

  // Draw a separator line before totals
  pdf.line(20, currentY + 2, pageWidth - 20, currentY + 2);
  currentY += 10;

  pdf.setFont('helvetica', 'bold');

  // Column positions
  const dozensX = 20 + colWidths.slice(0, 4).reduce((a, b) => a + b, 0);
  const netX = dozensX + colWidths[4];

  pdf.text(totalDozens.toString(), dozensX, currentY);
  pdf.text(totalNetWeight.toFixed(3), netX, currentY);

  currentY += 20;

  // ---------- NOTE ----------
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Note:', 20, currentY);

  // Leave TWO BLANK LINES
  currentY += 20;

  // ---------- SIGNATURE LABELS ----------
  pdf.setFont('helvetica', 'bold');
  pdf.text("Issuer's Sign", 20, currentY);
  pdf.text("Receiver's Sign", pageWidth - 70, currentY);

  // Save PDF
  const fileName = `StockMate_${polisher.name.replace(/\s+/g, '_')}_${new Date()
    .toISOString()
    .split('T')[0]}.pdf`;

  pdf.save(fileName);
}
