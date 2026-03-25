import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import CustomModal from "../../../layouts/CustomModal";
import InputField from "../../common/InputField";
import ReactSelect from "../../common/ReactSelect";
import { useAsync } from "../../../utilis/useAsync";
import { axiosPost, axiosPut } from "../../../../services/AxiosInstance";
import { URLS } from "../../../../constants";
import { FormAction } from "../../../../store/slices/formSlice";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import ConfirmationModal from "../../common/DeleteModal";
import NoData from "../../common/NoData";

const currencyOptions = [
    { label: "US Dollar (USD)", value: "US Dollar", code: "USD", symbol: "$" },
    { label: "Euro (EUR)", value: "Euro", code: "EUR", symbol: "€" },
    { label: "British Pound (GBP)", value: "British Pound", code: "GBP", symbol: "£" },
    { label: "Indian Ruppee (INR)", value: "Indian Ruppee", code: "INR", symbol: "₹" },
    { label: "Malaysian Ringgit (MYR)", value: "Malaysian Ringgit", code: "MYR", symbol: "RM" },
    { label: "Thai Baht (THB)", value: "Thai Baht", code: "THB", symbol: "฿" },
    { label: "Singapore Dollar (SGD)", value: "Singapore Dollar", code: "SGD", symbol: "S$" },
    { label: "Indonesian Rupiah (IDR)", value: "Indonesian Rupiah", code: "IDR", symbol: "Rp" },
    { label: "Philippine Peso (PHP)", value: "Philippine Peso", code: "PHP", symbol: "₱" },
    { label: "Japanese Yen (JPY)", value: "Japanese Yen", code: "JPY", symbol: "¥" },
    { label: "Chinese Yuan (CNY)", value: "Chinese Yuan", code: "CNY", symbol: "¥" },
    { label: "Australian Dollar (AUD)", value: "Australian Dollar", code: "AUD", symbol: "A$" },
    { label: "Canadian Dollar (CAD)", value: "Canadian Dollar", code: "CAD", symbol: "C$" },
    { label: "UAE Dirham (AED)", value: "UAE Dirham", code: "AED", symbol: "د.إ" },
    { label: "South Korean Won (KRW)", value: "South Korean Won", code: "KRW", symbol: "₩" },
    { label: "New Zealand Dollar (NZD)", value: "New Zealand Dollar", code: "NZD", symbol: "NZ$" },
    { label: "Swiss Franc (CHF)", value: "Swiss Franc", code: "CHF", symbol: "CHF" },
    { label: "Hong Kong Dollar (HKD)", value: "Hong Kong Dollar", code: "HKD", symbol: "HK$" },
    { label: "Saudi Riyal (SAR)", value: "Saudi Riyal", code: "SAR", symbol: "ر.س" },
    { label: "Qatari Riyal (QAR)", value: "Qatari Riyal", code: "QAR", symbol: "ر.ق" },
    { label: "Kuwaiti Dinar (KWD)", value: "Kuwaiti Dinar", code: "KWD", symbol: "د.ك" },
    { label: "Bahraini Dinar (BHD)", value: "Bahraini Dinar", code: "BHD", symbol: ".د.ب" },
    { label: "Omani Rial (OMR)", value: "Omani Rial", code: "OMR", symbol: "ر.ع." },
    { label: "South African Rand (ZAR)", value: "South African Rand", code: "ZAR", symbol: "R" },
    { label: "Turkish Lira (TRY)", value: "Turkish Lira", code: "TRY", symbol: "₺" },
    { label: "Russian Ruble (RUB)", value: "Russian Ruble", code: "RUB", symbol: "₽" },
    { label: "Brazilian Real (BRL)", value: "Brazilian Real", code: "BRL", symbol: "R$" },
    { label: "Mexican Peso (MXN)", value: "Mexican Peso", code: "MXN", symbol: "$" },
    { label: "Vietnamese Dong (VND)", value: "Vietnamese Dong", code: "VND", symbol: "₫" },
    { label: "Pakistani Rupee (PKR)", value: "Pakistani Rupee", code: "PKR", symbol: "₨" },
    { label: "Sri Lankan Rupee (LKR)", value: "Sri Lankan Rupee", code: "LKR", symbol: "Rs" },
    { label: "Bangladeshi Taka (BDT)", value: "Bangladeshi Taka", code: "BDT", symbol: "৳" },
];

const formatOptions = [
    { label: "Indian Standard (1,00,00,000)", value: "1,00,00,000" },
    { label: "International Standard (10,000,000)", value: "10,000,000" },

];

const AddModal = ({ setShowModal, showModal, editId, setEditId }) => {
    const dispatch = useDispatch();
    const isEdit = !!editId;
    const editUrl = `${URLS.CURRENCY_URL}/${editId}`;
    const editData = useAsync(editUrl, isEdit);

    const formik = useFormik({
        initialValues: {
            name: "",
            symbol: "",
            code: "",
            exchange_rate: "",
            currency_format: "",
            from_currency: "",
            to_currency: "",
        },
        onSubmit: async (values) => {
            try {
                let response;
                if (isEdit) {
                    response = await axiosPut(editUrl, values);
                } else {
                    response = await axiosPost(URLS.CURRENCY_URL, values);
                }
                if (response?.success) {
                    dispatch(FormAction.setRefresh());
                    notifyCreate("Currency", isEdit);
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
                name: record.name || "",
                symbol: record.symbol || "",
                code: record.code || "",
                exchange_rate: record.exchange_rate || "",
                currency_format: record.currency_format || "",
                from_currency: record.from_currency || "",
                to_currency: record.to_currency || "",
            });
        }
        return () => {
            formik.resetForm();
        };
    }, [editId, editData?.loading]);

    return (
        <CustomModal
            showModal={showModal}
            title={`${isEdit ? "Edit" : "Add"} Currency`}
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
                            <div className="mb-3 col-md-4">
                                <ReactSelect
                                    label="Name"
                                    name="name"
                                    placeholder="Select Name"
                                    options={currencyOptions}
                                    value={currencyOptions.find(opt => opt.value === formik.values.name)}
                                    onChange={(option) => {
                                        formik.setFieldValue("name", option.value);
                                        formik.setFieldValue("code", option.code);
                                        formik.setFieldValue("symbol", option.symbol);
                                    }}
                                    onBlur={formik.handleBlur}
                                    formik={formik}
                                    inputId="name"
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <InputField
                                    label="Symbol"
                                    name="symbol"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    values={formik.values}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <InputField
                                    label="Code"
                                    name="code"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    values={formik.values}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <ReactSelect
                                    label="From Currency"
                                    name="from_currency"
                                    placeholder="Select Currency"
                                    options={currencyOptions}
                                    value={currencyOptions.find(opt => opt.code === formik.values.from_currency)}
                                    onChange={(option) => formik.setFieldValue("from_currency", option.code)}
                                    onBlur={formik.handleBlur}
                                    formik={formik}
                                    inputId="from_currency"
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <ReactSelect
                                    label="To Currency"
                                    name="to_currency"
                                    placeholder="Select Currency"
                                    options={currencyOptions}
                                    value={currencyOptions.find(opt => opt.code === formik.values.to_currency)}
                                    onChange={(option) => formik.setFieldValue("to_currency", option.code)}
                                    onBlur={formik.handleBlur}
                                    formik={formik}
                                    inputId="to_currency"
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <InputField
                                    label="Exchange Rate"
                                    name="exchange_rate"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    values={formik.values}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-md-4">
                                <ReactSelect
                                    label="Currency Format"
                                    name="currency_format"
                                    placeholder="Select Format"
                                    options={formatOptions}
                                    value={formatOptions.find(opt => opt.value === formik.values.currency_format)}
                                    onChange={(option) => formik.setFieldValue("currency_format", option.value)}
                                    onBlur={formik.handleBlur}
                                    formik={formik}
                                    inputId="currency_format"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {isEdit ? "Update" : "Add"} Currency
                        </button>
                    </form>
                </div>
            </div>
        </CustomModal>
    );
};

const CurrencySettings = () => {
    const asyncData = useAsync(URLS.CURRENCY_URL);
    const tableData = asyncData?.data?.data;
    const isLoading = asyncData?.loading;
    const displayData = tableData || [];

    const [data, setData] = useState(
        document.querySelectorAll("#currency_table_wrapper tbody tr"),
    );
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState("");
    const [deleteUrl, setDeleteUrl] = useState("");
    const [deleteName, setDeleteName] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const sort = 8;
    const activePag = useRef(0);
    const chageData = (frist, sec) => {
        for (let i = 0; i < data.length; ++i) {
            if (i >= frist && i < sec) {
                data[i].classList.remove("d-none");
            } else {
                data[i].classList.add("d-none");
            }
        }
    };

    useEffect(() => {
        setData(document.querySelectorAll("#currency_table_wrapper tbody tr"));
    }, [tableData?.length]);

    activePag.current === 0 && chageData(0, sort);
    let paggination = Array(Math.ceil(data.length / sort))
        .fill()
        .map((_, i) => i + 1);

    const onClick = (i) => {
        activePag.current = i;
        chageData(activePag.current * sort, (activePag.current + 1) * sort);
    };

    const onDelete = (id, name) => {
        setDeleteUrl(`${URLS.CURRENCY_URL}/${id}`);
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
                                    <h2 className="heading">Currency Settings</h2>
                                </div>
                                <div className="d-flex flex-wrap my-2 my-sm-0">
                                    <div className="input-group search-area">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search here..."
                                        />
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
                                    </div>
                                    <div className="invoice-btn">
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="btn btn-primary"
                                        >
                                            New Currency
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

                    <div className="row">
                        <div className="col-xl-12">
                            <div
                                className="table-responsive  full-data dataTables_wrapper"
                                id="currency_table_wrapper"
                            >
                                <table
                                    className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer"
                                >
                                    <thead>
                                        <tr>
                                            <th className="text-center">Sl No</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Symbol</th>
                                            <th className="text-center">Code</th>
                                            <th className="text-center">From Currency</th>
                                            <th className="text-center">To Currency</th>
                                            <th className="text-center">Exchange Rate</th>
                                            <th className="text-center">Format</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData?.length ? (
                                            displayData.map((item, ind) => (
                                                <tr key={item.id || ind}>
                                                    <td className="text-center">{ind + 1}</td>
                                                    <td className="text-center">{item?.name || "-"}</td>
                                                    <td className="text-center">{item?.symbol || "-"}</td>
                                                    <td className="text-center">{item?.code || "-"}</td>
                                                    <td className="text-center">{item?.from_currency || "-"}</td>
                                                    <td className="text-center">{item?.to_currency || "-"}</td>
                                                    <td className="text-center">{item?.exchange_rate || "-"}</td>
                                                    <td className="text-center">
                                                        {formatOptions.find(opt => opt.value === item?.currency_format)?.label.split(" (")[0] || item?.currency_format || "-"}
                                                    </td>
                                                    <td>
                                                        <Dropdown>
                                                            <Dropdown.Toggle
                                                                as="div"
                                                                className="i-false btn-link btn sharp tp-btn btn-primary pill"
                                                            >
                                                                <svg
                                                                    width="20"
                                                                    height="20"
                                                                    viewBox="0 0 20 20"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M8.33319 9.99985C8.33319 10.9203 9.07938 11.6665 9.99986 11.6665C10.9203 11.6665 11.6665 10.9203 11.6665 9.99986C11.6665 9.07938 10.9203 8.33319 9.99986 8.33319C9.07938 8.33319 8.33319 9.07938 8.33319 9.99985Z"
                                                                        fill="#ffffff"
                                                                    />
                                                                    <path
                                                                        d="M8.33319 3.33329C8.33319 4.25376 9.07938 4.99995 9.99986 4.99995C10.9203 4.99995 11.6665 4.25376 11.6665 3.33329C11.6665 2.41282 10.9203 1.66663 9.99986 1.66663C9.07938 1.66663 8.33319 2.41282 8.33319 3.33329Z"
                                                                        fill="#ffffff"
                                                                    />
                                                                    <path
                                                                        d="M8.33319 16.6667C8.33319 17.5871 9.07938 18.3333 9.99986 18.3333C10.9203 18.3333 11.6665 17.5871 11.6665 16.6667C11.6665 15.7462 10.9203 15 9.99986 15C9.07938 15 8.33319 15.7462 8.33319 16.6667Z"
                                                                        fill="#ffffff"
                                                                    />
                                                                </svg>
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu className="dropdown-menu-end">
                                                                <Dropdown.Item
                                                                    onClick={() => {
                                                                        setEditId(item.id);
                                                                        setShowModal(true);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    onClick={() => onDelete(item.id, item.name)}
                                                                >
                                                                    Delete
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <NoData isLoading={isLoading} colSpan={9} />
                                        )}
                                    </tbody>
                                </table>
                                <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                                    <div className="dataTables_info">
                                        Showing {activePag.current * sort + 1} to{" "}
                                        {data.length > (activePag.current + 1) * sort
                                            ? (activePag.current + 1) * sort
                                            : data.length}{" "}
                                        of {data.length} entries
                                    </div>
                                    <div
                                        className="dataTables_paginate paging_simple_numbers mb-0"
                                    >
                                        <button
                                            className="paginate_button previous"
                                            onClick={() =>
                                                activePag.current > 0 && onClick(activePag.current - 1)
                                            }
                                        >
                                            <i className="fa-solid fa-angle-left"></i>
                                        </button>
                                        <span>
                                            {paggination.map((number, i) => (
                                                <button
                                                    key={i}
                                                    className={`paginate_button  ${activePag.current === i ? "current" : ""
                                                        } `}
                                                    onClick={() => onClick(i)}
                                                >
                                                    {number}
                                                </button>
                                            ))}
                                        </span>

                                        <button
                                            className="paginate_button next"
                                            onClick={() =>
                                                activePag.current + 1 < paggination.length &&
                                                onClick(activePag.current + 1)
                                            }
                                        >
                                            <i className="fa-solid fa-angle-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddModal
                showModal={showModal}
                setShowModal={setShowModal}
                editId={editId}
                setEditId={setEditId}
            />
            <ConfirmationModal
                showModal={showDeleteModal}
                setShowModal={setShowDeleteModal}
                url={deleteUrl}
                name={deleteName}
            />
        </>
    );
};
export default CurrencySettings;
