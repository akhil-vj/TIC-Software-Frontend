import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import PageTitle from "../../layouts/PageTitle";

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

    const [invoiceTerms, setInvoiceTerms] = useState("");
    const [packageTerms, setPackageTerms] = useState("");
    const [bankInfo, setBankInfo] = useState("");

    const toggleEdit = (section) => {
        setEditingState((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSave = (section) => {
        setEditingState((prev) => ({ ...prev, [section]: false }));
        console.log(`Saved ${section} Data:`, { invoiceTerms, packageTerms, bankInfo }[section + "Terms"] || { invoiceTerms, packageTerms, bankInfo }[section === 'bank' ? 'bankInfo' : section + 'Terms']);
        // Here you can add the logic to save a specific section to the backend
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
                    >
                        <i className="fa fa-save me-1"></i> Save
                    </button>
                )}
            </div>
        </div>
    );

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
