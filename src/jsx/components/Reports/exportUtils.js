import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Helper to export data to Excel (.xlsx)
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file
 * @param {Array} headers - Array of header strings
 * @param {Function} mapRow - Function to map an object to an array of values matching headers
 */
export const exportToExcel = (data, filename, headers, mapRow) => {
    // 1. Format the data to match headers
    const formattedData = [
        headers, // First row is headers
        ...data.map(mapRow) // Then rows
    ];

    // 2. Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");

    // 3. Auto-size columns approx
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 12) + 2 }));
    worksheet["!cols"] = colWidths;

    // 4. Generate buffer and save
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Helper to export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file/report
 * @param {Array} headers - Array of header strings
 * @param {Function} mapRow - Function to map an object to an array of values matching headers
 * @param {String} title - Title to display inside the PDF
 */
export const exportToPDF = (data, filename, headers, mapRow, title = "Report") => {
    const doc = new jsPDF('landscape'); // Landscape format is better for tables

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Format data
    const body = data.map(mapRow);

    // Auto Table
    doc.autoTable({
        head: [headers],
        body: body,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [1, 163, 255] }, // Matches primary blue
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray
    });

    // Save
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Legacy CSV export
 */
export const handleExport = (data, filename, headers, mapRow) => {
    const csvContent = [
        headers.join(","),
        ...data.map(row => mapRow(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
