import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import CustomModal from "../../layouts/CustomModal";
import { useNavigate } from "react-router-dom";
import { Formik, useFormik } from "formik";
import InputField from "./InputField";
import SelectField from "./SelectField";
import { axiosPost, axiosPut } from "../../../services/AxiosInstance";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../store/slices/formSlice";
import { useAsync } from "../../utilis/useAsync";
import { notifyCreate, notifyError } from "../../utilis/notifyMessage";
import { URLS } from "../../../constants";

const ResetPassword = (props) => {
  const {
    setShowModal,
    showModal,
    username='',
    setUsername,
  } = props;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const date = new Date();
  const isAdmin = !!username;
  const url = URLS.CHANGE_PASSWORD_URL;
  const title = 'Password'
  

  const initialValues = {
    username:'',
    current_password:'',
    new_password:'',
    c_password:'',
  };

  

  const formik = useFormik({
    initialValues: initialValues,
    validate: (values) => {
        const errors = {};
        if(!isAdmin && values.current_password == ''){
            errors.current_password = 'This Field is Required';
        }
        if(isAdmin && values.username == ''){
            errors.username = 'This Field is Required';
        }
        if(values.new_password == ''){
            errors.new_password = 'This Field is Required';
        }
        if(values.c_password == ''){
            errors.c_password = 'This Field is Required';
        }
        if (values.new_password !== values.c_password) {
          errors.new_password = 'Passwords do not match';
          errors.c_password = 'Passwords do not match';
        }
        return errors;
      },  
    onSubmit: async (values) => {
      // Handle form submission here
      let dataObj
      if(isAdmin){
        dataObj ={
            username:values.username,
            new_password:values.new_password,
            c_password:values.c_password,
          }
      }else{
        dataObj ={
          current_password:values.current_password,
          new_password:values.new_password,
          c_password:values.c_password,
        }
      }
      try {
        let response = await axiosPost(url, dataObj);
        if (response.success) {
        //   dispatch(FormAction.setRefresh());
          formik.resetForm()
          setShowModal(false);
          if (isAdmin) {
            setUsername("");
          }
          notifyCreate(`${isAdmin ? "Reset" : "Change"} ${title}`)
        }
      } catch (error) {
        console.log(error);
        notifyError(error)
      }
    },
  });
// console.log('err',formik.errors)    

useEffect(() => {
  if(!!username){
    formik.setFieldValue('username',username)
  }

  return () => {
    
  }
}, [username])

  

  return (
    <CustomModal
      showModal={showModal}
      title={`${isAdmin ? "Reset" : "Change"} ${title}`}
      handleModalClose={() => {
        setShowModal(false);
        if(isAdmin){
            setUsername("");
        }
        //   setFormComponent('setupForm')
        //   navigate('/enquiry/quotation')
      }}
    >
      <div className="card-body">
        <div className="basic-form">
          <form onSubmit={formik.handleSubmit}>
            <div className="row">
              <div className="mb-3 col-md-7">
                <InputField
                  label={isAdmin?'Username':'Current Password'}
                  name={isAdmin?'username':'current_password'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                  formik={formik}
                />
              </div>
              <div className="mb-3 col-md-6">
                <InputField
                  type='password'
                  label="New Password"
                  name="new_password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                  formik={formik}
                />
              </div>
              <div className="mb-3 col-md-6">
                <InputField
                  label="Confirm Password"
                  name="c_password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                  formik={formik}
                />
              </div>
            
            </div>
            <button type="submit" className="btn btn-primary">
              {`${isAdmin ? "Reset" : "Change"} ${title}`}
            </button>
          </form>
        </div>
      </div>
    </CustomModal>
  );
};

export default ResetPassword;
