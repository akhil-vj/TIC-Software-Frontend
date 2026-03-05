import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import EnquirySlider from "../Dashboard/EnquirySlider";
import QuestionIcon from "../Dashboard/Ticketing/QuestionIcon";
import { usePermissionType } from "../../utilis/usePermissionType";

const RightIcon = () => {
  return (
    <>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.50912 14.5C5.25012 14.5 4.99413 14.4005 4.80013 14.2065L1.79362 11.2C1.40213 10.809 1.40213 10.174 1.79362 9.78302C2.18512 9.39152 2.81913 9.39152 3.21063 9.78302L5.62812 12.2005L12.9306 7.18802C13.3866 6.87502 14.0106 6.99102 14.3236 7.44702C14.6371 7.90352 14.5211 8.52702 14.0646 8.84052L6.07613 14.324C5.90363 14.442 5.70612 14.5 5.50912 14.5Z"
          fill="#1EBA62"
        />
        <path
          d="M5.50912 8.98807C5.25012 8.98807 4.99413 8.88857 4.80013 8.69457L1.79362 5.68807C1.40213 5.29657 1.40213 4.66207 1.79362 4.27107C2.18512 3.87957 2.81913 3.87957 3.21063 4.27107L5.62812 6.68857L12.9306 1.67607C13.3866 1.36307 14.0106 1.47907 14.3236 1.93507C14.6371 2.39157 14.5211 3.01507 14.0646 3.32857L6.07613 8.81257C5.90363 8.93057 5.70612 8.98807 5.50912 8.98807Z"
          fill="#1EBA62"
        />
      </svg>
    </>
  );
};

const tableBlog = [
  {
    title: "Talan Siphron",
    mail: "ahmad@mail.com",
    phone: "+91 7723823348",
    icon: "#1EBA62",
    iconClass: "btn-success",
    icon2: <RightIcon />,
    icontext: "Confirmed",
  },
  {
    title: "Thomas Khun",
    mail: "soap@mail.com",
    phone: "+91 8823823348",
    icon: "#FF4646",
    iconClass: "btn-primary",
    icon2: <QuestionIcon colorchange="#01A3FF" />,
    icontext: "Pending",
  },
  {
    title: "Marilyn Workman",
    mail: "mantha@mail.com",
    phone: "+91 7723823348",
    icon: "#FF4646",
    iconClass: "btn-pink",
    icon2: <QuestionIcon colorchange="#EB62D0" />,
    icontext: "W. Approval",
  },
  {
    title: "Thomas Khun",
    mail: "hope@mail.com",
    phone: "+91 9923823348",
    icon: "#FF4646",
    iconClass: "btn-primary",
    icon2: <QuestionIcon colorchange="#01A3FF" />,
    icontext: "Pending",
  },
  {
    title: "Talan Siphron",
    mail: "jordan@mail.com",
    phone: "+91 7723823348",
    icon: "#1EBA62",
    iconClass: "btn-success",
    icon2: <RightIcon />,
    icontext: "Complete",
  },
  {
    title: "Marilyn Workman",
    mail: "adja@mail.com",
    phone: "+91 7723823348",
    icon: "#FF4646",
    iconClass: "btn-pink",
    icon2: <QuestionIcon colorchange="#EB62D0" />,
    icontext: "W. Approval",
  },
  {
    title: "Thomas Khun",
    mail: "soap@mail.com",
    phone: "+91 7723823348",
    icon: "#FF4646",
    iconClass: "btn-primary",
    icon2: <QuestionIcon colorchange="#01A3FF" />,
    icontext: "Pending",
  },
  {
    title: "Talan Siphron",
    mail: "kevin@mail.com",
    phone: "+91 7723823348",
    icon: "#FF4646",
    iconClass: "btn-pink",
    icon2: <QuestionIcon colorchange="#EB62D0" />,
    icontext: "W. Approval",
  },
  {
    title: "Marilyn Workman",
    mail: "vita@mail.com",
    phone: "+91 7723823348",
    icon: "#1EBA62",
    iconClass: "btn-success",
    icon2: <RightIcon />,
    icontext: "Complete",
  },
];

const Leads = () => {
  const navigate = useNavigate();
  const permissionType = usePermissionType("lead");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const pageSize = 8;

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tableBlog;
    return tableBlog.filter((item) =>
      [item.title, item.mail, item.icontext]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term)),
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = page * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page]);

  useEffect(() => {
    setPage(0);
    setSelectedRows(new Set());
  }, [search]);

  // Hide checkboxes when no rows are selected
  useEffect(() => {
    if (selectedRows.size === 0) {
      setShowCheckboxes(false);
    }
  }, [selectedRows]);

  const totalEntries = filteredLeads.length;
  const startEntry = totalEntries === 0 ? 0 : page * pageSize + 1;
  const endEntry =
    totalEntries === 0 ? 0 : Math.min((page + 1) * pageSize, totalEntries);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    const newSelected = new Set(selectedRows);
    if (e.target.checked) {
      paginatedLeads.forEach((_, ind) => {
        newSelected.add(page * pageSize + ind);
      });
    } else {
      paginatedLeads.forEach((_, ind) => {
        newSelected.delete(page * pageSize + ind);
      });
    }
    setSelectedRows(newSelected);
  };

  // Handle individual checkbox
  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  // Handle select from dropdown menu - shows checkboxes
  const handleSelectFromMenu = (index) => {
    if (!showCheckboxes) {
      setShowCheckboxes(true);
    }
    handleSelectRow(index);
  };

  // Check if all current page items are selected
  const isAllSelected = paginatedLeads.length > 0 &&
    paginatedLeads.every((_, ind) => selectedRows.has(page * pageSize + ind));

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-titles">
                <div className="d-flex align-items-center">
                  <h2 className="heading">Leads</h2>
                </div>
                <div className="d-flex flex-wrap my-2 my-sm-0">
                  <div className="input-group search-area">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search here..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="input-group-text">
                      <Link to={"#"}>
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.3"
                            d="M16.6751 19.4916C16.2194 19.036 16.2194 18.2973 16.6751 17.8417C17.1307 17.3861 17.8694 17.3861 18.325 17.8417L22.9916 22.5084C23.4473 22.964 23.4473 23.7027 22.9916 24.1583C22.536 24.6139 21.7973 24.6139 21.3417 24.1583L16.6751 19.4916Z"
                            fill="white"
                          />
                          <path
                            d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z"
                            fill="white"
                          />
                        </svg>
                      </Link>
                    </span>
                  </div>
                  {permissionType.write && (
                    <div className="invoice-btn">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/add-lead")}
                      >
                        New Leads{" "}
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 3C7.05 3 3 7.05 3 12C3 16.95 7.05 21 12 21C16.95 21 21 16.95 21 12C21 7.05 16.95 3 12 3ZM12 19.125C8.1 19.125 4.875 15.9 4.875 12C4.875 8.1 8.1 4.875 12 4.875C15.9 4.875 19.125 8.1 19.125 12C19.125 15.9 15.9 19.125 12 19.125Z"
                            fill="#FCFCFC"
                          />
                          <path
                            d="M16.3498 11.0251H12.9748V7.65009C12.9748 7.12509 12.5248 6.67509 11.9998 6.67509C11.4748 6.67509 11.0248 7.12509 11.0248 7.65009V11.0251H7.6498C7.1248 11.0251 6.6748 11.4751 6.6748 12.0001C6.6748 12.5251 7.1248 12.9751 7.6498 12.9751H11.0248V16.3501C11.0248 16.8751 11.4748 17.3251 11.9998 17.3251C12.5248 17.3251 12.9748 16.8751 12.9748 16.3501V12.9751H16.3498C16.8748 12.9751 17.3248 12.5251 17.3248 12.0001C17.3248 11.4751 16.8748 11.0251 16.3498 11.0251Z"
                            fill="#FCFCFC"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* swiper */}
          <EnquirySlider title="Leads" />
          {/* swiper end */}

          <div className="row">
            <div className="col-xl-12">
              <div
                className="table-responsive  full-data dataTables_wrapper"
                id="example2_wrapper"
              >
                <table
                  className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer"
                  id="example2"
                >
                  <thead>
                    <tr>
                      {showCheckboxes && (
                        <th className="sorting_asc ">
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={isAllSelected}
                            className="form-check-input"
                            id="checkAll"
                          />
                        </th>
                      )}
                      <th>ID</th>
                      <th>Client / Agent</th>
                      <th>Lead Source</th>
                      <th>Requirement</th>
                      <th>Package Details</th>
                      <th>Assigned To</th>
                      <th className="text-center">Date</th>
                      <th className="text-end">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((item, ind) => {
                      const globalIndex = page * pageSize + ind;
                      const isSelected = selectedRows.has(globalIndex);

                      return (
                        <tr key={ind}>
                          {showCheckboxes && (
                            <td className="sorting_1">
                              <div className="checkbox me-0 align-self-center">
                                <div className="custom-control custom-checkbox ">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`customCheckBox2${globalIndex}`}
                                    checked={isSelected}
                                    onChange={() => handleSelectRow(globalIndex)}
                                  />
                                  <label
                                    className="custom-control-label"
                                    htmlFor={`customCheckBox2${globalIndex}`}
                                  ></label>
                                </div>
                              </div>
                            </td>
                          )}
                          <td>{`#J0${globalIndex + 1}`}</td>
                          <td className="whitesp-no p-0">
                            <div className="py-sm-3 py-1 ps-3">
                              <div>
                                <h6 className="font-w500 fs-15 mb-0">
                                  {item.title}
                                </h6>
                                <span className="fs-14 font-w400">
                                  <Link to={"app-profile"}>{item.phone || item.mail}</Link>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>Adverisement</td>
                          <td>Full Package</td>
                          <td>Dubai, Qatar</td>
                          <td className="doller">Shanid CA</td>
                          <td className="whitesp-no fs-14 font-w400">
                            June 1, 2022, 08:22 AM
                          </td>
                          <td className="text-end">
                            <span
                              className={`btn light fs-14  btn-sm ${item.iconClass}`}
                            >
                              {item.icontext}
                            </span>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle
                                as="div"
                                className="i-false btn-link btn sharp tp-btn btn-primary pill"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.33319 9.99985C8.33319 10.9203 9.07938 11.6665 9.99986 11.6665C10.9203 11.6665 11.6665 10.9203 11.6665 9.99986C11.6665 9.07938 10.9203 8.33319 9.99986 8.33319C9.07938 8.33319 8.33319 9.07938 8.33319 9.99985Z"
                                    fill="#ffffff"
                                  />
                                  <path
                                    d="M8.33319 3.33329C8.33319 4.25376 9.07938 4.99995 9.99986 4.99995C10.9203 4.99995 11.6665 4.25376 11.6665 3.33329C11.6665 2.41282 10.9203 1.66663 9.99986 1.66663C9.07938 1.66663 8.33319 2.41282 8.33319 3.33329Z"
                                    fill="#ffffff"
                                  />
                                  <path
                                    d="M8.33319 16.6667C8.33319 17.5871 9.07938 18.3333 9.99986 18.3333C10.9203 18.3333 11.6665 17.5871 11.6665 16.6667C11.6665 15.7462 10.9203 15 9.99986 15C9.07938 15 8.33319 15.7462 8.33319 16.6667Z"
                                    fill="#ffffff"
                                  />
                                </svg>
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="dropdown-menu-end">
                                <Dropdown.Item
                                  onClick={() => handleSelectFromMenu(globalIndex)}
                                >
                                  {isSelected ? "Deselect" : "Select"}
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => navigate("/add-lead")}
                                >
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item>Delete</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                    {!paginatedLeads.length && (
                      <tr>
                        <td colSpan={showCheckboxes ? 10 : 9} className="text-center">
                          No leads found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                  <div className="dataTables_info">
                    Showing {startEntry} to {endEntry} of {totalEntries} entries
                  </div>
                  <div
                    className="dataTables_paginate paging_simple_numbers mb-0"
                    id="example2_paginate"
                  >
                    <button
                      className="paginate_button previous"
                      type="button"
                      disabled={page === 0}
                      onClick={() => page > 0 && setPage(page - 1)}
                    >
                      <i className="fa-solid fa-angle-left"></i>
                    </button>
                    <span>
                      {Array.from({ length: pageCount }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`paginate_button  ${page === i ? "current" : ""
                            } `}
                          onClick={() => setPage(i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </span>

                    <button
                      className="paginate_button next"
                      type="button"
                      disabled={page + 1 >= pageCount}
                      onClick={() =>
                        page + 1 < pageCount && setPage(page + 1)
                      }
                    >
                      <i className="fa-solid fa-angle-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Leads;