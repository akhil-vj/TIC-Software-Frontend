import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import CustomModal from "../../../layouts/CustomModal";
import InputField from "../../common/InputField";
import ReactSelect from "../../common/ReactSelect";
import CustomDatePicker from "../../common/CustomDatePicker";
import ResetPassword from "../../common/ResetPassword";
import DeleteModal from "../../common/DeleteModal";
import NoData from "../../common/NoData";
import UserRole from "./UserRole";

import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import { dateComparison, formatDate } from "../../../utilis/date";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { FormAction } from "../../../../store/slices/formSlice";
import { axiosPost, axiosPut } from "../../../../services/AxiosInstance";
import { buildApiUrl } from "../../../../services/apiConfig";

const formatNumber = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return value || "0";
    }
    return new Intl.NumberFormat("en-IN").format(num);
};

const SVG_ICONS = {
    total: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    ),
    active: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    ),
    expired: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="8" x2="16" y2="16"></line>
            <line x1="16" y1="8" x2="8" y2="16"></line>
        </svg>
    ),
    roles: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <circle cx="10" cy="12" r="1.5"></circle>
            <circle cx="14" cy="12" r="1.5"></circle>
        </svg>
    ),
};

const getIcon = (index) => {
    const icons = [SVG_ICONS.total, SVG_ICONS.active, SVG_ICONS.expired, SVG_ICONS.roles];
    return icons[index] || SVG_ICONS.roles;
};

const BG_SVG_PATTERN = (
    <svg
        width="108"
        height="84"
        viewBox="0 0 108 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g opacity="0.4">
            <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#01A3FF" />
            <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#01A3FF" />
            <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#01A3FF" />
            <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#01A3FF" />
            <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#01A3FF" />
            <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#01A3FF" />
            <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#01A3FF" />
        </g>
    </svg>
);

// Swiper Breakpoints Configuration
const SWIPER_BREAKPOINTS = {
    300: { slidesPerView: 1 },
    576: { slidesPerView: 2 },
    991: { slidesPerView: 3 },
    1200: { slidesPerView: 4 },
};

// Color Class Utility
const getBgColorClass = (index) => {
    const colors = ["blue", "green", "red", "secondary"];
    return colors[index % colors.length];
};

// KPI Card Component
const KPICard = ({ item, index }) => (
    <SwiperSlide key={`kpi-${index}`}>
        <div className={`card card-box ${getBgColorClass(index)}`}>
            <div className="back-image">
                {BG_SVG_PATTERN}
            </div>
            <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                <div className="d-flex align-items-center">
                    <div className="card-box-icon me-2">
                        {getIcon(index)}
                    </div>
                    <div>
                        <h4 className="fs-15 font-w600 mb-0">
                            {item.name}
                            <br />
                            User
                        </h4>
                    </div>
                </div>
                <div className="chart-num">
                    <h2 className="font-w600 mb-0 fs-28">{formatNumber(item.value)}</h2>
                </div>
            </div>
        </div>
    </SwiperSlide>
);

const KPICardMemo = React.memo(KPICard);


// User Avatar Helper
const getUserInitials = (firstName = "", lastName = "", username = "") => {
    const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    return initials || username?.charAt(0).toUpperCase();
};

// User Status Badge Component
const UserStatusBadge = ({ hasExpiry, isActive }) => {
    if (!hasExpiry) {
        return (
            <span className="modern-status-badge status-inactive-modern">
                <i className="fa-solid fa-circle-pause"></i>
                Inactive
            </span>
        );
    }
    if (isActive) {
        return (
            <span className="modern-status-badge status-active-modern">
                <i className="fa-solid fa-circle-check"></i>
                Active
            </span>
        );
    }
    return (
        <span className="modern-status-badge status-expired-modern">
            <i className="fa-solid fa-circle-exclamation"></i>
            Expired
        </span>
    );
};

const AddUserModal = ({ showModal, setShowModal, editId, setEditId }) => {
    const isEdit = !!editId;
    const dispatch = useDispatch();
    const editUrl = `${URLS.USER_GET_BY_ID_URL}/${editId}`;
    const editData = useAsync(editUrl, isEdit);
    const tableData = editData?.data?.data;

    const roleData = useAsync(URLS.USER_ROLE_URL);
    const roleOptions = roleData?.data?.data;
    const countryData = useAsync(URLS.COUNTRY_URL);
    const countryOptions = countryData?.data?.data;
    const languageData = useAsync(URLS.LANGUAGE_URL);
    const languageOptions = languageData?.data?.data;

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            phone: "",
            firstName: "",
            secondName: "",
            role: null,
            country: null,
            language: null,
            address: "",
            fromDate: null,
            toDate: null,
        },
        onSubmit: async (values, { resetForm }) => {
            let postData = {
                username: values.username,
                email: values.email,
                phone: values.phone,
                first_name: values.firstName,
                last_name: values.secondName,
                role_id: values.role?.value,
                country_id: values?.country?.value,
                language: values.language?.value,
                address: values.address,
                start_date: formatDate(values.fromDate),
                end_date: formatDate(values.toDate),
            };

            if (!isEdit) {
                postData = {
                    ...postData,
                    password: values.password,
                    c_password: values.password,
                };
            }

            try {
                if (isEdit) {
                    await axiosPut(buildApiUrl(`${URLS.USER_UPDATE_URL}/${editId}`), postData);
                } else {
                    await axiosPost(buildApiUrl(URLS.REGISTER_URL), postData);
                }
                dispatch(FormAction.setRefresh());
                resetForm();
                setShowModal(false);
                setEditId("");
                notifyCreate(values.username, isEdit);
            } catch (err) {
                console.error("User submit error", err);
                notifyError(err);
            }
        },
    });

    useEffect(() => {
        if (isEdit && tableData) {
            const role = tableData.roles?.[0];
            formik.setValues({
                username: tableData.username || "",
                email: tableData.email || "",
                phone: tableData.phone || "",
                firstName: tableData.first_name || "",
                secondName: tableData.last_name || "",
                role: role ? { label: role.name, value: role.id } : null,
                country: tableData.country ? { label: tableData.country.name, value: tableData.country.id } : null,
                language: tableData.language_name ? { label: tableData.language_name, value: tableData.language } : null,
                address: tableData.address || "",
                fromDate: tableData.start_date || null,
                toDate: tableData.end_date || null,
            });
        }
    }, [tableData, isEdit]);

    return (
        <CustomModal
            showModal={showModal}
            title={`${isEdit ? "Edit" : "Add"} User`}
            handleModalClose={() => {
                setShowModal(false);
                setEditId("");
            }}
        >
            <form onSubmit={formik.handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-2">
                        <InputField label="User Name" name="username" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} />
                    </div>
                    {!isEdit && (
                        <div className="col-md-6 mb-2">
                            <InputField label="Password" name="password" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} />
                        </div>
                    )}
                    <div className="col-md-6 mb-2">
                        <InputField label="First Name" name="firstName" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <InputField label="Last Name" name="secondName" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <InputField label="Phone" name="phone" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <InputField label="Email" name="email" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <InputField label="Address" name="address" onChange={formik.handleChange} onBlur={formik.handleBlur} values={formik.values} isTextarea />
                    </div>
                    <div className="col-md-6 mb-2">
                        <ReactSelect label="Staff Role" options={roleOptions} optionLabel="name" optionValue="id" value={formik.values.role} onChange={(selected) => formik.setFieldValue("role", selected)} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <ReactSelect label="Country" options={countryOptions} optionLabel="name" optionValue="id" value={formik.values.country} onChange={(selected) => formik.setFieldValue("country", selected)} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <ReactSelect label="Language" options={languageOptions} optionLabel="language" optionValue="id" value={formik.values.language} onChange={(selected) => formik.setFieldValue("language", selected)} />
                    </div>
                    <div className="col-md-6 m-b30">
                        <CustomDatePicker label="From Date" selected={formik.values?.fromDate} onChange={(date) => formik.setFieldValue("fromDate", date)} />
                    </div>
                    <div className="col-md-6 m-b30">
                        <CustomDatePicker label="To Date" selected={formik.values?.toDate} onChange={(date) => formik.setFieldValue("toDate", date)} />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-4">
                    {`${isEdit ? "Edit" : "Add"} User`}
                </button>
            </form>
        </CustomModal>
    );
};

// User Table Row Component
const UserTableRow = ({ item, navigate, getRoleBadgeClass, handleEdit, handleResetPassword, handleDelete, isAdmin }) => {
    const userInitials = getUserInitials(item.first_name, item.last_name, item.username);
    const isActive = dateComparison(item.end_date);
    const hasExpiry = item.end_date && item.end_date !== 'No Expiry';

    return (
        <tr>
            <td>
                <div className="user-info-cell">
                    <div className="user-avatar">{userInitials}</div>
                    <div className="user-text-info">
                        <h6>{item.first_name || item.username}</h6>
                        <span>{item.email}</span>
                    </div>
                </div>
            </td>
            <td>
                <span className={getRoleBadgeClass(item?.roles?.[0]?.name)}>
                    {item?.roles?.[0]?.name || 'N/A'}
                </span>
            </td>
            <td>{item.start_date || 'N/A'}</td>
            <td>{item.end_date || 'No Expiry'}</td>
            <td>
                <UserStatusBadge hasExpiry={hasExpiry} isActive={isActive} />
            </td>
            <td>
                <div className="action-buttons-modern">
                    <button 
                        className="action-icon-btn" 
                        onClick={() => handleEdit(item.id)}
                        title="Edit"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                        className="action-icon-btn"
                        onClick={() => navigate(item.id)}
                        title="View"
                    >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                    <Dropdown>
                        <Dropdown.Toggle as="div" className="modern-dropdown-toggle">
                            <i className="fa-solid fa-ellipsis"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu-end">
                            <Dropdown.Item onClick={() => handleResetPassword(item.username)}>
                                <i className="fa-solid fa-key me-2"></i>Reset Password
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(item.id, item.username)} className="text-danger">
                                <i className="fa-solid fa-trash me-2"></i>Delete
                            </Dropdown.Item>
                            {isAdmin && (
                                <Dropdown.Item>
                                    <i className="fa-solid fa-toggle-on me-2"></i>
                                    {item.icontext === "Active" ? "Deactivate" : "Activate"}
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </td>
        </tr>
    );
};

const User = () => {
    const navigate = useNavigate();
    const userData = useAsync(URLS.USER_GET_URL);
    const tableData = userData?.data?.data;
    const isLoading = userData?.loading;

    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editId, setEditId] = useState("");
    const [resetUsername, setResetUsername] = useState("");
    const [deleteUrl, setDeleteUrl] = useState("");
    const [deleteName, setDeleteName] = useState("");
    const [showRoleModal, setShowRoleModal] = useState(false);

    const sort = 8;
    const activePag = useRef(0);
    const isAdmin = useSelector((state) => state.auth.auth.data.is_super_admin);

    useEffect(() => {
        setData(document.querySelectorAll("#example2_wrapper tbody tr"));
    }, [tableData]);

    const toggleTableRowVisibility = useCallback((startIndex, endIndex) => {
        data.forEach((row, index) => {
            if (index >= startIndex && index < endIndex) {
                row.classList.remove("d-none");
            } else {
                row.classList.add("d-none");
            }
        });
    }, [data]);

    useEffect(() => {
        if (data.length > 0) {
            toggleTableRowVisibility(0, sort);
        }
    }, [data, sort, toggleTableRowVisibility]);

    const pagination = useMemo(() => {
        return Array(Math.ceil(data.length / sort))
            .fill()
            .map((_, i) => i + 1);
    }, [data.length, sort]);

    const handlePageChange = useCallback((pageIndex) => {
        activePag.current = pageIndex;
        toggleTableRowVisibility(pageIndex * sort, (pageIndex + 1) * sort);
    }, [sort, toggleTableRowVisibility]);

    const kpiCards = useMemo(() => {
        if (!tableData?.data) return [];
        const activeCount = tableData.data.filter(item => dateComparison(item.end_date)).length;
        const inactiveCount = tableData.data.filter(item => !dateComparison(item.end_date)).length;
        return [
            { name: "Total Users", value: tableData.data.length || "0" },
            { name: "Active Users", value: activeCount || "0" },
            { name: "Expired Users", value: inactiveCount || "0" },
            { name: "Role Types", value: "6" },
        ];
    }, [tableData?.data]);

    const handleEdit = useCallback((id) => {
        setEditId(id);
        setShowModal(true);
    }, []);

    const handleResetPassword = useCallback((username) => {
        setResetUsername(username);
        setShowResetModal(true);
    }, []);

    const handleDelete = useCallback((id, username) => {
        setDeleteUrl(`${URLS.USER_DELETE_URL}/${id}`);
        setDeleteName(username);
        setShowDeleteModal(true);
    }, []);

    const ROLE_BADGE_MAP = useMemo(() => ({
        'Super Admin': 'role-badge-super-admin',
        'Senior Tour Consultant': 'role-badge-senior',
        'Manager': 'role-badge-manager',
    }), []);

    const getRoleBadgeClass = useCallback((roleName) => {
        return ROLE_BADGE_MAP[roleName] || 'role-badge-default';
    }, [ROLE_BADGE_MAP]);

    return (
        <>
            <style>{`
                .modern-user-table {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .modern-user-table table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin-bottom: 0;
                }

                .modern-user-table thead th {
                    background: #F9FAFB;
                    padding: 16px 20px;
                    text-align: left;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6B7280;
                    border-bottom: 1px solid #E5E7EB;
                    white-space: nowrap;
                }

                .modern-user-table tbody tr {
                    border-bottom: 1px solid #F3F4F6;
                    transition: background-color 0.2s;
                }

                .modern-user-table tbody tr:last-child {
                    border-bottom: none;
                }

                .modern-user-table tbody tr:hover {
                    background-color: #F9FAFB;
                }

                .modern-user-table tbody td {
                    padding: 16px 20px;
                    font-size: 14px;
                    color: #1F2937;
                    vertical-align: middle;
                }

                .user-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 15px;
                    flex-shrink: 0;
                }

                .user-text-info h6 {
                    margin: 0 0 2px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1F2937;
                }

                .user-text-info span {
                    font-size: 13px;
                    color: #6B7280;
                    display: block;
                }

                .role-badge-super-admin {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    background: #DBEAFE;
                    color: #1E40AF;
                }

                .role-badge-senior {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    background: #D1FAE5;
                    color: #065F46;
                }

                .role-badge-manager {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    background: #E0E7FF;
                    color: #5B21B6;
                }

                .role-badge-default {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    background: #F3F4F6;
                    color: #4B5563;
                }

                .modern-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                }

                .status-active-modern {
                    background: #D1FAE5;
                    color: #065F46;
                }

                .status-expired-modern {
                    background: #FEE2E2;
                    color: #991B1B;
                }

                .status-inactive-modern {
                    background: #F3F4F6;
                    color: #4B5563;
                }

                .modern-status-badge i {
                    font-size: 12px;
                }

                .action-buttons-modern {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .action-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    border: 1px solid #E5E7EB;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #6B7280;
                    padding: 0;
                }

                .action-icon-btn:hover {
                    background: #F3F4F6;
                    border-color: #D1D5DB;
                }

                .action-icon-btn i {
                    font-size: 14px;
                }

                .modern-dropdown-toggle {
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 6px !important;
                    border: 1px solid #E5E7EB !important;
                    background: white !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    padding: 0 !important;
                }

                .modern-dropdown-toggle:hover {
                    background: #F3F4F6 !important;
                    border-color: #D1D5DB !important;
                }

                .modern-dropdown-toggle::after {
                    display: none !important;
                }

                .modern-dropdown-toggle i {
                    color: #6B7280;
                    font-size: 14px;
                }

                .pagination-wrapper-modern {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #F3F4F6;
                }

                .pagination-info-modern {
                    font-size: 14px;
                    color: #6B7280;
                }

                .pagination-buttons-modern {
                    display: flex;
                    gap: 4px;
                }

                .pagination-btn-modern {
                    padding: 8px 12px;
                    border: 1px solid #E5E7EB;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #374151;
                    transition: all 0.2s;
                    min-width: 40px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .pagination-btn-modern:hover:not(.disabled):not(.current) {
                    background: #F3F4F6;
                    color: #374151;
                    text-decoration: none;
                }

                .pagination-btn-modern.current {
                    background: #3B82F6;
                    color: white;
                    border-color: #3B82F6;
                }

                .pagination-btn-modern.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="row">
                <div className="col-xl-12">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="page-titles">
                                <div className="d-flex align-items-center">
                                    <h2 className="heading">User</h2>
                                </div>
                                <div className="d-flex flex-wrap my-2 my-sm-0">
                                    <div className="input-group search-area">
                                        <input type="text" className="form-control" placeholder="Search here..." />
                                        <span className="input-group-text">
                                            <Link to={"#"}>
                                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.3" d="M16.6751 19.4916C16.2194 19.036 16.2194 18.2973 16.6751 17.8417C17.1307 17.3861 17.8694 17.3861 18.325 17.8417L22.9916 22.5084C23.4473 22.964 23.4473 23.7027 22.9916 24.1583C22.536 24.6139 21.7973 24.6139 21.3417 24.1583L16.6751 19.4916Z" fill="white" />
                                                    <path d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z" fill="white" />
                                                </svg>
                                            </Link>
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            className="btn btn-primary d-flex align-items-center justify-content-center"
                                            style={{ width: '48px', height: '48px', padding: 0 }}
                                            onClick={() => setShowRoleModal(true)}
                                            title="Manage Roles"
                                        >
                                            <i className="fa-solid fa-user-shield fs-18"></i>
                                        </button>
                                        <div className="invoice-btn" onClick={() => setShowModal(true)}>
                                            <button className="btn btn-primary">
                                                New User{" "}
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 3C7.05 3 3 7.05 3 12C3 16.95 7.05 21 12 21C16.95 21 21 16.95 21 12C21 7.05 16.95 3 12 3ZM12 19.125C8.1 19.125 4.875 15.9 4.875 12C4.875 8.1 8.1 4.875 12 4.875C15.9 4.875 19.125 8.1 19.125 12C19.125 15.9 15.9 19.125 12 19.125Z" fill="#FCFCFC" />
                                                    <path d="M16.3498 11.0251H12.9748V7.65009C12.9748 7.12509 12.5248 6.67509 11.9998 6.67509C11.4748 6.67509 11.0248 7.12509 11.0248 7.65009V11.0251H7.6498C7.1248 11.0251 6.6748 11.4751 6.6748 12.0001C6.6748 12.5251 7.1248 12.9751 7.6498 12.9751H11.0248V16.3501C11.0248 16.8751 11.4748 17.3251 11.9998 17.3251C12.5248 17.3251 12.9748 16.8751 12.9748 16.3501V12.9751H16.3498C16.8748 12.9751 17.3248 12.5251 17.3248 12.0001C17.3248 11.4751 16.8748 11.0251 16.3498 11.0251Z" fill="#FCFCFC" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-0">
                        {kpiCards.map((item, index) => (
                            <div key={`kpi-${index}`} className="col-xl-3 col-lg-6 col-md-6">
                                <div className={`card card-box ${getBgColorClass(index)}`}>
                                    <div className="back-image">
                                        {BG_SVG_PATTERN}
                                    </div>
                                    <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                                        <div className="d-flex align-items-center">
                                            <div className="card-box-icon me-2">
                                                {getIcon(index)}
                                            </div>
                                            <div>
                                                <h4 className="fs-15 font-w600 mb-0">
                                                    {item.name}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="chart-num">
                                            <h2 className="font-w600 mb-0 fs-28">{formatNumber(item.value)}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="row mt-0">
                        <div className="col-xl-12">
                            <div className="modern-user-table" id="example2_wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Join Date</th>
                                            <th>Expiry</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5">
                                                    <NoData isLoading={isLoading} />
                                                </td>
                                            </tr>
                                        ) : (
                                            tableData?.data?.map((item) => (
                                                <UserTableRow 
                                                    key={item.id}
                                                    item={item}
                                                    navigate={navigate}
                                                    getRoleBadgeClass={getRoleBadgeClass}
                                                    handleEdit={handleEdit}
                                                    handleResetPassword={handleResetPassword}
                                                    handleDelete={handleDelete}
                                                    isAdmin={isAdmin}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <div className="pagination-wrapper-modern">
                                    <div className="pagination-info-modern">
                                        Showing {activePag.current * sort + 1} to{" "}
                                        {data.length > (activePag.current + 1) * sort ? (activePag.current + 1) * sort : data.length} of {data.length} entries
                                    </div>
                                    <div className="pagination-buttons-modern">
                                        <Link 
                                            className={`pagination-btn-modern ${activePag.current === 0 ? 'disabled' : ''}`}
                                            to="#"
                                            onClick={() => activePag.current > 0 && handlePageChange(activePag.current - 1)}
                                        >
                                            <i className="fa-solid fa-angle-left"></i>
                                        </Link>
                                        <span>
                                            {pagination.map((number, i) => (
                                                <Link 
                                                    key={i} 
                                                    to="#" 
                                                    className={`pagination-btn-modern ${activePag.current === i ? 'current' : ''}`}
                                                    onClick={() => handlePageChange(i)}
                                                >
                                                    {number}
                                                </Link>
                                            ))}
                                        </span>
                                        <Link 
                                            className={`pagination-btn-modern ${activePag.current + 1 >= pagination.length ? 'disabled' : ''}`}
                                            to="#"
                                            onClick={() => activePag.current + 1 < pagination.length && handlePageChange(activePag.current + 1)}
                                        >
                                            <i className="fa-solid fa-angle-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddUserModal showModal={showModal} setShowModal={setShowModal} editId={editId} setEditId={setEditId} />
            <ResetPassword showModal={showResetModal} setShowModal={setShowResetModal} username={resetUsername} setUsername={setResetUsername} />
            <DeleteModal showModal={showDeleteModal} setShowModal={setShowDeleteModal} name={deleteName} url={deleteUrl} method="GET" />
            <UserRole showModal={showRoleModal} setShowModal={setShowRoleModal} />
        </>
    );
};

export default User;