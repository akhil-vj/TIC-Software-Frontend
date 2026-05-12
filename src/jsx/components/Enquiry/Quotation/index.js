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

const options = [
  { value: "2", label: "Published" },
  { value: "3", label: "Draft" },
  { value: "4", label: "Trash" },
  { value: "5", label: "Private" },
  { value: "6", label: "Pending" },
];

const Quotation = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const { id } = useParams()
  const itineraryUrl = URLS.ITINERARY_URL
  const itineraryByEnquiryUrl = `${URLS.ITINERARY_URL}?enquiry_id=${id}`
  const fetchData = useAsync(itineraryByEnquiryUrl)
  const tableData = fetchData?.data?.data

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
    setShowDeleteModal(true)
  }

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
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>SI No</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "none", letterSpacing: "0.1px" }}>Ref No</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "none", letterSpacing: "0.1px" }}>Package Name</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Pax</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>From Date</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", border: "none", letterSpacing: "0.1px" }}>Edited by</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "right", border: "none", letterSpacing: "0.1px" }}>Price</th>
                            <th style={{ padding: "12px 10px", fontSize: "13px", fontWeight: 600, color: "#ffffff", textAlign: "center", border: "none", letterSpacing: "0.1px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            !!tableData?.length ?
                              tableData?.map((item, ind) => (
                                <tr key={ind} style={{ borderBottom: "1px solid #f0f3f8", transition: "background 0.15s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} onClick={() => navigate(`itinerary/${item.id}`)}>
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
                                  <td style={{ padding: "10px", textAlign: "center", fontSize: "13px", color: "#4B5563" }}>
                                    <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>
                                      {item.adult_count}A {item.child_count > 0 ? `${item.child_count}C` : ""}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{item.start_date ? new Date(item.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                                  <td style={{ padding: "10px", fontSize: "13px", color: "#4B5563", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.edited_by}>{item.edited_by || '-'}</td>
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
                                  <td style={{ padding: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
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
                              ))
                              :
                              <NoData isLoading={fetchData.loading} colSpan={8} />
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
        />
      </div>
    </>
  );
};

export default Quotation;