import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import {
  axiosDelete,
  axiosPost,
  axiosPut,
  axiosGet,
} from "../../../../services/AxiosInstance";
import {
  notifyDelete,
  notifyError,
  notifyCreate,
} from "../../../utilis/notifyMessage";

// ==================== INLINE MODAL COMPONENT ====================
const InlineModal = ({ isOpen, title, onClose, onSubmit, initialValue = "" }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      notifyError("Please enter a value");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(inputValue.trim());
      setInputValue("");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop show d-block"></div>
      <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group mb-0">
                  <label htmlFor="itemName" className="form-label mb-2">
                    Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== ACCORDION SECTION COMPONENT ====================
const AccordionSection = ({ section, isExpanded, onToggle }) => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await axiosGet(section.url);
      // Handle both array response and object with data property
      const itemsData = Array.isArray(response) 
        ? response 
        : response?.data || response?.result || [];
      setItems(itemsData);
    } catch (error) {
      // Log error for debugging
      console.error(`Error loading ${section.title}:`, error);
      // Only show error if section is expanded (to avoid multiple error notifications)
      const errorMsg = error?.response?.data?.message || 
                       error?.message || 
                       "Failed to load items";
      setItems([]);
      if (isExpanded) {
        notifyError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadItems();
    }
  }, [isExpanded, section.url]);

  const handleAddClick = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingValue("");
    setModalTitle(`Add New ${section.itemLabel}`);
    setModalOpen(true);
  };

  const handleEditClick = (item, e) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditingValue(item.name);
    setModalTitle(`Edit ${section.itemLabel}`);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(`Are you sure you want to delete "${name}"?`)
    ) {
      return;
    }

    try {
      const response = await axiosDelete(`${section.url}/${id}`);
      if (response.success || response.status === 200) {
        setItems(items.filter((item) => item.id !== id));
        dispatch(FormAction.setRefresh());
        notifyDelete(name);
      } else {
        notifyError("Failed to delete item");
      }
    } catch (error) {
      notifyError("Error deleting item");
    }
  };

  const handleModalSubmit = async (value) => {
    try {
      let response;

      if (editingId) {
        // Update existing item
        response = await axiosPut(`${section.url}/${editingId}`, {
          name: value,
        });
      } else {
        // Create new item
        response = await axiosPost(section.url, {
          name: value,
        });
      }

      if (response.success || response.status === 200 || response.status === 201) {
        setModalOpen(false);
        dispatch(FormAction.setRefresh());
        await loadItems();
        notifyCreate(section.itemLabel, !!editingId);
      } else {
        notifyError("Failed to save item");
      }
    } catch (error) {
      // Log full error for debugging
      console.error("API Error Details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.config?.data,
        },
      });
      
      // Log the raw response data as JSON for easier inspection
      if (error?.response?.data) {
        console.log("Backend Response Data (JSON):", JSON.stringify(error.response.data, null, 2));
      }

      // Extract error message from Laravel validation errors
      let errorMsg = "Error saving item";
      
      if (error?.response?.status === 422) {
        // Handle Laravel validation errors (422)
        // Errors can be in either data.errors or data.data.errors
        const errors = error?.response?.data?.data?.errors || error?.response?.data?.errors;
        console.log("Handling 422 validation error, errors object:", errors);
        
        if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
          const firstErrorKey = Object.keys(errors)[0];
          const firstError = errors[firstErrorKey];
          console.log(`First error key: "${firstErrorKey}", value:`, firstError);
          
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMsg = firstError[0];
          } else if (typeof firstError === "string") {
            errorMsg = firstError;
          }
        } else {
          errorMsg = error?.response?.data?.data?.message || 
                     error?.response?.data?.message || 
                     "Validation failed. Please check your input.";
        }
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      notifyError(errorMsg);
    }
  };

  const handleHeaderClick = (e) => {
    if (e.target.closest(".accordion-action-btn")) {
      return;
    }
    onToggle();
  };

  return (
    <>
      <div className="accordion-section">
        <div
          className={`accordion-header ${isExpanded ? "expanded" : ""}`}
          onClick={handleHeaderClick}
        >
          <div className="accordion-header-left">
            <svg
              className="accordion-chevron"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <h5 className="accordion-title">{section.title}</h5>
            <span className="accordion-count">{items.length} items</span>
          </div>

          <button
            className="accordion-action-btn btn btn-primary btn-sm"
            onClick={handleAddClick}
            title={`Add ${section.itemLabel}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add {section.itemLabel}
          </button>
        </div>

        {isExpanded && (
          <div className="accordion-content">
            {loading ? (
              <div className="accordion-loading">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading {section.title.toLowerCase()}...</span>
              </div>
            ) : items.length > 0 ? (
              <div className="accordion-items-list">
                {items.map((item, index) => (
                  <div key={item.id} className="accordion-item-row">
                    <div className="item-content">
                      <span className="item-index">{index + 1}</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <div className="item-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={(e) => handleEditClick(item, e)}
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
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id, item.name);
                        }}
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="accordion-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p>No {section.title.toLowerCase()} added yet</p>
                <p className="text-muted">Click "Add {section.itemLabel}" to create one</p>
              </div>
            )}
          </div>
        )}
      </div>

      <InlineModal
        isOpen={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialValue={editingValue}
      />
    </>
  );
};

// ==================== MAIN HOTEL SETTINGS PAGE ====================
const HotelSettingsPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    "property-category": true,
    "property-types": false,
    "room-types": false,
    "market-types": false,
    "room-amenities": false,
    "hotel-amenities": false,
    "meal-plan": false,
  });

  const sections = [
    {
      id: "property-category",
      title: "Property Category",
      itemLabel: "Category",
      url: URLS.PROPERTY_CATEGORY_URL,
    },
    {
      id: "property-types",
      title: "Property Types",
      itemLabel: "Type",
      url: URLS.PROPERTY_TYPE_URL,
    },
    {
      id: "room-types",
      title: "Room Types",
      itemLabel: "Type",
      url: URLS.ROOM_TYPE_URL,
    },
    {
      id: "market-types",
      title: "Market Types",
      itemLabel: "Type",
      url: URLS.MARKET_TYPE_URL,
    },
    {
      id: "room-amenities",
      title: "Room Amenities",
      itemLabel: "Amenity",
      url: URLS.ROOM_AMENITIES_URL,
    },
    {
      id: "hotel-amenities",
      title: "Hotel Amenities",
      itemLabel: "Amenity",
      url: URLS.HOTEL_AMENITIES_URL,
    },
    {
      id: "meal-plan",
      title: "Meal Plan",
      itemLabel: "Plan",
      url: URLS.MEAL_PLAN_URL,
    },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    sections.forEach((section) => {
      allExpanded[section.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = {};
    sections.forEach((section) => {
      allCollapsed[section.id] = false;
    });
    setExpandedSections(allCollapsed);
  };

  return (
    <div>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-titles">
                <div className="d-flex align-items-center">
                  <h2 className="heading">Hotel Settings</h2>
                </div>
                <div className="d-flex flex-wrap my-2 my-sm-0 align-items-center gap-2">
                  <button className="btn btn-primary btn-sm" onClick={expandAll}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="18 15 12 9 6 15"></polyline>
                      <polyline points="18 9 12 15 6 9"></polyline>
                    </svg>
                    Expand All
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={collapseAll}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                      <polyline points="6 15 12 9 18 15"></polyline>
                    </svg>
                    Collapse All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hotel-settings-container">
        <div className="accordion-container">
          {sections.map((section) => (
            <AccordionSection
              key={section.id}
              section={section}
              isExpanded={expandedSections[section.id]}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hotel-settings-container {
          padding: 20px 0;
        }

        .accordion-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .accordion-section {
          background: #fff;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .accordion-section:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: #f8f9fa;
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
          border-bottom: 1px solid transparent;
        }

        .accordion-section:hover .accordion-header {
          background: #f0f3f7;
        }

        .accordion-header.expanded {
          background: #f0f3f7;
          border-bottom-color: #e9ecef;
        }

        .accordion-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .accordion-chevron {
          flex-shrink: 0;
          color: #6c757d;
          transition: transform 0.3s ease;
        }

        .accordion-header.expanded .accordion-chevron {
          transform: rotate(180deg);
          color: #0d6efd;
        }

        .accordion-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.2px;
        }

        .accordion-count {
          font-size: 13px;
          color: #6c757d;
          background: rgba(13, 110, 253, 0.08);
          padding: 4px 10px;
          border-radius: 12px;
          flex-shrink: 0;
          font-weight: 600;
        }

        .accordion-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          border-radius: 6px !important;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .accordion-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
        }

        .accordion-content {
          padding: 20px;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            overflow: hidden;
          }
          to {
            opacity: 1;
            max-height: 2000px;
            overflow: visible;
          }
        }

        .accordion-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          color: #6c757d;
          font-size: 14px;
        }

        .accordion-items-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .accordion-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .accordion-item-row:last-child {
          border-bottom: none;
        }

        .accordion-item-row:hover {
          background: #f8f9fa;
          padding-left: 18px;
        }

        .item-content {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .item-index {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          background: #e7f3ff;
          color: #0d6efd;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .item-name {
          font-size: 15px;
          color: #1a1a1a;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .action-btn {
          background: transparent;
          border: 1px solid #e9ecef;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }

        .action-btn.edit-btn {
          color: #0d6efd;
          border-color: #0d6efd;
        }

        .action-btn.edit-btn:hover {
          background: #e7f3ff;
        }

        .action-btn.delete-btn {
          color: #dc3545;
          border-color: #dc3545;
        }

        .action-btn.delete-btn:hover {
          background: #ffe8e8;
        }

        .accordion-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: #6c757d;
        }

        .accordion-empty-state svg {
          color: #d1d5db;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .accordion-empty-state p {
          margin: 8px 0;
          font-size: 14px;
        }

        .accordion-empty-state p:first-of-type {
          font-weight: 600;
          color: #495057;
        }

        /* Modal Styles */
        .modal-backdrop.show {
          opacity: 0.5;
        }

        .modal.show {
          z-index: 1050;
        }

        .modal-content {
          border: none;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }

        .modal-header {
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .accordion-header {
            padding: 14px 16px;
          }

          .accordion-header-left {
            gap: 10px;
          }

          .accordion-title {
            font-size: 15px;
          }

          .accordion-count {
            font-size: 12px;
            padding: 3px 8px;
          }

          .accordion-action-btn {
            padding: 6px 12px !important;
            font-size: 12px !important;
          }

          .item-content {
            gap: 10px;
          }

          .item-index {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .item-name {
            font-size: 14px;
          }

          .accordion-item-row {
            padding: 12px 14px;
          }
        }

        @media (max-width: 576px) {
          .accordion-header-left {
            gap: 8px;
          }

          .accordion-title {
            font-size: 14px;
          }

          .accordion-count {
            display: none;
          }

          .item-actions {
            gap: 6px;
          }

          .action-btn {
            padding: 6px;
          }

          .action-btn svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default HotelSettingsPage;
