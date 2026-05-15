import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useFormik } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Components
import EnquirySlider from "../Dashboard/EnquirySlider";
import QuestionIcon from "../Dashboard/Ticketing/QuestionIcon";
import SelectField from "../common/SelectField";
import ReactSelect from "../common/ReactSelect";
import InputField from "../common/InputField";
import CustomDatePicker from "../common/CustomDatePicker";
import { ModeBtn } from "../common/ModeBtn";

// Utilities & Services
import { usePermissionType } from "../../utilis/usePermissionType";
import { useAsync } from "../../utilis/useAsync";
import { formatDate, parseDate } from "../../utilis/date";
import { checkFormValue } from "../../utilis/check";
import { notifyCreate, notifyError } from "../../utilis/notifyMessage";
import { axiosPut, axiosPatch, filePost } from "../../../services/AxiosInstance";

// Constants & Redux
import { SETUP, URLS } from "../../../constants";
import { useDispatch } from "react-redux";
import { FetchAction } from "../../../store/slices/fetchSlice";
import { FormAction } from "../../../store/slices/formSlice";

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS - Icons
// ═══════════════════════════════════════════════════════════════════════════

const RightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.50912 14.5C5.25012 14.5 4.99413 14.4005 4.80013 14.2065L1.79362 11.2C1.40213 10.809 1.40213 10.174 1.79362 9.78302C2.18512 9.39152 2.81913 9.39152 3.21063 9.78302L5.62812 12.2005L12.9306 7.18802C13.3866 6.87502 14.0106 6.99102 14.3236 7.44702C14.6371 7.90352 14.5211 8.52702 14.0646 8.84052L6.07613 14.324C5.90363 14.442 5.70612 14.5 5.50912 14.5Z" fill="#1EBA62" />
    <path d="M5.50912 8.98807C5.25012 8.98807 4.99413 8.88857 4.80013 8.69457L1.79362 5.68807C1.40213 5.29657 1.40213 4.66207 1.79362 4.27107C2.18512 3.87957 2.81913 3.87957 3.21063 4.27107L5.62812 6.68857L12.9306 1.67607C13.3866 1.36307 14.0106 1.47907 14.3236 1.93507C14.6371 2.39157 14.5211 3.01507 14.0646 3.32857L6.07613 8.81257C5.90363 8.93057 5.70612 8.98807 5.50912 8.98807Z" fill="#1EBA62" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// DATA - Real Enquiry List
// ═══════════════════════════════════════════════════════════════════════════

// tableBlog mock data has been removed. Data comes from Enquiry API now.


// ═══════════════════════════════════════════════════════════════════════════
// FORM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const initialValues = {
  type: { label: "B2B", value: "B2B" },
  typeValue: { label: "", value: "" },
  requirement: [],
  startDate: SETUP.TODAY_DATE || new Date(),
  endDate: SETUP.TODAY_DATE || new Date(),
  adult: 0,
  child: 0,
  infant: 0,
  refNo: "",
  name: "",
  email: "",
  mobile: "",
  salute: "",
  destination: null,
  subDestination: [],
  lead: "",
  priority: "",
  assigned: null,
  description: "",
};

const formOptions = {
  TypeOptions: [{ label: "B2B", value: "B2B" }, { label: "B2C", value: "B2C" }],
  SaluteOptions: [{ label: "Mr", value: "Mr" }, { label: "Ms", value: "Ms" }],
  inputOptions: [{ label: "Name", name: "name" }, { label: "Email", name: "email" }, { label: "Mobile", name: "mobile" }],
  suggestionArr: [
    { name: "Package 1", description: "description of package 1", cost: "10000" },
    { name: "Package 2", description: "description of package 2", cost: "20000" },
    { name: "Package 3", description: "description of package 3", cost: "30000" },
    { name: "Package 4", description: "description of package 4", cost: "40000" },
    { name: "Package 5", description: "description of package 5", cost: "40000" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// FILTER DROPDOWN COMPONENT
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 12px",
          borderRadius: "6px",
          border: value ? "1.5px solid #3B82F6" : "1.5px solid #e0e0e0",
          background: value ? "#EFF6FF" : "#F3F4F6",
          color: value ? "#1D4ED8" : "#555",
          fontWeight: value ? "600" : "400",
          fontSize: "13px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
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
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 1000,
            background: "#fff",
            borderRadius: "6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: "160px",
            overflow: "hidden",
            border: "1px solid #e8e8e8",
          }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  padding: "9px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
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

// Date filter dropdown
const DateFilterDropdown = ({ label, value, onChange, onClear }) => {
  const [open, setOpen] = useState(false);
  const displayLabel = value ? value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;

  return (
    <div className="position-relative" style={{ display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 12px",
          borderRadius: "6px",
          border: value ? "1.5px solid #3B82F6" : "1.5px solid #e0e0e0",
          background: value ? "#EFF6FF" : "#F3F4F6",
          color: value ? "#1D4ED8" : "#555",
          fontWeight: value ? "600" : "400",
          fontSize: "13px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span>{displayLabel || label}</span>
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
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 1000,
            background: "#fff",
            borderRadius: "6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            border: "1px solid #e8e8e8",
            padding: "8px",
          }}>
            <DatePicker
              selected={value}
              onChange={(date) => { onChange(date); setOpen(false); }}
              inline
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BADGE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  "Confirmed": { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
  "Pending": { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", dot: "#3B82F6" },
  "W. Approval": { bg: "#FDF4FF", color: "#9333EA", border: "#E9D5FF", dot: "#A855F7" },
  "Complete": { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", dot: "#22C55E" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", dot: "#9CA3AF" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap", letterSpacing: "0.1px",
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LEADS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Leads = ({ setShowModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const permissionType = usePermissionType("lead");

  // ─ State Management
  const [viewMode, setViewMode] = useState(id ? "form" : "list");
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterAssigned, setFilterAssigned] = useState(null);
  const [page, setPage] = useState(0);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showKpiCards, setShowKpiCards] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(id && id !== "add" ? true : false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // ─ Form Management
  const isEdit = id && id !== "add";
  const isFormPage = !setShowModal;
  const formik = useFormik({ initialValues });
  const { handleBlur, handleChange, setFieldValue, values } = formik;

  // ─ API Endpoints
  const url = URLS.ENQUIRY_URL;
  const editUrl = `${url}/${id}`;

  // ─ Fetch Data
  const { data: enquiryListData } = useAsync(url);
  const tableData = enquiryListData?.data || [];

  const { data: detailData } = useAsync(editUrl, !!isEdit);
  const editData = detailData?.data;

  const itineraryByEnquiryUrl = `${URLS.ITINERARY_URL}?enquiry_id=${id}`;
  const { data: itineraryData } = useAsync(itineraryByEnquiryUrl, !!isEdit);

  const agentData = useAsync(URLS.AGENT_URL);
  const agentDataOptions = agentData?.data?.data;

  const customerData = useAsync(URLS.CUSTOMER_URL);
  const customerDataOptions = customerData?.data?.data;

  const destinationData = useAsync(URLS.DESTINATION_URL);

  const selectedTypeValue = values.typeValue;
  const isB2b = values.type?.value === "B2B";
  const destinationId = values.destination?.value;
  const subDestinationUrl = `${URLS.SUB_DESTINATION_URL}?destination_id=${destinationId}`;
  const subDestinationData = useAsync(subDestinationUrl, destinationId);

  const leadData = useAsync(URLS.LEAD_SOURCE_URL);
  const leadDataOptions = leadData?.data?.data;

  const priorityData = useAsync(URLS.PRIORITY_URL);
  const priorityDataOptions = priorityData?.data?.data;

  const requirementData = useAsync(URLS.REQUIREMENT_URL);
  const requirementDataOptions = requirementData?.data?.data;

  const staffData = useAsync(URLS.USER_GET_URL);
  const staffDataOptions = staffData?.data?.data?.data;

  const fetchSelectedAgent = useAsync(URLS.AGENT_URL + "/" + selectedTypeValue?.value, isB2b && selectedTypeValue?.value);
  const selectedAgentData = fetchSelectedAgent?.data?.data;

  const fetchCustomerData = useAsync(URLS.CUSTOMER_URL + "?mobile=" + selectedTypeValue?.label, !isB2b && selectedTypeValue?.label);
  const selectedCustomerData = fetchCustomerData?.data?.data;

  // ─ Pagination
  const pageSize = 8;

  const summaryData = useMemo(() => {
    const total = tableData.length;
    let confirmed = 0, cancelled = 0, pending = 0;
    tableData.forEach((item) => {
      const s = (statusOverrides[item?.id] || item?.status || item?.enquiry_status || item?.current_status || item?.lead_status || "Pending").toLowerCase();
      if (s === "confirmed") confirmed++;
      else if (s === "cancelled") cancelled++;
      else pending++;
    });
    return [
      { name: "Total", value: total },
      { name: "Confirmed", value: confirmed },
      { name: "Pending", value: pending },
      { name: "Cancelled", value: cancelled },
    ];
  }, [tableData, statusOverrides]);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tableData.filter((item) => {
      const customerName = item?.customer?.name || item?.agent?.name || "";
      const leadSource = item?.lead_source?.name || "";
      const assignedName = item?.assigned_to_user?.first_name || "";
      const status = statusOverrides[item?.id] || item?.status || item?.enquiry_status || item?.current_status || item?.lead_status || "Pending";

      const matchesSearch = !term || [
        customerName,
        item?.customer?.email || item?.agent?.email || "",
        status
      ].filter(Boolean).some((f) => f.toLowerCase().includes(term));

      const matchesSource = !filterSource || leadSource === filterSource.value;
      const matchesStatus = !filterStatus || status === filterStatus.value;
      const itemDate = item.start_date ? new Date(item.start_date) : null;
      const matchesDateRange = (!filterStartDate || (itemDate && itemDate >= filterStartDate)) && (!filterEndDate || (itemDate && itemDate <= filterEndDate));
      const matchesAssigned = !filterAssigned || assignedName === filterAssigned.value;

      return matchesSearch && matchesSource && matchesStatus && matchesDateRange && matchesAssigned;
    });
  }, [tableData, search, filterSource, filterStatus, filterStartDate, filterEndDate, filterAssigned]);

  const sortedLeads = useMemo(() => {
    let sortableItems = [...filteredLeads];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = "";
        let bValue = "";

        const getVal = (item, key) => {
          if (key === 'title') return item?.customer?.name || item?.agent?.name || "";
          if (key === 'source') return item?.lead_source?.name || "";
          if (key === 'requirement') return Array.isArray(item?.requirements) ? item.requirements.map(r => r?.name || r).join(", ") : (item?.requirements || "");
          if (key === 'packageDetails') return item?.sub_destinations?.map(d => d.name).join(", ") || "";
          if (key === 'assignedTo') return item?.assigned_to_user?.first_name || "";
          if (key === 'date') return item?.start_date || "";
          if (key === 'icontext') return item?.status || item?.enquiry_status || item?.current_status || item?.lead_status || "Pending";
          return "";
        };

        aValue = getVal(a, sortConfig.key);
        bValue = getVal(b, sortConfig.key);

        if (sortConfig.key === "date") {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredLeads, sortConfig]);

  const pageCount = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = page * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, page]);

  const sourceOptions = useMemo(() => [...new Set(tableData.map(i => i?.lead_source?.name).filter(Boolean))].map(s => ({ label: s, value: s })), [tableData]);
  const statusOptions = useMemo(() => [...new Set(tableData.map(i => i?.status || i?.enquiry_status || i?.current_status || i?.lead_status || "Pending").filter(Boolean))].map((s) => ({ label: s, value: s })), [tableData]);
  const assignedOptions = useMemo(() => [...new Set(tableData.map((i) => i?.assigned_to_user?.first_name).filter(Boolean))].map((a) => ({ label: a, value: a })), [tableData]);

  const hasActiveFilters = () => filterSource || filterStatus || filterStartDate || filterEndDate || filterAssigned || search;

  const handleClearFilters = () => {
    setFilterSource(null);
    setFilterStatus(null);
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterAssigned(null);
    setSearch("");
    setSortConfig({ key: null, direction: 'asc' });
  };

  useEffect(() => { setPage(0); }, [search, filterSource, filterStatus, filterStartDate, filterEndDate, filterAssigned]);

  // ── Status Update Handler (frontend-only until backend adds status endpoint) ──
  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      // TODO: Once backend adds PATCH /api/enquiry-status-update/:id endpoint,
      // uncomment this line and remove the localStorage approach:
      // await axiosPatch(`${URLS.ENQUIRY_STATUS_URL}/${itemId}`, { status: newStatus });

      // Frontend-only status tracking
      const updated = { ...statusOverrides, [itemId]: newStatus };
      setStatusOverrides(updated);
      localStorage.setItem('leadStatusOverrides', JSON.stringify(updated));
    } catch (err) {
      console.error('Status update failed:', err);
      notifyError('Failed to update status');
    }
  };

  // Load persisted status overrides on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadStatusOverrides');
      if (saved) setStatusOverrides(JSON.parse(saved));
    } catch (e) { /* ignore parse errors */ }
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    }
    return sortConfig.direction === 'asc' ? <span style={{ marginLeft: '4px' }}>↑</span> : <span style={{ marginLeft: '4px' }}>↓</span>;
  };



  const totalEntries = filteredLeads.length;
  const startEntry = totalEntries === 0 ? 0 : page * pageSize + 1;
  const endEntry = totalEntries === 0 ? 0 : Math.min((page + 1) * pageSize, totalEntries);

  const itineraries = useMemo(() => {
    if (Array.isArray(itineraryData?.data)) return itineraryData.data;
    if (Array.isArray(itineraryData?.data?.data)) return itineraryData.data.data;
    return [];
  }, [itineraryData]);

  let selectedTypeData;
  if (isB2b) selectedTypeData = selectedAgentData;
  else if (selectedCustomerData) selectedTypeData = selectedCustomerData[0];

  const handleClick = async () => {
    try {
      const formData = new FormData();
      formData.append("type", values.type?.value);
      if (isB2b) formData.append("agent_id", values.typeValue?.value);
      else formData.append("customer_id", values.typeValue?.value);
      formData.append("name", checkFormValue(values.name));
      formData.append("email", checkFormValue(values.email));
      formData.append("mobile", checkFormValue(values.mobile));
      formData.append("salute", checkFormValue(values.salute));
      formData.append("destination_id", checkFormValue(values.destination?.value));
      values.subDestination.forEach((data, ind) => formData.append(`sub_destinations[${ind}]`, checkFormValue(data?.value)));
      formData.append("start_date", formatDate(values.startDate));
      formData.append("end_date", formatDate(values.endDate));
      formData.append("adult_count", checkFormValue(values.adult));
      formData.append("child_count", checkFormValue(values.child));
      formData.append("infant_count", checkFormValue(values.infant));
      formData.append("lead_source_id", checkFormValue(values.lead));
      formData.append("priority_id", checkFormValue(values.priority));
      values.requirement.forEach((data, ind) => formData.append(`requirements[${ind}]`, data?.value));
      formData.append("assigned_to", checkFormValue(values.assigned?.value));
      formData.append("ref_no", checkFormValue(values.refNo));

      let response;
      if (isEdit) response = await axiosPut(editUrl, formData);
      else response = await filePost(url, formData);

      if (setShowModal) { setShowModal(false); navigate(`${response?.data?.id}/profile`); }
      if (response?.success) { dispatch(FormAction.setRefresh()); notifyCreate("Lead", isEdit); setViewMode("list"); }
    } catch (error) {
      console.log("Error:", error);
      notifyError(error);
    }
  };

  useEffect(() => {
    if (editData) {
      dispatch(FetchAction.setEnquiryById(editData));
      setDisabled(true);
      const isB2b = editData.type === "B2B";
      const typeData = isB2b ? editData.agent : editData.customer;
      const type = { label: checkFormValue(editData.type), value: checkFormValue(editData.type) };
      const typeObj = { label: checkFormValue(isB2b ? typeData?.name : typeData?.mobile), value: checkFormValue(typeData?.id) };
      setFieldValue("type", checkFormValue(type));
      setFieldValue("typeValue", checkFormValue(typeObj));
      setFieldValue("name", checkFormValue(typeData?.name));
      setFieldValue("email", checkFormValue(typeData?.email));
      setFieldValue("mobile", checkFormValue(typeData?.mobile || typeData?.phone));
      setFieldValue("salute", checkFormValue(typeData?.salute));
      setFieldValue("destination", { value: editData.destination?.id, label: editData.destination?.name });
      setFieldValue("startDate", parseDate(editData.start_date));
      setFieldValue("endDate", parseDate(editData.end_date));
      setFieldValue("adult", checkFormValue(editData.adult_count));
      setFieldValue("child", checkFormValue(editData.child_count));
      setFieldValue("infant", checkFormValue(editData.infant_count));
      setFieldValue("lead", checkFormValue(editData.lead_source_id));
      setFieldValue("priority", checkFormValue(editData.priority_id));
      setFieldValue("assigned", { value: editData.assigned_to_user?.id, label: editData.assigned_to_user?.first_name });
      setFieldValue("refNo", checkFormValue(editData.ref_no));
      setFieldValue("subDestination", editData.sub_destinations.map((d) => ({ label: d.name, value: d.id, isExist: true })));
      setFieldValue("requirement", editData.requirements.map((d) => ({ label: d.name, value: d.id, isExist: true })));
    }
  }, [editData, id]);

  useEffect(() => {
    if (!readOnly) {
      if (!!values.typeValue?.label && selectedTypeData) {
        setFieldValue("name", checkFormValue(selectedTypeData.name));
        setFieldValue("email", checkFormValue(selectedTypeData.email));
        if (!isB2b) { setFieldValue("salute", checkFormValue(selectedTypeData.salute)); setFieldValue("mobile", checkFormValue(selectedTypeData.mobile)); }
        else setFieldValue("mobile", checkFormValue(selectedTypeData.phone));
      } else {
        setFieldValue("name", "");
        setFieldValue("email", "");
        setFieldValue("mobile", "");
        setFieldValue("salute", "");
      }
    }
  }, [selectedTypeValue?.id, selectedTypeData?.id, values.typeValue?.label]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCOPED STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  const LEADS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.leads-page *, .leads-page *::before, .leads-page *::after {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
  box-sizing: border-box;
}

/* ── Page root — flush with parent container, no side scroll ── */
.leads-page {
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

/* ── Content area ── */
.leads-content {
  padding: 1px 0px 40px;
}

/* ── Dropdown reset ── */
.leads-page .dropdown-toggle::after { display: none !important; }
.leads-page .dropdown-toggle:focus  { box-shadow: none !important; outline: none !important; }

/* ══════════════════════════════════════════════════
   TABLE — key fix: fixed layout + controlled widths
══════════════════════════════════════════════════ */

/* Outer wrapper: clip overflow, no page-level scroll */
.leads-table-outer {
  width: 100%;
  overflow: hidden; /* no horizontal scroll on page */
}

/* Inner scrollable zone — only the table scrolls if truly needed */
.leads-table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
}

/* The actual table */
.leads-table {
  width: 100%;
  table-layout: fixed; /* CRITICAL — forces column widths to be respected */
  border-collapse: collapse;
  min-width: 0 !important; /* override any min-width from global styles */
}

/* Column width definitions */
.leads-table col.col-id         { width: 15%; }
.leads-table col.col-client     { width: 14%; }
.leads-table col.col-source     { width: 12%; }
.leads-table col.col-req        { width: 12%; }
.leads-table col.col-pkg        { width: 15%; }
.leads-table col.col-assigned   { width: 10%; }
.leads-table col.col-date       { width: 10%; }
.leads-table col.col-status     { width: 10%; }
.leads-table col.col-action     { width: 10%; }
.leads-table col.col-chk        { width: 10%; }

/* Header cells */
.leads-table thead tr {
  background: #01A3FF;
}

.leads-table thead th {
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

/* Body cells */
.leads-table tbody td {
  padding: 10px 10px !important;
  font-size: 13px !important;
  color: #374151;
  vertical-align: middle;
  border-bottom: 1px solid #f0f3f8 !important;
}

/* Allow client/agent name to wrap on two lines */
.leads-table td.td-client {
  white-space: normal;
  line-height: 1.3;
}

.leads-table tbody tr:last-child td {
  border-bottom: none !important;
}

.leads-table tbody tr:hover td {
  background: #f7f9fc;
}
.leads-table tbody tr.row-hovered td { background: #f5f8ff; }
.leads-table tbody tr.row-selected td { background: #eff6ff; }

/* Truncate long text with tooltip support */
.td-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 0; /* forces ellipsis to work with table-layout:fixed */
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

/* Status badge sizing */
.leads-table .btn.btn-sm {
  padding: 4px 10px !important;
  font-size: 11.5px !important;
  white-space: nowrap;
  border-radius: 6px !important;
}

/* Action menu button */
.leads-table .tp-btn {
  padding: 4px 6px !important;
  border-radius: 6px !important;
}



/* ── Filter bar ── */
.leads-filter-bar {
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

/* ── Responsive ── */
@media (max-width: 900px) {
  .leads-content { padding: 7px 0px 30px; }

  /* On small screens let the table scroll within its container */
  .leads-table-outer { overflow-x: auto; }
  .leads-table { min-width: 700px !important; }
}
`;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  if (viewMode === "list") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: LEADS_STYLES }} />

        {/* ── Page Header ── */}
        <div className="row">
          <div className="col-xl-12">
            <div className="page-titles mb-4 pb-2" style={{ position: "relative", zIndex: 999 }}>
              <div className="d-flex align-items-center">
                <h2 className="heading">Leads</h2>
              </div>
              <div className="d-flex flex-wrap my-2 my-sm-0 align-items-center gap-3">
                <div className="input-group search-area">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="input-group-text">
                    <Link to={"#"}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M16.6751 19.4916C16.2194 19.036 16.2194 18.2973 16.6751 17.8417C17.1307 17.3861 17.8694 17.3861 18.325 17.8417L22.9916 22.5084C23.4473 22.964 23.4473 23.7027 22.9916 24.1583C22.536 24.6139 21.7973 24.6139 21.3417 24.1583L16.6751 19.4916Z" fill="white" />
                        <path d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z" fill="white" />
                      </svg>
                    </Link>
                  </span>
                </div>

                <button
                  className={`btn-link i-false d-flex align-items-center justify-content-center position-relative`}
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

                <Dropdown className="dropdown">
                  <Dropdown.Toggle as="div" className="btn-link i-false" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", background: "transparent", color: "inherit", margin: "0" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="5" r="1.5"></circle>
                      <circle cx="12" cy="19" r="1.5"></circle>
                    </svg>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end" style={{ zIndex: 9999 }}>
                    <Dropdown.Item onClick={() => dispatch(FormAction.setRefresh())}>Refresh</Dropdown.Item>
                    <Dropdown.Item onClick={() => setShowKpiCards(!showKpiCards)}>
                      Turn {showKpiCards ? "off" : "on"} KPI cards
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {permissionType.write && (
                  <div className="invoice-btn">
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setViewMode("form")}>
                      New Lead
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3C7.05 3 3 7.05 3 12C3 16.95 7.05 21 12 21C16.95 21 21 16.95 21 12C21 7.05 16.95 3 12 3ZM12 19.125C8.1 19.125 4.875 15.9 4.875 12C4.875 8.1 8.1 4.875 12 4.875C15.9 4.875 19.125 8.1 19.125 12C19.125 15.9 15.9 19.125 12 19.125Z" fill="#FCFCFC" />
                        <path d="M16.3498 11.0251H12.9748V7.65009C12.9748 7.12509 12.5248 6.67509 11.9998 6.67509C11.4748 6.67509 11.0248 7.12509 11.0248 7.65009V11.0251H7.6498C7.1248 11.0251 6.6748 11.4751 6.6748 12.0001C6.6748 12.5251 7.1248 12.9751 7.6498 12.9751H11.0248V16.3501C11.0248 16.8751 11.4748 17.3251 11.9998 17.3251C12.5248 17.3251 12.9748 16.8751 12.9748 16.3501V12.9751H16.3498C16.8748 12.9751 17.3248 12.5251 17.3248 12.0001C17.3248 11.4751 16.8748 11.0251 16.3498 11.0251Z" fill="#FCFCFC" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="leads-page">
          {/* ── Content ── */}
          <div className="leads-content" style={{ paddingTop: "0px" }}>

            {/* ── KPI Cards ── */}
            {showKpiCards && (
              <div className="row g-3 mb-3">

                {/* Card 1 – Total Leads */}
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
                          <svg width="25" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 19H20V21H4V19ZM6.5 5H8.5V16H6.5V5ZM12 8H14V16H12V8ZM17.5 11H19.5V16H17.5V11Z" fill="#FCFCFC" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="fs-15 font-w600 mb-0">
                            Total<br />Leads
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">{summaryData[0].value}</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>All enquiries</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 – Confirmed */}
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
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 21.5C5.225 21.5 0.5 16.775 0.5 11C0.5 5.225 5.225 0.5 11 0.5C16.775 0.5 21.5 5.225 21.5 11C21.5 16.775 16.775 21.5 11 21.5ZM11 2.6875C6.45 2.6875 2.6875 6.45 2.6875 11C2.6875 15.55 6.45 19.3125 11 19.3125C15.55 19.3125 19.3125 15.55 19.3125 11C19.3125 6.45 15.55 2.6875 11 2.6875Z" fill="#FCFCFC" />
                            <path d="M9.3373 15.1126C9.0748 15.1126 8.7248 15.0251 8.5498 14.7626L6.3623 12.5751C5.9248 12.1376 5.9248 11.4376 6.3623 11.0001C6.7998 10.5626 7.4998 10.5626 7.9373 11.0001L9.3373 12.4001L14.0623 7.6751C14.4998 7.2376 15.1998 7.2376 15.6373 7.6751C16.0748 8.1126 16.0748 8.8126 15.6373 9.2501L10.1248 14.7626C9.8623 15.0251 9.5998 15.1126 9.3373 15.1126Z" fill="#FCFCFC" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="fs-15 font-w600 mb-0">
                            Confirmed<br />Leads
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">{summaryData[1].value}</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>{summaryData[0].value > 0 ? `${Math.round((summaryData[1].value / summaryData[0].value) * 100)}% of total` : "0% of total"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 – Pending */}
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
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#FCFCFC" />
                            <path d="M12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#FCFCFC" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="fs-15 font-w600 mb-0">
                            Pending<br />Leads
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">{summaryData[2].value}</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Awaiting action</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4 – Cancelled */}
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
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#FCFCFC" />
                            <path d="M15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z" fill="#FCFCFC" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="fs-15 font-w600 mb-0">
                            Cancelled<br />Leads
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">{summaryData[3].value}</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>{summaryData[0].value > 0 ? `${Math.round((summaryData[3].value / summaryData[0].value) * 100)}% of total` : "0% of total"}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
            {/* end KPI row */}

            {/* ── Filter Bar ── */}
            {showFilters && (
              <div className="leads-filter-bar">
                <FilterDropdown label="Lead Source" value={filterSource} options={sourceOptions} onChange={setFilterSource} onClear={() => setFilterSource(null)} />
                <FilterDropdown label="Assigned" value={filterAssigned} options={assignedOptions} onChange={setFilterAssigned} onClear={() => setFilterAssigned(null)} />
                <FilterDropdown label="Status" value={filterStatus} options={statusOptions} onChange={setFilterStatus} onClear={() => setFilterStatus(null)} />
                <DateFilterDropdown label="From Date" value={filterStartDate} onChange={setFilterStartDate} onClear={() => setFilterStartDate(null)} />
                <DateFilterDropdown label="To Date" value={filterEndDate} onChange={setFilterEndDate} onClear={() => setFilterEndDate(null)} />
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

            {/* ══════════════════════════════════════
                TABLE CARD
            ══════════════════════════════════════ */}
            <div className="card" style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 0, border: "1px solid #e8ecf4" }}>
              <div className="leads-table-outer">
                <div className="leads-table-scroll">
                  <table className="leads-table">
                    <colgroup>
                      <col className="col-id" />
                      <col className="col-client" />
                      <col className="col-source" />
                      {/* <col className="col-req" /> */}
                      <col className="col-pkg" />
                      <col className="col-assigned" />
                      <col className="col-date" />
                      <col className="col-status" />
                      <col className="col-action" />
                    </colgroup>

                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>ID</th>
                        <th onClick={() => handleSort('title')} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Client / Agent {getSortIcon('title')}
                        </th>
                        <th onClick={() => handleSort('source')} style={{ textAlign: "center", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Lead Source {getSortIcon('source')}
                        </th>
                        {/* <th onClick={() => handleSort('requirement')} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Requirement {getSortIcon('requirement')}
                        </th> */}
                        <th onClick={() => handleSort('packageDetails')} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Package Details {getSortIcon('packageDetails')}
                        </th>
                        <th onClick={() => handleSort('assignedTo')} style={{ textAlign: "center", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Assigned To {getSortIcon('assignedTo')}
                        </th>
                        <th onClick={() => handleSort('date')} style={{ textAlign: "center", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Date {getSortIcon('date')}
                        </th>
                        <th onClick={() => handleSort('icontext')} style={{ textAlign: "center", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          Status {getSortIcon('icontext')}
                        </th>
                        <th style={{ textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedLeads.map((item, ind) => {
                        const globalIndex = page * pageSize + ind;
                        const isHovered = hoveredRow === globalIndex;
                        const customerName = item?.customer?.name || item?.agent?.name || "-";
                        const contactInfo = item?.customer?.email || item?.agent?.email || item?.customer?.phone || "";
                        const leadSourceName = item?.lead_source?.name || "-";
                        const assignedName = item?.assigned_to_user?.first_name || "-";
                        const dateStr = item?.start_date ? new Date(item.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                        const requirementText = Array.isArray(item?.requirements) ? item.requirements.map(r => r?.name || r).join(", ") : (item?.requirements || "-");
                        const status = statusOverrides[item?.id] || item?.status || item?.enquiry_status || item?.current_status || item?.lead_status || "Pending";
                        const pkgDetails = item?.sub_destinations?.map(d => d.name).join(", ") || "-";

                        return (
                          <tr
                            key={item?.id || ind}
                            className={isHovered ? "row-hovered" : ""}
                            onMouseEnter={() => setHoveredRow(globalIndex)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >

                            {/* ID */}
                            <td style={{ textAlign: "center" }}>
                              <span style={{
                                display: "inline-block", fontWeight: 700, fontSize: "12px",
                                color: "#6B7280", background: "#F3F4F6", border: "1px solid #E5E7EB",
                                borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px",
                              }}>
                                {item?.ref_no || `#J0${globalIndex + 1}`}
                              </span>
                            </td>

                            {/* Client / Agent */}
                            <td className="td-client">
                              <span style={{ fontWeight: 700, fontSize: "13px", color: "#111827", display: "block" }}>
                                {customerName}
                              </span>
                              <span style={{ fontSize: "11.5px", color: "#9CA3AF", display: "block", marginTop: "1px" }}>
                                <Link to={"app-profile"} style={{ color: "#9CA3AF", textDecoration: "none" }}>{contactInfo}</Link>
                              </span>
                            </td>

                            {/* Lead Source */}
                            <td>
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
                            {/* <td className="td-truncate" title={requirementText} style={{ color: "#4B5563" }}>
                              {requirementText}
                            </td> */}

                            {/* Package Details */}
                            <td className="td-truncate" title={pkgDetails} style={{ fontWeight: 500, color: "#1F2937" }}>
                              {pkgDetails}
                            </td>

                            {/* Assigned To */}
                            <td className="td-assigned" title={assignedName}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{
                                  width: "24px", height: "24px", borderRadius: "50%",
                                  background: "#E0F2FE", color: "#0284C7",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "11px", fontWeight: "700", flexShrink: 0
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

                            {/* Status */}
                            <td>
                              <StatusBadge status={status} />
                            </td>

                            {/* Actions – Status Update */}
                            <td style={{ textAlign: "center", padding: "0 8px" }}>
                              <Dropdown>
                                <Dropdown.Toggle
                                  as="div"
                                  className="i-false"
                                  style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    width: "30px", height: "30px", borderRadius: "8px",
                                    background: status.toLowerCase() === "confirmed" ? "#ECFDF5" : status.toLowerCase() === "cancelled" ? "#FEF2F2" : "#F1F5F9",
                                    border: `1px solid ${status.toLowerCase() === "confirmed" ? "#A7F3D0" : status.toLowerCase() === "cancelled" ? "#FECACA" : "#E2E8F0"}`,
                                    cursor: "pointer",
                                    color: status.toLowerCase() === "confirmed" ? "#059669" : status.toLowerCase() === "cancelled" ? "#DC2626" : "#64748B",
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="5" r="1.3" fill="currentColor" />
                                    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
                                    <circle cx="12" cy="19" r="1.3" fill="currentColor" />
                                  </svg>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end">
                                  {status.toLowerCase() !== "confirmed" && (
                                    <Dropdown.Item
                                      onClick={() => handleStatusUpdate(item?.id, "Confirmed")}
                                      style={{ color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                      Confirm
                                    </Dropdown.Item>
                                  )}
                                  {status.toLowerCase() !== "cancelled" && (
                                    <Dropdown.Item
                                      onClick={() => handleStatusUpdate(item?.id, "Cancelled")}
                                      style={{ color: "#DC2626", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                      Cancel
                                    </Dropdown.Item>
                                  )}
                                  {(status.toLowerCase() === "confirmed" || status.toLowerCase() === "cancelled") && (
                                    <Dropdown.Item
                                      onClick={() => handleStatusUpdate(item?.id, "Pending")}
                                      style={{ color: "#D97706", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                      Reset to Pending
                                    </Dropdown.Item>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })}

                      {!paginatedLeads.length && (
                        <tr>
                          <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 10px" }}>
                              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            No leads found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
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

          </div>{/* end leads-content */}
        </div > {/* end leads-page */}
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - FORM VIEW (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <div className="row">
        <div className={`col-${isFormPage ? "8" : "12"}`}>
          <div className="card profile-card card-bx m-b30 border-0">
            <form className="profile-form">
              <div className="card-body">
                <div className="row">
                  <ModeBtn className="col-sm-12 d-flex justify-content-end" isEdit={isFormPage} readOnly={readOnly} setReadOnly={setReadOnly} />

                  <div className="col-sm-4">
                    <ReactSelect label="Type" onChange={(selected) => { if (selected.label === "B2B") setDisabled(true); else setDisabled(false); setFieldValue("typeValue", { label: "", value: "" }); setFieldValue("name", ""); setFieldValue("email", ""); setFieldValue("mobile", ""); setFieldValue("salute", ""); setFieldValue("type", selected); }} onBlur={handleBlur} value={values.type} options={formOptions.TypeOptions} optionValue="value" optionLabel="label" isDisabled={readOnly} />
                  </div>
                  <div className="col-sm-4">
                    <ReactSelect label={isB2b ? "Agent" : "Customer"} onChange={(selected) => { setDisabled(true); setFieldValue("typeValue", selected); }} onBlur={handleBlur} value={values.typeValue} options={isB2b ? agentDataOptions : customerDataOptions} optionValue="id" optionLabel="name" isDisabled={readOnly} />
                  </div>
                  <div className="col-sm-4">
                    <InputField label="Ref No." name="refNo" onChange={handleChange} onBlur={handleBlur} values={values} disabled={readOnly} placeholder="e.g., H/56789" />
                  </div>
                  {!isB2b && (
                    <div className="col-sm-6">
                      <SelectField label="Salute" name="salute" onChange={handleChange} onBlur={handleBlur} values={values} options={formOptions.SaluteOptions} optionValue="value" optionLabel="label" required disabled={disabled || readOnly} />
                    </div>
                  )}
                  {formOptions.inputOptions.map((item, ind) => (
                    <div className="col-sm-6" key={ind}>
                      <InputField label={item.label} name={item.name} onChange={handleChange} onBlur={handleBlur} values={values} disabled={disabled || readOnly} required={item.name === "name" || (isB2b && item.name === "email")} />
                    </div>
                  ))}
                  <div className="col-sm-6">
                    <ReactSelect label="Destination" onChange={(selected) => setFieldValue("destination", selected)} onBlur={handleBlur} value={values.destination} options={destinationData?.data?.data} optionValue="id" optionLabel="name" required isDisabled={readOnly} />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect label="Sub Destination" onChange={(selected) => setFieldValue("subDestination", selected)} onBlur={handleBlur} value={values.subDestination} options={subDestinationData?.data?.data} optionValue="id" optionLabel="name" required={false} isDisabled={readOnly} isMulti />
                  </div>
                  <div className="col-sm-6 m-b30">
                    <CustomDatePicker label="Start Date" selected={formik.values?.startDate} onChange={(date) => formik.setFieldValue("startDate", date)} disabled={readOnly} />
                  </div>
                  <div className="col-sm-6 m-b30">
                    <CustomDatePicker label="End Date" selected={formik.values?.endDate} onChange={(date) => formik.setFieldValue("endDate", date)} disabled={readOnly} />
                  </div>
                  <div className="col-sm-4">
                    <InputField label="Adult" name="adult" type="number" onChange={handleChange} onBlur={handleBlur} values={values} disabled={readOnly} />
                  </div>
                  <div className="col-sm-4">
                    <InputField label="Child" name="child" type="number" onChange={handleChange} onBlur={handleBlur} values={values} disabled={readOnly} />
                  </div>
                  <div className="col-sm-4">
                    <InputField label="Infant" name="infant" type="number" onChange={handleChange} onBlur={handleBlur} values={values} disabled={readOnly} />
                  </div>
                  <div className="col-sm-6">
                    <SelectField label="Lead Source" name="lead" onChange={handleChange} onBlur={handleBlur} values={values} options={leadDataOptions} optionValue="id" optionLabel="name" disabled={readOnly} />
                  </div>
                  <div className="col-sm-6">
                    <SelectField label="Priority" name="priority" onChange={handleChange} onBlur={handleBlur} values={values} options={priorityDataOptions} optionValue="id" optionLabel="name" disabled={readOnly} />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect isMulti label="Requirement" onChange={(selected) => setFieldValue("requirement", selected)} onBlur={handleBlur} value={values.requirement} options={requirementDataOptions} optionValue="id" optionLabel="name" isDisabled={readOnly} />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect label="Assigned To" onChange={(selected) => setFieldValue("assigned", selected)} onBlur={handleBlur} value={values.assigned} options={staffDataOptions} optionValue="id" optionLabel="first_name" isDisabled={readOnly} />
                  </div>
                  <div className="card-footer border-0 pt-0 pb-3 col-12">
                    <button className="btn btn-primary" type="button" onClick={handleClick}>{isEdit ? "UPDATE" : "CREATE"}</button>
                    <button className="btn btn-secondary ms-2" type="button" onClick={() => setViewMode("list")}>CANCEL</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {isFormPage && (
          <div className="col-4">
            <div className="bg-white p-3 rounded">
              <div>
                <InputField label="Description" name="description" onChange={handleChange} onBlur={handleBlur} values={values} />
              </div>
              <div>
                <h6 className="my-4">Package Suggestion</h6>
                {formOptions.suggestionArr.map((item, ind) => (
                  <div className="d-flex border suggestion-card p-2 rounded mb-2" key={ind}>
                    <div><h6>{item.name}</h6><p>{item.description}</p></div>
                    <div><h6>{item.cost} Rs</h6></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Leads;