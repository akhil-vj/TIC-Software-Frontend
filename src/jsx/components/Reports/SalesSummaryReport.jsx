import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useReportData } from "./useReportData";
import { exportToExcel, exportToPDF, handleExport } from "./exportUtils";

const SalesSummaryReport = () => {

    const { loading, salesSummary, destinationSales, packageTypes, salesByAgent, monthlySales } = useReportData();
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

    const getExportData = () => ({
        data: destinationSales,
        filename: "Destination_Summary",
        headers: ["ID", "Destination", "Bookings", "Pax", "Revenue", "Profit", "Margin %"],
        mapRow: (item) => [item.id, item.destination, item.bookings, item.pax, item.revenue, item.profit, item.margin]
    });

    const maxMonthlyRevenue = monthlySales.length > 0 ? Math.max(...monthlySales.map(m => m.bookings), 1) : 1;

    return (
        <>
            <div className="row">
                <div className="col-xl-12">
                    <div className="page-titles mb-4 pb-2 d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex align-items-center mb-2 mb-sm-0">
                            <Link to="/reports" className="btn btn-primary btn-sm me-3 bg-white text-primary border-primary">
                                <i className="las la-arrow-left me-1"></i>Back
                            </Link>
                            <h2 className="heading mb-0">Sales Summary Report</h2>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="dropdown">
                                <button className="btn btn-outline-primary btn-sm dropdown-toggle" onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
                                    <i className="las la-download me-1"></i> Export Data
                                </button>
                                {exportDropdownOpen && (
                                    <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                                        <button className="dropdown-item" onClick={() => { const d = getExportData(); exportToExcel(d.data, d.filename, d.headers, d.mapRow); setExportDropdownOpen(false); }}>
                                            <i className="las la-file-excel text-success me-2"></i>Export as Excel
                                        </button>
                                        <button className="dropdown-item" onClick={() => { const d = getExportData(); handleExport(d.data, d.filename, d.headers, d.mapRow); setExportDropdownOpen(false); }}>
                                            <i className="las la-file-csv text-info me-2"></i>Export as CSV
                                        </button>
                                        <button className="dropdown-item" onClick={() => { const d = getExportData(); exportToPDF(d.data, d.filename, d.headers, d.mapRow, "Sales Destination Summary Report"); setExportDropdownOpen(false); }}>
                                            <i className="las la-file-pdf text-danger me-2"></i>Export as PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                                <i className="las la-print me-1"></i> Print Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="row g-3 mb-4">
                {/* Total Bookings */}
                <div className="col-xl-4 col-sm-6">
                    <div className="card card-box blue h-100" style={{ marginBottom: 0 }}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#01A3FF" />
                                    <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#01A3FF" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    <i className="las la-calendar-check fs-24 text-white"></i>
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">Total<br />Bookings</h4>
                                </div>
                            </div>
                            <div className="chart-num text-end">
                                <h2 className="font-w600 mb-0 fs-28 text-white">{salesSummary.totalBookings}</h2>
                                <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Confirmed orders</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Pax */}
                <div className="col-xl-4 col-sm-6">
                    <div className="card card-box green h-100" style={{ marginBottom: 0 }}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#10B981" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    <i className="las la-users fs-24 text-white"></i>
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">Total<br />Pax</h4>
                                </div>
                            </div>
                            <div className="chart-num text-end">
                                <h2 className="font-w600 mb-0 fs-28 text-white">{salesSummary.totalPax}</h2>
                                <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Total travelers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="col-xl-4 col-sm-6">
                    <div className="card card-box purple h-100" style={{ marginBottom: 0 }}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#8B5CF6" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    <i className="las la-dollar-sign fs-24 text-white"></i>
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">Total<br />Revenue</h4>
                                </div>
                            </div>
                            <div className="chart-num text-end">
                                <h2 className="font-w600 mb-0 fs-28 text-white">${(salesSummary.totalRevenue / 1000000).toFixed(2)}M</h2>
                                <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Gross sales</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="col-xl-4 col-sm-6">
                    <div className="card card-box red h-100" style={{ marginBottom: 0 }}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#EF4444" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    <i className="las la-money-bill-wave fs-24 text-white"></i>
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">Total<br />Cost</h4>
                                </div>
                            </div>
                            <div className="chart-num text-end">
                                <h2 className="font-w600 mb-0 fs-28 text-white">${(salesSummary.totalCost / 1000).toFixed(0)}k</h2>
                                <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Operating cost</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gross Profit */}
                <div className="col-xl-4 col-sm-6">
                    <div className="card card-box amber h-100" style={{ marginBottom: 0 }}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#F59E0B" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    <i className="las la-wallet fs-24 text-white"></i>
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">Gross<br />Profit</h4>
                                </div>
                            </div>
                            <div className="chart-num text-end">
                                <h2 className="font-w600 mb-0 fs-28 text-white">${(salesSummary.grossProfit / 1000).toFixed(0)}k</h2>
                                <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Net margin</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profit Margin */}
                <div className="col-xl-4 col-sm-6">
                    <div className="card card-box secondary h-100" style={{ marginBottom: 0 }}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#94A3B8" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    <i className="las la-percentage fs-24 text-white"></i>
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">Profit<br />Margin</h4>
                                </div>
                            </div>
                            <div className="chart-num text-end">
                                <h2 className="font-w600 mb-0 fs-28 text-white">{salesSummary.profitMargin}%</h2>
                                <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Overall %</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Monthly Sales Trend Chart (CSS-based) */}
                <div className="col-xl-12 mb-4">
                    <div className="card shadow-sm border-0 bg-white">
                        <div className="card-header border-0 pb-0">
                            <h4 className="card-title">Monthly Revenue Trend</h4>
                        </div>
                        <div className="card-body pt-2">
                            <div className="d-flex align-items-end justify-content-around" style={{ height: '300px', paddingBottom: '30px', paddingTop: '40px' }}>
                                {monthlySales.map((item, index) => {
                                    const heightPercentage = Math.max((item.revenue / maxMonthlyRevenue) * 100, 5);
                                    const colors = ['#01A3FF', '#3B5BDB', '#8B5CF6', '#10B981', '#FBBF24', '#F59E0B'];

                                    return (
                                        <div key={index} className="text-center position-relative" style={{ flex: '1 1 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <div className="position-absolute" style={{ bottom: `${heightPercentage}%`, marginBottom: '10px', width: '100%' }}>
                                                <small className="font-w600 text-black fs-12">${(item.revenue / 1000).toFixed(0)}k</small>
                                            </div>
                                            <div
                                                className="w-50 mx-auto"
                                                style={{
                                                    height: `${heightPercentage}%`,
                                                    background: `linear-gradient(to top, ${colors[index]}80, ${colors[index]})`,
                                                    borderRadius: '6px 6px 0 0',
                                                    transition: 'height 0.5s ease',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                                }}
                                                title={`Bookings: ${item.bookings} \nProfit: $${item.profit.toLocaleString()}`}
                                            ></div>
                                            <div className="position-absolute" style={{ bottom: '-30px', width: '100%' }}>
                                                <p className="mb-0 fs-13 font-w600 text-muted">{item.month}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales By Destination Table */}
                <div className="col-xl-6 mb-4">
                    <div className="card shadow-sm border-0 bg-white h-100">
                        <div className="card-header border-0 pb-0 d-flex justify-content-between">
                            <h4 className="card-title">Sales by Destination</h4>
                            <span className="badge badge-primary">{destinationSales.length} Regions</span>
                        </div>
                        <div className="card-body pt-3">
                            <div className="table-responsive">
                                <table className="table table-hover table-sm">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Destination</th>
                                            <th className="text-center">Bookings</th>
                                            <th className="text-end">Revenue</th>
                                            <th className="text-end">Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {destinationSales.map((item, i) => (
                                            <tr key={i}>
                                                <td className="font-w500">{item.destination}</td>
                                                <td className="text-center">{item.bookings}</td>
                                                <td className="text-end">${item.revenue.toLocaleString()}</td>
                                                <td className="text-end">
                                                    <span className={`badge ${item.margin >= 30 ? 'badge-success' : 'badge-warning'} light`}>{item.margin}%</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales By Package Type Table */}
                <div className="col-xl-6 mb-4">
                    <div className="card shadow-sm border-0 bg-white h-100">
                        <div className="card-header border-0 pb-0 d-flex justify-content-between">
                            <h4 className="card-title">Sales by Package Type</h4>
                        </div>
                        <div className="card-body pt-3">
                            <div className="table-responsive">
                                <table className="table table-hover table-sm">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Package Type</th>
                                            <th className="text-center">Pax</th>
                                            <th className="text-end">Revenue</th>
                                            <th className="text-end">Profit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packageTypes.map((item, i) => (
                                            <tr key={i}>
                                                <td className="font-w500">{item.packageType}</td>
                                                <td className="text-center">{item.pax}</td>
                                                <td className="text-end">${item.revenue.toLocaleString()}</td>
                                                <td className="text-end text-success font-w600">${item.profit.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales By Agent Channel Table */}
                <div className="col-xl-6 mb-4">
                    <div className="card shadow-sm border-0 bg-white h-100">
                        <div className="card-header border-0 pb-0">
                            <h4 className="card-title">Sales by Channel</h4>
                        </div>
                        <div className="card-body pt-3">
                            <div className="table-responsive">
                                <table className="table table-hover table-sm">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Channel</th>
                                            <th className="text-center">Bookings</th>
                                            <th className="text-end">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesByAgent.map((item, i) => (
                                            <tr key={i}>
                                                <td className="font-w500">
                                                    <i className={`las ${i === 0 ? 'la-desktop text-primary' : i === 1 ? 'la-briefcase text-success' : i === 2 ? 'la-globe text-info' : 'la-building text-warning'} me-2`}></i>
                                                    {item.channel}
                                                </td>
                                                <td className="text-center">{item.bookings}</td>
                                                <td className="text-end font-w600">${item.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Observations & Action Plan */}
                <div className="col-xl-6 mb-4">
                    <div className="card shadow-sm border-0 bg-white h-100">
                        <div className="card-header border-0 pb-0">
                            <h4 className="card-title">Insights & Action Plan</h4>
                        </div>
                        <div className="card-body pt-3">
                            <h6 className="font-w600 text-info mb-2"><i className="las la-lightbulb me-2"></i>Key Observations</h6>
                            <ul className="mb-4 text-muted fs-13 ms-3" style={{ listStyleType: 'disc' }}>
                                <li className="mb-1">Maldives destination yields the highest profit margin (38% market share).</li>
                                <li className="mb-1">MICE packages have the highest revenue per booking ($72k avg).</li>
                                <li className="mb-1">Direct B2C sales dominate revenue (46%) followed by B2B.</li>
                            </ul>

                            <h6 className="font-w600 text-success mb-2"><i className="las la-rocket me-2"></i>Recommended Actions</h6>
                            <ul className="text-muted fs-13 ms-3" style={{ listStyleType: 'disc' }}>
                                <li className="mb-1">Increase marketing spend on Maldives and Bali packages.</li>
                                <li className="mb-1">Develop targeted corporate outreach for more MICE bookings.</li>
                                <li className="mb-1">Incentivize top performing agents (Global Explorer, Wanderlust).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalesSummaryReport;
