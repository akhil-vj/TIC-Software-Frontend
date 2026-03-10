import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReportData } from "./useReportData";
import { exportToExcel, exportToPDF } from "./exportUtils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Reports = () => {
    const { loading, error, enquiries, salesSummary, destinationSales, salesStaffData, agentPerformance, monthlySales, hotelReports } = useReportData();

    // Format currency
    const fmt = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

    // Build main sales entry rows from real enquiry data
    const salesEntries = enquiries.map((e, i) => {
        const pax = (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
        const sellingPrice = 0; // Not available from API yet
        const supplierCost = 0;
        const totalSales = pax * sellingPrice;
        const totalCost = pax * supplierCost;
        const profit = totalSales - totalCost;
        const staffUser = e.assigned_to_user;
        const staffName = staffUser ? [staffUser.first_name, staffUser.last_name].filter(Boolean).join(" ") : "—";
        const agentName = e.agent?.name || e.customer?.name || "Direct Client";
        const dest = e.destination?.name || "—";
        const subDests = Array.isArray(e.sub_destinations) ? e.sub_destinations.map(d => d.name).join(" + ") : "";
        const pkgName = subDests || dest;
        const dt = e.start_date || e.created_at || "";
        const dateStr = dt ? new Date(dt).toLocaleDateString("en-IN") : "—";

        return {
            date: dateStr,
            rawDate: dt,
            bookingId: `ENQ-${String(e.id).padStart(3, "0")}`,
            salesStaff: staffName,
            agentClient: agentName,
            destination: dest,
            packageName: pkgName,
            pax,
            sellingPrice,
            totalSales,
            supplierCost,
            totalCost,
            profit,
            status: e.status || e.enquiry_status || "—",
        };
    });

    // Export entire workbook as multi-sheet Excel
    const exportMasterExcel = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Sales Entry
        const s1 = [
            ["Date", "Booking ID", "Sales Staff", "Agent / Client", "Destination", "Package Name", "Pax", "Selling Price", "Total Sales", "Supplier Cost", "Total Cost", "Profit", "Status"],
            ...salesEntries.map(r => [r.date, r.bookingId, r.salesStaff, r.agentClient, r.destination, r.packageName, r.pax, r.sellingPrice, r.totalSales, r.supplierCost, r.totalCost, r.profit, r.status])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "Sales Entry");

        // Sheet 2: Monthly Summary
        const s2 = [
            ["Month", "Total Bookings", "Total Pax", "Total Sales", "Total Cost", "Profit"],
            ...monthlySales.map(m => [m.month, m.bookings, m.pax, m.revenue, 0, m.profit])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "Monthly Summary");

        // Sheet 3: Destination Report
        const s3 = [
            ["Destination", "Bookings", "Pax", "Revenue", "Profit"],
            ...destinationSales.map(d => [d.destination, d.bookings, d.pax, d.revenue, d.profit])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), "Destination Report");

        // Sheet 4: Hotel Report
        const s4h = [
            ["Hotel Name", "Destination", "Bookings", "Room Nights", "Revenue", "Rating", "Occupancy %"],
            ...hotelReports.map(h => [h.hotelName, h.destination, h.bookings, h.nights, h.revenue, h.rating, h.occupancy])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s4h), "Hotel Report");

        // Sheet 5: Agent Report
        const s4 = [
            ["Agent Name", "Bookings", "Revenue", "Profit"],
            ...agentPerformance.map(a => [a.agentName, a.bookings, a.revenue, 0])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s4), "Agent Report");

        // Sheet 5: Sales Staff Report
        const s5 = [
            ["Sales Staff", "Total Bookings", "Total Pax", "Revenue", "Profit"],
            ...salesStaffData.map(s => [s.name, s.bookings, s.pax, s.revenue, s.profit])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s5), "Sales Staff Report");

        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `DMC_Sales_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    // Sheet tabs config
    const sheets = [
        { label: "Sales Entry", path: "/reports", icon: "la-table" },
        { label: "Monthly Summary", path: "/reports/monthly-trends", icon: "la-calendar-alt" },
        { label: "Destination Report", path: "/reports/destination", icon: "la-map-marked-alt" },
        { label: "Hotel Report", path: "/reports/hotels", icon: "la-hotel" },
        { label: "Agent Report", path: "/reports/agents", icon: "la-handshake" },
        { label: "Sales Staff", path: "/reports/sales-staff", icon: "la-user-tie" },
    ];

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .excel-tabs { display: flex; border-bottom: 2px solid #dee2e6; margin-bottom: 0; overflow-x: auto; }
                .excel-tab { padding: 10px 20px; border: 1px solid #dee2e6; border-bottom: none; margin-right: 2px; border-radius: 6px 6px 0 0; background: #f8f9fa; color: #495057; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; cursor: pointer; transition: all 0.15s; }
                .excel-tab:hover { background: #e9ecef; color: #212529; text-decoration: none; }
                .excel-tab.active { background: #fff; color: #0d6efd; border-bottom: 2px solid #fff; margin-bottom: -2px; }
                .excel-tab i { margin-right: 6px; }
                .report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .report-table th { background: #f1f3f5; border: 1px solid #dee2e6; padding: 8px 12px; font-weight: 600; color: #495057; white-space: nowrap; position: sticky; top: 0; }
                .report-table td { border: 1px solid #dee2e6; padding: 6px 12px; color: #212529; }
                .report-table tr:hover td { background: #f8f9fa; }
                .report-table .num { text-align: right; font-variant-numeric: tabular-nums; }
                .report-table tfoot td { background: #e9ecef; font-weight: 700; border-top: 2px solid #adb5bd; }
                .report-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; flex-wrap: wrap; gap: 10px; }
            `}} />

            {/* Header */}
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h3 className="mb-0 font-w600">DMC Sales Report</h3>
                        <div className="d-flex gap-2">
                            <button className="btn btn-success btn-sm" onClick={exportMasterExcel} disabled={loading}>
                                <i className="las la-file-excel me-1"></i>Download Full Excel Workbook
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sheet Tabs */}
            <div className="row">
                <div className="col-12">
                    <div className="excel-tabs">
                        {sheets.map((s, i) => (
                            <Link key={i} to={s.path} className={`excel-tab ${s.path === "/reports" ? "active" : ""}`}>
                                <i className={`las ${s.icon}`}></i>{s.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sheet 1: Sales Entry */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "0 0 8px 8px" }}>
                        <div className="card-body p-0">
                            {loading && (
                                <div className="text-center py-5 text-muted">
                                    <i className="las la-spinner la-spin fs-24 me-2"></i>Loading data...
                                </div>
                            )}
                            {error && (
                                <div className="alert alert-danger m-3">
                                    <i className="las la-exclamation-triangle me-2"></i>Error loading data.
                                </div>
                            )}
                            {!loading && (
                                <div className="table-responsive" style={{ maxHeight: "70vh" }}>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Date</th>
                                                <th>Booking ID</th>
                                                <th>Sales Staff</th>
                                                <th>Agent / Client</th>
                                                <th>Destination</th>
                                                <th>Package Name</th>
                                                <th className="num">Pax</th>
                                                <th className="num">Selling Price</th>
                                                <th className="num">Total Sales</th>
                                                <th className="num">Supplier Cost</th>
                                                <th className="num">Total Cost</th>
                                                <th className="num">Profit</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesEntries.map((r, i) => (
                                                <tr key={i}>
                                                    <td className="text-muted">{i + 1}</td>
                                                    <td style={{ whiteSpace: "nowrap" }}>{r.date}</td>
                                                    <td><span style={{ color: "#0d6efd", fontWeight: 500 }}>{r.bookingId}</span></td>
                                                    <td>{r.salesStaff}</td>
                                                    <td>{r.agentClient}</td>
                                                    <td>{r.destination}</td>
                                                    <td>{r.packageName}</td>
                                                    <td className="num">{r.pax}</td>
                                                    <td className="num">{fmt(r.sellingPrice)}</td>
                                                    <td className="num">{fmt(r.totalSales)}</td>
                                                    <td className="num">{fmt(r.supplierCost)}</td>
                                                    <td className="num">{fmt(r.totalCost)}</td>
                                                    <td className="num" style={{ color: r.profit >= 0 ? "#198754" : "#dc3545", fontWeight: 600 }}>{fmt(r.profit)}</td>
                                                    <td>
                                                        <span className={`badge badge-sm ${r.status.toLowerCase() === "confirmed" ? "badge-success" : r.status.toLowerCase() === "cancelled" ? "badge-danger" : "badge-warning"}`}
                                                            style={{ fontSize: "11px" }}>{r.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="7" className="text-end">TOTALS:</td>
                                                <td className="num">{salesEntries.reduce((s, r) => s + r.pax, 0)}</td>
                                                <td className="num"></td>
                                                <td className="num">{fmt(salesEntries.reduce((s, r) => s + r.totalSales, 0))}</td>
                                                <td className="num"></td>
                                                <td className="num">{fmt(salesEntries.reduce((s, r) => s + r.totalCost, 0))}</td>
                                                <td className="num">{fmt(salesEntries.reduce((s, r) => s + r.profit, 0))}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
