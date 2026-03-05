import React from "react";
import DatePicker from "react-datepicker";
import CustomModal from "../../../layouts/CustomModal";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import InputField from "../../common/InputField";
import SelectField from "../../common/SelectField";
import notify from "../../common/Notify";
import ReactSelect from "../../common/ReactSelect";


const AddModal = ({ setShowModal, showModal }) => {
  const navigate = useNavigate();
  const date = new Date();

  const initialValues = { cancelDate: date, dueDate: date };
  const TypeOptions = ["Task", "Call", "Meeting"];
  const reminderOptions = ["Yes", "No"];
  const assignedOptions = [
    { label: "Staff 1", value: "staff1" },
    { label: "Staff 2", value: "staff2" },
    { label: "Staff 3", value: "staff3" },
    { label: "Staff 4", value: "staff4" },
    { label: "Staff 5", value: "staff5" },
  ];
  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          setShowModal(false);
          notify({ message: "Follow Up Added Successfully" });
        }}
      >
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }) => (
          <CustomModal
            showModal={showModal}
            title={"Add Follow Ups"}
            handleModalClose={() => {
              setShowModal(false);
              //   setFormComponent('setupForm')
              //   navigate('/enquiry/quotation')
            }}
          >
            {console.log("val", values)}
            <div className="card-body">
              <div className="basic-form">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <SelectField
                        label="Type"
                        name={"type"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={TypeOptions}
                      />
                    </div>
                    <div className="mb-3 col-md-8">
                      <InputField
                        isTextarea
                        label="Description"
                        name="description"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <label>Reminder Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values?.cancelDate}
                        onChange={(date) => setFieldValue("cancelDate", date)}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <InputField
                        label="Time"
                        name="time"
                        type="time"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <SelectField
                        label="Set Reminder"
                        name={"remindertype"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={reminderOptions}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <ReactSelect
                        label="Assigned"
                        options={assignedOptions}
                        onChange={(selected) =>
                          setFieldValue("assigned", selected)
                        }
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Add Follow up
                  </button>
                </form>
              </div>
            </div>
          </CustomModal>
        )}
      </Formik>
    </>
  );
};

export default AddModal;
