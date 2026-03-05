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

  const formSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
    // setFormComponent('packageForm')
  };
  const initialValues = { paymentDate: date };
  const TypeOptions = ["Cash", "Upi", "Bank"];
  const StatusOptions = ["Unpaid", "Pending", "Paid"];
  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          setShowModal(false);
          notify({ message: "Payment Added Successfully" });
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
            title={"Add Payment"}
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
                    {/* <div className="mb-3 col-md-4">
                      <InputField
                        label="Payment Id"
                        name="paymentId"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div> */}
                    <div className="mb-3 col-md-4">
                      <InputField
                        label="Trans Id"
                        name="TransId"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
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
                    <div className="form-group mb-3 col-md-4">
                      <SelectField
                        label="Status"
                        name={"status"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={StatusOptions}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <InputField
                        label="Amount"
                        name="amount"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        type="number"
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <InputField
                        label="Convience Fee"
                        name="fee"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        type="number"
                      />
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <label>Payment Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values?.paymentDate}
                        onChange={(date) => setFieldValue("paymentDate", date)}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <InputField
                        label="Remarks"
                        name="remarks"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        isTextarea
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Add Payment
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
