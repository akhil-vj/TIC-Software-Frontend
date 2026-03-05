import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import AddModal from "./AddModal";

const suppliers = [
  {
    company: "Company 1",
    name: "Talan Siphron",
    email: "ahmad@mail.com",
    mobile: "1234567890",
    location: "Kolkata, India",
    by: "TravlBiz",
    date: "June 1, 2023",
  },
  {
    company: "Company 2",
    name: "Thomas Khun",
    email: "soap@mail.com",
    mobile: "9876543210",
    location: "Dubai, UAE",
    by: "TravlBiz",
    date: "June 2, 2023",
  },
  {
    company: "Company 3",
    name: "Marilyn Workman",
    email: "mantha@mail.com",
    mobile: "9988776655",
    location: "Delhi, India",
    by: "TravlBiz",
    date: "June 3, 2023",
  },
  {
    company: "Company 4",
    name: "Thomas Khun",
    email: "hope@mail.com",
    mobile: "8877665544",
    location: "Doha, Qatar",
    by: "TravlBiz",
    date: "June 4, 2023",
  },
  {
    company: "Company 5",
    name: "Talan Siphron",
    email: "jordan@mail.com",
    mobile: "7766554433",
    location: "Mumbai, India",
    by: "TravlBiz",
    date: "June 5, 2023",
  },
  {
    company: "Company 6",
    name: "Marilyn Workman",
    email: "adja@mail.com",
    mobile: "6655443322",
    location: "Kolkata, India",
    by: "TravlBiz",
    date: "June 6, 2023",
  },
  {
    company: "Company 7",
    name: "Thomas Khun",
    email: "soap@mail.com",
    mobile: "5544332211",
    location: "Kochi, India",
    by: "TravlBiz",
    date: "June 7, 2023",
  },
  {
    company: "Company 8",
    name: "Talan Siphron",
    email: "kevin@mail.com",
    mobile: "9988442211",
    location: "Bangalore, India",
    by: "TravlBiz",
    date: "June 8, 2023",
  },
];

const Supplier = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activePag, setActivePag] = useState(0);
  const sort = 8;

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter(({ company, name, email, mobile, location, by, date }) =>
      [company, name, email, mobile, location, by, date].some((value) =>
        value?.toString().toLowerCase().includes(term),
      ),
    );
  }, [searchTerm]);

  useEffect(() => {
    setActivePag(0);
  }, [searchTerm]);

  const pageCount = Math.ceil(filteredSuppliers.length / sort);
  const paginatedData = filteredSuppliers.slice(
    activePag * sort,
    (activePag + 1) * sort,
  );
  const startIndex = filteredSuppliers.length ? activePag * sort + 1 : 0;
  const endIndex = filteredSuppliers.length
    ? Math.min((activePag + 1) * sort, filteredSuppliers.length)
    : 0;

  useEffect(() => {
    if (activePag > 0 && activePag >= pageCount) {
      setActivePag(pageCount > 0 ? pageCount - 1 : 0);
    }
  }, [activePag, pageCount]);

  const handlePageChange = (event, pageIndex) => {
    event.preventDefault();
    setActivePag(pageIndex);
  };

  const handlePrev = (event) => {
    event.preventDefault();
    if (activePag > 0) {
      setActivePag(activePag - 1);
    }
  };

  const handleNext = (event) => {
    event.preventDefault();
    if (activePag + 1 < pageCount) {
      setActivePag(activePag + 1);
    }
  };

  const paggination = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-titles">
                <div className="d-flex align-items-center">
                  <h2 className="heading">Supplier </h2>
                </div>
                <div className="d-flex flex-wrap my-2 my-sm-0">
                  <div className="input-group search-area">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search here..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  <div className="invoice-btn">
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn btn-primary"
                    >
                      New Supplier{" "}
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
              </div>
            </div>
          </div>

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
                      <th className="text-center">Sl No</th>
                      <th className="text-center">Company</th>
                      <th className="text-center">Name</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Mobile</th>
                      <th className="text-center">Location</th>
                      <th className="text-center">By</th>
                      <th className="text-center">Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length ? (
                      paginatedData.map((item, ind) => (
                        <tr key={`${item.email}-${ind}`}>
                          <td className="text-center">
                            {startIndex + ind}
                          </td>
                          <td className="text-center">{item.company}</td>
                          <td className="text-center">{item.name}</td>
                          <td className="text-center">{item.email}</td>
                          <td className="text-center">{item.mobile}</td>
                          <td className="text-center">{item.location}</td>
                          <td className="whitesp-no fs-14 font-w400 text-center">
                            {item.by}
                          </td>
                          <td className="whitesp-no fs-14 font-w400 text-center">
                            {item.date}
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
                                <Dropdown.Item onClick={() => setShowModal(true)}>
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item>Delete</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-center" colSpan={9}>
                          No suppliers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                  <div className="dataTables_info">
                    Showing {startIndex} to {endIndex} of{" "}
                    {filteredSuppliers.length} entries
                  </div>
                  <div
                    className="dataTables_paginate paging_simple_numbers mb-0"
                    id="example2_paginate"
                  >
                    <Link
                      className={`paginate_button previous ${
                        activePag === 0 ? "disabled" : ""
                      }`}
                      to="/supplier"
                      onClick={handlePrev}
                    >
                      <i className="fa-solid fa-angle-left"></i>
                    </Link>
                    <span>
                      {paggination.map((number, i) => (
                        <Link
                          key={number}
                          to="/supplier"
                          className={`paginate_button  ${
                            activePag === i ? "current" : ""
                          } `}
                          onClick={(event) => handlePageChange(event, i)}
                        >
                          {number}
                        </Link>
                      ))}
                    </span>

                    <Link
                      className={`paginate_button next ${
                        activePag + 1 >= pageCount ? "disabled" : ""
                      }`}
                      to="/supplier"
                      onClick={handleNext}
                    >
                      <i className="fa-solid fa-angle-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddModal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};
export default Supplier;
