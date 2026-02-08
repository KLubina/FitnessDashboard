class CSVExporter {
  constructor() {
    this.BOM = "\ufeff";
  }
  convertToCSV(data, headers = null) {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return "";
    }
    const csvHeaders = headers || Object.keys(data[0]);
    const headerRow = csvHeaders.join(";");
    const dataRows = data.map((row) => {
      return csvHeaders
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return "";
          }
          if (value instanceof Date) {
            return value.toLocaleDateString("de-DE");
          }
          const stringValue = String(value).replace(/"/g, '""');
          if (
            stringValue.includes(";") ||
            stringValue.includes(",") ||
            stringValue.includes("\n") ||
            stringValue.includes('"')
          ) {
            return `"${stringValue}"`;
          }
          return stringValue;
        })
        .join(";");
    });
    return this.BOM + [headerRow, ...dataRows].join("\n");
  }
  downloadCSV(csvContent, filename) {
    if (!csvContent) {
      alert("Keine Daten zum Exportieren vorhanden");
      return;
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("CSV-Export wird in diesem Browser nicht unterstützt");
    }
  }
  export(data, filename, headers = null) {
    const csvContent = this.convertToCSV(data, headers);
    this.downloadCSV(csvContent, filename);
  }
}
const csvExporter = new CSVExporter();
export default csvExporter;