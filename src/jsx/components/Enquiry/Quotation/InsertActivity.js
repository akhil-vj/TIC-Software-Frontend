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
import { useParams } from "react-router-dom";
import { useFormDraft } from "../../../utilis/useFormDraft";
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
  itineraryDestination,
}) => {
  const { itineraryId } = useParams();
  const destination = useAsync(URLS.DESTINATION_URL);
  const destinationOptions = destination?.data?.data;
  const isEdit = !!editId || editId === 0;
  const initialValues = {
    startDate: SETUP.TODAY_DATE,
    startTime: SETUP.START_TIME,
    endDate: SETUP.TODAY_DATE,
    endTime: SETUP.END_TIME,
    insertType: "activity",
    adultCost: 0,
    childCost: 0,
    adult: 0,
    child: 0,
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
    dirty,
  } = useFormik({ initialValues });

  const draftEngine = useFormDraft(`itineraryBuilder_InsertActivity_${itineraryId || 'new'}`);
  draftEngine.useDraftAutoSave(values, dirty);

  useEffect(() => {
    const draftData = draftEngine.getDraft();
    if (draftData) {
      if (draftData.startDate) draftData.startDate = new Date(draftData.startDate);
      if (draftData.endDate) draftData.endDate = new Date(draftData.endDate);
      setValues(draftData);
    }
  }, []);

  const handleSetup = () => {
    draftEngine.clearDraft();
    onClick(values, setShowModal);
    resetForm();
  };
  useEffect(() => {
    console.log("edi", data);
    const showScheduleDateValue = data?.showScheduleDate ? new Date(data.showScheduleDate) : null;
    if(showScheduleDateValue && !isNaN(showScheduleDateValue)){
      setFieldValue('startDate',showScheduleDateValue)
      setFieldValue('endDate',showScheduleDateValue)
    }
    setFieldValue('adult', data?.adult ?? data?.adultCount ?? 0)
    setFieldValue('child', data?.child ?? data?.childCount ?? 0)
    if (isEdit) {
      const parsedData = { ...data };
      if (parsedData.startDate) parsedData.startDate = new Date(parsedData.startDate);
      if (parsedData.endDate) parsedData.endDate = new Date(parsedData.endDate);
      setValues(parsedData);
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
          draftEngine.clearDraft(); // clear draft on manual cancel
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
                      label="Adult count"
                      name="adult"
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                    />
                  </div>
                  <div className="col-sm-6">
                    <InputField
                      label="Child count"
                      name="child"
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
