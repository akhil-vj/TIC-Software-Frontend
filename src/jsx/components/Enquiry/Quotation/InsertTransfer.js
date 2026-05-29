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
import { useParams } from "react-router-dom";
import { useFormDraft } from "../../../utilis/useFormDraft";
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
  const { itineraryId } = useParams();
  const destination = useAsync(URLS.DESTINATION_URL);
  const destinationOptions = destination?.data?.data;
  const vehicleTypeData = useAsync(URLS.VEHICLE_TYPE_URL);
  const vehicleTypeOptions = vehicleTypeData?.data?.data?.map(item => ({
    label: item.name,
    value: item.name
  })) || [];

  // Fetch all transfers so estimations are always available (even during edit)
  const transferFetchData = useAsync(URLS.TRANSFER_URL);
  const allTransfers = transferFetchData?.data?.data || [];

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
    dirty
  } = useFormik({ initialValues });

  const draftEngine = useFormDraft(`itineraryBuilder_InsertTransfer_${itineraryId || 'new'}`);
  draftEngine.useDraftAutoSave(values, dirty);

  useEffect(() => {
    const draftData = draftEngine.getDraft();
    if (draftData) {
      if (draftData.startDate) draftData.startDate = new Date(draftData.startDate);
      if (draftData.endDate) draftData.endDate = new Date(draftData.endDate);
      setValues(draftData);
    }
  }, []);

  // Resolve estimations: from data prop (add mode) or by looking up the transfer by ID (edit mode)
  const getEstimations = () => {
    if (data?.estimations && data.estimations.length > 0) {
      return data.estimations;
    }
    // Look up by transfer ID in the full transfer list
    const transferId = data?.id;
    if (transferId && allTransfers.length > 0) {
      const found = allTransfers.find(t => t.id === transferId);
      if (found?.estimations) return found.estimations;
    }
    return [];
  };

  const handleSetup = () => {
    draftEngine.clearDraft();
    onClick(values, setShowModal);
    resetForm();
  };

  useEffect(() => {
    if (!data) return;

    if (isEdit) {
      // --- EDIT MODE ---
      const editType = data?.type?.value?.toUpperCase() || data?.type?.label?.toUpperCase() || "PRIVATE";
      setValues({
        ...initialValues,
        ...data,
        startDate: data?.startDate ? new Date(data.startDate) : (data?.showScheduleDate ? new Date(data.showScheduleDate) : initialValues.startDate),
        endDate: data?.endDate ? new Date(data.endDate) : (data?.showScheduleDate ? new Date(data.showScheduleDate) : initialValues.endDate),
        type: { label: editType, value: editType },
        cost: data?.cost ?? 0,
        adultCost: data?.adultCost ?? 0,
        childCost: data?.childCost ?? 0,
      });
    } else {
      // --- ADD MODE ---
      let newType = initialValues.type;
      let vehicleType = undefined;
      let cost = 0;
      let adultCost = 0;
      let childCost = 0;

      const estimations = getEstimations();
      if (estimations.length > 0) {
        const estimation = estimations[0];
        const estType = estimation?.type ? estimation.type.toUpperCase() : "PRIVATE";
        newType = { label: estType, value: estType };
        if (estType === "PRIVATE" && estimation?.vehicletype) {
          vehicleType = { label: estimation.vehicletype, value: estimation.vehicletype };
        }
        cost = estimation?.cost ?? 0;
        adultCost = estimation?.adult_cost ?? 0;
        childCost = estimation?.child_cost ?? 0;
      }

      setValues({
        ...initialValues,
        startDate: data?.showScheduleDate ? new Date(data.showScheduleDate) : initialValues.startDate,
        endDate: data?.showScheduleDate ? new Date(data.showScheduleDate) : initialValues.endDate,
        destination: {
          label: data?.destination?.name,
          value: data?.destination?.name,
        },
        name: data?.vehicle_name,
        id: data?.id,
        image: data?.image,
        type: newType,
        vehicleType: vehicleType,
        cost: cost,
        adultCost: adultCost,
        childCost: childCost,
      });
    }
  }, [editId, data, showModal, allTransfers.length]);

  return (
    <>
      <CustomModal
        showModal={showModal}
        title={isEdit ? "Edit Transfer" : "Create Transfer"}
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
                      onChange={(selected) => {
                        setFieldValue("type", selected);
                        const estimations = getEstimations();
                        if (estimations.length > 0) {
                          if (selected?.value?.toUpperCase() === "SIC") {
                            const matchedEstimation = estimations.find(est =>
                              est.type?.toUpperCase() === "SIC"
                            );
                            if (matchedEstimation) {
                              setFieldValue("cost", matchedEstimation.cost ?? 0);
                              setFieldValue("adultCost", matchedEstimation.adult_cost ?? 0);
                              setFieldValue("childCost", matchedEstimation.child_cost ?? 0);
                            } else {
                              setFieldValue("cost", 0);
                              setFieldValue("adultCost", 0);
                              setFieldValue("childCost", 0);
                            }
                          } else if (selected?.value?.toUpperCase() === "PRIVATE") {
                            if (values.vehicleType) {
                              const matchedEstimation = estimations.find(est =>
                                est.type?.toUpperCase() === "PRIVATE" &&
                                est.vehicletype === values.vehicleType.value
                              );
                              if (matchedEstimation) {
                                setFieldValue("cost", matchedEstimation.cost ?? 0);
                                setFieldValue("adultCost", matchedEstimation.adult_cost ?? 0);
                                setFieldValue("childCost", matchedEstimation.child_cost ?? 0);
                              } else {
                                setFieldValue("cost", 0);
                                setFieldValue("adultCost", 0);
                                setFieldValue("childCost", 0);
                              }
                            }
                          }
                        }
                      }}
                      onBlur={handleBlur}
                      // values={values}
                      options={typeOptions}
                      optionValue="value"
                      optionLabel="label"
                      isSearchable={false}
                    />
                  </div>
                  {values.type?.value?.toUpperCase() === "PRIVATE" ? (
                    <>
                      <div className="col-sm-4">
                        <ReactSelect
                          label="Vehicle Type"
                          value={values.vehicleType}
                          onChange={(selected) => {
                            setFieldValue("vehicleType", selected);
                            const estimations = getEstimations();
                            if (estimations.length > 0) {
                              const matchedEstimation = estimations.find(est =>
                                est.type?.toUpperCase() === "PRIVATE" &&
                                est.vehicletype === selected.value
                              );
                              if (matchedEstimation) {
                                setFieldValue("cost", matchedEstimation.cost ?? 0);
                                setFieldValue("adultCost", matchedEstimation.adult_cost ?? 0);
                                setFieldValue("childCost", matchedEstimation.child_cost ?? 0);
                              } else {
                                setFieldValue("cost", 0);
                                setFieldValue("adultCost", 0);
                                setFieldValue("childCost", 0);
                              }
                            }
                          }}
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
                            {values.cost != null && values.cost !== '' ? values.cost : 'N/A'}
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
                            {values.adultCost != null && values.adultCost !== '' ? values.adultCost : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="form-group mb-3">
                          <label>Child Cost</label>
                          <div className="form-control bg-light">
                            {values.childCost != null && values.childCost !== '' ? values.childCost : 'N/A'}
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
                {isEdit ? "Update Transfer" : "Setup Transfer"}
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default InsertTransfer;

