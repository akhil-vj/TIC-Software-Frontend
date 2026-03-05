import React from "react";
import DatePicker from "react-datepicker";
import CustomModal from "../../../layouts/CustomModal";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import InputField from "../../common/InputField";
import SelectField from "../../common/SelectField";
import notify from "../../common/Notify";

const AddModal = ({ setShowModal, showModal }) => {
  const navigate = useNavigate();
  const date = new Date();

  const initialValues = { cancelDate: date, dueDate: date };
  const TypeOptions = ["Transfer", "Hotel", "Activity"];
  const SaluteOptions = [{label:'Mr',value:'Mr'},{label:'Ms',value:'Ms'}]
  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          setShowModal(false);
          notify({ message: "Supplier Added Successfully" });
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
            title={"Add Supplier"}
            handleModalClose={() => {
              setShowModal(false);
              //   setFormComponent('setupForm')
              //   navigate('/enquiry/quotation')
            }}
          >
            <div className="card-body">
              <div className="basic-form">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <InputField
                        label="City"
                        name="city"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <InputField
                        label="Company Name"
                        name="companyName"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="form-group mb-3 col-md-6">
                    <SelectField
                        label="Salute"
                        name={"salute"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={SaluteOptions}
                        optionValue='value'
                        optionLabel='label'
                        // required
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <InputField
                        label="First Name"
                        name="firstName"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <InputField
                        label="Last Name"
                        name="lastName"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <InputField
                        label="Email"
                        name="email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <InputField
                        label="Mobile"
                        name="mobile"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                    <InputField
                        isTextarea
                        label="Address"
                        name="address"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        // formik={formik}
                        // required
                   />
                    </div>
                    
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Add 
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
