import jsPDF from 'jspdf';
import { MaterialEntry } from '../types';

export async function generatePDFReport(
  polisher: { id: string; name: string },
  entries: MaterialEntry[]
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(polisher.name, 20, 20);
  
  // Date on right corner
  const currentDate = new Date().toLocaleDateString();
  const dateWidth = pdf.getTextWidth(currentDate);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(currentDate, pageWidth - dateWidth - 20, 20);
  
  // Title
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Material Entry Report', 20, 40);
  
  // Table headers
  const startY = 60;
  const rowHeight = 8;
  const colWidths = [25, 25, 30, 20, 25, 25];
  const headers = ['Item Code', 'Item Name', 'Bag Type', 'Dozens', 'Gross (kg)', 'Net (kg)'];
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  let currentX = 20;
  headers.forEach((header, index) => {
    pdf.text(header, currentX, startY);
    currentX += colWidths[index];
  });
  
  // Draw header line
  pdf.line(20, startY + 2, pageWidth - 20, startY + 2);
  
  // Table data
  pdf.setFont('helvetica', 'normal');
  let currentY = startY + 10;
  
  entries.forEach((entry, index) => {
    if (currentY > pageHeight - 30) {
      pdf.addPage();
      currentY = 30;
    }
    
    currentX = 20;
    const rowData = [
      entry.itemCode,
      entry.itemName,
      entry.bagType,
      entry.dozens.toString(),
      entry.grossWeight.toFixed(3),
      entry.netWeight.toFixed(3)
    ];
    
    rowData.forEach((data, colIndex) => {
      // Truncate text if too long
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
  
  // Summary section
  currentY += 10;
  if (currentY > pageHeight - 50) {
    pdf.addPage();
    currentY = 30;
  }
  
  pdf.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary:', 20, currentY);
  currentY += 10;
  
  pdf.setFont('helvetica', 'normal');
  
  const totalDozens = entries.reduce((sum, entry) => sum + entry.dozens, 0);
  const totalGrossWeight = entries.reduce((sum, entry) => sum + entry.grossWeight, 0);
  const totalNetWeight = entries.reduce((sum, entry) => sum + entry.netWeight, 0);
  
  pdf.text(`Total Dozens: ${totalDozens}`, 20, currentY);
  currentY += 6;
  pdf.text(`Total Gross Weight: ${totalGrossWeight.toFixed(3)} kg`, 20, currentY);
  currentY += 6;
  pdf.text(`Total Net Weight: ${totalNetWeight.toFixed(3)} kg`, 20, currentY);
  
  // Save the PDF
  const fileName = `StockMate_${polisher.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}