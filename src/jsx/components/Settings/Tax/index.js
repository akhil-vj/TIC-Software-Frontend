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

      {/* Taxes List View */}
      <div className="row">
        <div className="col-xl-12">
          <div className="table-responsive full-data dataTables_wrapper">
            <table className="table display mb-4 dataTablesCard text-black dataTable no-footer">
              <thead>
                  <th style={{ width: "80px" }}>No.</th>
                  <th >Tax Name</th>
                  <th style={{ width: "200px" }}>Percentage</th>
                  <th style={{ width: "120px" }}>Action</th>
              </thead>
              <tbody>
                {/* Additional Taxes */}
                {additionalTaxes.map((tax, index) => (
                  <tr key={tax.id} className="align-middle">
                    <td className="ps-4">
                      <span className="text-muted fw-medium">{index + 1}</span>
                    </td>
                    <td>
                      <span className="text-dark fw-bold fs-16">{tax.name}</span>
                    </td>
                    <td>
                      <span className="badge bg-success-light text-success fw-bold p-2 px-3 fs-14">
                        {tax.percentage}%
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
                    <td colSpan="4" className="text-center py-4 text-muted">
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
