import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Dropdown } from "react-bootstrap";
import { axiosGet, axiosPost, axiosPut, axiosDelete } from "../../../../services/AxiosInstance";
import { URLS } from "../../../../constants";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";

const validationSchema = Yup.object().shape({
  cgst_percentage: Yup.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%")
    .required("Required"),
  sgst_percentage: Yup.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  igst_percentage: Yup.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  tcs_percentage: Yup.number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
});

const Tax = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [taxMode, setTaxMode] = useState("single");
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxPercentage, setNewTaxPercentage] = useState("");
  const [editingTax, setEditingTax] = useState(null); // holds { id, name, percentage }
  const [loading, setLoading] = useState(true);

  // Data from API
  const [taxSettings, setTaxSettings] = useState(null); // { id, cgst_percentage, ... }
  const [additionalTaxes, setAdditionalTaxes] = useState([]);

  const formikRef = useRef(null);

  // -------------------------------------------------------------------------
  // Fetch all tax data from backend on mount
  // -------------------------------------------------------------------------
  const fetchTaxData = async () => {
    try {
      setLoading(true);
      const res = await axiosGet(URLS.TAX_SETTINGS_URL);
      if (res?.success) {
        setTaxSettings(res.data?.tax_settings ?? null);
        setAdditionalTaxes(res.data?.additional_taxes ?? []);
      }
    } catch (error) {
      notifyError("Failed to load tax settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxData();
  }, []);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------
  const isSingleTaxMode =
    !taxSettings ||
    (taxSettings.sgst_percentage === 0 &&
      taxSettings.igst_percentage === 0 &&
      taxSettings.tcs_percentage === 0);

  const initialValues = {
    cgst_percentage: taxSettings?.cgst_percentage ?? 0,
    sgst_percentage: taxSettings?.sgst_percentage ?? 0,
    igst_percentage: taxSettings?.igst_percentage ?? 0,
    tcs_percentage: taxSettings?.tcs_percentage ?? 0,
  };

  // Conditional validation schema based on tax mode
  const getValidationSchema = () => {
    if (taxMode === "single") {
      return Yup.object().shape({
        cgst_percentage: Yup.number()
          .min(0, "Cannot be negative")
          .max(100, "Cannot exceed 100%")
          .required("GST is required"),
        sgst_percentage: Yup.number(),
        igst_percentage: Yup.number(),
        tcs_percentage: Yup.number(),
      });
    }
    return validationSchema;
  };

  // -------------------------------------------------------------------------
  // Save GST settings
  // -------------------------------------------------------------------------
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload =
        taxMode === "single"
          ? {
              cgst_percentage: values.cgst_percentage,
              sgst_percentage: 0,
              igst_percentage: 0,
              tcs_percentage: 0,
            }
          : values;

      const res = await axiosPost(URLS.TAX_SETTINGS_URL, payload);
      if (res?.success) {
        setTaxSettings(res.data);
        notifyCreate("Tax settings updated successfully");
        setIsEditing(false);
      } else {
        notifyError("Failed to update tax settings");
      }
    } catch (error) {
      notifyError("Failed to update tax settings");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset GST to zero via API
  const handleReset = async () => {
    try {
      const payload = {
        cgst_percentage: 0,
        sgst_percentage: 0,
        igst_percentage: 0,
        tcs_percentage: 0,
      };
      const res = await axiosPost(URLS.TAX_SETTINGS_URL, payload);
      if (res?.success) {
        setTaxSettings(res.data);
        notifyCreate("GST values reset to default");
      }
    } catch (error) {
      notifyError("Failed to reset tax settings");
    }
  };

  // -------------------------------------------------------------------------
  // Additional taxes CRUD
  // -------------------------------------------------------------------------
  const handleAddNewTax = async () => {
    if (!newTaxName.trim()) {
      notifyError("Tax name is required");
      return;
    }
    if (!newTaxPercentage || newTaxPercentage < 0 || newTaxPercentage > 100) {
      notifyError("Please enter a valid percentage (0-100)");
      return;
    }

    try {
      if (editingTax) {
        // Update existing
        const res = await axiosPut(`${URLS.ADDITIONAL_TAXES_URL}/${editingTax.id}`, {
          name: newTaxName,
          percentage: parseFloat(newTaxPercentage),
        });
        if (res?.success) {
          setAdditionalTaxes((prev) =>
            prev.map((t) => (t.id === editingTax.id ? res.data : t))
          );
          notifyCreate("Tax updated successfully");
        }
      } else {
        // Create new
        const res = await axiosPost(URLS.ADDITIONAL_TAXES_URL, {
          name: newTaxName,
          percentage: parseFloat(newTaxPercentage),
        });
        if (res?.success) {
          setAdditionalTaxes((prev) => [res.data, ...prev]);
          notifyCreate("Tax added successfully");
        }
      }
    } catch (error) {
      notifyError("Failed to save tax");
    }

    setNewTaxName("");
    setNewTaxPercentage("");
    setEditingTax(null);
    setShowAddTaxModal(false);
  };

  const handleDeleteTax = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tax?")) return;
    try {
      const res = await axiosDelete(`${URLS.ADDITIONAL_TAXES_URL}/${id}`);
      if (res?.success) {
        setAdditionalTaxes((prev) => prev.filter((t) => t.id !== id));
        notifyCreate("Tax deleted successfully");
      }
    } catch (error) {
      notifyError("Failed to delete tax");
    }
  };

  const handleEditTax = (tax) => {
    setEditingTax(tax);
    setNewTaxName(tax.name);
    setNewTaxPercentage(tax.percentage);
    setShowAddTaxModal(true);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-xl-12">
          <div className="page-titles d-flex align-items-center justify-content-between">
            <div>
              <h2 className="heading">Tax Configuration</h2>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingTax(null);
                  setNewTaxName("");
                  setNewTaxPercentage("");
                  setShowAddTaxModal(true);
                }}
                className="btn btn-primary"
              >
                <i className="fa fa-plus me-2"></i> Add New Tax
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GST Edit Modal */}
      {isEditing && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header border-bottom">
                <h5 className="modal-title">
                  <i className="fa fa-pencil me-2"></i> Edit GST Settings
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditing(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Tax Mode Selector */}
                <div className="mb-4 p-3 bg-light rounded border-left-3" style={{ borderLeft: "4px solid #007bff" }}>
                  <label className="form-label mb-3"><strong>Tax Configuration Mode</strong></label>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="taxMode"
                        id="singleMode"
                        value="single"
                        checked={taxMode === "single"}
                        onChange={() => setTaxMode("single")}
                      />
                      <label className="form-check-label" htmlFor="singleMode">
                        <strong>Single Mode</strong> - GST only
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="taxMode"
                        id="splitMode"
                        value="split"
                        checked={taxMode === "split"}
                        onChange={() => setTaxMode("split")}
                      />
                      <label className="form-check-label" htmlFor="splitMode">
                        <strong>Split Mode</strong> - CGST, SGST, IGST, TCS
                      </label>
                    </div>
                  </div>
                  <small className="text-muted d-block mt-2">
                    {taxMode === "split"
                      ? "Configure individual GST taxes for different regions"
                      : "Configure a single GST rate for all transactions"}
                  </small>
                </div>

                <Formik
                  innerRef={formikRef}
                  initialValues={initialValues}
                  validationSchema={getValidationSchema()}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit: formikHandleSubmit,
                    isSubmitting,
                  }) => (
                    <form onSubmit={formikHandleSubmit}>
                      {taxMode === "split" ? (
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-group">
                              <label className="form-label">CGST (%)</label>
                              <input
                                type="number"
                                name="cgst_percentage"
                                min="0" max="100" step="0.01"
                                className={`form-control ${touched.cgst_percentage && errors.cgst_percentage ? "is-invalid" : ""}`}
                                value={values.cgst_percentage}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {touched.cgst_percentage && errors.cgst_percentage && (
                                <small className="text-danger">{errors.cgst_percentage}</small>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-group">
                              <label className="form-label">SGST (%)</label>
                              <input
                                type="number"
                                name="sgst_percentage"
                                min="0" max="100" step="0.01"
                                className={`form-control ${touched.sgst_percentage && errors.sgst_percentage ? "is-invalid" : ""}`}
                                value={values.sgst_percentage}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {touched.sgst_percentage && errors.sgst_percentage && (
                                <small className="text-danger">{errors.sgst_percentage}</small>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-group">
                              <label className="form-label">IGST (%)</label>
                              <input
                                type="number"
                                name="igst_percentage"
                                min="0" max="100" step="0.01"
                                className={`form-control ${touched.igst_percentage && errors.igst_percentage ? "is-invalid" : ""}`}
                                value={values.igst_percentage}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {touched.igst_percentage && errors.igst_percentage && (
                                <small className="text-danger">{errors.igst_percentage}</small>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 mb-4">
                            <div className="form-group">
                              <label className="form-label">TCS (%)</label>
                              <input
                                type="number"
                                name="tcs_percentage"
                                min="0" max="100" step="0.01"
                                className={`form-control ${touched.tcs_percentage && errors.tcs_percentage ? "is-invalid" : ""}`}
                                value={values.tcs_percentage}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {touched.tcs_percentage && errors.tcs_percentage && (
                                <small className="text-danger">{errors.tcs_percentage}</small>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <div className="form-group">
                              <label className="form-label">GST (%)</label>
                              <input
                                type="number"
                                name="cgst_percentage"
                                min="0" max="100" step="0.01"
                                className={`form-control ${touched.cgst_percentage && errors.cgst_percentage ? "is-invalid" : ""}`}
                                value={values.cgst_percentage}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {touched.cgst_percentage && errors.cgst_percentage && (
                                <small className="text-danger">{errors.cgst_percentage}</small>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                          <i className="fa fa-save me-2"></i>
                          {isSubmitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={handleReset}
                        >
                          <i className="fa fa-refresh me-2"></i> Reset
                        </button>
                      </div>
                    </form>
                  )}
                </Formik>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taxes List View */}
      <div className="row">
        <div className="col-xl-12">
          <div className="table-responsive full-data dataTables_wrapper">
            <table className="table display mb-4 dataTablesCard text-black dataTable no-footer">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th>Tax Name</th>
                  <th style={{ width: "15%" }}>Type</th>
                  <th style={{ width: "15%" }}>Percentage</th>
                  <th style={{ width: "10%" }}>Mode</th>
                  <th style={{ width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {/* GST Row - Always First */}
                <tr>
                  <td className="fw-bold">1</td>
                  <td className="whitesp-no p-0">
                    <div className="py-sm-3 py-1 ps-3">
                      <h6 className="font-w500 fs-15 mb-0">GST</h6>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-primary">Default</span>
                  </td>
                  <td>
                    {isSingleTaxMode ? (
                      <strong className="text-success">
                        {taxSettings?.cgst_percentage ?? 0}%
                      </strong>
                    ) : (
                      <strong className="text-success">
                        {(
                          parseFloat(taxSettings?.cgst_percentage || 0) +
                          parseFloat(taxSettings?.sgst_percentage || 0) +
                          parseFloat(taxSettings?.igst_percentage || 0) +
                          parseFloat(taxSettings?.tcs_percentage || 0)
                        ).toFixed(2)}%
                      </strong>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {isSingleTaxMode ? "Single" : "Split"}
                    </span>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle
                        as="div"
                        className="i-false btn-link btn sharp tp-btn btn-primary pill"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.33319 9.99985C8.33319 10.9203 9.07938 11.6665 9.99986 11.6665C10.9203 11.6665 11.6665 10.9203 11.6665 9.99986C11.6665 9.07938 10.9203 8.33319 9.99986 8.33319C9.07938 8.33319 8.33319 9.07938 8.33319 9.99985Z" fill="#ffffff" />
                          <path d="M8.33319 3.33329C8.33319 4.25376 9.07938 4.99995 9.99986 4.99995C10.9203 4.99995 11.6665 4.25376 11.6665 3.33329C11.6665 2.41282 10.9203 1.66663 9.99986 1.66663C9.07938 1.66663 8.33319 2.41282 8.33319 3.33329Z" fill="#ffffff" />
                          <path d="M8.33319 16.6667C8.33319 17.5871 9.07938 18.3333 9.99986 18.3333C10.9203 18.3333 11.6665 17.5871 11.6665 16.6667C11.6665 15.7462 10.9203 15 9.99986 15C9.07938 15 8.33319 15.7462 8.33319 16.6667Z" fill="#ffffff" />
                        </svg>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="dropdown-menu-end">
                        <Dropdown.Item onClick={() => setIsEditing(true)}>
                          <i className="fa fa-edit me-2"></i> Edit
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>

                {/* Additional Taxes */}
                {additionalTaxes.map((tax, index) => (
                  <tr key={tax.id}>
                    <td className="fw-bold">{index + 2}</td>
                    <td className="whitesp-no p-0">
                      <div className="py-sm-3 py-1 ps-3">
                        <h6 className="font-w500 fs-15 mb-0">{tax.name}</h6>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">Custom</span>
                    </td>
                    <td>
                      <strong className="text-success">{tax.percentage}%</strong>
                    </td>
                    <td>
                      <span className="badge bg-warning text-dark">Single</span>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle
                          as="div"
                          className="i-false btn-link btn sharp tp-btn btn-primary pill"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.33319 9.99985C8.33319 10.9203 9.07938 11.6665 9.99986 11.6665C10.9203 11.6665 11.6665 10.9203 11.6665 9.99986C11.6665 9.07938 10.9203 8.33319 9.99986 8.33319C9.07938 8.33319 8.33319 9.07938 8.33319 9.99985Z" fill="#ffffff" />
                            <path d="M8.33319 3.33329C8.33319 4.25376 9.07938 4.99995 9.99986 4.99995C10.9203 4.99995 11.6665 4.25376 11.6665 3.33329C11.6665 2.41282 10.9203 1.66663 9.99986 1.66663C9.07938 1.66663 8.33319 2.41282 8.33319 3.33329Z" fill="#ffffff" />
                            <path d="M8.33319 16.6667C8.33319 17.5871 9.07938 18.3333 9.99986 18.3333C10.9203 18.3333 11.6665 17.5871 11.6665 16.6667C11.6665 15.7462 10.9203 15 9.99986 15C9.07938 15 8.33319 15.7462 8.33319 16.6667Z" fill="#ffffff" />
                          </svg>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu-end">
                          <Dropdown.Item onClick={() => handleEditTax(tax)}>
                            <i className="fa fa-edit me-2"></i> Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDeleteTax(tax.id)}
                            className="text-danger"
                          >
                            <i className="fa fa-trash me-2"></i> Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}

                {additionalTaxes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="fa fa-inbox me-2"></i> No additional taxes added. Click "Add New Tax" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Additional Tax Modal */}
      {showAddTaxModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom">
                <h5 className="modal-title">
                  {editingTax ? "Edit Tax" : "Add New Tax"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddTaxModal(false);
                    setEditingTax(null);
                    setNewTaxName("");
                    setNewTaxPercentage("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label"><strong>Tax Name</strong></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., VAT, Surcharge, etc."
                    value={newTaxName}
                    onChange={(e) => setNewTaxName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label"><strong>Percentage (%)</strong></label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.01"
                    value={newTaxPercentage}
                    onChange={(e) => setNewTaxPercentage(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddTaxModal(false);
                    setEditingTax(null);
                    setNewTaxName("");
                    setNewTaxPercentage("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddNewTax}
                >
                  {editingTax ? "Update" : "Add"} Tax
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tax;
