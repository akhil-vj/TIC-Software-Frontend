import React, { useEffect } from "react";
import InputField from "../../common/InputField";
import { useAsync } from "../../../utilis/useAsync";
import { SETUP, URLS } from "../../../../constants";
import SelectField from "../../common/SelectField";
import { useFormik } from "formik";
import ReactSelect from "../../common/ReactSelect";
import CustomDatePicker from "../../common/CustomDatePicker";
import { FileUploader } from "../../common/FileUploader";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useNavigate, useParams } from "react-router-dom";
import { Table } from "react-bootstrap";
import { formatDate } from "../../../utilis/date";
import { filePost } from "../../../../services/AxiosInstance";
import { checkFormValue, checkIsFile } from "../../../utilis/check";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";
import { LoadingButton } from "../../../components/common/LoadingBtn"

const typeOptions = [
  { label: "Private", value: "Private" },
  { label: "SIC", value: "SIC" },
];
const statusOptions = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 0 },
];

const AddTransfer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const initialValues = {
    fromDate: SETUP.TODAY_DATE,
    toDate: SETUP.TODAY_DATE,
    type: { label: "Private", value: "Private" },
    status: { label: "Active", value: 1 },
    cost: 0,
    adultCost: 0,
    childCost: 0,
    editArr: -1,
    image: '',
    costArr: [],
    costId: '',
    pickupPoint: ''
  };
  const url = URLS.TRANSFER_URL
  const editUrl = `${URLS.TRANSFER_URL}/${id}`
  const updateUrl = `${URLS.TRANSFER_UPDATE_URL}/${id}`


  const handleClick = async (values) => {
    try {
      dispatch(FormAction.setLoading(true))
      let response
      const formData = new FormData()
      // const values = formik.values
      formData.append('vehicle_name', checkFormValue(values.name))
      formData.append('vehicle_number', checkFormValue(values.vehicleNumber))
      formData.append('phone_number', checkFormValue(values.phoneNumber))
      formData.append('destination_id', checkFormValue(values.destination?.value))
      formData.append('description', checkFormValue(values.description))
      formData.append('is_active', values.status.value)
      if (checkIsFile(values.image)) {
        formData.append('image', values.image)
      }
      values.costArr.forEach((data, ind) => {
        if (!!data.costId) {
          formData.append(`estimations[${ind}][id]`, data.costId)
        }
        formData.append(`estimations[${ind}][from_date]`, data.fromDate)
        formData.append(`estimations[${ind}][to_date]`, data.toDate)
        formData.append(`estimations[${ind}][type]`, data.type.value)
        formData.append(`estimations[${ind}][cost]`, data.cost)
        formData.append(`estimations[${ind}][adult_cost]`, data.adultCost)
        formData.append(`estimations[${ind}][child_cost]`, data.childCost)
      })
      // console.log('formDa',Object.fromEntries(formData.entries()))
      if (isEdit) {
        response = await filePost(updateUrl, formData)
      } else {
        response = await filePost(url, formData)
      }
      if (response.success) {
        notifyCreate("Transfer", isEdit);
        navigate("/transfer");
      }
    } catch (error) {
      notifyError(error)
    } finally {
      dispatch(FormAction.setLoading(false))
    }
  };
  const formik = useFormik({
    initialValues,
    onSubmit: handleClick
  });
  const tableData = formik?.values?.costArr;
  // const destinationId = formik.values.destination
  // const subDestinationUrl = `${URLS.SUB_DESTINATION_URL}?destination_id=${destinationId}`

  const destinationData = useAsync(URLS.DESTINATION_URL);
  // const subDestinationData = useAsync(subDestinationUrl, destinationId)
  const categoryData = useAsync(URLS.PROPERTY_CATEGORY_URL);
  const propertyTypeData = useAsync(URLS.PROPERTY_TYPE_URL);

  const errors = formik.errors;
  const isEdit = !!id;

  const editData = useAsync(editUrl, isEdit)

  useEffect(() => {
    const data = editData?.data?.data
    if (data) {
      formik.setFieldValue('name', data.vehicle_name)
      formik.setFieldValue('vehicleNumber', data.vehicle_number)
      formik.setFieldValue('pickupPoint', '')
      formik.setFieldValue('phoneNumber', data.phone_number)
      formik.setFieldValue('destination', { value: data.destination?.id, label: data.destination?.name })
      formik.setFieldValue('description', data.description)
      formik.setFieldValue('image', data.image)
      formik.setFieldValue('status', { value: data.is_active, label: data.is_active === 1 ? 'Active' : 'Inactive' })
      const costArr = data.estimations?.map((item, ind) => {
        const obj = {
          costId: item.id, fromDate: item.from_date, toDate: item.to_date,
          type: { label: item.type, value: item.type }, cost: item.cost,
          adultCost: item.adult_cost, childCost: item.child_cost
        }
        return obj

      })
      formik.setFieldValue('costArr', costArr)
    }
    // return () => {
    //   second
    // }
  }, [editData?.data, id])

  const handleEstimationForm = (value, id = -1) => {
    if (!!value.costId) {
      formik.setFieldValue("costId", value.costId);
    }
    formik.setFieldValue("fromDate", value.fromDate);
    formik.setFieldValue("toDate", value.toDate);
    formik.setFieldValue("type", value.type);
    formik.setFieldValue("cost", value.cost);
    formik.setFieldValue("adultCost", value.adultCost);
    formik.setFieldValue("childCost", value.childCost);
    formik.setFieldValue("editArr", id);
  }
  const handleCost = () => {
    const values = formik.values;
    const obj = {
      costId: values.costId,
      fromDate: formatDate(values.fromDate),
      toDate: formatDate(values.toDate),
      type: values.type,
      cost: values.cost,
      adultCost: values.adultCost,
      childCost: values.childCost,
    };
    let arr
    if (values.editArr === -1) {
      arr = [...values.costArr, obj];
    } else {
      arr = tableData.map((data, ind) => {
        if (ind == values.editArr) {
          return obj
        }
        else {
          return data
        }
      })
    }
    formik.setFieldValue("costArr", arr);
    handleEstimationForm(initialValues)

  };

  const handleEdit = (id) => {
    const filteredVal = tableData.filter((val, i) => i == id);
    handleEstimationForm(filteredVal[0], id)
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
            <h4 className="card-title">{`${isEdit ? "Edit" : "Add"
              } Transfer`}</h4>
          </div>
          <div className="card-body">
            <div className="form-wizard ">
              <section>
                <div className="row">
                  <div className="col-lg-6 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                        label="Transfer Name"
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
                    <div className="form-group mb-3">
                      <InputField
                        label="Vehicle Number"
                        name="vehicleNumber"
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
                    <div className="form-group mb-3">
                      <InputField
                        label="Pickup Point"
                        name="pickupPoint"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                      />
                    </div>
                  </div>
                  {/* <div className="col-lg-6 mb-2">
          <SelectField
            label={'Sub Destination'}
            name={'subDestination'}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            values={formik.values}
            options={subDestinationData?.data?.data}
            optionValue="id"
            optionLabel="name"
          />
        </div> */}

                  <div className="col-lg-6 mb-2">
                    <div className="form-group mb-3">
                      <InputField
                        label="Phone Number"
                        name="phoneNumber"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        values={formik.values}
                        formik={formik}
                        required
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

                  <div className="col-lg-7">
                    <FileUploader
                      label="Image"
                      name="image"
                      // onChange={onChange}
                      onBlur={formik.handleBlur}
                      values={formik.values}
                      setFieldValue={formik.setFieldValue}
                    />
                  </div>
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
                    <ReactSelect
                      isSearchable={false}
                      label="Type"
                      options={typeOptions}
                      optionLabel="label"
                      optionValue="value"
                      value={formik.values?.type}
                      onChange={(selected) =>
                        formik.setFieldValue("type", selected)
                      }
                    />
                  </div>

                  {formik.values.type.value === "Private" ? (
                    <div className="col-lg-6 mb-2">
                      <div className="form-group mb-3">
                        <InputField
                          type="number"
                          label="Cost"
                          name="cost"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          values={formik.values}
                          formik={formik}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                  <div className="card-footer border-0 pt-2 pb-3 d-flex">
                    {formik.values.editArr !== -1 && <div className="me-2">
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
                          <th>Type</th>
                          <th>Cost</th>
                          <th>Adult Cost</th>
                          <th>Child Cost</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!tableData?.length ? (
                          tableData.map((data, key) => {
                            return (
                              <tr key={key}>
                                <th>{key + 1}</th>
                                <td>{data.fromDate}</td>
                                <td>{data.toDate}</td>
                                <td>{data.type.label}</td>
                                <td>{data.cost}</td>
                                <td>{data.adultCost}</td>
                                <td>{data.childCost}</td>
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
                            <td colSpan={8} style={{ textAlign: "center" }}>
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
                    >
                      UPDATE
                    </button> */}
                    <LoadingButton label='UPDATE' onClick={formik.handleSubmit} />
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

export default AddTransfer;
