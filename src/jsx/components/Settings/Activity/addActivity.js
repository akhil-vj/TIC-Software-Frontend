import React, { useEffect, useState } from "react";
import InputField from "../../common/InputField";
import { useAsync } from "../../../utilis/useAsync";
import { SETUP, URLS } from "../../../../constants";
import SelectField from "../../common/SelectField";
import { useFormik } from "formik";
import ReactSelect from "../../common/ReactSelect";
import CustomDatePicker from "../../common/CustomDatePicker";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useNavigate, useParams } from "react-router-dom";
import {  Table } from "react-bootstrap";
import { formatDate, formatTimeToHis, parseTime } from "../../../utilis/date";
import { axiosPost, axiosPut } from "../../../../services/AxiosInstance";
import * as Yup from "yup";
import { checkFormValue } from "../../../utilis/check";
import { LoadingButton } from "../../common/LoadingBtn";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";


const typeOptions = [
  { label: "Private", value: "Private" },
  { label: "SIC", value: "SIC" },
];
const statusOptions = [
  { label: "Active", value:1 },
  { label: "Inactive", value:0 },
];

const AddActivity = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = !!id;

  const url = URLS.ACTIVITY_URL
  const editUrl = `${url}/${id}`
  const editData = useAsync(editUrl,isEdit)
  const initialValues = {
    fromDate: SETUP.TODAY_DATE,
    toDate: SETUP.TODAY_DATE,
    openingTime: SETUP.START_TIME,
    closingTime: SETUP.START_TIME,
    status: { label: "Active", value:1 },
    cost:0,
    adultCost: 0,
    childCost: 0,
    adultCount: 0,
    childCount: 0,
    editArr:-1,
    costArr: [],
    costId:''
  };
  const formSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Your name must consist of at least 3 characters ")
      .required("Please enter a name"),
    email: Yup.string()
      .transform((value) => (value === "" || value === null ? undefined : value))
      .email( "not a valid email")
      .notRequired(),
  });
  const handleClick = async(values) => {
    try {
      dispatch(FormAction.setLoading(true))
      let response
      const formData = new FormData()
      // const values = formik.values
      formData.append('activity_name',values.name)
      formData.append('contact_number',checkFormValue(values.phoneNumber))
      formData.append('activity_type_id',checkFormValue(values.activityType?.value))
      formData.append('contact_email',checkFormValue(values.email))
      formData.append('destination_id',checkFormValue(values.destination?.value))
      formData.append('sub_destination_id',checkFormValue(values.subDestination?.value))
      formData.append('description',checkFormValue(values.description))
      formData.append('is_active',values.status.value)
      formData.append('adult_count',values.adultCount || 0)
      formData.append('child_count',values.childCount || 0)
      values.costArr.map((data,ind)=>{
        if(!!data.costId){
          formData.append(`estimations[${ind}][id]`,data.costId)
        }
        formData.append(`estimations[${ind}][from_date]`,data.fromDate)
        formData.append(`estimations[${ind}][to_date]`,data.toDate)
        formData.append(`estimations[${ind}][opening_time]`,formatTimeToHis(data.openingTime))
        formData.append(`estimations[${ind}][closing_time]`,formatTimeToHis(data.closingTime))
        formData.append(`estimations[${ind}][adult_cost]`,data.adultCost)
        formData.append(`estimations[${ind}][child_cost]`,data.childCost)
      })
      if(isEdit){
        response = await axiosPut(editUrl,formData)
      }else{
        response = await axiosPost(url,formData)
      }
      if(response.success){
        notifyCreate("Activity",isEdit);
        navigate("/activity");
      }
    } catch (error) {
      console.log('activity error',error)
      notifyError(error)
    }finally{
      dispatch(FormAction.setLoading(false))
    }
  };
  const formik = useFormik({
    initialValues,
    validationSchema:formSchema,
    onSubmit:handleClick
  });
  console.log('errrrr',formik.errors)
  const tableData = formik?.values?.costArr;
  const destinationId = formik.values.destination?.value
  
  const subDestinationUrl = `${URLS.SUB_DESTINATION_URL}?destination_id=${destinationId}`
  const destinationData = useAsync(URLS.DESTINATION_URL);
  const subDestinationData = useAsync(subDestinationUrl,destinationId);
  // const subDestinationData = useAsync(subDestinationUrl, destinationId)
  const activityTypeData = useAsync(URLS.ACTIVITY_TYPE_URL);
  const categoryData = useAsync(URLS.PROPERTY_CATEGORY_URL);
  const propertyTypeData = useAsync(URLS.PROPERTY_TYPE_URL);

  const errors = formik.errors;
  
  useEffect(() => {
    const data = editData?.data?.data
    if(data){
    formik.setFieldValue('name',data.activity_name)
      formik.setFieldValue('phoneNumber',data.contact_number )
      formik.setFieldValue('email',data.contact_email )
      formik.setFieldValue('destination',{value:data.destination?.id,label:data.destination?.name})
      formik.setFieldValue('subDestination',{value:data.sub_destination?.id,label:data.sub_destination?.name})
      if(data.activity_type){
        formik.setFieldValue('activityType',{value:data.activity_type?.id,label:data.activity_type?.name})
      }
      formik.setFieldValue('adultCount',data.adult_count || 0)
      formik.setFieldValue('childCount',data.child_count || 0)
      formik.setFieldValue('description',data.description)
      formik.setFieldValue('status',{value:data.is_active,label:data.is_active===1?'Active':'Inactive'})
      const costArr = data.estimations?.map((item,ind)=>{
        const obj = {costId:item.id,fromDate:item.from_date, toDate:item.to_date,
          openingTime:item.opening_time,closingTime:item.closing_time,
          adultCost:item.adult_cost,childCost:item.child_cost}
          return obj
  
      })
      formik.setFieldValue('costArr',costArr )
    }
    // return () => {
    //   second
    // }
  }, [editData?.data,id])
  
  
  
  const handleEstimationForm = (value,id=-1) => {
    formik.setFieldValue(`costId`,value.costId || '')
    formik.setFieldValue("fromDate", value.fromDate);
    formik.setFieldValue("toDate", value.toDate);
    formik.setFieldValue("openingTime", value.openingTime);
    formik.setFieldValue("closingTime", value.closingTime);
    formik.setFieldValue("type", value.type);
    formik.setFieldValue("cost", value.cost);
    formik.setFieldValue("adultCost", value.adultCost);
    formik.setFieldValue("childCost", value.childCost);
    formik.setFieldValue("editArr", id);
  }
  const handleCost = () => {
    const values = formik.values;
    
    const obj = {
      costId:values.costId,
      fromDate: formatDate(values.fromDate),
      toDate: formatDate(values.toDate),
      openingTime: values.openingTime,
      closingTime: values.closingTime,
      adultCost: values.adultCost,
      childCost: values.childCost,
    };
    console.log('data',obj)
    let arr
    if(values.editArr === -1){
      arr = [...values.costArr, obj];
    }else{
      arr = tableData.map((data,ind)=>{
        if(ind == values.editArr){
          return obj
        }
        else{
          return data
        }
      })
    }
    formik.setFieldValue('costArr',arr)
    handleEstimationForm(initialValues)
    
  };

  const handleEdit = (id) => {
    const filteredVal = tableData.filter((val, i) => i == id);
    handleEstimationForm(filteredVal[0],id)
    // setValue({...filteredVal[0],editRoom:id});
  };
  const handleDelete = (id) => {
    const filteredVal = tableData.filter((val, i) => i !== id);
    formik.setFieldValue("costArr", filteredVal);
  };
  return (
    <div className="row">
      <div className="col-xl-12 col-xxl-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">{`${
              isEdit ? "Edit" : "Add"
            } Activity`}</h4>
          </div>
          <div className="card-body">
            <div className="form-wizard ">
              <section>
                <div className="row">
                  <div className="col-lg-6 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                        label="Activity Name"
                        name="name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-2">
                    <ReactSelect
                      label="Activity Type"
                      options={activityTypeData?.data?.data}
                      optionLabel="name"
                      optionValue="id"
                      value={formik.values?.activityType}
                      onChange={(selected) =>
                        formik.setFieldValue("activityType", selected)
                      }
                    />
                  </div>
                  <div className="col-lg-6 mb-2">
                    <ReactSelect
                      label="Destination"
                      options={destinationData?.data?.data}
                      optionLabel="name"
                      optionValue="id"
                      value={formik.values?.destination}
                      onChange={(selected) =>
                        formik.setFieldValue("destination", selected)
                      }
                      required
                    />
                  </div>
                  <div className="col-lg-6 mb-2">
                    <ReactSelect
                      label="Sub Destination"
                      options={subDestinationData?.data?.data}
                      optionLabel="name"
                      optionValue="id"
                      value={formik.values?.subDestination}
                      onChange={(selected) =>
                        formik.setFieldValue("subDestination", selected)
                      }
                      required
                    />
                  </div>
                  <div className="col-lg-3 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                        type="number"
                        label="Adult Count"
                        name="adultCount"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                        type="number"
                        label="Child Count"
                        name="childCount"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                        label="Contact Email"
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-2">
                    <InputField
                      isTextarea
                      label="Description"
                      name="description"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      values={formik.values}
                      formik={formik}
                    />
                  </div>
                  <div className="col-lg-6 mb-2">
                  <ReactSelect
                      isSearchable={false}
                      label="Status"
                      options={statusOptions}
                      optionLabel="label"
                      optionValue="value"
                      value={formik.values?.status}
                      onChange={(selected) =>
                        formik.setFieldValue("status", selected)
                      }
                    />
                  </div>

                  {/* <div className="col-lg-7">
                    <FileUploader
                      label="Image"
                      name="image"
                      // onChange={onChange}
                      onBlur={formik.handleBlur}
                      values={formik.values}
                      setFieldValue={formik.setFieldValue}
                    />
                  </div> */}
                  <div className="col-lg-12">
                    <h5>Estimation *</h5>
                  </div>

                  <div className="col-lg-6 mb-3">
                    <CustomDatePicker
                      label="From Date"
                      selected={formik.values?.fromDate}
                      onChange={(date) =>
                        formik.setFieldValue("fromDate", date)
                      }
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <CustomDatePicker
                      label="To Date"
                      selected={formik.values?.toDate}
                      onChange={(date) => formik.setFieldValue("toDate", date)}
                    />
                  </div>
                  <div className="col-lg-6 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                      type='time'
                        label="Opening time"
                        name="openingTime"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                      type='time'
                        label="Closing time"
                        name="closingTime"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                      />
                    </div>
                  </div>
                      <div className="col-lg-6 mb-2">
                        <div className="form-group mb-3">
                          <InputField
                            type="number"
                            label="Adult Cost"
                            name="adultCost"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            values={formik.values}
                            formik={formik}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 mb-2">
                        <div className="form-group mb-3">
                          <InputField
                            type="number"
                            label="Child Cost"
                            name="childCost"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            values={formik.values}
                            formik={formik}
                            required
                          />
                        </div>
                      </div>
                  <div className="card-footer border-0 pt-2 pb-3 d-flex">
                  {formik.values.editArr !== -1  && <div className="me-2">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          handleEstimationForm(initialValues)
                        }
                        }
                      >
                        Cancel
                      </button>
                    </div>}
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleCost}
                    >
                      {formik.values.editArr === -1 ? 'Add' : 'Edit'} Cost
                    </button>
                  </div>

                  <div className="col-12 mt-4">
                    <Table responsive className="custom-table-bordered">
                      <thead className="thead-table">
                        <tr>
                          <th>#</th>
                          <th>From Date</th>
                          <th>To Date</th>
                          <th>Opening Time</th>
                          <th>Closing Time</th>
                          <th>Adult Cost</th>
                          <th>Child Cost</th>
                          <th>Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!tableData?.length ? (
                          tableData.map((data, key) => {
                            const adultCount = Number(formik.values.adultCount || 0);
                            const childCount = Number(formik.values.childCount || 0);
                            const adultTotal = Number(data.adultCost || 0) * adultCount;
                            const childTotal = Number(data.childCost || 0) * childCount;
                            const total = adultTotal + childTotal;
                            return (
                              <tr key={key}>
                                <th>{key + 1}</th>
                                <td>{data.fromDate}</td>
                                <td>{data.toDate}</td>
                                <td>{parseTime(data.openingTime)}</td>
                                <td>{parseTime(data.closingTime)}</td>
                                <td>{adultTotal}</td>
                                <td>{childTotal}</td>
                                <td><strong>{total}</strong></td>
                                <td>
                                  <div className="d-flex">
                                    <button
                                      className="btn bg-main btn-xs sharp me-1"
                                      onClick={() => handleEdit(key)}
                                    >
                                      <i className="fas fa-pencil-alt"></i>
                                    </button>
                                    <button
                                      className="btn bg-main btn-xs sharp"
                                      onClick={() => handleDelete(key)}
                                    >
                                      <i className="fa fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr id="empty-table-data">
                            <td colSpan={9} style={{ textAlign: "center" }}>
                              Empty !
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <div className="card-footer border-0 pt-2 pb-3">
                    {/* <button
                      className="btn btn-primary"
                      type="button"
                      onClick={formik.handleSubmit}
                      disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                    >
                      UPDATE
                    </button> */}
                    <LoadingButton label='UPDATE' onClick={formik.handleSubmit}  disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}/>
                    {/* <Link to={"#"} className="btn-link">Forgot your password?</Link> */}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddActivity;
