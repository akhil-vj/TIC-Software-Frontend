import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useFormik } from "formik";
import SelectField from "../common/SelectField";
import ReactSelect from "../common/ReactSelect";
import InputField from "../common/InputField";
import { SETUP, URLS } from "../../../constants";
import { notifyCreate, notifyError } from "../../utilis/notifyMessage";
import { useAsync } from "../../utilis/useAsync";
import { axiosPut, filePost } from "../../../services/AxiosInstance";
import CustomDatePicker from "../common/CustomDatePicker";
import { formatDate, parseDate } from "../../utilis/date";
import { checkFormValue } from "../../utilis/check";
import { useDispatch } from "react-redux";
import { FetchAction } from "../../../store/slices/fetchSlice";
import { ModeBtn } from "../common/ModeBtn";

import { FormAction } from "../../../store/slices/formSlice";

const initialValues = {
  type: "B2B",
  requirement: [],
  startDate: SETUP.TODAY_DATE,
  endDate: SETUP.TODAY_DATE,
  adult: 0,
  child: 0,
  infant: 0,
  refNo: "",
};
const TypeOptions = [
  { label: "B2B", value: "B2B" },
  { label: "B2C", value: "B2C" },
];
const SaluteOptions = [
  { label: "Mr", value: "Mr" },
  { label: "Ms", value: "Ms" },
];
const AgentOptions = [
  { label: "Agent 1", value: "agent1" },
  { label: "Agent 2", value: "agent2" },
  { label: "Agent 3", value: "agent3" },
  { label: "Agent 4", value: "agent4" },
];
const CustomerOptions = [
  { name: "Customer 1", id: "customer1" },
  { name: "Customer 2", id: "customer2" },
  { name: "Customer 3", id: "customer3" },
  { name: "Customer 4", id: "customer4" },
];
const LeadOptions = [
  { label: "Agent", value: "1" },
  { label: "Ads", value: "2" },
  { label: "Social Media", value: "3" },
  { label: "Friend Refferal", value: "4" },
];
const StaffOptions = [
  { label: "Staff 1", value: "staff1" },
  { label: "Staff 2", value: "staff2" },
  { label: "Staff 3", value: "staff3" },
  { label: "Staff 4", value: "staff4" },
];

const inputOptions = [
  { label: "Name", name: "name" },
  { label: "Mobile", name: "mobile" },
  { label: "Email", name: "email" },
  // { label:'Skills', value:'HTML,  JavaScript,  PHP' },
];

const destinationOptions = [
  { value: "Dubai", label: "Dubai" },
  { value: "Qatar", label: "Qatar" },
  { value: "Europe", label: "Europe" },
  { value: "India", label: "India" },
  { value: "America", label: "America" },
];
const priorityOptions = [
  { value: "Hot", label: "Hot" },
  { value: "Medium", label: "Medium" },
  { value: "Cold", label: "Cold" },
];
const requirementOptions = [
  { value: "Full Package", label: "Full Package" },
  { value: "Activaties", label: "Activaties" },
  { value: "Flight", label: "Flight" },
  { value: "Hotel", label: "Hotel" },
  { value: "Transport", label: "Transport" },
];
const suggestionArr = [
  { name: 'Package 1', description: 'description of package 1', cost: '10000' },
  { name: 'Package 2', description: 'description of package 2', cost: '20000' },
  { name: 'Package 3', description: 'description of package 3', cost: '30000' },
  { name: 'Package 4', description: 'description of package 4', cost: '40000' },
  { name: 'Package 5', description: 'description of package 5', cost: '40000' },
]

const EditProfile = ({ setShowModal }) => {
  // const [selectOption , setSelectOption] = useState('Gender');
  const isFormPage = !setShowModal
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(isFormPage);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = id && id !== "add";
  const formik = useFormik({
    initialValues,
  });
  const { handleBlur, handleChange, setFieldValue, values } = formik;
  const url = URLS.ENQUIRY_URL;
  const editUrl = `${url}/${id}`;
  const { data } = useAsync(editUrl, !!isEdit);
  const allEnquiriesData = useAsync(url, !isEdit);
  const editData = data?.data;
  const itineraryByEnquiryUrl = `${URLS.ITINERARY_URL}?enquiry_id=${id}`;
  const { data: itineraryData } = useAsync(itineraryByEnquiryUrl, !!isEdit);
  const selectedTypeValue = values.typeValue;
  const isB2b = values.type.value === "B2B";
  const itineraries = useMemo(() => {
    if (Array.isArray(itineraryData?.data)) return itineraryData.data;
    if (Array.isArray(itineraryData?.data?.data)) return itineraryData.data.data;
    return [];
  }, [itineraryData]);

  const agentData = useAsync(URLS.AGENT_URL);
  const agentDataOptions = agentData?.data?.data;
  const customerData = useAsync(URLS.CUSTOMER_URL);
  const customerDataOptions = customerData?.data?.data;
  const fetchSelectedAgent = useAsync(
    URLS.AGENT_URL + "/" + selectedTypeValue?.value,
    isB2b && selectedTypeValue?.value
  );
  const selectedAgentData = fetchSelectedAgent?.data?.data;
  const fetchCustomerData = useAsync(
    URLS.CUSTOMER_URL + "?mobile=" + selectedTypeValue?.label,
    !isB2b && selectedTypeValue?.label
  );
  const selectedCustomerData = fetchCustomerData?.data?.data;

  const destinationId = values.destination?.value;
  const subDestinationUrl = `${URLS.SUB_DESTINATION_URL}?destination_id=${destinationId}`;

  const destinationData = useAsync(URLS.DESTINATION_URL);
  const subDestinationData = useAsync(subDestinationUrl, destinationId);
  const leadData = useAsync(URLS.LEAD_SOURCE_URL);
  const leadDataOptions = leadData?.data?.data;
  const priorityData = useAsync(URLS.PRIORITY_URL);
  const priorityDataOptions = priorityData?.data?.data;
  const requirementData = useAsync(URLS.REQUIREMENT_URL);
  const requirementDataOptions = requirementData?.data?.data;
  const staffData = useAsync(URLS.USER_GET_URL);
  const staffDataOptions = staffData?.data?.data?.data;
  const quoteSummary = useMemo(() => {
    const totalQuotes = itineraries.length;
    const totalQuoteAmount = itineraries.reduce(
      (sum, itinerary) => sum + (Number(itinerary?.net_amount) || 0),
      0
    );
    const currency = itineraries.find((item) => item?.currency)?.currency;
    return { totalQuotes, totalQuoteAmount, currency };
  }, [itineraries]);
  const profileInfo = useMemo(() => {
    if (!editData) return {};
    const contact = editData.type === "B2B" ? editData.agent : editData.customer;
    const locationArr = [];
    if (editData.destination?.name) locationArr.push(editData.destination.name);
    if (editData.sub_destinations?.length) {
      const subDestinations = editData.sub_destinations
        .map((item) => item?.name)
        .filter(Boolean)
        .join(", ");
      if (subDestinations) {
        locationArr.push(subDestinations);
      }
    }
    return {
      name: contact?.name,
      email: contact?.email,
      location: locationArr.join(", "),
    };
  }, [editData]);

  const handleClick = async () => {
    try {
      const formData = new FormData();
      formData.append("type", values.type?.value);
      if (isB2b) {
        formData.append("agent_id", values.typeValue?.value);
      } else {
        formData.append("customer_id", values.typeValue?.value);
      }
      formData.append("name", checkFormValue(values.name));
      formData.append("email", checkFormValue(values.email));
      formData.append("mobile", checkFormValue(values.mobile));
      formData.append("salute", checkFormValue(values.salute));
      formData.append(
        "destination_id",
        checkFormValue(values.destination?.value)
      );
      //   formData.append(
      //     "sub_destination_id",
      //     checkFormValue(values.subDestination?.value)
      //   );     
      values.subDestination.forEach((data, ind) => {
        formData.append(
          `sub_destinations[${ind}]`,
          checkFormValue(data?.value)
        )
      })
      formData.append("start_date", formatDate(values.startDate));
      formData.append("end_date", formatDate(values.endDate));
      formData.append("adult_count", checkFormValue(values.adult));
      formData.append("child_count", checkFormValue(values.child));
      formData.append("infant_count", checkFormValue(values.infant));
      formData.append("lead_source_id", checkFormValue(values.lead));
      formData.append("priority_id", checkFormValue(values.priority));
      values.requirement.forEach((data, ind) => {
        // if(data.isExist){
        //   formData.append(`requirements[id]`,data?.value)
        // }
        formData.append(`requirements[${ind}]`, data?.value);
      });
      formData.append("assigned_to", checkFormValue(values.assigned?.value));
      formData.append("ref_no", checkFormValue(values.refNo));
      let response;
      if (isEdit) {
        response = await axiosPut(editUrl, formData);
      } else {
        response = await filePost(url, formData);
      }

      if (setShowModal) {
        setShowModal(false);
        navigate(`${response?.data?.id}/profile`);
      }
      if (response?.success) {
        dispatch(FormAction.setRefresh())
        notifyCreate("Profile", isEdit);
      }
    } catch (error) {
      console.log("er", error);
      notifyError(error);
    }
  };

  useEffect(() => {
    if (editData) {
      dispatch(FetchAction.setEnquiryById(editData));
      setDisabled(true);
      const isB2b = editData.type == "B2B";
      const typeData = isB2b ? editData.agent : editData.customer;
      const type = {
        label: checkFormValue(editData.type),
        value: checkFormValue(editData.type),
      };
      const typeObj = {
        label: checkFormValue(isB2b ? typeData?.name : typeData?.mobile),
        value: checkFormValue(typeData?.id),
      };
      setFieldValue("type", checkFormValue(type));
      setFieldValue("typeValue", checkFormValue(typeObj));
      setFieldValue("name", checkFormValue(typeData?.name));
      setFieldValue("email", checkFormValue(typeData?.email));
      setFieldValue("mobile", checkFormValue(typeData?.mobile || typeData?.phone));
      setFieldValue("salute", checkFormValue(typeData?.salute));
      setFieldValue("destination", {
        value: editData.destination?.id,
        label: editData.destination?.name,
      });
      // setFieldValue("subDestinations", {
      //   value: editData.sub_destination?.id,
      //   label: editData.sub_destination?.name,
      // });
      setFieldValue("startDate", parseDate(editData.start_date));
      setFieldValue("endDate", parseDate(editData.end_date));
      setFieldValue("adult", checkFormValue(editData.adult_count));
      setFieldValue("child", checkFormValue(editData.child_count));
      setFieldValue("infant", checkFormValue(editData.infant_count));
      setFieldValue("lead", checkFormValue(editData.lead_source_id));
      setFieldValue("priority", checkFormValue(editData.priority_id));
      setFieldValue("assigned", {
        value: editData.assigned_to_user?.id,
        label: editData.assigned_to_user?.first_name,
      });
      setFieldValue("refNo", checkFormValue(editData.ref_no));
      const subDestinationArr = editData.sub_destinations.map((data) => {
        const val = { label: data.name, value: data.id, isExist: true };
        return val;
      });
      setFieldValue("subDestination", subDestinationArr);
      const requirementArr = editData.requirements.map((data) => {
        const val = { label: data.name, value: data.id, isExist: true };
        return val;
      });
      setFieldValue("requirement", requirementArr);
    }
  }, [editData, id]);

  let selectedTypeData;
  if (isB2b) {
    selectedTypeData = selectedAgentData;
  } else {
    if (selectedCustomerData) {
      selectedTypeData = selectedCustomerData[0];
    }
  }
  useEffect(() => {
    // setfield work only on editmode
    if (!readOnly) {
      if (!!values.typeValue?.label && selectedTypeData) {
        setFieldValue("name", checkFormValue(selectedTypeData.name));
        setFieldValue("email", checkFormValue(selectedTypeData.email));
        if (!isB2b) {
          setFieldValue("salute", checkFormValue(selectedTypeData.salute));
          setFieldValue("mobile", checkFormValue(selectedTypeData.mobile));
        } else {
          setFieldValue("mobile", checkFormValue(selectedTypeData.phone));
        }
      } else {
        setFieldValue("name", '');
        setFieldValue("email", '');
        setFieldValue("mobile", '');
        setFieldValue("salute", '');
      }
    }
  }, [selectedTypeValue?.id, selectedTypeData?.id, values.typeValue?.label]);
  useEffect(() => {
    if (!readOnly && !isEdit) {
      const agentName = values.typeValue?.name || "";
      const assignedName = values.assigned?.first_name || "";
      
      if (agentName || assignedName) {
        let agentPart = "";
        if (agentName) {
          const words = String(agentName).trim().split(" ");
          if (words.length > 1) {
            agentPart = words.map(w => w[0].toUpperCase()).join("");
          } else {
            agentPart = String(agentName).substring(0, 2).toUpperCase();
          }
        }
        
        let assignedPart = assignedName ? String(assignedName).substring(0, 1).toUpperCase() : "";
        let prefix = "";
        if (agentPart && assignedPart) prefix = `${agentPart}/${assignedPart}/`;
        else if (agentPart) prefix = `${agentPart}/`;
        else if (assignedPart) prefix = `${assignedPart}/`;
        
        let highestNum = 0;
        const existingEnquiries = allEnquiriesData?.data?.data || [];
        existingEnquiries.forEach(enq => {
           if (enq.ref_no && String(enq.ref_no).startsWith(prefix)) {
              let numStr = String(enq.ref_no).substring(prefix.length);
              let num = parseInt(numStr, 10);
              if (!isNaN(num) && num > highestNum) {
                 highestNum = num;
              }
           }
        });
        const sequentialNum = highestNum + 1;
        
        if (prefix) {
            setFieldValue("refNo", `${prefix}${sequentialNum}`);
        }
      }
    }
  }, [values.typeValue?.name, values.assigned?.first_name, isEdit, readOnly, allEnquiriesData?.data?.data]);

  return (
    <>
      <div className="row">



        <div className={`col-${isFormPage ? '8' : '12'}`}>
          <div className="card profile-card card-bx m-b30 border-0">

            <form className="profile-form">
              <div className="card-body">
                <div className="row">
                  <ModeBtn className="col-sm-12 d-flex justify-content-end" isEdit={isFormPage}
                    readOnly={readOnly} setReadOnly={setReadOnly} />
                  <div className="col-sm-4">
                    <ReactSelect
                      label="Type"
                      onChange={(selected) => {
                        if (selected.label === 'B2B') {
                          setDisabled(true);
                        } else {
                          setDisabled(false);
                        }
                        setFieldValue("typeValue", { label: '', value: '' });
                        setFieldValue("name", '');
                        setFieldValue("email", '');
                        setFieldValue("mobile", '');
                        setFieldValue("salute", '');
                        setFieldValue("type", selected);
                      }}
                      onBlur={handleBlur}
                      value={values.type}
                      options={TypeOptions}
                      optionValue="value"
                      optionLabel="label"
                      isDisabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-4">
                    <ReactSelect
                      label={isB2b ? "Agent" : "Customer"}
                      onChange={(selected) => {
                        setDisabled(true);
                        setFieldValue("typeValue", selected);
                      }}
                      onBlur={handleBlur}
                      value={values.typeValue}
                      options={isB2b ? agentDataOptions : customerDataOptions}
                      optionValue="id"
                      optionLabel={isB2b ? "name" : "name"}
                      isDisabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-4">
                    <ReactSelect
                      label="Assigned To"
                      onChange={(selected) =>
                        setFieldValue("assigned", selected)
                      }
                      onBlur={handleBlur}
                      value={values.assigned}
                      options={staffDataOptions}
                      optionValue="id"
                      optionLabel="first_name"
                      isDisabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-4">
                    <InputField
                      label="Ref No."
                      name="refNo"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      disabled={readOnly}
                      placeholder="e.g., H/56789"
                    />
                  </div>
                  {!isB2b && (
                    <>
                      <div className="col-sm-2">
                        <SelectField
                          label="Salute"
                          name={"salute"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          values={values}
                          options={SaluteOptions}
                          optionValue="value"
                          optionLabel="label"
                          required
                          disabled={disabled || readOnly}
                        />
                      </div>
                      <div className="col-sm-6">
                        <InputField
                          label="Name"
                          name="name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          values={values}
                          disabled={disabled || readOnly}
                          required={true}
                        />
                      </div>
                    </>
                  )}
                  {isB2b && (
                    <div className="col-sm-6">
                      <InputField
                        label="Name"
                        name="name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        disabled={disabled || readOnly}
                        required={true}
                      />
                    </div>
                  )}
                  {inputOptions.slice(1).map((item, ind) => (
                    <div className="col-sm-6" key={ind}>

                      <InputField
                        label={item.label}
                        name={item.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        disabled={disabled || readOnly}
                        required={item.name === 'name' || isB2b}
                      />
                    </div>
                  ))}

                  <div className="col-sm-6">

                    <ReactSelect
                      label="Destination"
                      onChange={(selected) =>
                        setFieldValue("destination", selected)
                      }
                      onBlur={handleBlur}
                      value={values.destination}
                      options={destinationData?.data?.data}
                      optionValue="id"
                      optionLabel="name"
                      required
                      isDisabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-6">

                    <ReactSelect
                      label="Sub Destination"
                      onChange={(selected) =>
                        setFieldValue("subDestination", selected)
                      }
                      onBlur={handleBlur}
                      value={values.subDestination}
                      options={subDestinationData?.data?.data}
                      optionValue="id"
                      optionLabel="name"
                      required={false}
                      isDisabled={readOnly}
                      isMulti
                    />
                  </div>
                  <div className="col-sm-6 m-b30">
                    <CustomDatePicker
                      label="Start Date"
                      selected={formik.values?.startDate}
                      onChange={(date) =>
                        formik.setFieldValue("startDate", date)
                      }
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-6 m-b30">
                    <CustomDatePicker
                      label="End Date"
                      selected={formik.values?.endDate}
                      onChange={(date) => formik.setFieldValue("endDate", date)}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-4">
                    <InputField
                      label="Adult"
                      name="adult"
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-4">
                    <InputField
                      label="Child"
                      name="child"
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-4">
                    <InputField
                      label="Infant"
                      name="infant"
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-6">
                    <SelectField
                      label="Lead"
                      name={"lead"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      options={leadDataOptions}
                      optionValue="id"
                      optionLabel="name"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-6">
                    <SelectField
                      label="Priority"
                      name={"priority"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      options={priorityDataOptions}
                      optionValue="id"
                      optionLabel="name"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect
                      isMulti
                      label="Requirement"
                      onChange={(selected) => {
                        setFieldValue("requirement", selected);
                      }}
                      onBlur={handleBlur}
                      value={values.requirement}
                      options={requirementDataOptions}
                      optionValue="id"
                      optionLabel="name"
                      isDisabled={readOnly}
                    />
                  </div>

                  <div className="card-footer border-0 pt-0 pb-3">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleClick}
                    >
                      UPDATE
                    </button>
                    {/* <Link to={"#"} className="btn-link">Forgot your password?</Link> */}
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
        {isFormPage && <div className="col-4">
          <div className="bg-white p-3 rounded">
            <div>
              <InputField
                label={'Description'}
                name={'description'}
                onChange={handleChange}
                onBlur={handleBlur}
                values={values}
              // disabled={disabled || readOnly}
              // required
              />
            </div>
            <div className="">
              <h6 className="my-4">Package Suggestion</h6>
              {suggestionArr.map((item, ind) => (
                <div className="d-flex border suggestion-card p-2 rounded mb-2" key={ind}>
                  <div>
                    <h6>{item.name}</h6>
                    <p>{item.description}</p>
                  </div>
                  <div>
                    <h6>{item.cost} Rs</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>}
      </div>
    </>
  );
};
export default EditProfile;