import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Dropdown } from "react-bootstrap";

import EnquirySlider from "../../Dashboard/EnquirySlider";
import QuestionIcon from "../../Dashboard/Ticketing/QuestionIcon";
import SelectField from "../../common/SelectField";
import { useSelector } from "react-redux";
import notify from "../../common/Notify";
import InputField from "../../common/InputField";
import { Formik, useFormik } from "formik";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { axiosPost, axiosPut } from "../../../../services/AxiosInstance";

const RightIcon = () => {
  return (
    <>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.50912 14.5C5.25012 14.5 4.99413 14.4005 4.80013 14.2065L1.79362 11.2C1.40213 10.809 1.40213 10.174 1.79362 9.78302C2.18512 9.39152 2.81913 9.39152 3.21063 9.78302L5.62812 12.2005L12.9306 7.18802C13.3866 6.87502 14.0106 6.99102 14.3236 7.44702C14.6371 7.90352 14.5211 8.52702 14.0646 8.84052L6.07613 14.324C5.90363 14.442 5.70612 14.5 5.50912 14.5Z"
          fill="#1EBA62"
        />
        <path
          d="M5.50912 8.98807C5.25012 8.98807 4.99413 8.88857 4.80013 8.69457L1.79362 5.68807C1.40213 5.29657 1.40213 4.66207 1.79362 4.27107C2.18512 3.87957 2.81913 3.87957 3.21063 4.27107L5.62812 6.68857L12.9306 1.67607C13.3866 1.36307 14.0106 1.47907 14.3236 1.93507C14.6371 2.39157 14.5211 3.01507 14.0646 3.32857L6.07613 8.81257C5.90363 8.93057 5.70612 8.98807 5.50912 8.98807Z"
          fill="#1EBA62"
        />
      </svg>
    </>
  );
};

const tableData1 = [
  "dashboard",
  "leads",
  "enquiry",
  "follow ups",
  "tickets",
  "works",
  "finance",
  "mails",
  "settings",
];

const Permission = () => {

  const { id } = useParams()
  let isEdit = !!id
  const url = URLS.USER_ROLE_URL
  const editUrl = `${url}/${id}`
  const editData = useAsync(editUrl, isEdit)
  const permissionData = useAsync(URLS.PERMISSION_URL)
  const tableData = permissionData?.data?.data

  // console.log('dat', tableData)
  const navigate = useNavigate();
  // const roleData = useSelector((data) => data.form);
  const [data, setData] = useState(
    document.querySelectorAll("#example2_wrapper tbody tr"),
  );
  const [showModal, setShowModal] = useState(false);
  const [myObject, setMyObject] = useState({});

  const initialValues = {
    name: '',
    permissions: [],
    permissionObj: {}
  };
  const formik = useFormik({ initialValues: initialValues })

  const sort = 8;
  const activePag = useRef(0);
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };
  // use effect
  useEffect(() => {
    setData(document.querySelectorAll("#example2_wrapper tbody tr"));
    //chackboxFun();
  }, []);

  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  // paggination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  // Active paggination & chage data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    //settest(i);
  };

  const chackbox = document.querySelectorAll(".sorting_1 input");
  const motherChackBox = document.querySelector(".sorting_asc input");
  const chackboxFun = (type) => {
    for (let i = 0; i < chackbox.length; i++) {
      const element = chackbox[i];
      if (type === "all") {
        if (motherChackBox.checked) {
          element.checked = true;
        } else {
          element.checked = false;
        }
      } else {
        if (!element.checked) {
          motherChackBox.checked = false;
          break;
        } else {
          motherChackBox.checked = true;
        }
      }
    }
  };
  const sliderArr = [
    { name: "Total", value: "8" },
    { name: "Active", value: "6" },
    { name: "Inactive", value: "2" },
    { name: "Type", value: "6" },
  ];
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const permission = ["read", "write", "update", "delete"];
  const permissionOption = [
    "None",
    "All",
    "Added",
    "Assigned",
    "Added and Assigned",
  ];
  const readPermissionOption = ["All", "Added", "None"];
  const handleSubmit = async () => {
    try {
      let response;
      const values = formik.values

      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('is_active', 1)
      formData.append('sync', 1)
      formData.append('description', 'description')
      Object.values(values.permissionObj).forEach((item, i) => {
        if (item !== 'none') {
          formData.append(`permissions[${i}]`, item)
        }
      })

      if (isEdit) {
        response = await axiosPut(editUrl, formData);
      } else {
        response = await axiosPost(url, formData);
      }
      if (response.success) {
        // dispatch(FormAction.setRefresh());
        // formik.setFieldValue("name", "");
        navigate("/user-role");
        notifyCreate('User Role', isEdit)
      }
    } catch (error) {
      // console.log(error);
      notifyError(error)
    }

  };



  const onChange = (e, name) => {
    const val = e.target.value
    const prev = formik.values.permissions
    // setMyObject((prevState) => ({
    //   ...prevState,
    //   [name]: val,
    // }));
    let permissionObj = {
      ...formik.values.permissionObj,
      [name]: val
    }
    formik.setFieldValue('permissionObj', permissionObj)

  }


  const orderPermission = (data) => {

    // const order = permissionOption.map((option => data.find(item => item.name === option)))
    const orderedArr = permissionOption.map((name) => {
      const matchingItem = data.find((item) => item.name === name);
      return matchingItem ? { ...matchingItem } : { id: 'none', name: 'None' };
    });

    // console.log('order', orderedArr)
    return orderedArr
  }

  useEffect(() => {
    const value = editData?.data?.data
    if (value) {
      const permission = value?.permissions?.reduce((acc, item) => {
        const menu = item.slug.split('-').slice(0, 2).join('-')
        acc[menu] = item.id;
        return acc;
      }, {});
      const obj = {
        name: value.name,
        permissionObj: permission
      }
      formik.setValues(obj)
    }


    return () => {

    }
  }, [editData?.data?.data?.id])

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-titles">
                <div className="d-flex align-items-center">
                  <h2 className="heading">{isEdit ? "Edit" : "Add"} role</h2>
                </div>
                <div className="d-flex flex-wrap my-2 my-sm-0">
                  {/* <div className="input-group search-area">
                                        <input type="text" className="form-control" placeholder="Search here..." />
                                        <span className="input-group-text">
                                            <Link to={"#"}>
                                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.3" d="M16.6751 19.4916C16.2194 19.036 16.2194 18.2973 16.6751 17.8417C17.1307 17.3861 17.8694 17.3861 18.325 17.8417L22.9916 22.5084C23.4473 22.964 23.4473 23.7027 22.9916 24.1583C22.536 24.6139 21.7973 24.6139 21.3417 24.1583L16.6751 19.4916Z" fill="white"/>
                                                    <path d="M12.8333 18.6667C16.055 18.6667 18.6667 16.055 18.6667 12.8334C18.6667 9.61169 16.055 7.00002 12.8333 7.00002C9.61166 7.00002 6.99999 9.61169 6.99999 12.8334C6.99999 16.055 9.61166 18.6667 12.8333 18.6667ZM12.8333 21C8.323 21 4.66666 17.3437 4.66666 12.8334C4.66666 8.32303 8.323 4.66669 12.8333 4.66669C17.3436 4.66669 21 8.32303 21 12.8334C21 17.3437 17.3436 21 12.8333 21Z" fill="white"/>
                                                </svg>
                                            </Link>
                                        </span>
                                    </div> */}
                  <div className="invoice-btn">
                    <button
                      onClick={() => handleSubmit()}
                      className="btn btn-primary"
                    >
                      Submit
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
          {/* swiper */}
          {/* <EnquirySlider title='Permission' array={sliderArr}/> */}
          {/* swiper end */}
          <div className="row">
            <div className="col-xl-4">
              <div className="mb-2">
                <InputField
                  label="Name"
                  name="name"
                  placeholder="Add User role name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                />
              </div>
            </div>
            <div className="col-xl-12">
              <div
                className="table-responsive  full-data dataTables_wrapper"
                id=""
              >
                <table
                  className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer"
                  id="example2"
                >
                  <thead>
                    <tr>
                      {/* <th className="sorting_asc ">
                                                <input type="checkbox" onClick={() => chackboxFun("all")} className="form-check-input" id="checkAll" required="" />
                                            </th> */}
                      <th className="">Module</th>
                      {permission.map((data) => (
                        <th className="" key={data}>
                          {data}
                        </th>
                      ))}

                      {/* <th className="text-end">Status</th> */}
                      {/* <th></th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((item, ind) => (
                      <tr key={ind}>
                        {/* <td className="sorting_1">
                                                    <div className="checkbox me-0 align-self-center">
                                                        <div className="custom-control custom-checkbox ">
                                                            <input type="checkbox" className="form-check-input" id={"customCheckBox2"+ ind} required="" 
                                                                onClick={() => chackboxFun()} 
                                                            />
                                                            <label className="custom-control-label" htmlFor={"customCheckBox2"+ ind} ></label>
                                                        </div>
                                                    </div>
                                                </td> */}
                        <td className="">{capitalizeFirstLetter(item?.name)}</td>
                        {/* {permission.map((data) => ( */}
                        <td>
                          <SelectField
                            // key={`${item.name}-${ind}-`}
                            // values={formik.values}
                            name={`${item?.name.toLowerCase()}-read`}
                            options={orderPermission(item?.permissions?.read)}
                            optionValue='id'
                            optionLabel='name'
                            selected='none'
                            values={formik.values.permissionObj}
                            formClass="w-50 mb-0"
                            selectClass="ms-0"
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-read`)}
                          />
                        </td>
                        <td>
                          <SelectField
                            // key={`${item.name}-${ind}-`}
                            // values={formik.values}
                            name={`${item?.name.toLowerCase()}-write`}
                            options={orderPermission(item?.permissions?.write)}
                            optionValue='id'
                            optionLabel='name'
                            selected='none'
                            values={formik.values.permissionObj}
                            formClass="w-50 mb-0"
                            selectClass="ms-0"
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-write`)}
                          />
                        </td>
                        <td>
                          <SelectField
                            // key={`${item.name}-${ind}-`}
                            // values={formik.values}
                            name={`${item?.name.toLowerCase()}-update`}
                            options={orderPermission(item?.permissions?.update)}
                            optionValue='id'
                            optionLabel='name'
                            selected='none'
                            values={formik.values.permissionObj}
                            formClass="w-50 mb-0"
                            selectClass="ms-0"
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-update`)}
                          />
                        </td>
                        <td>
                          <SelectField
                            // key={`${item.name}-${ind}-`}
                            // values={formik.values}
                            name={`${item?.name.toLowerCase()}-delete`}
                            options={orderPermission(item?.permissions?.delete)}
                            optionValue='id'
                            optionLabel='name'
                            selected='none'
                            values={formik.values.permissionObj}
                            formClass="w-50 mb-0"
                            selectClass="ms-0"
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-delete`)}
                          />
                        </td>
                        {/* ))} */}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                                    <div className="dataTables_info">
                                        Showing {activePag.current * sort + 1} to{" "}
                                        {data.length > (activePag.current + 1) * sort
                                            ? (activePag.current + 1) * sort
                                            : data.length}{" "}
                                        of {data.length} entries
                                    </div>
                                    <div
                                        className="dataTables_paginate paging_simple_numbers mb-0"
                                        id="example2_paginate"
                                    >
                                        <Link
                                            className="paginate_button previous disabled"
                                            to="/invoice"
                                            onClick={() =>
                                                activePag.current > 0 &&
                                                onClick(activePag.current - 1)
                                            }
                                            >
                                            <i className="fa-solid fa-angle-left"></i>
                                            
                                        </Link>
                                        <span>
                                            {paggination.map((number, i) => (
                                                <Link
                                                    key={i}
                                                    to="/invoice"
                                                    className={`paginate_button  ${
                                                        activePag.current === i ? "current" : ""
                                                    } `}
                                                    onClick={() => onClick(i)}
                                                >
                                                    {number}
                                                </Link>
                                            ))}
                                        </span>

                                        <Link
                                            className="paginate_button next"
                                            to="/invoice"
                                            onClick={() =>
                                                activePag.current + 1 < paggination.length &&
                                                onClick(activePag.current + 1)
                                            }
                                        >
                                            <i className="fa-solid fa-angle-right"></i>
                                        </Link>
                                    </div>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};
export default Permission;
