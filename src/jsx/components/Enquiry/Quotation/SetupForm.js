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
import {ModeBtn} from "../../common/ModeBtn";

const SetupForm = ({ formik, setFormComponent, setShowModal, showModal,isEdit }) => {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = formik;

  const navigate = useNavigate();
  const destinationData = useAsync(URLS.DESTINATION_URL)
  const [readOnly, setReadOnly] = useState(isEdit);


  const formSubmit = (e) => {
    // e.preventDefault();
    setShowModal(false);
    setFormComponent("packageForm");
  };
  return (
    <>
      <CustomModal
        showModal={showModal}
        title={"Create itinerary"}
        handleModalClose={() => {
          setShowModal(false);
          setFormComponent("setupForm");
          navigate(-1);
        }}
      >
        <div className="card-body">
          <div className="basic-form">
            <form>
              <div className="row">
              {/* {isEdit &&
                  <div className="col-sm-12 d-flex justify-content-end">
                    <button className="btn btn-primary mb-3" type="button" onClick={()=>{setReadOnly((prev)=>!prev)}}>{readOnly?'Read Mode':'Write Mode'}</button>
                  </div>
                  
                  } */}
                  <ModeBtn className="col-sm-12 d-flex justify-content-end" isEdit={isEdit} 
                  readOnly={readOnly} setReadOnly={setReadOnly}/>
                <div className="col-md-4">
                  <InputField
                    inputClassName={readOnly?'':"custom-input"}
                    label="Package Name"
                    name="packageName"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="form-group mb-3 col-md-4">
                  <label>Start Date</label>
                  <DatePicker
                    className={readOnly?'form-control ':"form-control custom-input"}
                    selected={values.formStartDate}
                    onChange={(date) => setFieldValue("formStartDate", date)}
                    disabled={readOnly}
                  />
                </div>
                <div className="form-group mb-3 col-md-4">
                  <label>End Date</label>
                  <DatePicker
                    className={readOnly?'form-control ':"form-control custom-input"}
                    selected={values.formEndDate}
                    onChange={(date) => setFieldValue("formEndDate", date)}
                    disabled={readOnly}
                  />
                </div>
                <div className="col-md-4">
                  <InputField
                    inputClassName={readOnly?'':"custom-input"}
                    label="Adult"
                    name="adult"
                    type='number'
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
                    inputClassName={readOnly?'':"custom-input"}
                    label="Child"
                    name="child"
                    type='number'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                    formik={formik}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="col-md-4">
                <ReactSelect
                  label="Destination"
                  options={destinationData?.data?.data}
                  value={values.destination}
                  onChange={(selected) => setFieldValue("destination", selected)}
                  optionValue="id"
                  optionLabel="name"
                  inputId='destination'
                  formik={formik}
                  onBlur={handleBlur}
                  className='custom-input'
                  required
                  isDisabled={readOnly}
                />
                </div>
                <div className="form-group mb-3 col-md-4">
                  <label>Validity</label>
                  <DatePicker
                    className={readOnly?'form-control ':"form-control custom-input"}
                    selected={values.formValidityDate}
                    onChange={(date) => setFieldValue("formValidityDate", date)}
                    disabled={readOnly}
                  />
                </div>
              </div>
              {/* <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <label>State</label>
                      <select
                        defaultValue={"option"}
                        id="inputState"
                        className="form-control"
                      >
                        <option value="option" disabled>
                          Choose...
                        </option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                        <option>Option 3</option>
                      </select>
                    </div>
                    <div className="form-group col-md-2">
                      <label>Zip</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" />
                      <label className="form-check-label">Check me out</label>
                    </div>
                  </div> */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={formSubmit}
              >
                Setup itinerary
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default SetupForm;
