import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import PageTitle from "../../layouts/PageTitle";
import { axiosGet, axiosPut } from "../../../services/AxiosInstance";
import { URLS } from "../../../constants";
import { notifyCreate, notifyError } from "../../utilis/notifyMessage";

const TermsEditor = ({ data, onChange, disabled }) => {
    return (
        <>
            <CKEditor
                editor={ClassicEditor}
                data={data || ""}
                disabled={disabled}
                onReady={(editor) => {
                    // You can store the "editor" and use when it is needed.
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    if (onChange) {
                        onChange(data);
                    }
                }}
            />
        </>
    );
};

const PackageTerms = () => {
    const [editingState, setEditingState] = useState({
        invoice: false,
        package: false,
        bank: false,
    });

    const [savingState, setSavingState] = useState({
        invoice: false,
        package: false,
        bank: false,
    });

    const [invoiceTerms, setInvoiceTerms] = useState("");
    const [packageTerms, setPackageTerms] = useState("");
    const [bankInfo, setBankInfo] = useState("");
    const [loading, setLoading] = useState(true);

    // -------------------------------------------------------------------------
    // Fetch existing terms from backend on mount
    // -------------------------------------------------------------------------
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                setLoading(true);
                const res = await axiosGet(URLS.PACKAGE_TERMS_URL);
                if (res?.success && res?.data) {
                    setInvoiceTerms(res.data.invoice_terms ?? "");
                    setPackageTerms(res.data.package_terms ?? "");
                    setBankInfo(res.data.bank_info ?? "");
                }
            } catch (error) {
                // If no record exists yet, silently ignore (first-time setup)
                console.warn("Could not fetch package terms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, []);

    const toggleEdit = (section) => {
        setEditingState((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // -------------------------------------------------------------------------
    // Save a specific section to the backend
    // -------------------------------------------------------------------------
    const handleSave = async (section) => {
        const payloadMap = {
            invoice: { invoice_terms: invoiceTerms },
            package: { package_terms: packageTerms },
            bank:    { bank_info: bankInfo },
        };

        try {
            setSavingState((prev) => ({ ...prev, [section]: true }));
            const res = await axiosPut(URLS.PACKAGE_TERMS_URL, payloadMap[section]);
            if (res?.success) {
                notifyCreate("Terms saved successfully", true);
                setEditingState((prev) => ({ ...prev, [section]: false }));
            } else {
                notifyError("Failed to save. Please try again.");
            }
        } catch (error) {
            console.error(`Error saving ${section}:`, error);
            notifyError("An error occurred while saving. Please try again.");
        } finally {
            setSavingState((prev) => ({ ...prev, [section]: false }));
        }
    };

    const renderHeader = (title, iconClass, colorClass, section) => (
        <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title">
                <i className={`fa ${iconClass} me-2 ${colorClass}`}></i>
                {title}
            </h4>
            <div>
                {!editingState[section] ? (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => toggleEdit(section)}
                    >
                        <i className="fa fa-pencil me-1"></i> Edit
                    </button>
                ) : (
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleSave(section)}
                        disabled={savingState[section]}
                    >
                        {savingState[section] ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-save me-1"></i> Save
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );

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
        <>
            <PageTitle
                activeMenu="CkEditor"
                motherMenu="Form"
                pageContent="CkEditor"
            />
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        {renderHeader("Invoice Terms & Condition", "fa-file-text", "text-primary", "invoice")}
                        <div className="card-body custom-ekeditor">
                            <TermsEditor
                                data={invoiceTerms}
                                onChange={setInvoiceTerms}
                                disabled={!editingState.invoice}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        {renderHeader("Package Terms & Condition", "fa-archive", "text-success", "package")}
                        <div className="card-body custom-ekeditor">
                            <TermsEditor
                                data={packageTerms}
                                onChange={setPackageTerms}
                                disabled={!editingState.package}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        {renderHeader("Bank Information", "fa-university", "text-warning", "bank")}
                        <div className="card-body custom-ekeditor">
                            <TermsEditor
                                data={bankInfo}
                                onChange={setBankInfo}
                                disabled={!editingState.bank}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PackageTerms;
