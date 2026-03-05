import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Formik } from "formik";

import CustomModal from "../../../layouts/CustomModal";
import InputField from "../../common/InputField";
import DeleteModal from "../../common/DeleteModal";

import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import { RoleAction } from "../../../../store/slices/roleSlice";
import { axiosPut } from "../../../../services/AxiosInstance";
import { buildApiUrl } from "../../../../services/apiConfig";
import { notifyError, notifySuccess } from "../../../utilis/notifyMessage";

const AddRoleModal = ({ showModal, setShowModal }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <CustomModal
            showModal={showModal}
            title={"Add Role"}
            handleModalClose={() => setShowModal(false)}
            style={{ zIndex: 1060 }}
        >
            <Formik
                initialValues={{ name: "" }}
                onSubmit={(values) => {
                    setShowModal(false);
                    dispatch(RoleAction.setPage(values.name));
                    navigate("/user-role/add");
                }}
            >
                {({ values, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="mb-2">
                                <InputField label="Name" name="name" onChange={handleChange} onBlur={handleBlur} values={values} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary mt-4">
                            Submit
                        </button>
                    </form>
                )}
            </Formik>
        </CustomModal>
    );
};

const UserRole = ({ showModal, setShowModal }) => {
    const navigate = useNavigate();
    const url = URLS.USER_ROLE_URL;
    const roleData = useAsync(url);
    const isLoading = roleData?.loading;
    const tableData = roleData?.data?.data || [];

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUrl, setDeleteUrl] = useState("");
    const [deleteName, setDeleteName] = useState("");
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const roleDetailData = useAsync(selectedRoleId ? `${url}/${selectedRoleId}` : null, !!selectedRoleId);
    const permissionData = useAsync(URLS.PERMISSION_URL);

    // Use actual data from backend
    const displayData = tableData;

    const onDetail = (id) => {
        setSelectedRoleId(id);
        setShowDetailModal(true);
    };

    const onEdit = (id) => {
        setShowModal(false);
        navigate(`/user-role/add/${id}`);
    };

    const onDelete = (id, name) => {
        setDeleteUrl(`${url}/${id}`);
        setDeleteName(name);
        setShowDeleteModal(true);
    };

    const handleToggleStatus = async (item) => {
        if (isUpdating) return;

        try {
            setIsUpdating(true);

            // Assume active if is_active is undefined or null
            const currentStatus = item.is_active !== 0 && item.is_active !== false;
            const newStatus = currentStatus ? 0 : 1;

            // Reconstruct the payload expected by RolesController@update
            const payload = {
                name: item.name,
                description: item.description || '',
                is_active: newStatus,
                sync: 0, // Don't sync permissions to users down the line just on a status toggle
                permissions: item.permissions ? item.permissions.map(p => p.id || p.permission_id) : []
            };

            const response = await axiosPut(buildApiUrl(`${url}/${item.id}`), payload);
            if (response.success) {
                notifySuccess(`Role ${newStatus ? 'activated' : 'disabled'} successfully`);
                // Update local state directly so UI reflects change immediately
                // since the backend might not return is_active in the refresh
                if (roleData.data && roleData.data.data) {
                    const updatedData = roleData.data.data.map(role =>
                        role.id === item.id ? { ...role, is_active: newStatus } : role
                    );
                    roleData.setData({ ...roleData.data, data: updatedData });
                } else {
                    roleData.triggerFetch();
                }
            }
        } catch (error) {
            console.error("Error toggling role status:", error);
            notifyError("Failed to update role status");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <style>{`
            .user-role-modal .modal-dialog {
                max-width: 900px;
                margin: 1.75rem auto;
                display: flex;
                align-items: center;
                min-height: calc(100% - 3.5rem);
            }
            .user-role-modal .modal-content {
                border-radius: 16px;
                border: none;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            }
            .user-role-modal .modal-header {
                border-bottom: 1px solid #e2e8f0;
                padding: 2rem 2.5rem 1.5rem 2.5rem;
                align-items: flex-start;
                display: flex;
                position: relative;
            }
            .user-role-modal .modal-title {
                width: 100%;
                display: flex;
                align-items: flex-start;
                padding-right: 3rem;
            }
            .user-role-modal .modal-header .btn-close {
                position: absolute;
                right: 2rem;
                top: 2rem;
                margin: 0;
                padding: 0;
                font-size: 1.25rem;
                opacity: 0.4;
                transition: opacity 0.2s;
                z-index: 1;
            }
            .user-role-modal .modal-header .btn-close:hover {
                opacity: 0.8;
            }
            .user-role-modal .modal-body {
                padding: 0;
            }
            .user-role-table-container {
                padding: 0;
            }
            .user-role-table {
                width: 100%;
                margin-bottom: 0;
            }
            .user-role-table th {
                color: #64748b;
                font-weight: 500;
                font-size: 0.8125rem;
                padding: 1.25rem 2.5rem;
                border-bottom: 1px solid #e2e8f0;
                white-space: nowrap;
                text-align: left;
                background-color: #f8fafc;
            }
            .user-role-table td {
                padding: 1.5rem 2.5rem;
                vertical-align: middle;
                border-bottom: 1px solid #e2e8f0;
                color: #1e293b;
                font-weight: 500;
                font-size: 0.9375rem;
            }
            .user-role-table tbody tr:last-child td {
                border-bottom: none;
            }
            .status-toggle {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 6px 14px;
                background-color: #dcfce7;
                border-radius: 20px;
            }
            .toggle-switch-wrapper {
                position: relative;
                width: 40px;
                height: 22px;
                background-color: #10b981;
                border-radius: 11px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .toggle-switch-wrapper.active {
                background-color: #10b981;
            }
            .toggle-switch-circle {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 18px;
                height: 18px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            }
            .toggle-switch-wrapper.active .toggle-switch-circle {
                transform: translateX(18px);
            }
            .status-label {
                font-size: 0.875rem;
                font-weight: 500;
            }
            .status-label.active {
                color: #10b981;
            }
            .status-label.inactive {
                color: #94a3b8;
            }
            .action-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-start;
            }
            .action-btn {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background-color: #f1f5f9;
                color: #64748b;
                transition: all 0.2s;
                cursor: pointer;
                font-size: 0.9375rem;
            }
            .action-btn:hover {
                background-color: #e2e8f0;
                color: #334155;
            }
            .action-btn.delete-btn {
                color: #ef4444;
            }
            .action-btn.delete-btn:hover {
                background-color: #fee2e2;
                color: #dc2626;
            }
            .user-role-empty {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 2rem 2.5rem;
                color: #64748b;
                font-size: 0.875rem;
            }
            .empty-circle {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 2px solid #cbd5e1;
            }
            .new-role-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                padding: 0.625rem 1.25rem;
                border-radius: 8px;
                font-size: 0.9375rem;
                transition: all 0.2s;
            }
            .new-role-btn:hover {
                background-color: #0284c7 !important;
                border-color: #0284c7 !important;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
            }
            `}</style>
            <CustomModal
                showModal={showModal}
                handleModalClose={() => setShowModal(false)}
                modalClass="user-role-modal"
                title={
                    <div className="d-flex justify-content-between align-items-start w-100">
                        <div style={{ flex: 1, maxWidth: "60%" }}>
                            <h3 className="mb-2" style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b", lineHeight: "1.3" }}>User Roles</h3>
                            <p className="mb-0" style={{ fontSize: "0.9375rem", color: "#64748b", fontWeight: "400" }}>Manage available roles</p>
                        </div>
                        <button
                            className="btn btn-primary new-role-btn"
                            onClick={() => setShowAddRoleModal(true)}
                            style={{ backgroundColor: "#0ea5e9", borderColor: "#0ea5e9", flexShrink: 0 }}
                        >
                            <i className="fa-solid fa-plus" style={{ fontSize: "14px" }}></i>
                            New Role
                        </button>
                    </div>
                }
                size="lg"
            >
                <div className="user-role-table-container">
                    <table className="user-role-table">
                        <thead>
                            <tr>
                                <th style={{ width: "45%" }}>Role Name</th>
                                <th style={{ width: "30%" }}>Status</th>
                                <th style={{ width: "25%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5" style={{ color: "#64748b" }}>Loading...</td>
                                </tr>
                            ) : displayData && displayData.length > 0 ? (
                                displayData.map((item, ind) => {
                                    // Assume active if is_active is missing or true
                                    const isActive = item.is_active !== 0 && item.is_active !== false;
                                    return (
                                        <tr key={item.id || ind}>
                                            <td>{item.name}</td>
                                            <td>
                                                <div className="status-toggle">
                                                    <div
                                                        className={`toggle-switch-wrapper ${isActive ? 'active' : ''}`}
                                                        onClick={() => handleToggleStatus(item)}
                                                        style={{ opacity: isUpdating ? 0.6 : 1, cursor: isUpdating ? 'wait' : 'pointer' }}
                                                    >
                                                        <div className="toggle-switch-circle"></div>
                                                    </div>
                                                    <span className={`status-label ${isActive ? 'active' : 'inactive'}`}>
                                                        {isActive ? 'Active' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn" onClick={() => onDetail(item.id)} title="View">
                                                        <i className="fa-regular fa-eye"></i>
                                                    </button>
                                                    <button className="action-btn" onClick={() => onEdit(item.id)} title="Edit">
                                                        <i className="fa-solid fa-pencil"></i>
                                                    </button>
                                                    <button className="action-btn delete-btn" onClick={() => onDelete(item.id, item.name)} title="Delete">
                                                        <i className="fa-regular fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3">
                                        <div className="user-role-empty">
                                            <div className="empty-circle"></div>
                                            No roles found
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CustomModal>

            {showDetailModal && (
                <CustomModal
                    showModal={showDetailModal}
                    handleModalClose={() => {
                        setShowDetailModal(false);
                        setSelectedRoleId(null);
                    }}
                    modalClass="role-detail-modal"
                    title={
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div>
                                <h3 className="mb-2" style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b", lineHeight: "1.3" }}>Role Details</h3>
                                <p className="mb-0" style={{ fontSize: "0.9375rem", color: "#64748b", fontWeight: "400" }}>View permissions for this role</p>
                            </div>
                        </div>
                    }
                    size="lg"
                    style={{ zIndex: 1070 }}
                >
                    <div className="role-detail-content" style={{ padding: "2rem 2.5rem" }}>
                        {roleDetailData?.loading || permissionData?.loading ? (
                            <div className="text-center py-5" style={{ color: "#64748b" }}>
                                <div className="spinner-border" role="status" style={{ width: "2rem", height: "2rem", color: "#0ea5e9" }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2">Loading role details...</p>
                            </div>
                        ) : roleDetailData?.data?.data ? (
                            <>
                                <div className="mb-4">
                                    <h5 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "0.5rem" }}>Role Name</h5>
                                    <p style={{ color: "#475569", fontSize: "0.9375rem", marginBottom: 0 }}>{roleDetailData?.data?.data?.name}</p>
                                </div>
                                <div className="mb-4">
                                    <h5 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "1rem" }}>Permissions</h5>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
                                            <thead>
                                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                                    <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "500", fontSize: "0.8125rem" }}>Module</th>
                                                    <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "500", fontSize: "0.8125rem" }}>Read</th>
                                                    <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "500", fontSize: "0.8125rem" }}>Write</th>
                                                    <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "500", fontSize: "0.8125rem" }}>Update</th>
                                                    <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "500", fontSize: "0.8125rem" }}>Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {permissionData?.data?.data && permissionData?.data?.data.length > 0 ? (
                                                    permissionData?.data?.data.map((module, idx) => {
                                                        const getPermission = (moduleName, permType) => {
                                                            const slug = `${moduleName.toLowerCase()}-${permType}`;
                                                            const perm = roleDetailData?.data?.data?.permissions?.find(p => p?.slug?.split("-").slice(0, 2).join("-") === slug);
                                                            return perm ? perm.name : "—";
                                                        };
                                                        return (
                                                            <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                                <td style={{ padding: "1rem", color: "#1e293b", fontWeight: "500" }}>{module.name.charAt(0).toUpperCase() + module.name.slice(1)}</td>
                                                                <td style={{ padding: "1rem", color: "#475569" }}>{getPermission(module.name, "read")}</td>
                                                                <td style={{ padding: "1rem", color: "#475569" }}>{getPermission(module.name, "write")}</td>
                                                                <td style={{ padding: "1rem", color: "#475569" }}>{getPermission(module.name, "update")}</td>
                                                                <td style={{ padding: "1rem", color: "#475569" }}>{getPermission(module.name, "delete")}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No permissions assigned</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                                No data available
                            </div>
                        )}
                    </div>
                </CustomModal>
            )}

            <AddRoleModal showModal={showAddRoleModal} setShowModal={setShowAddRoleModal} />
            <DeleteModal showModal={showDeleteModal} setShowModal={setShowDeleteModal} name={deleteName} url={deleteUrl} />
        </>
    );
};

export default UserRole;