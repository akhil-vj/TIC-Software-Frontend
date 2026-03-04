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
import { axiosPut, filePost } from "../../../services/AxiosInstance";

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
// DATA - Mock Lead List
// ═══════════════════════════════════════════════════════════════════════════

const tableBlog = [
  { title: "Talan Siphron", mail: "ahmad@mail.com", phone: "+917723823348", icon: "#1EBA62", iconClass: "btn-success", icon2: <RightIcon />, icontext: "Confirmed", source: "Google Ads", assignedTo: "Shanid CA", date: "2024-02-15", requirement: "Premium Plus", packageDetails: "Dubai, UAE - 7 Days" },
  { title: "Thomas Khun", mail: "soap@mail.com", phone: "+918823823348", icon: "#FF4646", iconClass: "btn-primary", icon2: <QuestionIcon colorchange="#01A3FF" />, icontext: "Pending", source: "Facebook", assignedTo: "John Smith", date: "2024-02-10", requirement: "Standard Package", packageDetails: "Maldives - 5 Days" },
  { title: "Marilyn Workman", mail: "mantha@mail.com", phone: "+917723823348", icon: "#FF4646", iconClass: "btn-pink", icon2: <QuestionIcon colorchange="#EB62D0" />, icontext: "W. Approval", source: "Direct", assignedTo: "Sarah Wilson", date: "2024-02-05", requirement: "Family Bundle", packageDetails: "Singapore - 4 Days" },
  { title: "Thomas Khun", mail: "hope@mail.com", phone: "+919923823348", icon: "#FF4646", iconClass: "btn-primary", icon2: <QuestionIcon colorchange="#01A3FF" />, icontext: "Pending", source: "Email Marketing", assignedTo: "Shanid CA", date: "2024-02-12", requirement: "Basic Tier", packageDetails: "Thailand - 6 Days" },
  { title: "Talan Siphron", mail: "jordan@mail.com", phone: "+917723823348", icon: "#1EBA62", iconClass: "btn-success", icon2: <RightIcon />, icontext: "Complete", source: "Referral", assignedTo: "Mike Johnson", date: "2024-01-28", requirement: "Luxury Package", packageDetails: "Paris & London - 10 Days" },
  { title: "Marilyn Workman", mail: "adja@mail.com", phone: "+917723823348", icon: "#FF4646", iconClass: "btn-pink", icon2: <QuestionIcon colorchange="#EB62D0" />, icontext: "W. Approval", source: "LinkedIn", assignedTo: "Sarah Wilson", date: "2024-02-08", requirement: "Group Tour", packageDetails: "Bali & Lombok - 8 Days" },
  { title: "Thomas Khun", mail: "soap@mail.com", phone: "+917723823348", icon: "#FF4646", iconClass: "btn-primary", icon2: <QuestionIcon colorchange="#01A3FF" />, icontext: "Pending", source: "Google Ads", assignedTo: "John Smith", date: "2024-02-14", requirement: "Honeymoon Special", packageDetails: "Santorini - 5 Days" },
  { title: "Talan Siphron", mail: "kevin@mail.com", phone: "+917723823348", icon: "#FF4646", iconClass: "btn-pink", icon2: <QuestionIcon colorchange="#EB62D0" />, icontext: "W. Approval", source: "Direct", assignedTo: "Shanid CA", date: "2024-02-06", requirement: "Adventure Tour", packageDetails: "Nepal & Bhutan - 9 Days" },
  { title: "Marilyn Workman", mail: "vita@mail.com", phone: "+917723823348", icon: "#1EBA62", iconClass: "btn-success", icon2: <RightIcon />, icontext: "Complete", source: "Facebook", assignedTo: "Mike Johnson", date: "2024-01-30", requirement: "Corporate Retreat", packageDetails: "Goa - 3 Days" },
];

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
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showKpiCards, setShowKpiCards] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(id && id !== "add" ? true : false);

  // ─ Form Management
  const isEdit = id && id !== "add";
  const isFormPage = !setShowModal;
  const formik = useFormik({ initialValues });
  const { handleBlur, handleChange, setFieldValue, values } = formik;

  // ─ API Endpoints
  const url = URLS.ENQUIRY_URL;
  const editUrl = `${url}/${id}`;

  // ─ Fetch Data
  const { data } = useAsync(editUrl, !!isEdit);
  const editData = data?.data;

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
  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tableBlog.filter((item) => {
      const matchesSearch = !term || [item.title, item.mail, item.icontext].filter(Boolean).some((f) => f.toLowerCase().includes(term));
      const matchesSource = !filterSource || item.source === filterSource.value;
      const matchesStatus = !filterStatus || item.icontext === filterStatus.value;
      const itemDate = new Date(item.date);
      const matchesDateRange = (!filterStartDate || itemDate >= filterStartDate) && (!filterEndDate || itemDate <= filterEndDate);
      const matchesAssigned = !filterAssigned || item.assignedTo === filterAssigned.value;
      return matchesSearch && matchesSource && matchesStatus && matchesDateRange && matchesAssigned;
    });
  }, [search, filterSource, filterStatus, filterStartDate, filterEndDate, filterAssigned]);

  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = page * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page]);

  const sourceOptions = useMemo(() => [...new Set(tableBlog.map((i) => i.source))].map((s) => ({ label: s, value: s })), []);
  const statusOptions = useMemo(() => [...new Set(tableBlog.map((i) => i.icontext))].map((s) => ({ label: s, value: s })), []);
  const assignedOptions = useMemo(() => [...new Set(tableBlog.map((i) => i.assignedTo))].map((a) => ({ label: a, value: a })), []);

  const hasActiveFilters = () => filterSource || filterStatus || filterStartDate || filterEndDate || filterAssigned || search;

  const handleClearFilters = () => {
    setFilterSource(null);
    setFilterStatus(null);
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterAssigned(null);
    setSearch("");
  };

  useEffect(() => { setPage(0); setSelectedRows(new Set()); }, [search, filterSource, filterStatus, filterStartDate, filterEndDate, filterAssigned]);
  useEffect(() => { if (selectedRows.size === 0) setShowCheckboxes(false); }, [selectedRows]);

  const handleSelectAll = (e) => {
    const newSelected = new Set(selectedRows);
    if (e.target.checked) paginatedLeads.forEach((_, ind) => newSelected.add(page * pageSize + ind));
    else paginatedLeads.forEach((_, ind) => newSelected.delete(page * pageSize + ind));
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) newSelected.delete(index);
    else newSelected.add(index);
    setSelectedRows(newSelected);
  };

  const handleSelectFromMenu = (index) => {
    if (!showCheckboxes) setShowCheckboxes(true);
    handleSelectRow(index);
  };

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every((_, ind) => selectedRows.has(page * pageSize + ind));

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
.leads-table col.col-id         { width: 55px; }
.leads-table col.col-client     { width: 12%; }
.leads-table col.col-source     { width: 10%; }
.leads-table col.col-req        { width: 12%; }
.leads-table col.col-pkg        { width: 15%; }
.leads-table col.col-assigned   { width: 15%; }
.leads-table col.col-date       { width: 10%; }
.leads-table col.col-status     { width: 60px; }
.leads-table col.col-action     { width: 48px; }
.leads-table col.col-chk        { width: 18px; }

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

/* ══════════════════════════════════════════════════
   KPI CARDS — restore colored backgrounds
══════════════════════════════════════════════════ */

.leads-page .card-box {
  position: relative;
  overflow: hidden;
  border: none !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
}

.leads-page .card-box .back-image {
  position: absolute;
  right: -20px;
  top: -20px;
  pointer-events: none;
  opacity: 1;
}

.leads-page .card-box .card-body {
  position: relative;
  z-index: 1;
}

.leads-page .card-box .card-body h4,
.leads-page .card-box .card-body h2,
.leads-page .card-box .card-body span {
  color: #fff !important;
}

/* Blue — Total Leads */
.leads-page .card-box.blue {
  background: linear-gradient(135deg, #01A3FF 0%, #0284d4 50%) !important;
}

.leads-page .card-box.blue .card-box-icon {
  background: rgba(255,255,255,0.12);
  border: 1px solid #ffffff;
}

/* Green — Conversion Rate */
.leads-page .card-box.green {
  background: linear-gradient(135deg, #1EBA62 0%, #17a356 50%) !important;
}

/* Secondary/Purple — Response Time */
.leads-page .card-box.secondary {
  background: linear-gradient(135deg, #9254DE 0%, #7a3fc4 50%) !important;
}

/* Amber/Orange — Hot Leads */
.leads-page .card-box.amber {
  background: linear-gradient(135deg, #FF9500 0%, #e07f00 50%) !important;
}

/* Icon circle background */
.leads-page .card-box-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255,255,255,0.2);
  flex-shrink: 0;
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
                            <rect width="24" height="24" rx="10" fill="var(--primary)" />
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
                        <h2 className="font-w600 mb-0 fs-28">3,932</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>+82 this week</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 – Conversion Rate */}
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
                            Conversion<br />Rate
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">67%</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>+ 3% from last wk</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 – Avg Response Time */}
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
                          <svg width="28" height="28" viewBox="0 -1 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 3.5C9.03 3.5 5 7.53 5 12.5C5 17.47 9.03 21.5 14 21.5C18.97 21.5 23 17.47 23 12.5C23 7.53 18.97 3.5 14 3.5ZM14 19.5C10.13 19.5 7 16.37 7 12.5C7 8.63 10.13 5.5 14 5.5C17.87 5.5 21 8.63 21 12.5C21 16.37 17.87 19.5 14 19.5Z" fill="#FCFCFC" />
                            <path d="M14 8.5C13.45 8.5 13 8.95 13 9.5V13.5C13 14.05 13.45 14.5 14 14.5C14.55 14.5 15 14.05 15 13.5V9.5C15 8.95 14.55 8.5 14 8.5ZM16.5 15.09L14.5 13.91C14.01 13.63 13.39 13.8 13.11 14.29C12.83 14.78 13 15.4 13.49 15.68L15.49 16.86C15.65 16.95 15.82 17 16 17C16.35 17 16.7 16.82 16.89 16.5C17.17 16.01 17 15.37 16.5 15.09Z" fill="#FCFCFC" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="fs-15 font-w600 mb-0">
                            Response<br />Time(Avg)
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">2h 14m</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>Across leads</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4 – Hot Leads */}
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
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.75 2.625C13.0 6.125 13.5 9.5 11.5 12C10.2 13.9 7.875 14.875 7.875 14.875C7.875 14.875 9.1 10.5 5.75 9.625C5.75 9.625 4.375 14.875 6.75 18.625C9.125 22.375 13.375 24.125 17.5 22.875C21.625 21.625 23.625 17.5 22 13.625C20.125 9.25 15.75 2.625 15.75 2.625Z" fill="#FCFCFC" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="fs-15 font-w600 mb-0">
                            Hot<br />Leads
                          </h4>
                        </div>
                      </div>
                      <div className="chart-num text-end">
                        <h2 className="font-w600 mb-0 fs-28">28</h2>
                        <span className="fs-12 font-w400 d-block" style={{ opacity: 0.75 }}>needing follow-up</span>
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
                      {showCheckboxes && <col className="col-chk" />}
                      <col className="col-id" />
                      <col className="col-client" />
                      <col className="col-source" />
                      <col className="col-req" />
                      <col className="col-pkg" />
                      <col className="col-assigned" />
                      <col className="col-date" />
                      <col className="col-status" />
                      <col className="col-action" />
                    </colgroup>

                    <thead>
                      <tr>
                        {showCheckboxes && (
                          <th style={{ padding: "0 0 0 2px", width: "18px", verticalAlign: "middle", overflow: "visible", textAlign: "right" }}>
                            <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="form-check-input" style={{ accentColor: "#fff", margin: "0 -4px 0 0" }} />
                          </th>
                        )}
                        <th style={{ textAlign: "center" }}>ID</th>
                        <th >Client / Agent</th>
                        <th style={{ textAlign: "center" }}>Lead Source</th>
                        <th >Requirement</th>
                        <th >Package Details</th>
                        <th style={{ textAlign: "center" }}>Assigned To</th>
                        <th style={{ textAlign: "center" }}>Date</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedLeads.map((item, ind) => {
                        const globalIndex = page * pageSize + ind;
                        const isSelected = selectedRows.has(globalIndex);
                        const isHovered = hoveredRow === globalIndex;
                        return (
                          <tr
                            key={ind}
                            className={isSelected ? "row-selected" : isHovered ? "row-hovered" : ""}
                            onMouseEnter={() => setHoveredRow(globalIndex)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            {showCheckboxes && (
                              <td style={{ padding: "0 0 0 2px", verticalAlign: "middle", overflow: "visible", textAlign: "right" }}>
                                <input type="checkbox" className="form-check-input" checked={isSelected} onChange={() => handleSelectRow(globalIndex)} style={{ margin: "0 -4px 0 0" }} />
                              </td>
                            )}

                            {/* ID */}
                            <td style={{ textAlign: "center" }}>
                              <span style={{
                                display: "inline-block", fontWeight: 700, fontSize: "12px",
                                color: "#6B7280", background: "#F3F4F6", border: "1px solid #E5E7EB",
                                borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px",
                              }}>
                                {`#J0${globalIndex + 1}`}
                              </span>
                            </td>

                            {/* Client / Agent */}
                            <td className="td-client">
                              <span style={{ fontWeight: 700, fontSize: "13px", color: "#111827", display: "block" }}>
                                {item.title}
                              </span>
                              <span style={{ fontSize: "11.5px", color: "#9CA3AF", display: "block", marginTop: "1px" }}>
                                <Link to={"app-profile"} style={{ color: "#9CA3AF", textDecoration: "none" }}>{item.phone || item.mail}</Link>
                              </span>
                            </td>

                            {/* Lead Source */}
                            <td>
                              <span style={{
                                display: "inline-block", padding: "3px 9px", borderRadius: "12px",
                                fontSize: "12px", fontWeight: 500, background: "#F1F5F9",
                                color: "#475569", border: "1px solid #E2E8F0", whiteSpace: "nowrap",
                                maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
                              }} title={item.source}>
                                {item.source}
                              </span>
                            </td>

                            {/* Requirement */}
                            <td className="td-truncate" title={item.requirement} style={{ color: "#4B5563" }}>
                              {item.requirement}
                            </td>

                            {/* Package Details */}
                            <td className="td-truncate" title={item.packageDetails} style={{ fontWeight: 500, color: "#1F2937" }}>
                              {item.packageDetails}
                            </td>

                            {/* Assigned To */}
                            <td className="td-assigned" title={item.assignedTo}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{
                                  width: "24px", height: "24px", borderRadius: "50%",
                                  background: "#E0F2FE", color: "#0284C7",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "11px", fontWeight: "700", flexShrink: 0
                                }}>
                                  {item.assignedTo ? item.assignedTo.charAt(0).toUpperCase() : "?"}
                                </div>
                                <span style={{ color: "#01A3FF", fontWeight: 600 }}>{item.assignedTo}</span>
                              </div>
                            </td>

                            {/* Date */}
                            <td style={{ whiteSpace: "nowrap", color: "#6B7280", fontSize: "12.5px" }}>
                              {new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>

                            {/* Status */}
                            <td>
                              <StatusBadge status={item.icontext} />
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
                                  <Dropdown.Item onClick={() => handleSelectFromMenu(globalIndex)}>
                                    {isSelected ? "Deselect" : "Select"}
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => setViewMode("form")}>Edit</Dropdown.Item>
                                  <Dropdown.Item>Delete</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })}

                      {!paginatedLeads.length && (
                        <tr>
                          <td colSpan={showCheckboxes ? 10 : 9} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>
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
        </div>{/* end leads-page */}
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