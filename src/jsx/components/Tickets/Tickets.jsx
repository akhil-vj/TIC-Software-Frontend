import React, { useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";
import CustomModal from "../../layouts/CustomModal";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import NoData from "../common/NoData";

const TICKETS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.tickets-page *, .tickets-page *::before, .tickets-page *::after {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
  box-sizing: border-box;
}

.tickets-page {
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

.tickets-content {
  padding: 1px 0px 40px;
}

.tickets-page .dropdown-toggle::after { display: none !important; }
.tickets-page .dropdown-toggle:focus  { box-shadow: none !important; outline: none !important; }

/* ── Table wrappers ── */
.tickets-table-outer {
  width: 100%;
  overflow: hidden;
}
.tickets-table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
}

/* ── Table ── */
.tickets-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  min-width: 0 !important;
}

.tickets-table thead tr {
  background: #01A3FF;
}
.tickets-table thead th {
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

.tickets-table tbody td {
  padding: 10px 10px !important;
  font-size: 13px !important;
  color: #374151;
  vertical-align: middle;
  border-bottom: 1px solid #f0f3f8 !important;
}
.tickets-table tbody tr:last-child td {
  border-bottom: none !important;
}
.tickets-table tbody tr:hover td {
  background: #f7f9fc;
}

/* ── Filter bar ── */
.tickets-filter-bar {
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

/* ── New Ticket button ── */
.tickets-cta {
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
.tickets-cta:active {
  transform: scale(0.97);
}

@media (max-width: 900px) {
  .tickets-content { padding: 7px 0px 30px; }
  .tickets-table-outer { overflow-x: auto; }
  .tickets-table { min-width: 700px !important; }
}
`;

const TicketModal = ({ show, onClose, onSave, values }) => {
    const [formValues, setFormValues] = useState(values);

    React.useEffect(() => {
        setFormValues(values);
    }, [values]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues);
    };

    return (
        <CustomModal
            showModal={show}
            title={`${formValues?.id ? "Edit" : "Add"} Ticket`}
            handleModalClose={onClose}
        >
            <div className="card-body">
                <div className="basic-form">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="mb-3 col-md-6">
                                <InputField
                                    label="Subject"
                                    name="subject"
                                    onChange={handleChange}
                                    values={formValues}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <InputField
                                    label="Reference"
                                    name="reference"
                                    onChange={handleChange}
                                    values={formValues}
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <SelectField
                                    label="Status"
                                    name="status"
                                    onChange={handleChange}
                                    values={formValues}
                                    options={["Open", "In Progress", "Closed"]}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <SelectField
                                    label="Priority"
                                    name="priority"
                                    onChange={handleChange}
                                    values={formValues}
                                    options={["Low", "Medium", "High"]}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <InputField
                                    label="Assignee"
                                    name="assignee"
                                    onChange={handleChange}
                                    values={formValues}
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <InputField
                                    label="Due Date"
                                    type="date"
                                    name="dueDate"
                                    onChange={handleChange}
                                    values={formValues}
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <InputField
                                    label="Notes"
                                    name="notes"
                                    onChange={handleChange}
                                    values={formValues}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {formValues?.id ? "Update" : "Add"} Ticket
                        </button>
                    </form>
                </div>
            </div>
        </CustomModal>
    );
};

// ── FilterDropdown (same as Leads) ──
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

const Tickets = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterAssigned, setFilterAssigned] = useState(null);
    const [filterPriority, setFilterPriority] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editTicket, setEditTicket] = useState(null);
    const [showKpiCards, setShowKpiCards] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [tickets, setTickets] = useState([
        {
            id: "TIC-001",
            subject: "Flight reschedule request",
            status: "Open",
            priority: "High",
            assignee: "Alex",
            dueDate: "2024-12-18",
            reference: "ENQ-1023",
            notes: "Client requested next-day flight.",
        },
        {
            id: "TIC-002",
            subject: "Hotel confirmation follow-up",
            status: "In Progress",
            priority: "Medium",
            assignee: "Sam",
            dueDate: "2024-12-20",
            reference: "ENQ-1044",
            notes: "Awaiting supplier update.",
        },
        {
            id: "TIC-003",
            subject: "Visa document status",
            status: "Closed",
            priority: "Low",
            assignee: "Priya",
            dueDate: "2024-12-10",
            reference: "ENQ-1011",
            notes: "Docs delivered to client.",
        },
    ]);
    const pageSize = 8;
    const [page, setPage] = useState(0);

    // Filter option arrays
    const statusOptions = [
        { value: "Open", label: "Open" },
        { value: "In Progress", label: "In Progress" },
        { value: "Closed", label: "Closed" },
    ];
    const priorityOptions = [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
    ];
    const assignedOptions = useMemo(() => {
        const names = [...new Set(tickets.map(t => t.assignee).filter(Boolean))];
        return names.map(n => ({ value: n, label: n }));
    }, [tickets]);

    const hasActiveFilters = () => !!(filterStatus || filterAssigned || filterPriority);
    const handleClearFilters = () => {
        setFilterStatus(null);
        setFilterAssigned(null);
        setFilterPriority(null);
        setPage(0);
    };

    const filteredTickets = useMemo(() => {
        const term = search.trim().toLowerCase();
        return tickets.filter((ticket) => {
            const matchesSearch = term
                ? [ticket.subject, ticket.reference, ticket.assignee, ticket.notes]
                    .filter(Boolean)
                    .some((field) => field.toLowerCase().includes(term))
                : true;
            const matchesStatus = !filterStatus || ticket.status === filterStatus.value;
            const matchesAssigned = !filterAssigned || ticket.assignee === filterAssigned.value;
            const matchesPriority = !filterPriority || ticket.priority === filterPriority.value;
            return matchesSearch && matchesStatus && matchesAssigned && matchesPriority;
        });
    }, [tickets, search, filterStatus, filterAssigned, filterPriority]);

    const paginatedTickets = useMemo(() => {
        const start = page * pageSize;
        return filteredTickets.slice(start, start + pageSize);
    }, [filteredTickets, page, pageSize]);

    const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));

    const handleDelete = (id) => {
        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    };

    const handleSave = (values) => {
        if (values.id) {
            setTickets((prev) =>
                prev.map((ticket) => (ticket.id === values.id ? values : ticket)),
            );
        } else {
            const newId = `TIC-${(tickets.length + 1)
                .toString()
                .padStart(3, "0")}`;
            setTickets((prev) => [...prev, { ...values, id: newId }]);
        }
        setShowModal(false);
        setEditTicket(null);
    };

    const handleEdit = (ticket) => {
        setEditTicket(ticket);
        setShowModal(true);
    };

    const initialModalValues =
        editTicket || {
            id: "",
            subject: "",
            reference: "",
            status: "Open",
            priority: "Low",
            assignee: "",
            dueDate: "",
            notes: "",
        };

    const onPageChange = (next) => {
        if (next >= 0 && next < pageCount) {
            setPage(next);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: TICKETS_STYLES }} />

            {/* ── Page Header ── */}
            <div className="row">
                <div className="col-xl-12">
                    <div className="page-titles mb-4 pb-2" style={{ position: "relative", zIndex: 999 }}>
                        <div className="d-flex align-items-center">
                            <h2 className="heading">Ticketing</h2>
                        </div>
                        <div className="d-flex flex-wrap my-2 my-sm-0 align-items-center gap-3">
                            <div className="input-group search-area">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search tickets..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(0);
                                    }}
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

                            {/* New Ticket button */}
                            <div className="invoice-btn">
                                <button className="tickets-cta" onClick={() => { setEditTicket(null); setShowModal(true); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" fill="#fff" />
                                    </svg>
                                    New Ticket
                                </button>
                            </div>

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

            <div className="tickets-page">
                <div className="tickets-content" style={{ paddingTop: "0px" }}>

                    {/* ── KPI Cards ── */}
                    {showKpiCards && (
                        <div className="row g-3 mb-3">

                            {/* Card 1 – Total Tickets */}
                            <div className="col-xl-3 col-sm-6">
                                <div className="card card-box blue h-100" style={{ marginBottom: 0 }}>
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
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20,6H4C2.9,6,2,6.9,2,8v3c1.1,0,2,0.9,2,2s-0.9,2-2,2v3c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2v-3c-1.1,0-2-0.9-2-2s0.9-2,2-2V8C22,6.9,21.1,6,20,6z M9,16H7v-2h2V16z M9,10H7V8h2V10z M13,16h-2v-2h2V16z M13,10h-2V8h2V10z M17,16h-2v-2h2V16z M17,10h-2V8h2V10z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="fs-15 font-w600 mb-0">
                                                    Total<br />Tickets
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="chart-num text-end">
                                            <h2 className="font-w600 mb-0 fs-28">{tickets.length}</h2>
                                            <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>all time</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 – Open Tickets */}
                            <div className="col-xl-3 col-sm-6">
                                <div className="card card-box green h-100" style={{ marginBottom: 0 }}>
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
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4v-8l8,5l8-5V18z M12,11L4,6h16L12,11z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="fs-15 font-w600 mb-0">
                                                    Open<br />Tickets
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="chart-num text-end">
                                            <h2 className="font-w600 mb-0 fs-28">{tickets.filter(t => t.status === "Open").length}</h2>
                                            <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>needs attention</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 – In Progress */}
                            <div className="col-xl-3 col-sm-6">
                                <div className="card card-box secondary h-100" style={{ marginBottom: 0 }}>
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
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 11V6h1.5v4.2l4.5 4.5-.8.8z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="fs-15 font-w600 mb-0">
                                                    In<br />Progress
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="chart-num text-end">
                                            <h2 className="font-w600 mb-0 fs-28">{tickets.filter(t => t.status === "In Progress").length}</h2>
                                            <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>being worked on</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 – High Priority */}
                            <div className="col-xl-3 col-sm-6">
                                <div className="card card-box amber h-100" style={{ marginBottom: 0 }}>
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
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="fs-15 font-w600 mb-0">
                                                    High<br />Priority
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="chart-num text-end">
                                            <h2 className="font-w600 mb-0 fs-28">{tickets.filter(t => t.priority === "High").length}</h2>
                                            <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>urgent tickets</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                    {/* end KPI row */}

                    {/* ── Filter Bar ── */}
                    {showFilters && (
                        <div className="tickets-filter-bar">
                            <FilterDropdown label="Status" value={filterStatus} options={statusOptions} onChange={(opt) => { setFilterStatus(opt); setPage(0); }} onClear={() => { setFilterStatus(null); setPage(0); }} />
                            <FilterDropdown label="Assigned" value={filterAssigned} options={assignedOptions} onChange={(opt) => { setFilterAssigned(opt); setPage(0); }} onClear={() => { setFilterAssigned(null); setPage(0); }} />
                            <FilterDropdown label="Priority" value={filterPriority} options={priorityOptions} onChange={(opt) => { setFilterPriority(opt); setPage(0); }} onClear={() => { setFilterPriority(null); setPage(0); }} />
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
                        <div className="tickets-table-outer">
                            <div className="tickets-table-scroll">
                                <table className="tickets-table">
                                    <colgroup>
                                        <col style={{ width: "55px" }} />
                                        <col style={{ width: "16%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "16%" }} />
                                        <col style={{ width: "80px" }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "center" }}>Sl No</th>
                                            <th style={{ textAlign: "center" }}>Subject</th>
                                            <th style={{ textAlign: "center" }}>Reference</th>
                                            <th style={{ textAlign: "center" }}>Status</th>
                                            <th style={{ textAlign: "center" }}>Priority</th>
                                            <th style={{ textAlign: "center" }}>Assignee</th>
                                            <th >Due Date</th>
                                            <th style={{ textAlign: "center" }}>Notes</th>
                                            <th style={{ textAlign: "center" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTickets.length ? (
                                            paginatedTickets.map((item, ind) => {
                                                const globalIdx = page * pageSize + ind;
                                                return (
                                                    <tr key={item.id || ind}>
                                                        <td style={{ textAlign: "center" }}>
                                                            <span style={{
                                                                display: "inline-block", fontWeight: 700, fontSize: "12px",
                                                                color: "#6B7280", background: "#F3F4F6", border: "1px solid #E5E7EB",
                                                                borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px",
                                                            }}>
                                                                {globalIdx + 1}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: 500, color: "#1F2937" }}>{item.subject}</td>
                                                        <td style={{ textAlign: "center", color: "#6B7280" }}>{item.reference || "-"}</td>
                                                        <td style={{ textAlign: "center" }}>{item.status}</td>
                                                        <td style={{ textAlign: "center" }}>{item.priority}</td>
                                                        <td style={{ textAlign: "center", color: "#01A3FF", fontWeight: 600 }}>{item.assignee || "-"}</td>
                                                        <td style={{ whiteSpace: "nowrap", color: "#6B7280", fontSize: "12.5px" }}>{item.dueDate || "-"}</td>
                                                        <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 0, color: "#4B5563" }}>{item.notes || "-"}</td>
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
                                                                    <Dropdown.Item onClick={() => handleEdit(item)}>Edit</Dropdown.Item>
                                                                    <Dropdown.Item onClick={() => handleDelete(item.id)}>Delete</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 10px" }}>
                                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                    </svg>
                                                    No tickets found matching your criteria
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
                                {filteredTickets.length === 0
                                    ? "No results found"
                                    : <>Showing <strong style={{ color: "#111827" }}>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredTickets.length)}</strong> of <strong style={{ color: "#111827" }}>{filteredTickets.length}</strong> entries</>
                                }
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                {/* Prev */}
                                <button
                                    type="button" disabled={page === 0} onClick={() => page > 0 && onPageChange(page - 1)}
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
                                        key={i} type="button" onClick={() => onPageChange(i)}
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
                                    type="button" disabled={page + 1 >= pageCount} onClick={() => page + 1 < pageCount && onPageChange(page + 1)}
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

                </div>{/* end tickets-content */}
            </div > {/* end tickets-page */}

            < TicketModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditTicket(null);
                }}
                onSave={handleSave}
                values={initialModalValues}
            />
        </>
    );
};

export default Tickets;
