import { CsvData } from "@/lib/types/CSV";

/**
 * Parse a CSV string into headers and rows
 */
export const parseCSV = (csvString: string): CsvData => {
    // Split by new lines
    const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // No data
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }
    
    // Parse headers 
    const headers = parseCSVLine(lines[0]);
    
    // Parse rows (skip headers)
    const rows = lines.slice(1).map(line => parseCSVLine(line));
    
    return { headers, rows };
  };

  /**
 * Parse a CSV line into an array of values
 * Handles quoted values with commas inside them
 */
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }
      
      if (char === ',' && !insideQuotes) {
        result.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    
    // Add the last value
    result.push(currentValue.trim());
    
    return result;
  };

/**
 * Convert data to a CSV string for download
 */
export const dataToCSV = (data: CsvData): string => {
  // Create headers line
  const headerLine = data.headers.map(escapeCSVValue).join(',');
  
  // Create rows
  const rowLines = data.rows.map(row => 
    row.map(escapeCSVValue).join(',')
  );
  
  // Combine headers and rows
  return [headerLine, ...rowLines].join('\n');
};

/**
 * Escape a value for CSV format
 */
const escapeCSVValue = (value: string): string => {
  // If value contains commas, quotes, or newlines, wrap in quotes and escape inner quotes
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Download CSV data as a file
 */
export const downloadCSV = (data: CsvData, filename: string): void => {
  const csvContent = dataToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};