import React, { useState } from "react";
import InputField from "../../common/InputField";
import { useAsync } from "../../../utilis/useAsync";
import { SETUP, URLS } from "../../../../constants";
import { useFormik } from "formik";
import ReactSelect from "../../common/ReactSelect";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { Table } from "react-bootstrap";
import { formatDate } from "../../../utilis/date";
import { filePost } from "../../../../services/AxiosInstance";
import * as Yup from "yup";
import { checkFormValue, checkIsFile } from "../../../utilis/check";
import { LoadingButton } from "../../common/LoadingBtn";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";

const typeOptions = [
  { label: "Private", value: "Private" },
  { label: "SIC", value: "SIC" },
];

const statusOptions = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 0 },
];

const TransferFormModal = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();

  const initialValues = {
    name: "",
    vehicleNumber: "",
    destination: null,
    phoneNumber: "",
    description: "",
    status: { label: "Active", value: 1 },
    image: "",
    fromDate: SETUP.TODAY_DATE,
    toDate: SETUP.TODAY_DATE,
    type: typeOptions[0],
    cost: 0,
    adultCost: 0,
    childCost: 0,
    editArr: -1,
    costArr: [],
    costId: "",
  };

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Vehicle name must be at least 3 characters")
      .required("Please enter vehicle name"),
    destination: Yup.object().required("Please select destination"),
    phoneNumber: Yup.string()
      .transform((value) => (value === "" || value === null ? undefined : value))
      .min(5, "Phone must be at least 5 characters")
      .max(15, "Phone must be at most 15 characters")
      .notRequired(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        dispatch(FormAction.setLoading(true));

        if (!values.costArr || values.costArr.length === 0) {
          notifyError("Add at least one cost estimation");
          dispatch(FormAction.setLoading(false));
          return;
        }

        const formData = new FormData();
        formData.append("vehicle_name", values.name);
        formData.append("vehicle_number", checkFormValue(values.vehicleNumber));
        formData.append("phone_number", checkFormValue(values.phoneNumber));
        formData.append("destination_id", checkFormValue(values.destination?.value));
        formData.append("description", checkFormValue(values.description));
        formData.append("is_active", values.status.value);

        if (checkIsFile(values.image)) {
          formData.append("image", values.image);
        }

        values.costArr.forEach((data, ind) => {
          if (!!data.costId) {
            formData.append(`estimations[${ind}][id]`, data.costId);
          }
          formData.append(`estimations[${ind}][from_date]`, data.fromDate);
          formData.append(`estimations[${ind}][to_date]`, data.toDate);
          formData.append(`estimations[${ind}][type]`, data.type.value);
          formData.append(`estimations[${ind}][cost]`, data.cost);
          formData.append(`estimations[${ind}][adult_cost]`, data.adultCost);
          formData.append(`estimations[${ind}][child_cost]`, data.childCost);
        });

        const response = await filePost(URLS.TRANSFER_URL, formData);

        if (response.success) {
          notifyCreate("Transfer", false);
          dispatch(FormAction.setLoading(false));
          if (onSuccess) {
            onSuccess(response.data);
          }
          formik.resetForm();
        }
      } catch (error) {
        const errObj = error?.response?.data?.data?.errors;
        const firstErr =
          errObj && Object.values(errObj)?.flat()?.[0]
            ? Object.values(errObj).flat()[0]
            : error?.response?.data?.message || error?.message || "Save failed";
        notifyError(firstErr);
        dispatch(FormAction.setLoading(false));
      }
    },
  });

  const { values, errors, handleChange, handleBlur, setFieldValue, isSubmitting } = formik;

  const destinationFetchData = useAsync(URLS.DESTINATION_URL);
  const destinationData = destinationFetchData?.data?.data || [];

  const tableData = values?.costArr;

  const handleEstimationForm = (value, id = -1) => {
    if (!!value.costId) {
      setFieldValue("costId", value.costId);
    }
    setFieldValue("fromDate", value.fromDate);
    setFieldValue("toDate", value.toDate);
    setFieldValue("type", value.type);
    setFieldValue("cost", value.cost);
    setFieldValue("adultCost", value.adultCost);
    setFieldValue("childCost", value.childCost);
    setFieldValue("editArr", id);
  };

  const handleAddCost = () => {
    const obj = {
      costId: values.costId,
      fromDate: formatDate(values.fromDate),
      toDate: formatDate(values.toDate),
      type: values.type,
      cost: values.cost,
      adultCost: values.adultCost,
      childCost: values.childCost,
    };

    let arr;
    if (values.editArr === -1) {
      arr = [...values.costArr, obj];
    } else {
      arr = tableData.map((data, ind) => {
        if (ind === values.editArr) {
          return obj;
        } else {
          return data;
        }
      });
    }
    setFieldValue("costArr", arr);
    handleEstimationForm(initialValues);
  };

  const handleDeleteCost = (id) => {
    const filteredVal = tableData.filter((val, i) => i !== id);
    setFieldValue("costArr", filteredVal);
  };

  const handleEditCost = (id) => {
    const filteredVal = tableData.filter((val, i) => i === id);
    handleEstimationForm(filteredVal[0], id);
  };

  return (
    <div className="form-wizard">
      <form onSubmit={formik.handleSubmit}>
        <div className="row">
          <div className="col-sm-6">
            <InputField
              label="Vehicle Name"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
              error={errors.name}
              required
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="Vehicle Number"
              name="vehicleNumber"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
          <div className="col-sm-6">
            <ReactSelect
              label="Destination"
              name="destination"
              value={values.destination}
              onChange={(selected) => setFieldValue("destination", selected)}
              onBlur={handleBlur}
              options={destinationData}
              optionValue="id"
              optionLabel="name"
              error={errors.destination}
              required
            />
          </div>
          <div className="col-sm-6">
            <ReactSelect
              label="Status"
              name="status"
              value={values.status}
              onChange={(selected) => setFieldValue("status", selected)}
              onBlur={handleBlur}
              options={statusOptions}
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="Phone Number"
              name="phoneNumber"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
              error={errors.phoneNumber}
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="Image"
              name="image"
              type="file"
              onChange={(e) => setFieldValue("image", e.target.files[0])}
              onBlur={handleBlur}
              accept="image/*"
            />
          </div>
          <div className="col-sm-12">
            <InputField
              label="Description"
              name="description"
              type="textarea"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
        </div>

        <hr className="my-4" />
        <h6 className="mb-3">Cost Estimations</h6>

        <div className="row">
          <div className="col-sm-6">
            <InputField
              label="From Date"
              name="fromDate"
              type="date"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="To Date"
              name="toDate"
              type="date"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
          <div className="col-sm-6">
            <ReactSelect
              label="Transfer Type"
              name="type"
              value={values.type}
              onChange={(selected) => setFieldValue("type", selected)}
              onBlur={handleBlur}
              options={typeOptions}
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="Cost"
              name="cost"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="Adult Cost"
              name="adultCost"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
          <div className="col-sm-6">
            <InputField
              label="Child Cost"
              name="childCost"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
            />
          </div>
          <div className="col-sm-12">
            <button
              type="button"
              className="btn btn-sm btn-info"
              onClick={handleAddCost}
            >
              {values.editArr === -1 ? "Add Cost" : "Update Cost"}
            </button>
          </div>
        </div>

        {tableData?.length > 0 && (
          <div className="table-responsive mt-3">
            <Table striped bordered>
              <thead>
                <tr>
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
                {tableData.map((item, ind) => (
                  <tr key={ind}>
                    <td>{item.fromDate}</td>
                    <td>{item.toDate}</td>
                    <td>{item.type?.label}</td>
                    <td>{item.cost}</td>
                    <td>{item.adultCost}</td>
                    <td>{item.childCost}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditCost(ind)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCost(ind)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <div className="text-end mt-4">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <LoadingButton
            label="Save Transfer"
            type="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};

export default TransferFormModal;
