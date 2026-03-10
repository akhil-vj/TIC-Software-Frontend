import React from "react";
import { Link } from "react-router-dom";
import { useReportData } from "./useReportData";
import { exportToExcel, exportToPDF } from "./exportUtils";

const MonthlyTrendsReport = () => {
    const { loading, monthlySales } = useReportData();
    const fmt = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

    const totals = monthlySales.reduce((acc, m) => ({
        bookings: acc.bookings + m.bookings,
        pax: acc.pax + m.pax,
        revenue: acc.revenue + m.revenue,
        profit: acc.profit + m.profit,
    }), { bookings: 0, pax: 0, revenue: 0, profit: 0 });

    const sheets = [
        { label: "Sales Entry", path: "/reports", icon: "la-table" },
        { label: "Monthly Summary", path: "/reports/monthly-trends", icon: "la-calendar-alt" },
        { label: "Destination Report", path: "/reports/destination", icon: "la-map-marked-alt" },
        { label: "Hotel Report", path: "/reports/hotels", icon: "la-hotel" },
        { label: "Agent Report", path: "/reports/agents", icon: "la-handshake" },
        { label: "Sales Staff", path: "/reports/sales-staff", icon: "la-user-tie" },
    ];

    const handleExcelExport = () => {
        exportToExcel(
            monthlySales,
            "Monthly_Summary",
            ["Month", "Total Bookings", "Total Pax", "Total Sales", "Total Cost", "Profit"],
            (m) => [m.month, m.bookings, m.pax, m.revenue, 0, m.profit]
        );
    };

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
                .report-table th { background: #f1f3f5; border: 1px solid #dee2e6; padding: 8px 12px; font-weight: 600; color: #495057; white-space: nowrap; }
                .report-table td { border: 1px solid #dee2e6; padding: 6px 12px; color: #212529; }
                .report-table tr:hover td { background: #f8f9fa; }
                .report-table .num { text-align: right; font-variant-numeric: tabular-nums; }
                .report-table tfoot td { background: #e9ecef; font-weight: 700; border-top: 2px solid #adb5bd; }
            `}} />

            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h3 className="mb-0 font-w600">DMC Sales Report</h3>
                        <button className="btn btn-success btn-sm" onClick={handleExcelExport} disabled={loading}>
                            <i className="las la-file-excel me-1"></i>Download Monthly Summary
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="excel-tabs">
                        {sheets.map((s, i) => (
                            <Link key={i} to={s.path} className={`excel-tab ${s.path === "/reports/monthly-trends" ? "active" : ""}`}>
                                <i className={`las ${s.icon}`}></i>{s.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "0 0 8px 8px" }}>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5 text-muted"><i className="las la-spinner la-spin fs-24 me-2"></i>Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Month</th>
                                                <th className="num">Total Bookings</th>
                                                <th className="num">Total Pax</th>
                                                <th className="num">Total Sales</th>
                                                <th className="num">Total Cost</th>
                                                <th className="num">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlySales.map((m, i) => (
                                                <tr key={i}>
                                                    <td className="text-muted">{i + 1}</td>
                                                    <td style={{ fontWeight: 500 }}>{m.month}</td>
                                                    <td className="num">{m.bookings}</td>
                                                    <td className="num">{m.pax}</td>
                                                    <td className="num">{fmt(m.revenue)}</td>
                                                    <td className="num">{fmt(0)}</td>
                                                    <td className="num" style={{ color: m.profit >= 0 ? "#198754" : "#dc3545", fontWeight: 600 }}>{fmt(m.profit)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="2" className="text-end">TOTALS:</td>
                                                <td className="num">{totals.bookings}</td>
                                                <td className="num">{totals.pax}</td>
                                                <td className="num">{fmt(totals.revenue)}</td>
                                                <td className="num">{fmt(0)}</td>
                                                <td className="num" style={{ fontWeight: 700 }}>{fmt(totals.profit)}</td>
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

export default MonthlyTrendsReport;
