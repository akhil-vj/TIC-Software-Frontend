import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useReportData } from "./useReportData";
import { exportToExcel, exportToPDF, handleExport } from "./exportUtils";

const TopPackagesReport = () => {
    const { loading, topPackages } = useReportData();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortCol, setSortCol] = useState("revenue");
    const [sortDesc, setSortDesc] = useState(true);

    const handleSort = (col) => {
        if (sortCol === col) setSortDesc(!sortDesc);
        else { setSortCol(col); setSortDesc(true); }
    };

    const sortedData = [...topPackages].sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (typeof valA === 'string') return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        return sortDesc ? valB - valA : valA - valB;
    }).filter(item =>
        item.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

    const getExportData = () => ({
        data: sortedData,
        filename: "TopPackages_Analytics",
        headers: ["ID", "Itinerary Name", "Base Destination", "Pax", "Revenue", "Bookings"],
        mapRow: (item) => [item.id, item.packageName, item.destination, item.pax, item.revenue, item.bookings]
    });

    return (
        <>
            <div className="row">
                <div className="col-xl-12">
                    <div className="page-titles mb-4 pb-2 d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex align-items-center mb-2 mb-sm-0">
                            <Link to="/reports" className="btn btn-primary btn-sm me-3 bg-white text-primary border-primary">
                                <i className="las la-arrow-left me-1"></i>Back
                            </Link>
                            <h2 className="heading mb-0">Top Packages Analytics</h2>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="dropdown">
                                <button className="btn btn-outline-warning btn-sm dropdown-toggle" onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
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
                                        <button className="dropdown-item" onClick={() => { const d = getExportData(); exportToPDF(d.data, d.filename, d.headers, d.mapRow, "Top Packages Analytics Report"); setExportDropdownOpen(false); }}>
                                            <i className="las la-file-pdf text-danger me-2"></i>Export as PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete Data Table */}
            <div className="row">
                <div className="col-xl-12">
                    <div className="card shadow-sm border-0 bg-white border-top border-4 border-warning">
                        <div className="card-header border-0 pb-3 d-flex flex-wrap align-items-center justify-content-between">
                            <h4 className="card-title mb-0">Most Popular Itineraries</h4>
                            <div className="input-group search-area border rounded" style={{ width: '300px' }}>
                                <input type="text" className="form-control border-0 bg-transparent px-3" placeholder="Search itineraries or destinations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <span className="input-group-text bg-transparent border-0 pe-3"><i className="las la-search text-muted"></i></span>
                            </div>
                        </div>
                        <div className="card-body pt-0">
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered mb-0">
                                    <thead className="thead-light bg-light" style={{ cursor: 'pointer' }}>
                                        <tr>
                                            <th style={{ width: '50px' }}>Rank</th>
                                            <th onClick={() => handleSort('packageName')}>Itinerary Name {sortCol === 'packageName' && <i className={`las la-sort-${sortDesc ? 'down' : 'up'}`}></i>}</th>
                                            <th onClick={() => handleSort('destination')}>Destination {sortCol === 'destination' && <i className={`las la-sort-${sortDesc ? 'down' : 'up'}`}></i>}</th>
                                            <th className="text-center" onClick={() => handleSort('bookings')}>Bookings {sortCol === 'bookings' && <i className={`las la-sort-${sortDesc ? 'down' : 'up'}`}></i>}</th>
                                            <th className="text-center" onClick={() => handleSort('pax')}>Pax Volume {sortCol === 'pax' && <i className={`las la-sort-${sortDesc ? 'down' : 'up'}`}></i>}</th>
                                            <th className="text-end" onClick={() => handleSort('revenue')}>Revenue {sortCol === 'revenue' && <i className={`las la-sort-${sortDesc ? 'down' : 'up'}`}></i>}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedData.map((pkg, i) => {
                                            const isTop3 = i < 3 && sortCol === 'revenue' && sortDesc && searchTerm === "";
                                            const badgeColor = i === 0 ? '#FBBF24' : i === 1 ? '#9CA3AF' : i === 2 ? '#D97706' : 'transparent';
                                            return (
                                                <tr key={i} className={isTop3 ? 'bg-light' : ''}>
                                                    <td className="text-center">
                                                        {isTop3 ? (
                                                            <div className="icon-box icon-box-sm rounded-circle text-white font-w600 fs-14 mx-auto" style={{ width: '32px', height: '32px', background: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <i className="las la-trophy"></i>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted font-w600">{i + 1}</span>
                                                        )}
                                                    </td>
                                                    <td className="font-w600 text-black">
                                                        <span className="text-primary">{pkg.packageName}</span>
                                                    </td>
                                                    <td className="text-muted fs-13"><i className="las la-map-marker me-1"></i>{pkg.destination}</td>
                                                    <td className="text-center font-w500">{pkg.bookings}</td>
                                                    <td className="text-center">{pkg.pax}</td>
                                                    <td className="text-end font-w600 text-success">${pkg.revenue.toLocaleString()}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TopPackagesReport;
