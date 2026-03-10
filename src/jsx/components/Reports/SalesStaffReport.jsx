import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useReportData } from "./useReportData";
import { exportToExcel } from "./exportUtils";

const SalesStaffReport = () => {
    const { loading, salesStaffData } = useReportData();
    const fmt = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");
    const [search, setSearch] = useState("");
    const [sortCol, setSortCol] = useState("bookings");
    const [sortDesc, setSortDesc] = useState(true);

    const toggleSort = (col) => {
        if (sortCol === col) setSortDesc(!sortDesc);
        else { setSortCol(col); setSortDesc(true); }
    };

    const filtered = salesStaffData
        .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.email || "").toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => sortDesc ? (b[sortCol] || 0) - (a[sortCol] || 0) : (a[sortCol] || 0) - (b[sortCol] || 0));

    const totals = filtered.reduce((acc, s) => ({
        bookings: acc.bookings + s.bookings,
        pax: acc.pax + s.pax,
        revenue: acc.revenue + s.revenue,
        profit: acc.profit + s.profit,
    }), { bookings: 0, pax: 0, revenue: 0, profit: 0 });

    const avgConv = filtered.length > 0 ? (filtered.reduce((s, x) => s + x.conversionRate, 0) / filtered.length).toFixed(1) : 0;

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
            filtered,
            "Sales_Staff_Report",
            ["Sales Staff", "Email", "Phone", "Total Bookings", "Total Pax", "Revenue", "Profit", "Conv. Rate %"],
            (s) => [s.name, s.email, s.phone, s.bookings, s.pax, s.revenue, s.profit, s.conversionRate + "%"]
        );
    };

    const sortArrow = (col) => sortCol === col ? (sortDesc ? " ▼" : " ▲") : "";

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
                .report-table th { background: #f1f3f5; border: 1px solid #dee2e6; padding: 8px 12px; font-weight: 600; color: #495057; white-space: nowrap; cursor: pointer; user-select: none; }
                .report-table th:hover { background: #e2e6ea; }
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
                            <i className="las la-file-excel me-1"></i>Download Staff Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="excel-tabs">
                        {sheets.map((s, i) => (
                            <Link key={i} to={s.path} className={`excel-tab ${s.path === "/reports/sales-staff" ? "active" : ""}`}>
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
                            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                                <span className="text-muted fs-13">Sales Staff Performance Report — Bookings and revenue by staff member</span>
                                <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }} placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            {loading ? (
                                <div className="text-center py-5 text-muted"><i className="las la-spinner la-spin fs-24 me-2"></i>Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Sales Staff</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th className="num" onClick={() => toggleSort("bookings")}>Total Bookings{sortArrow("bookings")}</th>
                                                <th className="num" onClick={() => toggleSort("pax")}>Total Pax{sortArrow("pax")}</th>
                                                <th className="num" onClick={() => toggleSort("revenue")}>Revenue{sortArrow("revenue")}</th>
                                                <th className="num" onClick={() => toggleSort("profit")}>Profit{sortArrow("profit")}</th>
                                                <th className="num" onClick={() => toggleSort("conversionRate")}>Conv. Rate{sortArrow("conversionRate")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((s, i) => (
                                                <tr key={i}>
                                                    <td className="text-muted">{i + 1}</td>
                                                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                                                    <td className="text-muted" style={{ fontSize: 12 }}>{s.email || "—"}</td>
                                                    <td className="text-muted" style={{ fontSize: 12 }}>{s.phone || "—"}</td>
                                                    <td className="num">{s.bookings}</td>
                                                    <td className="num">{s.pax}</td>
                                                    <td className="num">{fmt(s.revenue)}</td>
                                                    <td className="num" style={{ color: "#198754" }}>{fmt(s.profit)}</td>
                                                    <td className="num">{s.conversionRate}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4" className="text-end">TOTALS:</td>
                                                <td className="num">{totals.bookings}</td>
                                                <td className="num">{totals.pax}</td>
                                                <td className="num">{fmt(totals.revenue)}</td>
                                                <td className="num">{fmt(totals.profit)}</td>
                                                <td className="num">Avg: {avgConv}%</td>
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

export default SalesStaffReport;
