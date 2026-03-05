import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";

import AddEnquiry from "./add";
import CustomModal from "../../layouts/CustomModal";
import DeleteModal from "../common/DeleteModal";
import { URLS } from "../../../constants";
import { useAsync } from "../../utilis/useAsync";
import { usePermissionType } from "../../utilis/usePermissionType";
import { axiosDelete } from "../../../services/AxiosInstance";
import { notifyDelete, notifyError } from "../../utilis/notifyMessage";

// ═══════════════════════════════════════════════════════════════════════════
// KPI CARD HELPERS & INLINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const formatNumber = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return value || "0";
    }
    return new Intl.NumberFormat("en-IN").format(num);
};

const getIcon = (index) => {
    switch (index) {
        case 0:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            );
        case 1:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            );
        case 2:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            );
        default:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            );
    }
};

const getBgColorClass = (index) => {
    const colors = ["blue", "green", "secondary", "pink"];
    return colors[index % colors.length];
};

const EnquiryKPI = ({ title = "Enquiry", array = [] }) => {
    if (!Array.isArray(array) || !array.length) return null;
    return (
        <Swiper
            className="overflow-hidden mb-0"
            speed={1500}
            parallax={true}
            slidesPerView={4}
            spaceBetween={20}
            loop={false}
            modules={[Autoplay]}
            breakpoints={{
                300: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                991: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
                1600: { slidesPerView: 4 },
            }}
        >
            {array.map((item, index) => (
                <SwiperSlide key={index}>
                    <div className={`card card-box ${getBgColorClass(index)}`}>
                        <div className="back-image">
                            <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.4">
                                    <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#01A3FF" />
                                    <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#01A3FF" />
                                    <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#01A3FF" />
                                    <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#01A3FF" />
                                    <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#01A3FF" />
                                    <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#01A3FF" />
                                    <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#01A3FF" />
                                </g>
                            </svg>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="card-box-icon me-2">
                                    {getIcon(index)}
                                </div>
                                <div>
                                    <h4 className="fs-15 font-w600 mb-0">
                                        {item.name}
                                        <br />
                                        {title}
                                    </h4>
                                </div>
                            </div>
                            <div className="chart-num">
                                <h2 className="font-w600 mb-0 fs-28">{formatNumber(item.value)}</h2>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCOPED STYLES (matches Leads / Tickets pattern)
// ═══════════════════════════════════════════════════════════════════════════

const ENQUIRY_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.enquiry-page *, .enquiry-page *::before, .enquiry-page *::after {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
  box-sizing: border-box;
}

.enquiry-page {
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

.enquiry-content {
  padding: 1px 0px 40px;
}

.enquiry-page .dropdown-toggle::after { display: none !important; }
.enquiry-page .dropdown-toggle:focus  { box-shadow: none !important; outline: none !important; }

/* ── Table wrappers ── */
.enquiry-table-outer {
  width: 100%;
  overflow: hidden;
}
.enquiry-table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
}

/* ── Table ── */
.enquiry-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  min-width: 0 !important;
}

.enquiry-table thead tr {
  background: #01A3FF;
}
.enquiry-table thead th {
  padding: 12px 10px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: none !important;
  letter-spacing: 0.1px;
}

.enquiry-table tbody td {
  padding: 10px 10px !important;
  font-size: 13px !important;
  color: #374151;
  vertical-align: middle;
  border-bottom: 1px solid #f0f3f8 !important;
}
.enquiry-table tbody tr:last-child td {
  border-bottom: none !important;
}
.enquiry-table tbody tr:hover td {
  background: #f7f9fc;
}
.enquiry-table tbody tr.row-hovered td { background: #f5f8ff; }

/* Truncate long text */
.td-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 0;
}

/* Assigned To — highlight color */
.td-assigned {
  color: #01A3FF !important;
  font-weight: 500 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 0;
}

/* ── Filter bar ── */
.enquiry-filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── New Enquiry button (matches tickets-cta) ── */
.enquiry-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #3b5bdb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(59,91,219,0.38);
  transition: background 0.13s, box-shadow 0.13s, transform 0.1s;
  white-space: nowrap;
  letter-spacing: 0.1px;
  margin-top: 3px;
}
.enquiry-cta:active {
  transform: scale(0.97);
}

@media (max-width: 900px) {
  .enquiry-content { padding: 7px 0px 30px; }
  .enquiry-table-outer { overflow-x: auto; }
  .enquiry-table { min-width: 700px !important; }
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// FILTER DROPDOWN (same as Leads / Tickets)
// ═══════════════════════════════════════════════════════════════════════════

const FilterDropdown = ({ label, value, options, onChange, onClear }) => {
    const [open, setOpen] = useState(false);
    const selectedLabel = value ? value.label : null;

    return (
        <div className="position-relative" style={{ display: "inline-block" }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 12px", borderRadius: "6px",
                    border: value ? "1.5px solid #3B82F6" : "1.5px solid #e0e0e0",
                    background: value ? "#EFF6FF" : "#F3F4F6",
                    color: value ? "#1D4ED8" : "#555",
                    fontWeight: value ? "600" : "400",
                    fontSize: "13px", cursor: "pointer",
                    whiteSpace: "nowrap", transition: "all 0.15s ease",
                }}
            >
                <span>{selectedLabel || label}</span>
                {value ? (
                    <span
                        onClick={(e) => { e.stopPropagation(); onClear(); setOpen(false); }}
                        style={{ marginLeft: "2px", color: "#1D4ED8", fontWeight: "700", fontSize: "15px", lineHeight: 1 }}
                    >
                        ×
                    </span>
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                )}
            </button>

            {open && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 1000,
                        background: "#fff", borderRadius: "6px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        minWidth: "160px", overflow: "hidden", border: "1px solid #e8e8e8",
                    }}>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                style={{
                                    padding: "9px 14px", fontSize: "13px", cursor: "pointer",
                                    background: value?.value === opt.value ? "#EFF6FF" : "transparent",
                                    color: value?.value === opt.value ? "#1D4ED8" : "#333",
                                    fontWeight: value?.value === opt.value ? "600" : "400",
                                    transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => { if (value?.value !== opt.value) e.currentTarget.style.background = "#f5f5f5"; }}
                                onMouseLeave={(e) => { if (value?.value !== opt.value) e.currentTarget.style.background = "transparent"; }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENQUIRY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Enquiry = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showKpiCards, setShowKpiCards] = useState(true);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [page, setPage] = useState(0);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUrl, setDeleteUrl] = useState("");
    const [deleteName, setDeleteName] = useState("");

    // Filter states
    const [filterType, setFilterType] = useState(null);
    const [filterSource, setFilterSource] = useState(null);
    const [filterAssigned, setFilterAssigned] = useState(null);

    const url = URLS.ENQUIRY_URL;
    const enquiryData = useAsync(url);
    const tableData = enquiryData?.data?.data || [];

    const summaryData = useMemo(() => {
        const getStatus = (item) =>
            String(
                item?.status ||
                item?.enquiry_status ||
                item?.current_status ||
                item?.lead_status ||
                "",
            ).toLowerCase();
        const total = tableData.length;
        const confirmed = tableData.filter((item) =>
            getStatus(item).includes("confirm"),
        ).length;
        const followUp = tableData.filter((item) => {
            const status = getStatus(item);
            return (
                item?.follow_up ||
                item?.followup ||
                item?.follow_up_required ||
                status.includes("follow")
            );
        }).length;
        const sent = tableData.filter((item) => getStatus(item).includes("sent"))
            .length;
        return [
            { name: "Total", value: total },
            { name: "Confirmed", value: confirmed },
            { name: "Follow up", value: followUp },
            { name: "Sent", value: sent },
        ];
    }, [tableData]);

    // ── Filter option arrays ──
    const typeOptions = useMemo(() => {
        const types = [...new Set(tableData.map(i => i?.type).filter(Boolean))];
        return types.map(t => ({ label: t, value: t }));
    }, [tableData]);

    const sourceOptions = useMemo(() => {
        const sources = [...new Set(tableData.map(i => i?.lead_source?.name).filter(Boolean))];
        return sources.map(s => ({ label: s, value: s }));
    }, [tableData]);

    const assignedOptions = useMemo(() => {
        const names = [...new Set(tableData.map(i => i?.assigned_to_user?.first_name).filter(Boolean))];
        return names.map(n => ({ label: n, value: n }));
    }, [tableData]);

    const hasActiveFilters = () => !!(filterType || filterSource || filterAssigned || search);

    const handleClearFilters = () => {
        setFilterType(null);
        setFilterSource(null);
        setFilterAssigned(null);
        setSearch("");
        setPage(0);
    };

    const filteredData = useMemo(() => {
        const term = search.trim().toLowerCase();
        return tableData.filter((item) => {
            const matchValue = (val) => {
                if (val === null || val === undefined) return false;
                if (Array.isArray(val)) return val.some((v) => matchValue(v));
                if (typeof val === "object") return Object.values(val).some((v) => matchValue(v));
                return String(val).toLowerCase().includes(term);
            };
            const matchesSearch = !term || [
                item?.type,
                item?.customer?.name,
                item?.agent?.name,
                item?.lead_source?.name,
                item?.assigned_to_user?.first_name,
                item?.requirements,
                item?.start_date,
            ].some((field) => matchValue(field));

            const matchesType = !filterType || item?.type === filterType.value;
            const matchesSource = !filterSource || item?.lead_source?.name === filterSource.value;
            const matchesAssigned = !filterAssigned || item?.assigned_to_user?.first_name === filterAssigned.value;

            return matchesSearch && matchesType && matchesSource && matchesAssigned;
        });
    }, [tableData, search, filterType, filterSource, filterAssigned]);

    // ── Pagination ──
    const pageSize = 8;
    const pageCount = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const paginatedData = useMemo(() => {
        const start = page * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page]);

    const totalEntries = filteredData.length;
    const startEntry = totalEntries === 0 ? 0 : page * pageSize + 1;
    const endEntry = totalEntries === 0 ? 0 : Math.min((page + 1) * pageSize, totalEntries);

    useEffect(() => { setPage(0); }, [search, filterType, filterSource, filterAssigned]);

    const permissionType = usePermissionType('enquiry');

    const onView = (id) => {
        navigate(`/enquiry-detail/${id}`);
    };
    const onEdit = (id) => {
        navigate(`${id}/profile`);
    };

    // ── Selection & Bulk Delete ──
    const handleSelectRow = (id) => {
        setSelectedRows(prev => {
            if (prev.includes(id)) {
                return prev.filter(rowId => rowId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectFromMenu = (id) => {
        if (!isSelectionMode) setIsSelectionMode(true);
        handleSelectRow(id);
    };

    useEffect(() => {
        if (selectedRows.length === 0 && isSelectionMode) {
            setIsSelectionMode(false);
        }
    }, [selectedRows.length, isSelectionMode]);

    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map(item => item.id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            notifyError("Please select at least one enquiry to delete");
            return;
        }
        try {
            await Promise.all(
                selectedRows.map(id => axiosDelete(`${url}/${id}`))
            );
            notifyDelete("Selected Enquiries");
            setSelectedRows([]);
            setIsSelectionMode(false);
            window.location.reload();
        } catch (error) {
            console.log("Error deleting enquiries:", error);
            notifyError(error);
        }
    };

    const onDeleteConfirm = (id, name) => {
        setDeleteUrl(`${url}/${id}`);
        setDeleteName(name || "Enquiry");
        setShowDeleteModal(true);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: ENQUIRY_STYLES }} />

            {/* ── Page Header ── */}
            <div className="row">
                <div className="col-xl-12">
                    <div className="page-titles mb-4 pb-2" style={{ position: "relative", zIndex: 999 }}>
                        <div className="d-flex align-items-center">
                            <h2 className="heading">Enquiry</h2>
                        </div>
                        <div className="d-flex flex-wrap my-2 my-sm-0 align-items-center gap-3">
                            <div className="input-group search-area">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search enquiries..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                />
                                <span className="input-group-text">
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.3" d="M16.6751 19.4916C16.2194 19.036 16.2194 18.2973 16.6751 17.8417C17.1307 17.3861 17.8694 17.3861 18.325 17.8417L22.9916 22.5084C23.4473 22.964 23.4473 23.7027 22.9916 24.1583C22.536 24.6139 21.7973 24.6139 21.3417 24.1583L16.6751 19.4916Z" fill="#8892A2" />
                                        <path d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z" fill="#8892A2" />
                                    </svg>
                                </span>
                            </div>

                            {/* Filter icon button */}
                            <button
                                className="btn-link i-false d-flex align-items-center justify-content-center position-relative"
                                onClick={() => setShowFilters(!showFilters)}
                                title="Toggle filters"
                                style={{ cursor: "pointer", width: "38px", height: "38px", border: "none", background: "transparent", color: "inherit", margin: "0", padding: "0" }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                </svg>
                                {hasActiveFilters() && (
                                    <span className="position-absolute bg-primary rounded-circle" style={{ width: 8, height: 8, top: 6, right: 6 }}></span>
                                )}
                            </button>

                            {/* New Enquiry button (matches tickets-cta) */}
                            {permissionType.write && (
                                <div className="invoice-btn">
                                    <button className="enquiry-cta" onClick={() => setShowModal(true)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" fill="#fff" />
                                        </svg>
                                        New Enquiry
                                    </button>
                                </div>
                            )}

                            {/* 3-dot menu */}
                            <Dropdown className="dropdown">
                                <Dropdown.Toggle as="div" className="btn-link i-false" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", background: "transparent", color: "inherit", margin: "0" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1.5"></circle>
                                        <circle cx="12" cy="5" r="1.5"></circle>
                                        <circle cx="12" cy="19" r="1.5"></circle>
                                    </svg>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end" style={{ zIndex: 9999 }}>
                                    <Dropdown.Item onClick={() => { /* refresh logic */ }}>Refresh</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setShowKpiCards(!showKpiCards)}>
                                        Turn {showKpiCards ? "off" : "on"} KPI cards
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>

            <div className="enquiry-page">
                <div className="enquiry-content" style={{ paddingTop: "0px" }}>

                    {/* ── KPI Cards (EnquirySlider) ── */}
                    {showKpiCards && <EnquiryKPI array={summaryData} />}

                    {/* ── Selection Banner ── */}
                    {isSelectionMode && selectedRows.length > 0 && (
                        <div className="alert alert-info mb-3 d-flex justify-content-between align-items-center" style={{ borderRadius: "10px", padding: "12px 20px", background: "#EFF6FF", border: "1.5px solid #BFDBFE", color: "#1D4ED8" }}>
                            <span style={{ fontWeight: 600 }}>{selectedRows.length} enquir{selectedRows.length > 1 ? "ies" : "y"} selected</span>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={handleBulkDelete}
                                style={{ fontWeight: 600, borderRadius: "8px", padding: "6px 16px" }}
                            >
                                Delete Selected
                            </button>
                        </div>
                    )}

                    {/* ── Filter Bar ── */}
                    {showFilters && (
                        <div className="enquiry-filter-bar">
                            <FilterDropdown label="Type" value={filterType} options={typeOptions} onChange={(opt) => { setFilterType(opt); setPage(0); }} onClear={() => { setFilterType(null); setPage(0); }} />
                            <FilterDropdown label="Lead Source" value={filterSource} options={sourceOptions} onChange={(opt) => { setFilterSource(opt); setPage(0); }} onClear={() => { setFilterSource(null); setPage(0); }} />
                            <FilterDropdown label="Assigned To" value={filterAssigned} options={assignedOptions} onChange={(opt) => { setFilterAssigned(opt); setPage(0); }} onClear={() => { setFilterAssigned(null); setPage(0); }} />
                            <div style={{ width: "1px", height: "24px", background: "#e0e0e0", margin: "0 4px" }} />
                            {hasActiveFilters() && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "6px", border: "1.5px solid #FBBF24", background: "#FFFBEB", color: "#D97706", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-3.51"></path></svg>
                                    Reset
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── TABLE CARD ── */}
                    <div className="card" style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 0, border: "1px solid #e8ecf4" }}>
                        <div className="enquiry-table-outer">
                            <div className="enquiry-table-scroll">
                                <table className="enquiry-table">
                                    <colgroup>
                                        {isSelectionMode && <col style={{ width: "24px" }} />}
                                        <col style={{ width: "30px" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "23%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "12%" }} />
                                        <col style={{ width: "8%" }} />
                                        <col style={{ width: "40px" }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            {isSelectionMode && (
                                                <th style={{ padding: "0 0 0 4px", width: "24px", verticalAlign: "middle", textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                                        className="form-check-input"
                                                        style={{ accentColor: "#fff", margin: 0 }}
                                                    />
                                                </th>
                                            )}
                                            <th style={{ textAlign: "center", paddingLeft: isSelectionMode ? "0" : "10px" }}>Sl No</th>
                                            <th style={{ textAlign: "center" }}>Type</th>
                                            <th>Name</th>
                                            <th style={{ textAlign: "center" }}>Lead Source</th>
                                            <th>Requirement</th>
                                            <th style={{ textAlign: "center" }}>Assigned To</th>
                                            <th>Date</th>
                                            <th style={{ textAlign: "center" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.length ? (
                                            paginatedData.map((item, ind) => {
                                                const globalIdx = page * pageSize + ind;
                                                const isHovered = hoveredRow === globalIdx;
                                                const isRowSelected = selectedRows.includes(item?.id);
                                                const customerName = item?.customer?.name || item?.agent?.name || "-";
                                                const contactInfo = item?.customer?.email || item?.agent?.email || item?.customer?.phone || "";
                                                const leadSourceName = item?.lead_source?.name || "-";
                                                const assignedName = item?.assigned_to_user?.first_name || "-";
                                                const dateStr = item?.start_date
                                                    ? new Date(item.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                                    : "-";
                                                const requirementText = Array.isArray(item?.requirements)
                                                    ? item.requirements.map(r => r?.name || r).join(", ")
                                                    : (item?.requirements || "-");

                                                return (
                                                    <tr
                                                        key={item?.id || ind}
                                                        className={isRowSelected ? "row-hovered" : isHovered ? "row-hovered" : ""}
                                                        onMouseEnter={() => setHoveredRow(globalIdx)}
                                                        onMouseLeave={() => setHoveredRow(null)}
                                                    >
                                                        {/* Checkbox */}
                                                        {isSelectionMode && (
                                                            <td style={{ padding: "0 0 0 4px", verticalAlign: "middle", textAlign: "center" }}>
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={() => handleSelectRow(item?.id)}
                                                                    checked={isRowSelected}
                                                                    className="form-check-input"
                                                                    style={{ margin: 0 }}
                                                                />
                                                            </td>
                                                        )}

                                                        {/* Sl No */}
                                                        <td style={{ textAlign: "center", paddingLeft: isSelectionMode ? "0" : "10px" }}>
                                                            <span style={{
                                                                display: "inline-block", fontWeight: 700, fontSize: "12px",
                                                                color: "#6B7280", background: "#F3F4F6", border: "1px solid #E5E7EB",
                                                                borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px",
                                                            }}>
                                                                {globalIdx + 1}
                                                            </span>
                                                        </td>

                                                        {/* Type */}
                                                        <td style={{ textAlign: "center" }}>
                                                            <span style={{
                                                                display: "inline-block", padding: "3px 9px", borderRadius: "12px",
                                                                fontSize: "12px", fontWeight: 500, background: "#F1F5F9",
                                                                color: "#475569", border: "1px solid #E2E8F0", whiteSpace: "nowrap",
                                                            }}>
                                                                {item?.type || "-"}
                                                            </span>
                                                        </td>

                                                        {/* Name */}
                                                        <td style={{ whiteSpace: "normal", lineHeight: 1.3 }}>
                                                            <span style={{ fontWeight: 700, fontSize: "13px", color: "#111827", display: "block" }}>
                                                                {customerName}
                                                            </span>
                                                            {contactInfo && (
                                                                <span style={{ fontSize: "11.5px", color: "#9CA3AF", display: "block", marginTop: "1px" }}>
                                                                    {contactInfo}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Lead Source */}
                                                        <td style={{ textAlign: "center" }}>
                                                            <span style={{
                                                                display: "inline-block", padding: "3px 9px", borderRadius: "12px",
                                                                fontSize: "12px", fontWeight: 500, background: "#F1F5F9",
                                                                color: "#475569", border: "1px solid #E2E8F0", whiteSpace: "nowrap",
                                                                maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
                                                            }} title={leadSourceName}>
                                                                {leadSourceName}
                                                            </span>
                                                        </td>

                                                        {/* Requirement */}
                                                        <td className="td-truncate" title={requirementText} style={{ color: "#4B5563" }}>
                                                            {requirementText}
                                                        </td>

                                                        {/* Assigned To */}
                                                        <td className="td-assigned" title={assignedName}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                                                                <div style={{
                                                                    width: "24px", height: "24px", borderRadius: "50%",
                                                                    background: "#E0F2FE", color: "#0284C7",
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    fontSize: "11px", fontWeight: "700", flexShrink: 0,
                                                                }}>
                                                                    {assignedName !== "-" ? assignedName.charAt(0).toUpperCase() : "?"}
                                                                </div>
                                                                <span style={{ color: "#01A3FF", fontWeight: 600 }}>{assignedName}</span>
                                                            </div>
                                                        </td>

                                                        {/* Date */}
                                                        <td style={{ whiteSpace: "nowrap", color: "#6B7280", fontSize: "12.5px" }}>
                                                            {dateStr}
                                                        </td>

                                                        {/* Actions */}
                                                        <td style={{ textAlign: "center", padding: "0 8px" }}>
                                                            <Dropdown>
                                                                <Dropdown.Toggle
                                                                    as="div"
                                                                    className="i-false"
                                                                    style={{
                                                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                                        width: "30px", height: "30px", borderRadius: "8px",
                                                                        background: "#F1F5F9", border: "1px solid #E2E8F0",
                                                                        cursor: "pointer", color: "#64748B",
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                        <circle cx="12" cy="5" r="1.3" fill="currentColor" />
                                                                        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
                                                                        <circle cx="12" cy="19" r="1.3" fill="currentColor" />
                                                                    </svg>
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="dropdown-menu-end">
                                                                    {permissionType.delete && (
                                                                        <Dropdown.Item onClick={() => handleSelectFromMenu(item?.id)}>
                                                                            {isRowSelected ? 'Deselect' : 'Select'}
                                                                        </Dropdown.Item>
                                                                    )}
                                                                    {permissionType.update && (
                                                                        <Dropdown.Item onClick={() => onEdit(item?.id)}>Edit</Dropdown.Item>
                                                                    )}
                                                                    {permissionType.delete && (
                                                                        <Dropdown.Item onClick={() => onDeleteConfirm(item?.id, customerName)}>Delete</Dropdown.Item>
                                                                    )}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={isSelectionMode ? 9 : 8} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 10px" }}>
                                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                    </svg>
                                                    {enquiryData?.loading ? "Loading enquiries..." : "No enquiries found matching your criteria"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Pagination ── */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            flexWrap: "wrap", gap: "10px", padding: "14px 20px",
                            borderTop: "1px solid #f0f4fa", background: "#fafbfd",
                        }}>
                            <div style={{ fontSize: "13px", color: "#6B7280" }}>
                                {totalEntries === 0
                                    ? "No results found"
                                    : <>Showing <strong style={{ color: "#111827" }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: "#111827" }}>{totalEntries}</strong> entries</>
                                }
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                {/* Prev */}
                                <button
                                    type="button" disabled={page === 0} onClick={() => page > 0 && setPage(page - 1)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: "34px", height: "34px", borderRadius: "8px",
                                        border: "1.5px solid #e5e7eb",
                                        background: page === 0 ? "#f9fafb" : "#fff",
                                        color: page === 0 ? "#d1d5db" : "#374151",
                                        cursor: page === 0 ? "not-allowed" : "pointer",
                                    }}
                                >
                                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                        <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: pageCount }, (_, i) => (
                                    <button
                                        key={i} type="button" onClick={() => setPage(i)}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            width: "34px", height: "34px", borderRadius: "8px",
                                            border: page === i ? "none" : "1.5px solid #e5e7eb",
                                            background: page === i ? "#3b5bdb" : "#fff",
                                            color: page === i ? "#fff" : "#374151",
                                            fontWeight: page === i ? "700" : "500",
                                            fontSize: "13px", cursor: "pointer",
                                            boxShadow: page === i ? "0 2px 8px rgba(59,91,219,0.35)" : "none",
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                {/* Next */}
                                <button
                                    type="button" disabled={page + 1 >= pageCount} onClick={() => page + 1 < pageCount && setPage(page + 1)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: "34px", height: "34px", borderRadius: "8px",
                                        border: "1.5px solid #e5e7eb",
                                        background: page + 1 >= pageCount ? "#f9fafb" : "#fff",
                                        color: page + 1 >= pageCount ? "#d1d5db" : "#374151",
                                        cursor: page + 1 >= pageCount ? "not-allowed" : "pointer",
                                    }}
                                >
                                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>{/* end card */}

                </div>{/* end enquiry-content */}
            </div>{/* end enquiry-page */}

            {/* ── Delete Confirmation Modal ── */}
            <DeleteModal
                showModal={showDeleteModal}
                setShowModal={setShowDeleteModal}
                name={deleteName}
                url={deleteUrl}
            />

            <CustomModal
                showModal={showModal}
                title={"Customer Info"}
                handleModalClose={() => {
                    setShowModal(false);
                }}
                modalClass="insert-modal"
            >
                <AddEnquiry setShowModal={setShowModal} />
            </CustomModal>
        </>
    );
};
export default Enquiry;
