import React, { useState } from "react";
import { Link } from "react-router-dom";

//component
import ActionDropdown from "../../Dashboard/ActionDropdown";
import AddAgent from "./addAgent";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import NoData from "../../common/NoData";
import Avatar from "../../common/Avatar";
import DeleteModal from "../../common/DeleteModal";

const Agent = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const url = URLS.AGENT_URL;
  const agentData = useAsync(url);
  const tableData = agentData?.data?.data;

  const onEdit = (id) => {
    setEditId(id);
    setShowAddModal(true);
  };

  const onDelete = (id, name) => {
    setDeleteUrl(`${url}/${id}`);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  const onStatus = (id, name) => {
    console.log('onStatus', name);
  };

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            {/* Page Header */}
            <div className="col-xl-12 mb-3">
              <div className="page-titles">
                <div className="d-flex align-items-center">
                  <h2 className="heading mb-0">Agent</h2>
                </div>
                <div className="right-area">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary d-flex align-items-center gap-2"
                    style={{ padding: '10px 20px' }}
                  >
                    <span>New Agent</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3C7.05 3 3 7.05 3 12C3 16.95 7.05 21 12 21C16.95 21 21 16.95 21 12C21 7.05 16.95 3 12 3ZM12 19.125C8.1 19.125 4.875 15.9 4.875 12C4.875 8.1 8.1 4.875 12 4.875C15.9 4.875 19.125 8.1 19.125 12C19.125 15.9 15.9 19.125 12 19.125Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16.3498 11.0251H12.9748V7.65009C12.9748 7.12509 12.5248 6.67509 11.9998 6.67509C11.4748 6.67509 11.0248 7.12509 11.0248 7.65009V11.0251H7.6498C7.1248 11.0251 6.6748 11.4751 6.6748 12.0001C6.6748 12.5251 7.1248 12.9751 7.6498 12.9751H11.0248V16.3501C11.0248 16.8751 11.4748 17.3251 11.9998 17.3251C12.5248 17.3251 12.9748 16.8751 12.9748 16.3501V12.9751H16.3498C16.8748 12.9751 17.3248 12.5251 17.3248 12.0001C17.3248 11.4751 16.8748 11.0251 16.3498 11.0251Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Cards */}
            <div className="col-xl-12">
              {tableData?.length > 0 ? (
                <div className="row g-3">
                  {tableData?.map((item, ind) => (
                    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12" key={ind}>
                      <div className="card contact_list h-100 border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start justify-content-between">
                            {/* Left side - Avatar and Details */}
                            <div className="d-flex gap-3 flex-grow-1" style={{ minWidth: 0 }}>
                              {/* Avatar - Perfect Circle */}
                              <div className="flex-shrink-0">
                                <div style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}>
                                  <Avatar name={item.name} index={ind} />
                                </div>
                              </div>

                              {/* User Details */}
                              <div className="flex-grow-1" style={{ minWidth: 0, paddingTop: '6px' }}>
                                <h4 className="user-name mb-2 text-truncate" style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                                  {item.name}
                                </h4>
                                <div className="d-flex flex-column" style={{ gap: '8px' }}>
                                  <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                                    <i className="fa fa-phone" style={{ fontSize: '13px', width: '14px', color: '#6c757d' }}></i>
                                    <span className="text-truncate" style={{ fontSize: '13px', color: '#6c757d' }}>
                                      {item.phone}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                                    <i className="fa fa-envelope" style={{ fontSize: '13px', width: '14px', color: '#6c757d' }}></i>
                                    <span className="text-truncate" style={{ fontSize: '13px', color: '#6c757d' }} title={item.email}>
                                      {item.email}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                                    <i className="fa fa-map-marker-alt" style={{ fontSize: '13px', width: '14px', color: '#6c757d' }}></i>
                                    <span className="text-truncate" style={{ fontSize: '13px', color: '#6c757d' }}>
                                      {item.country_name}
                                    </span>
                                  </div>
                                  {item.address && (
                                    <div className="d-flex align-items-start" style={{ gap: '10px' }}>
                                      <i className="fa fa-location-dot" style={{ fontSize: '13px', width: '14px', marginTop: '2px', color: '#6c757d' }}></i>
                                      <span className="text-truncate" style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.4' }} title={item.address}>
                                        {item.address}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right side - Dropdown Menu */}
                            <div className="flex-shrink-0 ms-2">
                              <ActionDropdown
                                onEdit={() => onEdit(item.id)}
                                onDelete={() => onDelete(item.id, item.name)}
                                isActive={true}
                                onStatus={() => onStatus(item.id, item.name)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <NoData isCard={true} isLoading={agentData.loading} />
              )}
            </div>
          </div>

          {/* Pagination */}
          {!!tableData?.length && (
            <div className="table-pagenation mt-4 mb-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <p className="mb-0" style={{ fontSize: '14px', color: '#6c757d' }}>
                  Showing <span style={{ color: '#0d6efd', fontWeight: '600' }}>12-24</span> from{" "}
                  <span style={{ color: '#0d6efd', fontWeight: '600' }}>100</span> data
                </p>
                <nav>
                  <ul className="pagination pagination-gutter pagination-primary no-bg mb-0">
                    <li className="page-item page-indicator">
                      <Link to={"#"} className="page-link">
                        <i className="fa-solid fa-angle-left"></i>
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link to={"#"} className="page-link">1</Link>
                    </li>
                    <li className="page-item active">
                      <Link to={"#"} className="page-link">2</Link>
                    </li>
                    <li className="page-item">
                      <Link to={"#"} className="page-link">3</Link>
                    </li>
                    <li className="page-item page-indicator me-0">
                      <Link to={"#"} className="page-link">
                        <i className="fa-solid fa-angle-right"></i>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddAgent
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        editId={editId}
        setEditId={setEditId}
      />
      <DeleteModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        name={deleteName}
        url={deleteUrl}
      />
    </>
  );
};

export default Agent;