import React, { Fragment, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Stepper, Step } from "react-form-stepper";
import { useFormik } from "formik";
import * as Yup from "yup";

// Imports from components
import EnquirySlider from "../../Dashboard/EnquirySlider";
import QuestionIcon from "../../Dashboard/Ticketing/QuestionIcon";
import HotelSlider from "../../Dashboard/HotelSlider";
import course1 from "../../../../images/course/hotel-1.jpg";
import NoData from "../../common/NoData";
import { DetailComponent } from "../../common/DetailComponent";
import PageTitle from "../../../layouts/PageTitle";
import { LoadingButton } from "../../common/LoadingBtn";

// Imports from Store, Services, Utils, Constants
import { FormAction } from "../../../../store/slices/formSlice";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import {
  axiosDelete,
  axiosPost,
  axiosPut,
  filePost,
} from "../../../../services/AxiosInstance";
import { getApiBaseUrl } from "../../../../services/apiConfig";
import {
  notifyDelete,
  notifyError,
  notifyCreate,
} from "../../../utilis/notifyMessage";
import { checkFormValue, checkIsFile } from "../../../utilis/check";

// Step Components
import StepOne from "./AddHotel/StepOne";
import StepTwo from "./AddHotel/StepTwo";
import StepThree from "./AddHotel/StepThree";
import StepFour from "./AddHotel/StepFour";

const baseUrl = getApiBaseUrl();

// ==================== HOTELS LIST VIEW ====================
const HotelsListView = ({ onEdit, onDelete, onDetail, viewType, setViewType, navigate }) => {
  const hotelData = useAsync(URLS.HOTEL_URL);

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
                            fill="white"
                          />
                          <path
                            d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z"
                            fill="white"
                          />
                        </svg>
                      </span>
                    </span>
                  </div>
                  <div className="view-toggle-btns">
                    <button
                      className={`view-toggle-btn ${viewType === "card" ? "active" : ""}`}
                      onClick={() => setViewType("card")}
                      title="Card View"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
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
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="invoice-btn d-flex gap-2">
                    <button
                      onClick={() => navigate("../hotel-settings")}
                      className="btn btn-secondary d-flex align-items-center"
                      style={{
                        padding: "8px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#6c757d",
                        border: "1px solid #5a6268",
                        cursor: "pointer",
                      }}
                      title="Hotel Settings"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                        <line x1="9" y1="2" x2="9" y2="10"></line>
                        <line x1="15" y1="12" x2="15" y2="20"></line>
                      </svg>
                    </button>

                    <button onClick={() => onEdit(null)} className="btn btn-primary">
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

          {/* Card View */}
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
                          <div className="hotel-image-wrapper">
                            <img
                              src={imageSrc}
                              alt={item.name}
                              className="hotel-image"
                            />
                            <div className="image-overlay">
                              <button
                                className="view-btn"
                                onClick={() => onDetail(item.id)}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                View Details
                              </button>
                            </div>
                            <div className="rating-badge">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 15"
                                fill="none"
                              >
                                <path
                                  d="M8 0.5L9.79611 6.02786H15.6085L10.9062 9.44427L12.7023 14.9721L8 11.5557L3.29772 14.9721L5.09383 9.44427L0.391548 6.02786H6.20389L8 0.5Z"
                                  fill="#FFC107"
                                />
                              </svg>
                              <span>5.0</span>
                            </div>
                          </div>

                          <div className="hotel-content">
                            <div className="hotel-header">
                              <h4 className="hotel-name">{item.name}</h4>
                              <p className="hotel-location">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {item.destination_name &&
                                item.sub_destination_name
                                  ? `${item.destination_name}, ${item.sub_destination_name}`
                                  : item.destination_name || "Location"}
                              </p>
                            </div>

                            <div className="hotel-stats">
                              <div className="stat-item">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
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
                                onClick={() => onEdit(item.id)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => onDelete(item.id, item.name)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
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
                            const first = Array.isArray(data)
                              ? data[0]
                              : data;
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
                            if (
                              typeof raw === "string" &&
                              raw.startsWith("http")
                            ) {
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
                            <tr
                              key={index}
                              className="hotel-list-row"
                              onClick={() => onDetail(item.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>
                                <div className="list-hotel-info">
                                  <img
                                    src={imageSrc}
                                    alt={item.name}
                                    className="list-hotel-img"
                                  />
                                  <div className="list-hotel-details">
                                    <h6 className="hotel-list-name">
                                      {item.name}
                                    </h6>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="location-badge">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  {item.destination_name || "India, Kochi Kerala"}
                                </div>
                              </td>
                              <td>
                                <span className="category-badge">
                                  {item.category_name || "-"}
                                </span>
                              </td>
                              <td>
                                <span className="email-text">
                                  {item.sales_email || "-"}
                                </span>
                              </td>
                              <td>
                                <span className="phone-text">
                                  {item.phone_number || "-"}
                                </span>
                              </td>
                              <td>
                                <div className="list-actions">
                                  <button
                                    className="list-action-btn edit-btn"
                                    onClick={() => onEdit(item.id)}
                                    title="Edit"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                  <button
                                    className="list-action-btn delete-btn"
                                    onClick={() => onDelete(item.id, item.name)}
                                    title="Delete"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
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
          background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 100%);
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

        /* Hotel Settings Dropdown */
        .hotel-settings-dropdown .btn-secondary {
          background: #6c757d !important;
          border: 1px solid #5a6268 !important;
          color: #fff !important;
          transition: all 0.3s ease;
        }

        .hotel-settings-dropdown .btn-secondary:hover {
          background: #5a6268 !important;
          border-color: #545b62 !important;
        }

        .hotel-settings-dropdown .btn-secondary::after {
          display: none !important;
        }

        .hotel-settings-dropdown .dropdown-menu {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          padding: 8px 0;
          min-width: 200px;
        }

        .hotel-settings-dropdown .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 14px;
          color: #495057;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .hotel-settings-dropdown .dropdown-item:hover {
          background: #f8f9fa;
          color: #0d6efd;
          padding-left: 20px;
        }

        .hotel-settings-dropdown .dropdown-item svg {
          color: inherit;
          flex-shrink: 0;
        }

        .hotel-settings-dropdown .dropdown-divider {
          margin: 8px 0;
          background: #e9ecef;
        }
      `}</style>
    </>
  );
};

// ==================== ADD/EDIT HOTEL VIEW ====================
const AddEditHotelView = ({ hotelId, onBack }) => {
  const [goSteps, setGoSteps] = useState(0);
  const dispatch = useDispatch();
  const isEdit = !!hotelId;

  const initialValues = {
    addRoom: [],
    hotelAmentity: [],
    hotelImg: [],
    roomId: "",
  };

  const url = URLS.HOTEL_URL;
  const editUrl = `${URLS.HOTEL_URL}/${hotelId}`;
  const updateUrl = `${URLS.HOTEL_UPDATE_URL}/${hotelId}`;

  const editData = useAsync(editUrl, isEdit);

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Your name must consist of at least 3 characters ")
      .max(50, "Your name must consist of at limit 50 characters ")
      .required("Please enter a name"),
    place: Yup.string()
      .min(5, "Your place must be at least 5 characters long")
      .max(50, "Your place must be at limit 50 characters long")
      .required("Please provide a place"),
    destination: Yup.object().required("Please select a destination"),
    subDestination: Yup.object().required("Please select a sub destination"),
    category: Yup.string().required("Please select a category"),
    propertyType: Yup.string().required("Please select a property type"),
    salesEmail: Yup.string()
      .required("Please select a sales email")
      .email("Please provide valid email"),
    phoneNumber: Yup.string()
      .min(5, "Your phone number must be at least 5 characters long")
      .max(15, "Your phone number must be at limit 15 characters long")
      .required("Please provide a phone number"),
    address: Yup.string()
      .min(5, "Your address must be at least 5 characters long")
      .max(100, "Your address must be at limit 100 characters long")
      .required("Please provide a address"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        dispatch(FormAction.setLoading(true));
        if (!values.addRoom || values.addRoom.length === 0) {
          notifyError("Add at least one room before saving the hotel");
          dispatch(FormAction.setLoading(false));
          return;
        }
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("destination_id", values.destination?.value);
        formData.append("sub_destination_id", values.subDestination?.value);
        formData.append("place", values.place);
        formData.append("category_id", values.category);
        formData.append("property_type_id", values.propertyType);
        formData.append("sales_email", values.salesEmail);
        formData.append("sales_no", checkFormValue(values.salesNumber));
        formData.append("reservation_email", checkFormValue(values.reservationEmail));
        formData.append(
          "reservation_no",
          checkFormValue(values.reservationNumber)
        );
        formData.append("phone_number", values.phoneNumber);
        formData.append("address", values.address);
        for (let [ind, item] of (values.addRoom || []).entries()) {
          const start = new Date(item.roomStartDate);
          const end = new Date(item.roomEndDate);
          if (end <= start) {
            notifyError(`Room ${ind + 1}: To Date must be after From Date`);
            dispatch(FormAction.setLoading(false));
            return;
          }
          const invalidMeal = item.mealPlan?.some((mp) => !(Number(mp.amount) > 0));
          if (invalidMeal) {
            notifyError(`Room ${ind + 1}: Meal plan amount must be greater than 0`);
            dispatch(FormAction.setLoading(false));
            return;
          }
          if (!!item.roomId) {
            formData.append(`rooms[${ind}][id]`, item.roomId);
          }
          formData.append(`rooms[${ind}][market_type_id]`, item.marketType.value);
          formData.append(
            `rooms[${ind}][from_date]`,
            start.toLocaleDateString("en-CA")
          );
          formData.append(
            `rooms[${ind}][to_date]`,
            end.toLocaleDateString("en-CA")
          );
          formData.append(`rooms[${ind}][room_type_id]`, item.roomType.value);
          formData.append(`rooms[${ind}][single_bed_amount]`, item.singleBed);
          formData.append(`rooms[${ind}][double_bed_amount]`, item.doubleBed);
          formData.append(`rooms[${ind}][triple_bed_amount]`, item.tripleBed);
          formData.append(
            `rooms[${ind}][is_triple_bed_available]`,
            item.tripleBedSelect ? 1 : 0
          );
          formData.append(`rooms[${ind}][extra_bed_amount]`, item.extraBed);
          formData.append(
            `rooms[${ind}][is_extra_bed_available]`,
            item.extraBedSelect ? 1 : 0
          );
          formData.append(`rooms[${ind}][child_w_bed_amount]`, item.childWBed);
          formData.append(
            `rooms[${ind}][is_child_w_bed_available]`,
            item.childWBedSelect ? 1 : 0
          );
          formData.append(`rooms[${ind}][child_n_bed_amount]`, item.childNBed);
          formData.append(
            `rooms[${ind}][is_child_n_bed_available]`,
            item.childNBedSelect ? 1 : 0
          );
          formData.append(`rooms[${ind}][occupancy]`, item.occupancy);
          item.roomAmentity?.forEach((item, i) => {
            formData.append(`rooms[${ind}][amenities][${i}]`, item);
          });
          item.roomImg?.forEach((item, i) => {
            if (checkIsFile(item)) {
              formData.append(`rooms[${ind}][images][${i}]`, item);
            }
          });
          item.mealPlan?.forEach((item, i) => {
            formData.append(`rooms[${ind}][meal_plans][${i}][id]`, item.id);
            formData.append(`rooms[${ind}][meal_plans][${i}][amount]`, item.amount);
          });
          formData.append(
            `rooms[${ind}][is_allotted]`,
            item.alloment ? 1 : 0
          );
          formData.append(
            `rooms[${ind}][allotted_cut_off_days]`,
            item.cutOff
          );
        }
        if (values.hotelAmentity?.length) {
          values.hotelAmentity.forEach((item, ind) => {
            formData.append(`amenities[${ind}]`, item);
          });
        } else {
          formData.append("amenities", "");
        }
        values.hotelImg?.forEach((item, ind) => {
          if (checkIsFile(item)) {
            formData.append(`document_2[${ind}]`, item);
          }
        });
        let response;
        if (isEdit) {
          response = await filePost(updateUrl, formData);
        } else {
          response = await filePost(url, formData);
        }
        if (response.success) {
          dispatch(FormAction.setRefresh());
          if (isEdit) {
            dispatch(FormAction.setEditId());
          }
          notifyCreate("Hotel", isEdit);
          setTimeout(() => {
            onBack();
          }, 500);
        }
      } catch (error) {
        const errObj = error?.response?.data?.data?.errors;
        const firstErr =
          errObj && Object.values(errObj)?.flat()?.[0]
            ? Object.values(errObj).flat()[0]
            : error?.response?.data?.message || error?.message || "Save failed";
        notifyError(firstErr);
      } finally {
        dispatch(FormAction.setLoading(false));
      }
    },
  });

  const editValues = editData?.data?.data;
  useEffect(() => {
    if (!!editValues) {
      const obj = {
        name: editValues.name,
        destination: {
          label: editValues.destination_name,
          value: editValues.destination_id,
        },
        subDestination: {
          label: editValues.sub_destination_name,
          value: editValues.sub_destination_id,
        },
        place: editValues.place,
        category: editValues.category_id,
        propertyType: editValues.property_type_id,
        salesEmail: editValues.sales_email,
        salesNumber: editValues.sales_no,
        reservationEmail: editValues.reservation_email,
        reservationNumber: editValues.reservation_no,
        phoneNumber: editValues.phone_number,
        address: editValues.address,
        hotelImg: editValues.document_2,
      };
      const hotelAmentityArr = editValues.amenities.map((item) => item.id);
      const addRoomArr = editValues.rooms?.map((item, ind) => {
        const obj = {
          roomId: item.id,
          marketType: {
            label: item.market_type_name,
            value: item.market_type_id,
          },
          roomStartDate: item.from_date,
          roomEndDate: item.to_date,
          roomType: { label: item.room_type_name, value: item.room_type_id },
          singleBed: item.single_bed_amount,
          doubleBed: item.double_bed_amount,
          tripleBed: item.triple_bed_amount,
          tripleBedSelect: item.is_triple_bed_available == 1 ? true : false,
          extraBed: item.extra_bed_amount,
          extraBedSelect: item.is_extra_bed_available == 1 ? true : false,
          childWBed: item.child_w_bed_amount,
          childWBedSelect: item.is_child_w_bed_available == 1 ? true : false,
          childNBed: item.child_n_bed_amount,
          childNBedSelect: item.is_child_n_bed_available == 1 ? true : false,
          occupancy: item.occupancy,
          roomImg: item.media,
          mealPlan: item.meal_plans,
          allotted: item.is_allotted == 1 ? true : false,
          cutOff: item.allotted_cut_off_days,
        };
        const roomAmentityArr = item.amenities.map((item) => item.id);
        const newObj = { ...obj, roomAmentity: roomAmentityArr };
        return newObj;
      });
      const newObj = { ...obj, addRoom: addRoomArr, hotelAmentity: hotelAmentityArr };
      formik.setValues(newObj);
    }
  }, [hotelId, editValues]);

  useEffect(() => {
    return () => {
      dispatch(FormAction.setEditId(""));
    };
  }, []);

  return (
    <Fragment>
      <PageTitle activeMenu="Components" motherMenu="Home" />

      <div className="row">
        <div className="col-xl-12 col-xxl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">{`${isEdit ? "Edit" : "Add"} Hotel`}</h4>
              <button
                onClick={onBack}
                className="btn btn-sm btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <div className="card-body">
              <div className="form-wizard ">
                <Stepper
                  className="nav-wizard"
                  activeStep={goSteps}
                >
                  <Step className="nav-link" onClick={() => setGoSteps(0)} />
                  <Step className="nav-link" onClick={() => setGoSteps(1)} />
                  <Step className="nav-link" onClick={() => setGoSteps(2)} />
                  <Step className="nav-link" onClick={() => setGoSteps(3)} />
                </Stepper>
                {goSteps === 0 && (
                  <>
                    <StepOne formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-primary sw-btn-next"
                        onClick={() => setGoSteps(1)}
                        disabled={
                          formik.isSubmitting ||
                          !formik.isValid ||
                          !formik.dirty
                        }
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {goSteps === 1 && (
                  <>
                    <StepTwo formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-secondary sw-btn-prev me-1"
                        onClick={() => setGoSteps(0)}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-primary sw-btn-next ms-1"
                        onClick={() => setGoSteps(2)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {goSteps === 2 && (
                  <>
                    <StepThree formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-secondary sw-btn-prev me-1"
                        onClick={() => setGoSteps(1)}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-primary sw-btn-next ms-1"
                        onClick={() => setGoSteps(3)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {goSteps === 3 && (
                  <>
                    <StepFour formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-secondary sw-btn-prev me-2"
                        onClick={() => setGoSteps(2)}
                      >
                        Prev
                      </button>
                      <LoadingButton
                        label="Submit"
                        onClick={formik.handleSubmit}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

// ==================== HOTEL DETAIL VIEW ====================
const HotelDetailView = ({ hotelId, onBack }) => {
  const url = URLS.HOTEL_URL;
  const array = [
    { label: "Hotel", value: "document_2", type: "image", isMulti: true },
    { label: "Name", value: "name" },
    { label: "Destination", value: "destination_name" },
    { label: "Sub Destination", value: "sub_destination_name" },
    { label: "Place", value: "place" },
    { label: "Category", value: "category_name" },
    { label: "Property Type", value: "property_type_name" },
    { label: "Sales Number", value: "sales_no" },
    { label: "Sales Email", value: "sales_email" },
    { label: "Reservation Number", value: "reservation_no" },
    { label: "Reservation Email", value: "reservation_email" },
    { label: "Address", value: "address" },
    { label: "Phone Number", value: "phone_number" },
    { label: "Amenites", value: "amenities" },
    {
      label: "Rooms",
      value: "rooms",
      type: "table",
      table: [
        { tableLabel: "#", tableValue: "index" },
        { tableLabel: "market", tableValue: "market_type_name" },
        { tableLabel: "Start date", tableValue: "to_date" },
        { tableLabel: "From date", tableValue: "from_date" },
        { tableLabel: "Type", tableValue: "room_type_name" },
        { tableLabel: "Single", tableValue: "single_bed_amount" },
        { tableLabel: "Double", tableValue: "double_bed_amount" },
        { tableLabel: "Extra", tableValue: "extra_bed_amount" },
        { tableLabel: "Child W", tableValue: "child_w_bed_amount" },
        { tableLabel: "Child N", tableValue: "child_n_bed_amount" },
        { tableLabel: "Occupancy", tableValue: "occupancy" },
        { tableLabel: "Cut Off", tableValue: "allotted_cut_off_days" },
      ],
    },
  ];

  const headerStyle = {
    backgroundColor: "#00a8ff",
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: "0",
  };

  const backButtonStyle = {
    position: "absolute",
    left: "30px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const titleStyle = {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "600",
    margin: "0",
    textAlign: "center",
  };

  return (
    <>
      <div style={headerStyle}>
        <button
          onClick={onBack}
          style={backButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          title="Go back to Hotels"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h2 style={titleStyle}>Hotel Details</h2>
      </div>

      <style>{`
        .detail-component-wrapper > div:first-of-type:not(:only-child) {
          display: none !important;
        }
      `}</style>

      <div className="detail-component-wrapper">
        <DetailComponent title="" url={url} array={array} id={hotelId} />
      </div>
    </>
  );
};

// ==================== MAIN HOTELS PAGE COMPONENT ====================
const HotelsPage = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'add', 'edit', 'detail'
  const [selectedId, setSelectedId] = useState(null);
  const [viewType, setViewType] = useState("card");
  const navigate = useNavigate();

  const handleEdit = (id) => {
    setSelectedId(id);
    setCurrentView(id ? "edit" : "add");
  };

  // Dispatch is used for refresh, moved inside since we have access to it
  const dispatch = useDispatch();

  const handleDelete = async (id, name) => {
    const deleteUrl = `${URLS.HOTEL_URL}/${id}`;
    try {
      const response = await axiosDelete(deleteUrl);
      if (response.success) {
        dispatch(FormAction.setRefresh());
        notifyDelete(name);
      }
    } catch (error) {
      notifyError("Something went wrong!");
    }
  };

  const handleDetail = (id) => {
    setSelectedId(id);
    setCurrentView("detail");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedId(null);
  };

  return (
    <>
      {currentView === "list" && (
        <HotelsListView
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDetail={handleDetail}
          viewType={viewType}
          setViewType={setViewType}
          navigate={navigate}
        />
      )}
      {currentView === "add" && (
        <AddEditHotelView hotelId={null} onBack={handleBack} />
      )}
      {currentView === "edit" && (
        <AddEditHotelView hotelId={selectedId} onBack={handleBack} />
      )}
      {currentView === "detail" && (
        <HotelDetailView hotelId={selectedId} onBack={handleBack} />
      )}
    </>
  );
};

export default HotelsPage;
