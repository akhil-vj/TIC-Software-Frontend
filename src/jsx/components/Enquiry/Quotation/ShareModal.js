import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import CustomModal from "../../../layouts/CustomModal";
import { useNavigate, useParams } from "react-router-dom";
import InputField from "../../common/InputField";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import ReactSelect from "../../common/ReactSelect";
import { parseDate } from "../../../utilis/date";
import { checkFormValue } from "../../../utilis/check";
import { useFormik } from "formik";

const ShareModal = ({ setFormComponent, setShowModal, showModal,isEdit }) => {
    const initialValues = {
        mode:'private'
    }
    const formik = useFormik({
            initialValues:initialValues
    })
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = formik;

  console.log('valu',values)
  const navigate = useNavigate();
  const [readOnly, setReadOnly] = useState(isEdit);


  const formSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
  };
  const isPrivate = values.mode === 'private'
  const onModeChange = (type='private') => {
    if(type == 'private'){
        setFieldValue('mode','private')
    }else{
        setFieldValue('mode','public')
    }
  }
  return (
    <>
      <CustomModal
        showModal={showModal}
        title={"Share"}
        handleModalClose={() => {
          setShowModal(false);
        }}
      >
        <div className="card-body">
          <div className="basic-form">
            <form>
              <div className="row">
                  <div className="col-sm-6 d-flex justify-content-end">
                    <button className={`btn ${isPrivate ?`btn-primary`:`btn-outline-primary`} w-100 mb-3`} type="button" onClick={()=>onModeChange()}>Share Privately</button>
                  </div>
                  <div className="col-sm-6 d-flex justify-content-end">
                    <button className={`btn ${!isPrivate ?`btn-primary`:`btn-outline-primary`} w-100 mb-3`} type="button" onClick={()=>onModeChange('public')}>Share Publicly</button>
                  </div>

                <div className="col-md-12">
                    <p>Share your itinerary privately via email to specific recipients. Recipients will be prompted to create a login in order to view this itinerary</p>
                </div>
                <div className="col-md-12">
                    <h6 className="mb-1">Clients</h6>
                    <p>Select client you would like to email this itinerary to.</p>
                </div>
                <div className="col-md-4">
                  <InputField
                    // inputClassName={readOnly?'':"custom-input"}
                    label="Name"
                    name="name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="col-md-4">
                  <InputField
                    // inputClassName={readOnly?'':"custom-input"}
                    label="Email"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="col-md-4">
                  <InputField
                    // inputClassName={readOnly?'':"custom-input"}
                    label="Number"
                    name="number"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="col-md-12">
                  <InputField
                    // inputClassName={readOnly?'':"custom-input"}
                    label="CC Mail"
                    name="ccMail"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="col-md-12">
                  <InputField
                    // inputClassName={readOnly?'':"custom-input"}
                    isTextarea={true}
                    label="Add a message"
                    name="message"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    // required
                    disabled={readOnly}
                  />
                </div>
               
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={formSubmit}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default ShareModal;
