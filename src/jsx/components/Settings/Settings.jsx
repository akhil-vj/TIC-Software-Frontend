import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const smallCard = [
    { icon: "fa fa-map-marker-alt", title: "Destination", path: "/destination", desc: "Manage travel destinations and sub-regions" },
    { icon: "fa fa-truck", title: "Suppliers", path: "/supplier", desc: "Manage supplier accounts" },
    { icon: "fa fa-hotel", title: "Hotels", path: "/hotels", desc: "Hotels & property settings" },
    { icon: "fa fa-hiking", title: "Activity", path: "/activity", desc: "Tour activities & excursions" },
    { icon: "fa fa-tags", title: "Activity Type", path: "/activity-type", desc: "Categorize activity types" },
    { icon: "fa fa-shuttle-van", title: "Transfer", path: "/transfer", desc: "Transport & transfer options" },
    { icon: "fa fa-bullseye", title: "Lead Source", path: "/lead-source", desc: "Where your leads come from" },
    { icon: "fa fa-flag", title: "Priority", path: "/priority", desc: "Lead priority levels" },
    { icon: "fa fa-clipboard-list", title: "Requirement", path: "/requirement", desc: "Customer requirements" },
    { icon: "fa fa-calendar-day", title: "Day Itinerary", path: "/day-itinerary", desc: "Daily itinerary templates" },
    { icon: "fa fa-envelope-open-text", title: "Mail Settings", path: "/mail-settings", desc: "Email configuration" },
    { icon: "fa fa-coins", title: "Currency", path: "/currency", desc: "Currency management" },
    { icon: "fa fa-percent", title: "Tax", path: "/tax", desc: "Tax rules & rates" },
    { icon: "fa fa-user-tie", title: "Agents", path: "/agent", desc: "Agent accounts & info" },
];

// ── View toggle icon components ──

const GridIcon = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.6" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.6" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.6" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.6" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
    </svg>
);


const CompactIcon = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="7" y="1" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="13" y="1" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="1" y="7" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="7" y="7" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="13" y="7" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="1" y="13" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="7" y="13" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="13" y="13" width="4" height="4" rx="1" stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.3" fill={active ? "#fff" : "none"} fillOpacity={active ? 0.2 : 0} />
    </svg>
);

// ── Shared styles ──

const viewBtnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.18s ease",
};

const viewBtnActive = {
    ...viewBtnBase,
    background: "#3b5bdb",
    boxShadow: "0 2px 8px rgba(59,91,219,0.35)",
};

const viewBtnInactive = {
    ...viewBtnBase,
    background: "#F3F4F6",
    border: "1px solid #E5E7EB",
};

// ── Card renderers per view ──

const GridCard = ({ item }) => (
    <div className="col-xl-3 col-xxl-3 col-md-4 col-sm-6 mb-4">
        <Link to={item.path} style={{ textDecoration: "none" }}>
            <div className="card h-100" style={{ 
                transition: "box-shadow 0.18s, transform 0.18s", 
                cursor: "pointer",
                minHeight: "70px"
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
            >
                <div className="card-body">
                    <div className="widget-courses align-items-center d-flex justify-content-between" style={{ gap: "12px" }}>
                        <div className="d-flex align-items-center" style={{ minWidth: 0, flex: 1 }}>
                            <i className={item.icon} style={{ fontSize: "1.4rem", color: "#7356f1", width: "32px", textAlign: "center", flexShrink: 0 }}></i>
                            <div className="ms-3" style={{ minWidth: 0, flex: 1 }}>
                                <h4 style={{ marginBottom: 0, fontSize: "15px", lineHeight: "1.4", whiteSpace: "normal", wordWrap: "break-word" }}>{item.title}</h4>
                            </div>
                        </div>
                        <i className="las la-angle-right text-primary" style={{ flexShrink: 0, fontSize: "1.2rem" }}></i>
                    </div>
                </div>
            </div>
        </Link>
    </div>
);


const CompactCard = ({ item }) => (
    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mb-3">
        <Link to={item.path} style={{ textDecoration: "none" }}>
            <div className="card h-100" style={{ transition: "box-shadow 0.18s, transform 0.18s", cursor: "pointer", marginBottom: 0 }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
            >
                <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ padding: "20px 10px", textAlign: "center" }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "10px",
                    }}>
                        <i className={item.icon} style={{ fontSize: "1.2rem", color: "#7356f1" }}></i>
                    </div>
                    <h4 style={{ fontSize: "13px", marginBottom: 0, lineHeight: 1.3 }}>{item.title}</h4>
                </div>
            </div>
        </Link>
    </div>
);

function Settings() {
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "compact"
    const navigate = useNavigate();

    const views = [
        { key: "grid", label: "Grid", Icon: GridIcon },
        { key: "compact", label: "Compact", Icon: CompactIcon },
    ];

    const CardComponent = viewMode === "compact" ? CompactCard : GridCard;

    return (
        <>
            {/* ── Page Header (matches Leads / Tickets) ── */}
            <div className="row">
                <div className="col-xl-12">
                    <div className="page-titles mb-4 pb-2" style={{ position: "relative", zIndex: 999 }}>
                        <div className="d-flex align-items-center">
                            <h2 className="heading">Admin Settings</h2>
                        </div>

                        {/* ── View Toggle Buttons ── */}
                        <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                            {views.map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    title={`${label} view`}
                                    onClick={() => setViewMode(key)}
                                    style={viewMode === key ? viewBtnActive : viewBtnInactive}
                                >
                                    <Icon active={viewMode === key} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Settings Cards ── */}
            <div className="row">
                {smallCard.map((item, index) => (
                    <CardComponent key={index} item={item} />
                ))}
            </div>
        </>
    );
}

export default Settings;