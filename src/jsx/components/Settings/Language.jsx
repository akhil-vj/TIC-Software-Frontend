import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import CustomModal from "../../layouts/CustomModal";
import InputField from "../common/InputField";
import { useAsync } from "../../utilis/useAsync";
import { axiosPost, axiosPut } from "../../../services/AxiosInstance";
import { URLS } from "../../../constants";
import { FormAction } from "../../../store/slices/formSlice";
import { notifyCreate, notifyError } from "../../utilis/notifyMessage";
import DeleteModal from "../common/DeleteModal";
import NoData from "../common/NoData";

const AddLanguageModal = ({ setShowModal, showModal, editId, setEditId }) => {
    const dispatch = useDispatch();
    const isEdit = !!editId;
    const editUrl = `${URLS.LANGUAGE_URL}/${editId}`;
    const editData = useAsync(editUrl, isEdit);

    const formik = useFormik({
        initialValues: {
            language: "",
            slug: "",
        },
        onSubmit: async (values) => {
            try {
                let response;
                if (isEdit) {
                    response = await axiosPut(editUrl, values);
                } else {
                    response = await axiosPost(URLS.LANGUAGE_URL, values);
                }
                if (response?.success) {
                    dispatch(FormAction.setRefresh());
                    notifyCreate("Language", isEdit);
                    setShowModal(false);
                    setEditId("");
                    formik.resetForm();
                }
            } catch (error) {
                notifyError("Something went wrong");
            }
        },
    });

    useEffect(() => {
        const record = editData?.data?.data;
        if (record && isEdit) {
            formik.setValues({
                language: record.language || "",
                slug: record.slug || "",
            });
        }
        return () => {
            formik.resetForm();
        };
    }, [editId, editData?.loading]);

    return (
        <CustomModal
            showModal={showModal}
            title={`${isEdit ? "Edit" : "Add"} Language`}
            handleModalClose={() => {
                setShowModal(false);
                setEditId("");
                formik.resetForm();
            }}
        >
            <div className="card-body">
                <div className="basic-form">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row">
                            <div className="mb-3 col-md-6">
                                <InputField
                                    label="Language"
                                    name="language"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    values={formik.values}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <InputField
                                    label="Slug (e.g. en, ms, ar)"
                                    name="slug"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    values={formik.values}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {isEdit ? "Update" : "Add"} Language
                        </button>
                    </form>
                </div>
            </div>
        </CustomModal>
    );
};

const Language = () => {
    const url = URLS.LANGUAGE_URL;
    const asyncData = useAsync(url);
    const tableData = asyncData?.data?.data;
    const isLoading = asyncData?.loading;

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUrl, setDeleteUrl] = useState("");
    const [deleteName, setDeleteName] = useState("");

    const handleEdit = (id) => {
        setEditId(id);
        setShowModal(true);
    };

    const onDelete = (id, name) => {
        setDeleteUrl(`${url}/${id}`);
        setDeleteName(name);
        setShowDeleteModal(true);
    };

    return (
        <>
            <div className="row">
                <div className="col-xl-12">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="page-titles">
                                <div className="d-flex align-items-center">
                                    <h2 className="heading">Language</h2>
                                </div>
                                <div className="d-flex flex-wrap my-2 my-sm-0">
                                    <div className="invoice-btn">
                                        <button
                                            onClick={() => {
                                                setEditId("");
                                                setShowModal(true);
                                            }}
                                            className="btn btn-primary"
                                        >
                                            New Language{" "}
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
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="table-responsive full-data dataTables_wrapper" id="example2_wrapper">
                                <table className="table-responsive-lg table display mb-4 dataTablesCard text-black dataTable no-footer" id="example2">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Sl No</th>
                                            <th>Language</th>
                                            <th>Slug</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="text-center">Loading...</td>
                                            </tr>
                                        ) : tableData?.length ? (
                                            tableData.map((item, ind) => (
                                                <tr key={item.id}>
                                                    <td className="text-center">{ind + 1}</td>
                                                    <td>{item.language}</td>
                                                    <td>{item.slug}</td>
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
                                                                <Dropdown.Item onClick={() => handleEdit(item.id)}>
                                                                    Edit
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => onDelete(item.id, item.language)}>
                                                                    Delete
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4}>
                                                    <NoData />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddLanguageModal showModal={showModal} setShowModal={setShowModal} editId={editId} setEditId={setEditId} />
            <DeleteModal showModal={showDeleteModal} setShowModal={setShowDeleteModal} name={deleteName} url={deleteUrl} />
        </>
    );
};

export default Language;
