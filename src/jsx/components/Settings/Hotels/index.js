import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import EnquirySlider from "../../Dashboard/EnquirySlider";
import QuestionIcon from "../../Dashboard/Ticketing/QuestionIcon";
import HotelSlider from "../../Dashboard/HotelSlider";
import course1 from "../../../../images/course/hotel-1.jpg";
import { FormAction } from "../../../../store/slices/formSlice";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import { axiosDelete } from "../../../../services/AxiosInstance";
import { getApiBaseUrl } from "../../../../services/apiConfig";
import { notifyDelete, notifyError } from "../../../utilis/notifyMessage";
import NoData from "../../common/NoData";

const baseUrl = getApiBaseUrl();

const Hotels = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hotelData = useAsync(URLS.HOTEL_URL);
  const [viewType, setViewType] = useState("card");
  console.log('hotel', hotelData);

  const handleEdit = (id) => {
    navigate(`add/${id}`);
  };

  const handleDelete = async (id, name) => {
    const deleteUrl = `${URLS.HOTEL_URL}/${id}`;
    try {
      const response = await axiosDelete(deleteUrl);
      if (response.success) {
        dispatch(FormAction.setRefresh());
        notifyDelete(name);
      }
    } catch (error) {
      notifyError("Something went wrong !");
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
                  <h2 className="heading">Hotels</h2>
                </div>
                <div className="d-flex flex-wrap my-2 my-sm-0 align-items-center gap-2">
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
                  <div className="view-toggle-btns">
                    <button
                      className={`view-toggle-btn ${viewType === "card" ? "active" : ""}`}
                      onClick={() => setViewType("card")}
                      title="Card View"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    </button>
                    <button
                      className={`view-toggle-btn ${viewType === "list" ? "active" : ""}`}
                      onClick={() => setViewType("list")}
                      title="List View"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="invoice-btn">
                    <button
                      onClick={() => navigate(`add`)}
                      className="btn btn-primary"
                    >
                      New Hotels{" "}
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

          {/* Modern Hotel Cards Grid */}
          {viewType === "card" ? (
            <div className="row g-4">
              {hotelData?.data?.data?.length > 0
                ? hotelData?.data?.data?.map((item, index) => {
                  const pickImagePath = (data) => {
                    if (!data) return "";
                    const first = Array.isArray(data) ? data[0] : data;
                    return (
                      first?.file_url ||
                      first?.file ||
                      first?.url ||
                      first?.original_url ||
                      first?.path ||
                      ""
                    );
                  };
                  const buildImgUrl = (raw) => {
                    if (!raw) return "";
                    const newDomain = "https://tic-backend.plantriponline.com";
                    if (typeof raw === "string" && raw.startsWith("http")) {
                      return raw.replace(/https:\/\/tic\.cyberonics\.net/, newDomain);
                    }
                    const storageUrl = "https://tic-backend.plantriponline.com/storage";
                    const sep = raw?.startsWith("/") ? "" : "/";
                    return `${storageUrl}${sep}${raw}`;
                  };
                  const rawImg =
                    pickImagePath(item?.document_2) ||
                    pickImagePath(item?.media);
                  const imageSrc = buildImgUrl(rawImg) || course1;

                  return (
                    <div className="col-xl-4 col-lg-6 col-md-6" key={index}>
                      <div className="modern-hotel-card">
                        {/* Image Container */}
                        <div className="hotel-image-wrapper">
                          <img src={imageSrc} alt={item.name} className="hotel-image" />
                          <div className="image-overlay">
                            <button
                              className="view-btn"
                              onClick={() => navigate(item.id)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              View Details
                            </button>
                          </div>
                          <div className="rating-badge">
                            <svg width="14" height="14" viewBox="0 0 16 15" fill="none">
                              <path d="M8 0.5L9.79611 6.02786H15.6085L10.9062 9.44427L12.7023 14.9721L8 11.5557L3.29772 14.9721L5.09383 9.44427L0.391548 6.02786H6.20389L8 0.5Z" fill="#FFC107" />
                            </svg>
                            <span>5.0</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="hotel-content">
                          <div className="hotel-header">
                            <h4 className="hotel-name">{item.name}</h4>
                            <p className="hotel-location">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              {item.destination_name && item.sub_destination_name
                                ? `${item.destination_name}, ${item.sub_destination_name}`
                                : item.destination_name || "Location"}
                            </p>
                          </div>

                          <div className="hotel-stats">
                            <div className="stat-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>110+ Bookings</span>
                            </div>
                          </div>

                          <div className="hotel-actions">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(item.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(item.id, item.name)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                : <NoData isLoading={hotelData?.loading} isCard />}
            </div>
          ) : (
            // List View
            <div className="row">
              <div className="col-xl-12">
                <div className="table-responsive">
                  <table className="table table-hover hotel-list-table">
                    <thead className="table-header-bg">
                      <tr>
                        <th>Hotel Name</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotelData?.data?.data?.length > 0 ? (
                        hotelData?.data?.data?.map((item, index) => {
                          const pickImagePath = (data) => {
                            if (!data) return "";
                            const first = Array.isArray(data) ? data[0] : data;
                            return (
                              first?.file_url ||
                              first?.file ||
                              first?.url ||
                              first?.original_url ||
                              first?.path ||
                              ""
                            );
                          };
                          const buildImgUrl = (raw) => {
                            if (!raw) return "";
                            const newDomain = "https://tic-backend.plantriponline.com";
                            if (typeof raw === "string" && raw.startsWith("http")) {
                              return raw.replace(/https:\/\/tic\.cyberonics\.net/, newDomain);
                            }
                            const storageUrl = "https://tic-backend.plantriponline.com/storage";
                            const sep = raw?.startsWith("/") ? "" : "/";
                            return `${storageUrl}${sep}${raw}`;
                          };
                          const rawImg =
                            pickImagePath(item?.document_2) ||
                            pickImagePath(item?.media);
                          const imageSrc = buildImgUrl(rawImg) || course1;

                          return (
                            <tr key={index} className="hotel-list-row" onClick={() => navigate(item.id)} style={{ cursor: 'pointer' }}>
                              <td>
                                <div className="list-hotel-info">
                                  <img src={imageSrc} alt={item.name} className="list-hotel-img" />
                                  <div className="list-hotel-details">
                                    <h6 className="hotel-list-name">{item.name}</h6>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="location-badge">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  {item.destination_name || "India, Kochi Kerala"}
                                </div>
                              </td>
                              <td>
                                <span className="category-badge">{item.category_name || "-"}</span>
                              </td>
                              <td>
                                <span className="email-text">{item.sales_email || "-"}</span>
                              </td>
                              <td>
                                <span className="phone-text">{item.phone_number || "-"}</span>
                              </td>
                              <td>
                                <div className="list-actions">
                                  <button
                                    className="list-action-btn edit-btn"
                                    onClick={() => handleEdit(item.id)}
                                    title="Edit"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                  <button
                                    className="list-action-btn delete-btn"
                                    onClick={() => handleDelete(item.id, item.name)}
                                    title="Delete"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <NoData isLoading={hotelData?.loading} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modern-hotel-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .modern-hotel-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
          border-color: rgba(13, 110, 253, 0.15);
        }

        .hotel-image-wrapper {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .hotel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-hotel-card:hover .hotel-image {
          transform: scale(1.12);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .modern-hotel-card:hover .image-overlay {
          opacity: 1;
        }

        .view-btn {
          background: #fff;
          color: #1a1a1a;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .view-btn:hover {
          background: #0d6efd;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.3);
        }

        .rating-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          padding: 8px 14px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 14px;
          color: #1a1a1a;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
        }

        .hotel-content {
          padding: 22px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .hotel-header {
          margin-bottom: 16px;
        }

        .hotel-name {
          font-size: 21px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 10px 0;
          line-height: 1.3;
          letter-spacing: -0.3px;
        }

        .hotel-location {
          color: #6c757d;
          font-size: 14px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 500;
        }

        .hotel-location svg {
          color: #0d6efd;
          flex-shrink: 0;
        }

        .hotel-stats {
          margin-bottom: 18px;
          padding: 14px 0;
          border-top: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #495057;
          font-size: 14px;
          font-weight: 600;
        }

        .stat-item svg {
          color: #0d6efd;
        }

        .hotel-actions {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }

        .action-btn {
          flex: 1;
          border: none;
          padding: 11px 18px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .edit-btn {
          background: #e7f3ff;
          color: #0d6efd;
        }

        .edit-btn:hover {
          background: #0d6efd;
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.25);
        }

        .delete-btn {
          background: #ffe8e8;
          color: #dc3545;
        }

        .delete-btn:hover {
          background: #dc3545;
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(220, 53, 69, 0.25);
        }

        @media (max-width: 768px) {
          .hotel-image-wrapper {
            height: 200px;
          }

          .hotel-name {
            font-size: 18px;
          }

          .hotel-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }

        /* View Toggle Buttons */
        .view-toggle-btns {
          display: flex;
          gap: 8px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 4px;
          background: #f8f9fa;
        }

        .view-toggle-btn {
          background: transparent;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-toggle-btn:hover {
          background: #e9ecef;
          color: #495057;
        }

        .view-toggle-btn.active {
          background: #0d6efd;
          color: #fff;
        }

        /* List View Styles */
        .hotel-list-table {
          margin-bottom: 0;
        }

        .table-header-bg {
          background: #f8f9fa;
        }

        .table-header-bg th {
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          color: #495057;
          padding: 16px 12px;
        }

        .hotel-list-row {
          border-bottom: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .hotel-list-row:hover {
          background: #f8f9fa;
        }

        .hotel-list-row td {
          padding: 16px 12px;
          vertical-align: middle;
        }

        .list-hotel-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .list-hotel-img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e9ecef;
        }

        .list-hotel-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hotel-list-name {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .view-details-link {
          background: none;
          border: none;
          color: #0d6efd;
          cursor: pointer;
          font-size: 13px;
          padding: 0;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .view-details-link:hover {
          color: #0b5ed7;
          text-decoration: underline;
        }

        .location-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
        }

        .location-badge svg {
          color: #0d6efd;
          flex-shrink: 0;
        }

        .category-badge {
          display: inline-block;
          background: #e7f3ff;
          color: #0d6efd;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }

        .email-text {
          color: #6c757d;
          font-size: 14px;
        }

        .phone-text {
          color: #6c757d;
          font-size: 14px;
        }

        .list-actions {
          display: flex;
          gap: 8px;
        }

        .list-action-btn {
          background: transparent;
          border: 1px solid #e9ecef;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .list-action-btn.edit-btn {
          color: #0d6efd;
          border-color: #0d6efd;
        }

        .list-action-btn.edit-btn:hover {
          background: #e7f3ff;
        }

        .list-action-btn.delete-btn {
          color: #dc3545;
          border-color: #dc3545;
        }

        .list-action-btn.delete-btn:hover {
          background: #ffe8e8;
        }

        @media (max-width: 768px) {
          .hotel-list-table {
            font-size: 13px;
          }

          .list-hotel-img {
            width: 50px;
            height: 50px;
          }

          .hotel-list-name {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default Hotels;