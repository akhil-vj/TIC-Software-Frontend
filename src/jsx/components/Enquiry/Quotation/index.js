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
  //{ value: '1', label: 'Select Status' },
  { value: "2", label: "Published" },
  { value: "3", label: "Draft" },
  { value: "4", label: "Trash" },
  { value: "5", label: "Private" },
  { value: "6", label: "Pending" },
];

const tableData1 = [
  { number: "1", title: "Privacy Policy" },
  { number: "2", title: "Contact Us" },
  { number: "3", title: "Price" },
  { number: "4", title: "Blog" },
  { number: "5", title: "Faq" },
  { number: "6", title: "About us" },
  { number: "7", title: "Portfolio" },
  { number: "8", title: "Schedule" },
  { number: "9", title: "Under Maintenance" },
  { number: "10", title: "Comming Soon" },
  { number: "11", title: "Faq" },
  { number: "12", title: "About us" },
  { number: "13", title: "Portfolio" },
];

const Quotation = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(true);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const {id}= useParams()
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
    //chackboxFun();
  }, [test]);

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
    settest(i);
  };

  const [deleteItem, setDeleteItem] = useState(tableData);
  const handleDelete = (ind) => {
    setDeleteItem((oldValues) => {
      return oldValues.filter((_, i) => i !== ind);
    });
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

  const handleCombine = () => {
    notify({ message: "Downloaded Successfully" });
  };
  const onDelete = (id,name) => {
    const url = `${itineraryUrl}/${id}`
    setDeleteUrl(url)
    setDeleteName(name)
    setShowDeleteModal(true)
  }

  return (
    <>
      <div className="row">
        {/* <ToastContainer /> */}
        <div className="col-xl-12">
          <div className="filter cm-content-box box-primary">
            <div className="content-title">
              <div className="cpa">
                <i className="fas fa-filter me-2"></i>Filter
              </div>
              <div className="tools">
                <Link
                  to={"#"}
                  className={`SlideToolHeader ${open ? "collapse" : "expand"}`}
                  onClick={() => setOpen(!open)}
                >
                  <i className="fas fa-angle-up"></i>
                </Link>
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
          <div className="mb-3 d-flex justify-content-between">
            <div className="">
              <button
                className="btn btn-primary"
                onClick={() => handleCombine()}
              >
                Combine itinerary
              </button>
            </div>
            <div className="d-flex">
              <div className="">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowInsertModal(true)}
                >
                  Insert itinerary
                </button>
              </div>
              <div className="ms-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("itinerary")}
                >
                  Create itinerary
                </button>
              </div>
            </div>
          </div>
          <div className="filter cm-content-box box-primary mt-5">
            <div className={`content-title`}>
              <div className="cpa">
                <i className="fas fa-file-word me-2"></i>Enquiry List
              </div>
              <div className="tools">
                <Link
                  to={"#"}
                  className={`SlideToolHeader ${open2 ? "collapse" : "expand"}`}
                  onClick={() => setOpen2(!open2)}
                >
                  <i className="fas fa-angle-up"></i>
                </Link>
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
                      <table className="table table-bordered table-responsive-lg table-striped table-condensed flip-content">
                        <thead>
                          <tr>
                            <th className="sorting_asc">
                              <input
                                type="checkbox"
                                onClick={() => chackboxFun("all")}
                                className="form-check-input"
                                id="checkAll"
                                required=""
                              />
                            </th>
                            <th>ID</th>
                            <th>Package Name</th>
                            <th>Pax</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            {/* <th>Created By</th> */}
                            <th>Valid Until</th>
                            {/* <th>Title</th> */}
                            <th>Price</th>
                            {/* <th>Status</th> */}
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                          !!tableData?.length ?
                          tableData?.map((item, ind) => (
                            <tr key={ind}>
                              <td className="sorting_1 ps-3">
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
                              <td>{item.package_name}</td>
                              <td>{`${item.adult_count} adult , ${item.child_count} child`}</td>
                              <td>{item.start_date}</td>
                              <td>{item.end_date}</td>
                              {/* <td>sahid</td> */}
                              <td>{item.valid_until}</td>
                              {/* <td>Option 1</td> */}
                              <td>{item.net_amount}</td>
                              {/* <td>
                                <Badge bg="" className="light badge-warning">
                                  Pending
                                </Badge>
                              </td> */}
                              <td className="text-end">
                                <Link
                                  to={`itinerary/${item.id}`}
                                  className="btn btn-warning btn-sm content-icon me-1"
                                >
                                  <i className="fa fa-edit"></i>
                                </Link>
                                <button
                                  // to={"#"}
                                  className="btn btn-danger btn-sm content-icon ms-1"
                                  onClick={() => onDelete(item.id,item.package_name)}
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                          :
                          <NoData isLoading={fetchData.loading} colSpan={10}/>
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

        {/* <SetupModal showModal={showSetupModal} setShowModal={setShowSetupModal}/> */}
        <InsertModal
          showModal={showInsertModal}
          setShowModal={setShowInsertModal}
        />
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
