import { useFormik } from "formik";
import React, { useEffect } from "react";
import ReactSelect from "../../common/ReactSelect";
import { SETUP, URLS } from "../../../../constants";
import InputField from "../../common/InputField";
import CustomModal from "../../../layouts/CustomModal";
import DatePicker from "react-datepicker";
import TimePickerPicker from "react-time-picker";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { FormSection } from "../../common/FormSection";
import { useAsync } from "../../../utilis/useAsync";
const nameOptions = [
  { label: "Vechile 1", value: "1" },
  { label: "Vechile 2", value: "2" },
  { label: "Vechile 3", value: "3" },
  { label: "Vechile 4", value: "4" },
];
const typeOptions = [
  { label: "PRIVATE", value: "PRIVATE" },
  { label: "SIC", value: "SIC" },
];
const destinationOption = [
  { value: "Dubai", label: "Dubai" },
  { value: "Qatar", label: "Qatar" },
  { value: "Europe", label: "Europe" },
  { value: "India", label: "India" },
  { value: "America", label: "America" },
];
const activityOptions = [
  { label: "Activity 1", value: "1" },
  { label: "Activity 2", value: "2" },
  { label: "Activity 3", value: "3" },
  { label: "Activity 4", value: "4" },
];

const InsertTransfer = ({
  showModal,
  setShowModal,
  data,
  onClick,
  editId,
  onClose,
}) => {
  const destination = useAsync(URLS.DESTINATION_URL);
  const destinationOptions = destination?.data?.data;
  const vehicleTypeData = useAsync(URLS.VEHICLE_TYPE_URL);
  const vehicleTypeOptions = vehicleTypeData?.data?.data?.map(item => ({
    label: item.name,
    value: item.name
  })) || [];
  const isEdit = !!editId || editId === 0;
  const initialValues = {
    startDate: SETUP.TODAY_DATE,
    startTime: SETUP.START_TIME,
    endDate: SETUP.TODAY_DATE,
    endTime: SETUP.END_TIME,
    insertType: "transfer",
    type: { label: "PRIVATE", value: "PRIVATE" },
  };
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    setValues,
    resetForm,
  } = useFormik({ initialValues });

  const handleSetup = () => {
    onClick(values, setShowModal);
    resetForm();
  };
  useEffect(() => {
    setFieldValue('startDate', data?.showScheduleDate)
    setFieldValue('endDate', data?.showScheduleDate)
    if (isEdit) {
      setValues(data);
    } else {
      const destinationObj = {
        label: data?.destination?.name,
        value: data?.destination?.name,
      };
      setFieldValue("destination", destinationObj);
      setFieldValue("name", data?.vehicle_name);
      setFieldValue("id", data?.id);
      setFieldValue("image", data?.image);

      // Get pricing from estimations array (from admin settings)
      if (data?.estimations && data.estimations.length > 0) {
        const estimation = data.estimations[0];
        setFieldValue("cost", estimation?.cost || 0);
        setFieldValue("adultCost", estimation?.adult_cost || 0);
        setFieldValue("childCost", estimation?.child_cost || 0);
      }
    }
  }, [editId, data, showModal]);
  return (
    <>
      <CustomModal
        showModal={showModal}
        title={"Create Transfer"}
        handleModalClose={() => {
          onClose(setShowModal);
          resetForm();
        }}
      >
        <div className="card-body">
          <div className="basic-form">
            <form>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-6">
                    <ReactSelect
                      label="Destination"
                      value={values.destination}
                      onChange={(selected) =>
                        setFieldValue("destination", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={destinationOptions}
                      optionValue="id"
                      optionLabel="name"
                    />
                  </div>
                  {/* <div className="col-sm-4">
                    <ReactSelect
                      label="Vechile Name"
                      onChange={(selected) =>
                        setFieldValue("name", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={nameOptions}
                      optionValue="value"
                      optionLabel="label"
                    />
                  </div> */}
                  <div className="col-sm-6">
                    <InputField
                      label="Vechile Name"
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                    />
                  </div>

                  {/* <div className="col-sm-8">
                    <InputField
                      label="Note"
                      name="note"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                    />
                  </div> */}

                  {/* <div className="col-sm-6">
                    <ReactSelect
                      label="Activity"
                      onChange={(selected) =>
                        setFieldValue("activity", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={activityOptions}
                      optionValue="value"
                      optionLabel="label"
                    />
                  </div> */}

                  {/* <div className="col-sm-8">
                    <InputField
                      label="Description"
                      name="description"
                      // type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      isTextarea
                    />
                  </div> */}

                  <div className="col-sm-4">
                    <ReactSelect
                      label="Type"
                      value={values.type}
                      onChange={(selected) => setFieldValue("type", selected)}
                      onBlur={handleBlur}
                      // values={values}
                      options={typeOptions}
                      optionValue="value"
                      optionLabel="label"
                      isSearchable={false}
                    />
                  </div>
                  {values.type?.label === "PRIVATE" ? (
                    <>
                      <div className="col-sm-4">
                        <ReactSelect
                          label="Vehicle Type"
                          value={values.vehicleType}
                          onChange={(selected) => setFieldValue("vehicleType", selected)}
                          onBlur={handleBlur}
                          options={vehicleTypeOptions}
                          optionValue="value"
                          optionLabel="label"
                          isSearchable={false}
                        />
                      </div>
                      <div className="col-sm-4">
                        <div className="form-group mb-3">
                          <label>Cost</label>
                          <div className="form-control bg-light">
                            {values.cost || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-sm-4">
                        <div className="form-group mb-3">
                          <label>Adult Cost</label>
                          <div className="form-control bg-light">
                            {values.adultCost || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="form-group mb-3">
                          <label>Child Cost</label>
                          <div className="form-control bg-light">
                            {values.childCost || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <FormSection>
                    <div className="col-sm-5">
                      <label>Start Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values.startDate}
                        onChange={(date) => setFieldValue("startDate", date)}
                      />
                    </div>

                    <div className="col-sm-5">
                      <InputField
                        label="Start Time"
                        name="startTime"
                        type="time"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="col-sm-5">
                      <label>End Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values.endDate}
                        onChange={(date) => setFieldValue("endDate", date)}
                      />
                    </div>
                    <div className="col-sm-5">
                      <InputField
                        label="End Time"
                        name="endTime"
                        type="time"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                  </FormSection>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSetup}
              >
                Setup Transfer
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default InsertTransfer;
