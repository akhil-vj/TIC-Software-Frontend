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
  const TypeOptions = ["Supplier 1", "Supplier 2", "Supplier 3"];
  const StatusOptions = ["Mail to", "Pending", "Completed"];
  const PaymentOptions = [ "Pending", "Success"];
  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          setShowModal(false);
          notify({ message: "Supplier Payment Added Successfully" });
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
            title={"Add Supplier Payment"}
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
                    <div className="form-group mb-3 col-md-4">
                      <SelectField
                        label="Supplier"
                        name={"supplier"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={TypeOptions}
                      />
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <SelectField
                        label="Booking Status"
                        name={"status"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={StatusOptions}
                      />
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <SelectField
                        label="Payment Status"
                        name={"payment"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        options={PaymentOptions}
                      />
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <label>Cancellation Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values?.cancelDate}
                        onChange={(date) => setFieldValue("cancelDate", date)}
                      />
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <label>Due Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values?.dueDate}
                        onChange={(date) => setFieldValue("dueDate", date)}
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
                        label="Paid Amount"
                        name="paidAmount"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        type="number"
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
