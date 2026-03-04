import React, { useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";
import CustomModal from "../../layouts/CustomModal";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import NoData from "../common/NoData";

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

const Ticketing = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
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

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = term
        ? [ticket.subject, ticket.reference, ticket.assignee, ticket.notes]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(term))
        : true;
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

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
      <div className="row">
        <div className="col-xl-12">
          <div className="page-titles">
            <div className="d-flex align-items-center">
              <h2 className="heading">Ticketing</h2>
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center my-2 my-sm-0">
              <div className="input-group search-area" style={{ flex: "1 1 200px", minWidth: "200px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search subject, ref, assignee..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
                <span className="input-group-text">
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
                      fill="#007bff"
                    />
                    <path
                      d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z"
                      fill="#007bff"
                    />
                  </svg>
                </span>
              </div>
              <div style={{ minWidth: "130px", marginTop: "4px" }}>
                <select
                  className="form-control mb-0"
                  name="status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div style={{ minWidth: "130px", marginTop: "4px" }}>
                <select
                  className="form-control mb-0"
                  name="priority"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="all">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setEditTicket(null);
                  setShowModal(true);
                }}
                className="btn btn-primary"
              >
                New Ticket
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
          </div>

          <div className="row">
            <div className="col-xl-12">
              <div
                className="table-responsive  full-data dataTables_wrapper"
                id="tickets_table_wrapper"
              >
                <table className="table-responsive-lg table display mb-4 dataTablesCard text-black dataTable no-footer">
                  <thead>
                    <tr>
                      <th style={{ width: "60px", textAlign: "center" }}>Sl No</th>
                      <th style={{ minWidth: "150px", textAlign: "center" }}>Subject</th>
                      <th style={{ width: "100px", textAlign: "center" }}>Reference</th>
                      <th style={{ width: "110px", textAlign: "left" }}>Status</th>
                      <th style={{ width: "90px", textAlign: "left" }}>Priority</th>
                      <th style={{ width: "100px", textAlign: "leftr" }}>Assignee</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Due Date</th>
                      <th style={{ minWidth: "180px", textAlign: "center" }}>Notes</th>
                      <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.length ? (
                      paginatedTickets.map((item, ind) => (
                        <tr key={item.id || ind}>
                          <td style={{ textAlign: "center" }}>
                            {page * pageSize + ind + 1}
                          </td>
                          <td style={{ textAlign: "left", paddingLeft: "15px" }}>{item.subject}</td>
                          <td style={{ textAlign: "left", paddingLeft: "15px" }}>{item.reference || "-"}</td>
                          <td style={{ textAlign: "left", paddingLeft: "15px" }}>{item.status}</td>
                          <td style={{ textAlign: "left", paddingLeft: "15px" }}>{item.priority}</td>
                          <td style={{ textAlign: "left", paddingLeft: "15px" }}>{item.assignee || "-"}</td>
                          <td style={{ textAlign: "left", paddingLeft: "15px" }}>{item.dueDate || "-"}</td>
                          <td
                            style={{ textAlign: "left", paddingLeft: "15px", maxWidth: "180px" }}
                            className="text-truncate"
                          >
                            {item.notes || "-"}
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
                                <Dropdown.Item onClick={() => handleEdit(item)}>
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleDelete(item.id)}>
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <NoData colSpan={9} />
                    )}
                  </tbody>
                </table>
                <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                  <div className="dataTables_info">
                    Showing {page * pageSize + 1} to{" "}
                    {Math.min((page + 1) * pageSize, filteredTickets.length)} of{" "}
                    {filteredTickets.length} entries
                  </div>
                  <div className="dataTables_paginate paging_simple_numbers mb-0">
                    <button
                      className="paginate_button previous"
                      onClick={() => onPageChange(page - 1)}
                      disabled={page === 0}
                    >
                      <i className="fa-solid fa-angle-left"></i>
                    </button>
                    <span>
                      {Array.from({ length: pageCount }).map((_, i) => (
                        <button
                          key={i}
                          className={`paginate_button ${
                            page === i ? "current" : ""
                          }`}
                          onClick={() => onPageChange(i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </span>

                    <button
                      className="paginate_button next"
                      onClick={() => onPageChange(page + 1)}
                      disabled={page + 1 >= pageCount}
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
      <TicketModal
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

export default Ticketing;