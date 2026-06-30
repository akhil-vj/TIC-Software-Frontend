import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Collapse from "react-bootstrap/Collapse";
import DatePicker from "react-datepicker";
import { Badge, Button, Form } from "react-bootstrap";
import SetupModal from "./SetupModal";
import InsertModal from "./InsertModal";
import notify from "../../common/Notify";
import NoData from "../../common/NoData"
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import ConfirmationModal from "../../common/DeleteModal";
import { axiosPut, axiosPost } from "../../../../services/AxiosInstance";
import { notifyCreate, notifyError, notifyDelete } from "../../../utilis/notifyMessage";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";

const options = [
  { value: "2", label: "Published" },
  { value: "3", label: "Draft" },
  { value: "4", label: "Trash" },
  { value: "5", label: "Private" },
  { value: "6", label: "Pending" },
];

const Quotation = () => {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { id } = useParams()
  const itineraryUrl = URLS.ITINERARY_URL
  const itineraryByEnquiryUrl = `${URLS.ITINERARY_URL}?enquiry_id=${id}&ref=${refreshKey}`
  const fetchData = useAsync(itineraryByEnquiryUrl, true)
  const tableData = fetchData?.data?.data

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [tableData]);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedTableData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedTableData.map(item => item.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axiosPost(`/api/itineraries/bulk-delete`, {
        ids: selectedIds
      });
      if (response.success) {
        notifyDelete(`${selectedIds.length} Quotation(s)`);
        setSelectedIds([]);
        dispatch(FormAction.setRefresh());
      } else {
        notifyError(response.message || "Failed to delete quotations");
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Something went wrong !");
    }
  };

  const [data, setData] = useState(
    document.querySelectorAll("#content_wrapper tbody tr"),
  );
  const sort = 8;
  const activePag = useRef(0);
  const [test, settest] = useState(0);

  const navigate = useNavigate();

  // Active data
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };

  // use effect
  useEffect(() => {
    setData(document.querySelectorAll("#content_wrapper tbody tr"));
  }, [test]);

  // Active pagination
  activePag.current === 0 && chageData(0, sort);
  
  // pagination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  // Active pagination & change data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    settest(i);
  };

  const chackbox = document.querySelectorAll(".sorting_1 input");
  const motherChackBox = document.querySelector(".sorting_asc input");
  const chackboxFun = (type) => {
    for (let i = 0; i < chackbox.length; i++) {
      const element = chackbox[i];
      if (type === "all") {
        if (motherChackBox.checked) {
          element.checked = true;
        } else {
          element.checked = false;
        }
      } else {
        if (!element.checked) {
          motherChackBox.checked = false;
          break;
        } else {
          motherChackBox.checked = true;
        }
      }
    }
  };

  const onDelete = (id, name) => {
    const url = `${itineraryUrl}/${id}`
    setDeleteUrl(url)
    setDeleteName(name)
    setIsBulkDelete(false)
    setShowDeleteModal(true)
  }

  const onBulkDeleteTrigger = () => {
    setDeleteUrl("")
    setDeleteName(`${selectedIds.length} Quotation(s)`)
    setIsBulkDelete(true)
    setShowDeleteModal(true)
  }

  // ── Version History: set a previous version as current ──
  const handleSetCurrent = async (itemId) => {
    try {
      const url = `${URLS.ITINERARY_SET_CURRENT_URL}${itemId}/set-current`;
      await axiosPut(url);
      notifyCreate('Version activated', false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      notifyError(err?.response?.data?.message || 'Failed to set version');
    }
  };

  // ── Sort: group by parent, current first, then by version desc ──
  const sortedTableData = React.useMemo(() => {
    if (!tableData?.length) return [];
    return [...tableData].sort((a, b) => {
      // Group by parent_itinerary_id
      const pA = a.parent_itinerary_id || a.id;
      const pB = b.parent_itinerary_id || b.id;
      if (pA !== pB) return 0; // keep original order across groups
      // Within same group: current first, then by version desc
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      return (b.version || 1) - (a.version || 1);
    });
  }, [tableData]);

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          {/* Filter Section */}
          <div className="filter cm-content-box box-primary">
            <div className="content-title">
              <div className="cpa">
                <i className="fas fa-file-word me-2"></i>Quotation
              </div>
              <div className="tools d-flex align-items-center gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("itinerary")}
                >
                  <i className="fa fa-plus me-2"></i>Create Itinerary
                </button>
              </div>
            </div>

            <Collapse in={open}>
              <div className="cm-content-body form excerpt">
                <div className="card-body">
                  <div className="row filter-row">
                    <div className="col-xl-3 col-xxl-6">
                      <input
                        type="text"
                        className="form-control mb-xl-0 mb-3"
                        id="exampleFormControlInput1"
                        placeholder="Title"
                      />
                    </div>
                    <div className="col-xl-3 col-xxl-6">
                      <Select
                        options={options}
                        className="custom-react-select mb-3 mb-xxl-0"
                        placeholder="Select Status"
                      />
                    </div>
                    <div className="col-xl-3 col-xxl-6">
                      <DatePicker
                        className="form-control mb-xxl-0 mb-3"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                    </div>
                    <div className="col-xl-3 col-xxl-6">
                      <button
                        className="btn btn-primary me-2"
                        title="Click here to Search"
                        type="button"
                      >
                        <i className="fa fa-search me-1"></i>Filter
                      </button>
                      <button
                        className="btn btn-danger light"
                        title="Click here to remove filter"
                        type="button"
                      >
                        Remove Filter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          </div>

          {/* Enquiry List Section */}
          <div className="filter cm-content-box box-primary mt-4">
            <div className="content-title">
              <div className="cpa">
                <i className="fas fa-list me-2"></i>Quotation List
              </div>
              {selectedIds.length > 0 && (
                <div className="tools d-flex align-items-center gap-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={onBulkDeleteTrigger}
                  >
                    <i className="fa fa-trash me-2"></i>Delete Selected ({selectedIds.length})
                  </button>
                </div>
              )}
            </div>

            <Collapse in={open2}>
              <div className="cm-content-body form excerpt">
                <div className="card-body">
                  <div className="table-responsive">
                    <div
                      id="content_wrapper"
                      className="dataTables_wrapper no-footer"
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#01A3FF" }}>
                            <th style={{ padding: "12px 10px", width: "40px", textAlign: "center", border: "none" }}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={sortedTableData?.length > 0 && selectedIds.length === sortedTableData.length}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>SI No</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "none", letterSpacing: "0.1px" }}>Ref No</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "none", letterSpacing: "0.1px" }}>Package Name</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Version</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Pax</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>From Date</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "none", letterSpacing: "0.1px" }}>Edited by</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Edited Date</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "right", border: "none", letterSpacing: "0.1px" }}>Price</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Status</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            !!sortedTableData?.length ?
                              sortedTableData?.map((item, ind) => {
                                const isCurrent = !!item.is_current;
                                const version = item.version || 1;
                                return (
                                <tr key={ind} style={{
                                  borderBottom: "1px solid #f0f3f8",
                                  transition: "background 0.15s",
                                  cursor: "pointer",
                                  opacity: isCurrent ? 1 : 0.75,
                                  background: isCurrent ? "transparent" : "#fafbfc",
                                }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#f7f9fc"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = isCurrent ? "transparent" : "#fafbfc"}
                                  onClick={() => navigate(`itinerary/${item.id}`)}
                                >
                                  <td style={{ padding: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={selectedIds.includes(item.id)}
                                      onChange={() => handleSelectRow(item.id)}
                                    />
                                  </td>
                                  <td style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "#6B7280" }}>
                                    <span style={{
                                      display: "inline-block", fontWeight: 700, fontSize: "12px",
                                      color: "#6B7280", background: "#F3F4F6", border: "1px solid #E5E7EB",
                                      borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px",
                                    }}>
                                      {ind + 1}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px", fontSize: "13px", color: "#374151", fontWeight: 500, whiteSpace: "nowrap" }}>{item.enquiry_ref_no || item.enquiry?.ref_no || '-'}</td>
                                  <td style={{ padding: "10px", fontSize: "13px", color: "#374151", fontWeight: 500, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.package_name}>{item.package_name}</td>

                                  {/* ── Version Badge ── */}
                                  <td style={{ padding: "10px", textAlign: "center" }}>
                                    <span style={{
                                      display: "inline-block",
                                      padding: "3px 10px",
                                      borderRadius: "12px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      letterSpacing: "0.5px",
                                      background: isCurrent ? "#DBEAFE" : "#F3F4F6",
                                      color: isCurrent ? "#1D4ED8" : "#6B7280",
                                      border: `1px solid ${isCurrent ? "#BFDBFE" : "#E5E7EB"}`,
                                    }}>
                                      v{version}
                                    </span>
                                  </td>

                                  <td style={{ padding: "10px", textAlign: "center", fontSize: "13px", color: "#4B5563" }}>
                                    <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>
                                      {item.adult_count}A {item.child_count > 0 ? `${item.child_count}C` : ""}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{item.start_date ? new Date(item.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                                  <td style={{ padding: "10px", fontSize: "13px", color: "#4B5563", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.edited_by}>{item.edited_by || '-'}</td>
                                  
                                  {/* ── Edited Date Column ── */}
                                  <td style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "#4B5563", whiteSpace: "nowrap" }}>
                                    {item.edited_at ? new Date(item.edited_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                                  </td>

                                  <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#01A3FF", whiteSpace: "nowrap" }}>
                                    {(() => {
                                      const baseTotal = parseFloat(item.grand_total || item.total_amount || item.net_amount || 0);

                                      let priceInObj = item.priceIn || item.price_in;
                                      if (typeof priceInObj === 'string') {
                                        try { priceInObj = JSON.parse(priceInObj); } catch (e) { }
                                      }

                                      const isBase = priceInObj?.value === 'base' || String(priceInObj?.label).toLowerCase() === 'base';
                                      const exchangeRate = parseFloat(priceInObj?.exchange_rate) || 0;

                                      let displayTotal = baseTotal;
                                      if (!isBase && exchangeRate > 0) {
                                        displayTotal = baseTotal / exchangeRate;
                                      } else if (item.converted_total && !isBase) {
                                        displayTotal = parseFloat(item.converted_total);
                                      }

                                      return displayTotal.toLocaleString(undefined, { maximumFractionDigits: 2 });
                                    })()}
                                  </td>

                                  {/* ── Status Badge ── */}
                                  <td style={{ padding: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                    {isCurrent ? (
                                      <span style={{
                                        display: "inline-flex", alignItems: "center", gap: "5px",
                                        padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
                                        fontWeight: 600, letterSpacing: "0.3px",
                                        background: "#D1FAE5", color: "#065F46",
                                        border: "1px solid #A7F3D0",
                                      }}>
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
                                        Current
                                      </span>
                                    ) : (
                                      <span
                                        title="Click to use this version"
                                        style={{
                                          display: "inline-flex", alignItems: "center", gap: "5px",
                                          padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
                                          fontWeight: 600, letterSpacing: "0.3px",
                                          background: "#F3F4F6", color: "#6B7280",
                                          border: "1px solid #E5E7EB",
                                          cursor: "pointer", transition: "all 0.15s",
                                        }}
                                        onClick={(e) => { e.stopPropagation(); handleSetCurrent(item.id); }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#DBEAFE"; e.currentTarget.style.color = "#1D4ED8"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                                      >
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9CA3AF", display: "inline-block" }}></span>
                                        Previous
                                      </span>
                                    )}
                                  </td>

                                  <td style={{ padding: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                      {/* Use This Version — only for previous versions */}
                                      {!isCurrent && (
                                        <button
                                          title="Use this version as current"
                                          style={{
                                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                                            width: "30px", height: "30px", borderRadius: "8px",
                                            background: "#DBEAFE", border: "1px solid #BFDBFE",
                                            cursor: "pointer", color: "#1D4ED8", transition: "all 0.15s",
                                            padding: 0
                                          }}
                                          onClick={(e) => { e.stopPropagation(); handleSetCurrent(item.id); }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = "#93C5FD"; e.currentTarget.style.borderColor = "#60A5FA"; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = "#DBEAFE"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
                                        >
                                          <i className="fa fa-check" style={{ fontSize: "13px" }}></i>
                                        </button>
                                      )}
                                      <button
                                        style={{
                                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                                          width: "30px", height: "30px", borderRadius: "8px",
                                          background: "#F1F5F9", border: "1px solid #E2E8F0",
                                          cursor: "pointer", color: "#64748B", transition: "all 0.15s",
                                          padding: 0
                                        }}
                                        onClick={(e) => { e.stopPropagation(); navigate(`itinerary/${item.id}`); }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#E0F2FE"; e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.color = "#0284C7"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; }}
                                      >
                                        <i className="fa fa-edit" style={{ fontSize: "14px" }}></i>
                                      </button>
                                      <button
                                        style={{
                                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                                          width: "30px", height: "30px", borderRadius: "8px",
                                          background: "#FEE2E2", border: "1px solid #FECACA",
                                          cursor: "pointer", color: "#DC2626", transition: "all 0.15s",
                                          padding: 0
                                        }}
                                        onClick={() => onDelete(item.id, item.package_name)}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FCA5A5"; e.currentTarget.style.borderColor = "#F87171"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#FECACA"; }}
                                      >
                                        <i className="fa fa-trash" style={{ fontSize: "14px" }}></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )})
                              :
                              <NoData isLoading={fetchData.loading} colSpan={12} isTableRow={true} />
                          }
                        </tbody>
                      </table>
                      <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
                        <div className="dataTables_info">
                          Showing {activePag.current * sort + 1} to{" "}
                          {data.length > (activePag.current + 1) * sort
                            ? (activePag.current + 1) * sort
                            : data.length}{" "}
                          of {data.length} entries
                        </div>
                        <div
                          className="dataTables_paginate paging_simple_numbers"
                          id="example2_paginate"
                        >
                          <Link
                            className="paginate_button previous disabled"
                            to="/content"
                            onClick={() =>
                              activePag.current > 0 &&
                              onClick(activePag.current - 1)
                            }
                          >
                            <i
                              className="fa fa-angle-double-left"
                              aria-hidden="true"
                            ></i>
                          </Link>
                          <span>
                            {paggination.map((number, i) => (
                              <Link
                                key={i}
                                to="/content"
                                className={`paginate_button  ${activePag.current === i ? "current" : ""
                                  } `}
                                onClick={() => onClick(i)}
                              >
                                {number}
                              </Link>
                            ))}
                          </span>
                          <Link
                            className="paginate_button next"
                            to="/content"
                            onClick={() =>
                              activePag.current + 1 < paggination.length &&
                              onClick(activePag.current + 1)
                            }
                          >
                            <i
                              className="fa fa-angle-double-right"
                              aria-hidden="true"
                            ></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          </div>
        </div>

        <ConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          url={deleteUrl}
          name={deleteName}
          onConfirm={isBulkDelete ? handleBulkDelete : undefined}
        />
      </div>
    </>
  );
};

export default Quotation;