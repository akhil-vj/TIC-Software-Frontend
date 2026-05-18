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

// ── Color map for each permission value ──────────────────────────────────────
const permStyles = {
  "None":                 { background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0" },
  "All":                  { background: "#eff6ff", color: "#1e40af", border: "1px solid #93c5fd" },
  "Added":                { background: "#f0fdf4", color: "#166534", border: "1px solid #86efac" },
  "Assigned":             { background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74" },
  "Added and Assigned":   { background: "#faf5ff", color: "#6b21a8", border: "1px solid #d8b4fe" },
};

// ── Drop-in replacement for SelectField — color-coded select ─────────────────
const ColorSelect = ({ name, options, optionValue, optionLabel, values, onChange }) => {
  const currentId = values?.[name] || "none";
  const currentOption = options?.find(o => String(o[optionValue]) === String(currentId));
  const currentLabel = currentOption?.[optionLabel] || "None";
  const s = permStyles[currentLabel] || permStyles["None"];

  return (
    <div style={{ position: "relative", display: "inline-block", minWidth: "148px" }}>
      <select
        name={name}
        value={currentId}
        onChange={onChange}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: "100%",
          padding: "6px 26px 6px 10px",
          fontSize: "12px",
          fontWeight: "600",
          borderRadius: "6px",
          cursor: "pointer",
          outline: "none",
          ...s,
        }}
      >
        {options?.map((opt) => (
          <option key={opt[optionValue]} value={opt[optionValue]}>
            {opt[optionLabel]}
          </option>
        ))}
      </select>
      <span style={{
        position: "absolute", right: "8px", top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none",
        color: s.color, fontSize: "10px", lineHeight: 1,
      }}>▾</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

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
  "reports",
  "settings",
];

const Permission = () => {

  const { id } = useParams()
  let isEdit = !!id
  const url = URLS.USER_ROLE_URL
  const editUrl = `${url}/${id}`
  const editData = useAsync(editUrl, isEdit)
  const permissionData = useAsync(URLS.PERMISSION_URL)
  const allowedModules = ["dashboard", "leads", "enquiry", "follow ups", "tickets", "reports", "settings"];
  const tableData = permissionData?.data?.data?.filter(item => 
    allowedModules.includes(item?.name?.toLowerCase())
  )

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
    let permissionObj = {
      ...formik.values.permissionObj,
      [name]: val
    }
    formik.setFieldValue('permissionObj', permissionObj)

  }


  const orderPermission = (data) => {
    const orderedArr = permissionOption.map((name) => {
      const matchingItem = data.find((item) => item.name === name);
      return matchingItem ? { ...matchingItem } : { id: 'none', name: 'None' };
    });
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
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                  {isEdit ? "Edit Role" : "Add Role"}
                </h1>
              </div>
              <button
                onClick={() => handleSubmit()}
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "12px", 
                fontWeight: "600", 
                color: "#64748b",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Role Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter role name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className="form-control"
                style={{ 
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  padding: "10px 12px"
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-xl-12">
              <div
                className="table-responsive  full-data dataTables_wrapper"
                id=""
                style={{ borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              >
                <table
                  className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer"
                  id="example2"
                  style={{ tableLayout: "fixed", marginBottom: 0 }}
                >
                  <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e2e8f0" }}>
                    <tr>
                      <th className="" style={{ width: "12%", paddingLeft: "16px", paddingTop: "14px", paddingBottom: "14px", fontWeight: "600", color: "#475569", fontSize: "13px" }}>Module</th>
                      {permission.map((data) => (
                        <th className="" key={data} style={{ width: "22%", textAlign: "center", paddingTop: "14px", paddingBottom: "14px", fontWeight: "600", color: "#475569", fontSize: "13px" }}>
                          {data.charAt(0).toUpperCase() + data.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((item, ind) => (
                      <tr key={ind} style={{ 
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: ind % 2 === 0 ? "#ffffff" : "#fafbfc",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f4f8"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ind % 2 === 0 ? "#ffffff" : "#fafbfc"}
                      >
                        <td style={{ width: "12%", paddingLeft: "16px", paddingTop: "14px", paddingBottom: "14px", fontWeight: "500", color: "#1e293b" }}>
                          {capitalizeFirstLetter(item?.name)}
                        </td>

                        <td style={{ width: "22%", textAlign: "center", paddingTop: "10px", paddingBottom: "10px" }}>
                          <ColorSelect
                            name={`${item?.name.toLowerCase()}-read`}
                            options={orderPermission(item?.permissions?.read)}
                            optionValue='id'
                            optionLabel='name'
                            values={formik.values.permissionObj}
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-read`)}
                          />
                        </td>
                        <td style={{ width: "22%", textAlign: "center", paddingTop: "10px", paddingBottom: "10px" }}>
                          <ColorSelect
                            name={`${item?.name.toLowerCase()}-write`}
                            options={orderPermission(item?.permissions?.write)}
                            optionValue='id'
                            optionLabel='name'
                            values={formik.values.permissionObj}
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-write`)}
                          />
                        </td>
                        <td style={{ width: "22%", textAlign: "center", paddingTop: "10px", paddingBottom: "10px" }}>
                          <ColorSelect
                            name={`${item?.name.toLowerCase()}-update`}
                            options={orderPermission(item?.permissions?.update)}
                            optionValue='id'
                            optionLabel='name'
                            values={formik.values.permissionObj}
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-update`)}
                          />
                        </td>
                        <td style={{ width: "22%", textAlign: "center", paddingTop: "10px", paddingBottom: "10px" }}>
                          <ColorSelect
                            name={`${item?.name.toLowerCase()}-delete`}
                            options={orderPermission(item?.permissions?.delete)}
                            optionValue='id'
                            optionLabel='name'
                            values={formik.values.permissionObj}
                            onChange={(e) => onChange(e, `${item?.name.toLowerCase()}-delete`)}
                          />
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};
export default Permission;