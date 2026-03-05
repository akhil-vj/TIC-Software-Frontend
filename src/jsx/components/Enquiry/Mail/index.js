import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";

//import PageTitle from "../../../../layouts/PageTitle";
import { Dropdown } from "react-bootstrap";



const MailToSupplier = () => {
  const supplierList = [
    { id: 1, label: "Checkbox 1", checked: false },
    { id: 2, label: "Checkbox 2", checked: false },
    { id: 3, label: "Checkbox 3", checked: false },
    // Add more checkboxes as needed
  ];

  const [checkboxes, setCheckboxes] = useState(supplierList);
  const handleCheckboxChange = (id) => {
    const updatedCheckboxes = checkboxes.map((checkbox) =>
      checkbox.id === id
        ? { ...checkbox, checked: !checkbox.checked }
        : checkbox,
    );
    setCheckboxes(updatedCheckboxes);
  };

  const handleCheckAll = () => {
    const allChecked = checkboxes.every((checkbox) => checkbox.checked);
    const updatedCheckboxes = checkboxes.map((checkbox) => ({
      ...checkbox,
      checked: !allChecked,
    }));
    setCheckboxes(updatedCheckboxes);
  };
  return (
    <Fragment>
      <div className="row">
        <div className="col-lg-12">
          <div className="card rounded-0 mb-0 h-auto">
            <div className="card-body p-0 ">
              <div className="row gx-0">
                <div className="col-lg-9 col-xl-10 col-xxl-9">
                  <div className="email-right-box ms-0">
                    {/* <div className="toolbar mb-4 px-3 mt-3" role="toolbar">
							  <div className="btn-group mb-1">
								<button type="button" className="btn btn-primary light px-3">
								  <i className="fa fa-archive"></i>
								</button>
								<button type="button" className="btn btn-primary light px-3">
								  	<i className="fa fa-exclamation-circle"></i>
								</button>
								<button type="button" className="btn btn-primary light px-3">
								  <i className="fa fa-trash"></i>
								</button>
							  </div>
							  <Dropdown className="btn-group mb-1">
								<Dropdown.Toggle
								  type="button"
								  className="btn btn-primary light dropdown-toggle px-3 ms-1"
								  data-toggle="dropdown"
								>
								  <i className="fa fa-folder"></i>
								  <b className="caret m-l-5"></b>
								</Dropdown.Toggle>
								<Dropdown.Menu className="dropdown-menu">
								  <Dropdown.Item
									as="a"
									className="dropdown-item"
									to="/email-compose"
								  >
									Social
								  </Dropdown.Item>
								  <Dropdown.Item
									as="a"
									className="dropdown-item"
									to="/email-compose"
								  >
									Promotions
								  </Dropdown.Item>
								  <Dropdown.Item
									as="a"
									className="dropdown-item"
									to="/email-compose"
								  >
									Updates
								  </Dropdown.Item>
								  <Dropdown.Item
									as="a"
									className="dropdown-item"
									to="/email-compose"
								  >
									Forums
								  </Dropdown.Item>
								</Dropdown.Menu>
							  </Dropdown>
							  <Dropdown className="btn-group mb-1">
								<Dropdown.Toggle
								  className="btn btn-primary light dropdown-toggle px-3 ms-1"
								  data-toggle="dropdown"
								>
								  <i className="fa fa-tag"></i>
								</Dropdown.Toggle>
								<Dropdown.Menu>
								  <Dropdown.Item as="a">Updates</Dropdown.Item>
								  <Dropdown.Item as="a">Social</Dropdown.Item>
								  <Dropdown.Item as="a">Promotions</Dropdown.Item>
								  <Dropdown.Item as="a">Forums</Dropdown.Item>
								</Dropdown.Menu>
							  </Dropdown>
							  <Dropdown className="btn-group mb-1">
								<Dropdown.Toggle
								  type="button"
								  className="btn btn-primary light dropdown-toggle px-3  ms-1"
								  data-toggle="dropdown"
								>
								  More <span className="caret m-l-5"></span>
								</Dropdown.Toggle>
								<Dropdown.Menu className="dropdown-menu">
								  <Dropdown.Item
									className="dropdown-item"
									to="/email-compose"
								  >
									Mark as Unread
								  </Dropdown.Item>
								  <Dropdown.Item
									className="dropdown-item"
									to="/email-compose"
								  >
									Add to Tasks
								  </Dropdown.Item>
								  <Dropdown.Item
									className="dropdown-item"
									to="/email-compose"
								  >
									Add Star
								  </Dropdown.Item>
								  <Dropdown.Item
									className="dropdown-item"
									to="/email-compose"
								  >
									Mute
								  </Dropdown.Item>
								</Dropdown.Menu>
							  </Dropdown>
							</div> */}
                    <div
                      className="compose-wrapper mt-1 pt-5"
                      id="compose-content"
                    >
                      <div className="compose-content">
                        <form action="#">
                          <div className="form-group mb-3">
                            <input
                              type="text"
                              className="form-control bg-transparent"
                              placeholder=" To:"
                            />
                          </div>
                          <div className="form-group mb-3">
                            <input
                              type="text"
                              className="form-control bg-transparent"
                              placeholder=" Subject:"
                            />
                          </div>
                          <div className="form-group mb-3">
                            {/* <textarea id="email-compose-editor" className="textarea_editor form-control bg-transparent" rows="5"
											placeholder="Enter text ..."
										></textarea> */}
                            <div
                              id="email-compose-editor"
                              className="textarea_editor"
                            >
                              {/* <h2>Using CKEditor 5 build in React</h2> */}
                              {/* <CkEditor /> */}
                              <textarea className="form-control" rows="10" placeholder="Type your message..."></textarea>
                              {/* <textarea className="form-control" rows="10" placeholder="Type your message..."></textarea> */}
                            </div>
                          </div>
                        </form>

                      </div>
                      <div className="text-left mt-4 mb-5">
                        <button
                          className="btn btn-primary btn-sl-sm me-2"
                          type="button"
                        >
                          <span className="me-2">
                            <i className="fa fa-paper-plane"></i>
                          </span>
                          Send
                        </button>
                        <button
                          className="btn btn-danger light btn-sl-sm"
                          type="button"
                        >
                          <span className="me-2">
                            <i className="fa fa-times" aria-hidden="true"></i>
                          </span>
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-xl-2 col-xxl-3">
                  <div className="mt-2 px-2">
                    <div className="input-group search-area">
                      <input
                        type="text"
                        className={`form-control ${false ? "active" : ""
                          } border-0`}
                        placeholder="Search here..."
                      />
                      <span className="input-group-text">
                        <Link to={"#"}>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17.5605 15.4395L13.7527 11.6317C14.5395 10.446 15 9.02625 15 7.5C15 3.3645 11.6355 0 7.5 0C3.3645 0 0 3.3645 0 7.5C0 11.6355 3.3645 15 7.5 15C9.02625 15 10.446 14.5395 11.6317 13.7527L15.4395 17.5605C16.0245 18.1462 16.9755 18.1462 17.5605 17.5605C18.1462 16.9747 18.1462 16.0252 17.5605 15.4395V15.4395ZM2.25 7.5C2.25 4.605 4.605 2.25 7.5 2.25C10.395 2.25 12.75 4.605 12.75 7.5C12.75 10.395 10.395 12.75 7.5 12.75C4.605 12.75 2.25 10.395 2.25 7.5V7.5Z"
                              fill="#01A3FF"
                            />
                          </svg>
                        </Link>
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center pt-3">
                    <label
                      className="fw-bold mb-0 me-2"
                      style={{ padding: "0 1.25rem" }}
                    >
                      Select All
                    </label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={handleCheckAll}
                    />
                  </div>
                  <PerfectScrollbar className="email-left-box dlab-scroll h-auto">
                    {checkboxes?.map((data, key) => (
                      <div className="d-flex" key={key}>
                        <div>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={data.checked}
                            onChange={() => handleCheckboxChange(data.id)}
                          />
                        </div>
                        <div className="ms-2">
                          <h6>Burj khalifa</h6>
                          <p className="text-neutral">{`Supplier ${key + 1
                            } - supplier${key + 1}@gmail.com`}</p>
                        </div>
                      </div>
                    ))}
                  </PerfectScrollbar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default MailToSupplier;
