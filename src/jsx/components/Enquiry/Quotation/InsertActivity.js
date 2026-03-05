import { useFormik } from "formik";
import React from "react";
import ReactSelect from "../../common/ReactSelect";
import { SETUP, URLS } from "../../../../constants";
import InputField from "../../common/InputField";
import CustomModal from "../../../layouts/CustomModal";
import DatePicker from "react-datepicker";
import TimePickerPicker from "react-time-picker";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { useEffect } from "react";
import { FormSection } from "../../common/FormSection";
import { useAsync } from "../../../utilis/useAsync";
const typeOptions = [
  { label: "Type 1", value: "1" },
  { label: "Type 2", value: "2" },
  { label: "Type 3", value: "3" },
  { label: "Type 4", value: "4" },
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

const InsertActivity = ({
  showModal,
  setShowModal,
  data,
  onClick,
  editId,
  onClose,
}) => {
  const destination = useAsync(URLS.DESTINATION_URL);
  const destinationOptions = destination?.data?.data;
  const isEdit = !!editId || editId === 0;
  const initialValues = {
    startDate: SETUP.TODAY_DATE,
    endDate: SETUP.TODAY_DATE,
    startTime: SETUP.START_TIME,
    endTime: SETUP.END_TIME,
    insertType: "activity",
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
    console.log("edi", data);
    const showScheduleDateValue = data?.showScheduleDate
    if(showScheduleDateValue){
      setFieldValue('startDate',showScheduleDateValue)
      setFieldValue('endDate',showScheduleDateValue)
    }
    setFieldValue('person',data?.personCount)
    if (isEdit) {
      setValues(data);
    } else {
      const destinationObj = {
        label: data?.destination?.name,
        value: data?.destination?.name,
      };
      setFieldValue("destination", destinationObj);
      setFieldValue("name", data?.activity_name);
      setFieldValue("id", data?.id);
    }
  }, [editId, data, showModal]);
  return (
    <>
      <CustomModal
        showModal={showModal}
        title={`${isEdit ? "Edit" : "Create"} Activity`}
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
                      optionValue="value"
                      optionLabel="label"
                    />
                  </div>
                  {/* <div className="col-sm-6">
                    <ReactSelect
                      label="Type"
                      value={values.type}
                      onChange={(selected) => setFieldValue("type", selected)}
                      onBlur={handleBlur}
                      // values={values}
                      options={typeOptions}
                      optionValue="value"
                      optionLabel="label"
                    />
                  </div> */}
                  <div className="col-sm-6">
                    <InputField
                      label="Activity name"
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                    />
                  </div>
                  <div className="col-sm-6">
                    <InputField
                      label="No of person"
                      name="person"
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                    />
                  </div>
                  <div className="col-sm-6">
                    <InputField
                      label="Description"
                      name="description"
                      // type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      isTextarea
                    />
                  </div>
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
                Setup Activity
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default InsertActivity;
