/**
 * Formats date values to DD-MM-YYYY format, avoiding timezone issues
 * @param value - Date string in various formats (ISO, YYYY-MM-DD, etc.)
 * @returns Formatted date string in DD-MM-YYYY format or 'N/A' if invalid
 */
export function formatDateForDisplay(value: string | null | undefined): string {
  if (!value) return 'N/A';
  
  try {
    let dateStr: string;
    
    // Handle different date formats
    if (typeof value === 'string' && value.includes('T')) {
      // ISO string format (e.g., "2001-08-18T00:00:00.000Z")
      dateStr = value.split('T')[0]; // Extract YYYY-MM-DD part
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Already in YYYY-MM-DD format
      dateStr = value;
    } else {
      // Try to parse as date and extract date part without timezone conversion
      const date = new Date(value + 'T00:00:00'); // Add time to avoid timezone issues
      if (isNaN(date.getTime())) return value; // Return original if invalid date
      dateStr = date.toISOString().split('T')[0];
    }
    
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  } catch {
    return value || 'N/A';
  }
}

/**
 * Formats date values for form inputs (YYYY-MM-DD format)
 * @param value - Date string in various formats
 * @returns Date string in YYYY-MM-DD format for input fields
 */
export function formatDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  
  try {
    if (typeof value === 'string' && value.includes('T')) {
      // ISO string format
      return value.split('T')[0];
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Already in YYYY-MM-DD format
      return value;
    } else if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
      // DD-MM-YYYY format, convert to YYYY-MM-DD
      const [day, month, year] = value.split('-');
      return `${year}-${month}-${day}`;
    } else {
      // Try to parse as date
      const date = new Date(value + 'T00:00:00');
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    }
  } catch {
    return '';
  }
}

/**
 * Formats date values for API payloads (YYYY-MM-DD format) without timezone issues
 * @param value - Date value from form input (string or Date object)
 * @returns Date string in YYYY-MM-DD format for API submission
 */
export function formatDateForAPI(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  
  try {
    if (typeof value === 'string') {
      // If it's already a string from HTML date input, it should be in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      // If it's a string in other format, parse it safely
      return formatDateForInput(value);
    } else if (value instanceof Date) {
      // If it's a Date object, format it without timezone conversion
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return undefined;
  } catch {
    return undefined;
  }
}
