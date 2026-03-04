import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Dropdown } from "react-bootstrap";

import EnquirySlider from "../../Dashboard/EnquirySlider";
import QuestionIcon from "../../Dashboard/Ticketing/QuestionIcon";

import CustomModal from "../../../layouts/CustomModal";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import DeleteModal from "../../common/DeleteModal";
import { CustomTable } from "../../common/CustomTable";
// import CustomModal from "../../layouts/CustomModal";

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



const Activity = () => {
  const navigate = useNavigate();

  const onView = (id) => {
    navigate(`${id}`)
  };
  const onEdit = (id) => {
    navigate(`add/${id}`)
  };
  const tableArray = [
    { label: "Sl no", value: "index", className: "text-center" },
    { label: "Name", value: "activity_name" },
    { label: "Number", value: "contact_number" },
    { label: "Email", value: "contact_email" },
    { label: "Destination", value: ["destination", "name"], className: 'text-center' },
    { label: "Status", value: "is_active" },
    {
      label: "Actions",
      value: [
        { menu: "Status", showLabel: 'activity_name', showValue: "is_active" },
        { menu: "View", onPress: onView },
        { menu: "Edit", onPress: onEdit },
        { menu: "Delete", showLabel: 'activity_name' },
      ],
    },
  ];
  const url = URLS.ACTIVITY_URL
  const patchUrl = URLS.ACTIVITY_UPDATE_URL
  const activityData = useAsync(url)
  const tableData = activityData?.data?.data
  const [data, setData] = useState(
    document.querySelectorAll("#example2_wrapper tbody tr"),
  );
  const sort = 8;
  const activePag = useRef(0);
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
    setData(document.querySelectorAll("#example2_wrapper tbody tr"));
    //chackboxFun();
  }, []);

  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  // paggination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  // Active paggination & chage data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    //settest(i);
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

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-titles">
                <div className="d-flex align-items-center">
                  <h2 className="heading">Activity</h2>
                </div>
                <div className="d-flex flex-wrap my-2 my-sm-0">
                  <div className="input-group search-area">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search here..."
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
                      onClick={() => navigate(`add`)}
                      className="btn btn-primary"
                    >
                      New Activity{" "}
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
          {/* swiper */}
          <EnquirySlider title="Activity" />
          {/* swiper end */}

          {/* <div className="row">
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
                      <th className="sorting_asc ">
                        <input
                          type="checkbox"
                          onClick={() => chackboxFun("all")}
                          className="form-check-input"
                          id="checkAll"
                          required=""
                        />
                      </th>
                      <th>No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Destination</th>
                      <th>Sub Destination</th>
                      <th className="text-center">Start Date</th> 
                      <th className="text-center">End Date</th>
                      <th className="text-end">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((item, ind) => (
                      <tr key={ind}>
                        <td className="sorting_1">
                          <div className="checkbox me-0 align-self-center">
                            <div className="custom-control custom-checkbox ">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={"customCheckBox2" + ind}
                                required=""
                                onClick={() => chackboxFun()}
                              />
                              <label
                                className="custom-control-label"
                                htmlFor={"customCheckBox2" + ind}
                              ></label>
                            </div>
                          </div>
                        </td>
                        <td>{ind+1}</td>
                        <td className="whitesp-no p-0">
                          <div className="py-sm-3 py-1 ps-3">
                            <div>
                              <h6 className="font-w500 fs-15 mb-0">
                                {item?.activity_name}
                              </h6>
                              <span className="fs-14 font-w400">
                                <Link to={"app-profile"}>{item?.contact_number}</Link>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{item?.contact_email}</td>
                        <td>{item?.destination?.name}</td>
                        <td> {item?.sub_destination?.name}</td>
                        <td className="whitesp-no fs-14 font-w400">
                          June 1, 2022
                        </td>
                        <td className="whitesp-no fs-14 font-w400">
                          June 15, 2022
                        </td>
                        <td className="text-end">
                          <span
                            className={`btn light fs-14  btn-sm ${item?.is_active === 1 ?'btn-success':'btn-pink'}`}
                          >
                            {item.icon2}
                                                        {" "}
                            {item?.is_active === 1 ?'Active':'Inactive'}
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
                                onClick={() => handleStatus(item.id)}
                              >
                                {item?.is_active === 1 ?'Inactive':'Active'}
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => navigate(`${item.id}`)}
                              >
                                View
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => navigate(`add/${item.id}`)}
                              >
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item onClick={()=>onDelete(item.id,item.activity_name)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                  <div className="dataTables_info">
                    Showing {activePag.current * sort + 1} to{" "}
                    {data.length > (activePag.current + 1) * sort
                      ? (activePag.current + 1) * sort
                      : data.length}{" "}
                    of {data.length} entries
                  </div>
                  <div
                    className="dataTables_paginate paging_simple_numbers mb-0"
                    id="example2_paginate"
                  >
                    <Link
                      className="paginate_button previous disabled"
                      to="/invoice"
                      onClick={() =>
                        activePag.current > 0 && onClick(activePag.current - 1)
                      }
                    >
                      <i className="fa-solid fa-angle-left"></i>
                    </Link>
                    <span>
                      {paggination.map((number, i) => (
                        <Link
                          key={i}
                          to="/invoice"
                          className={`paginate_button  ${
                            activePag.current === i ? "current" : ""
                          } `}
                          onClick={() => onClick(i)}
                        >
                          {number}
                        </Link>
                      ))}
                    </span>

                    <Link
                      className="paginate_button next"
                      to="/invoice"
                      onClick={() =>
                        activePag.current + 1 < paggination.length &&
                        onClick(activePag.current + 1)
                      }
                    >
                      <i className="fa-solid fa-angle-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          <CustomTable
            tableArray={tableArray}
            data={tableData}
            length={tableData?.length}
            loading={activityData?.loading}
            url={url}
            url2={patchUrl}
          />
        </div>
      </div>


    </>
  );
};
export default Activity;
