import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import CustomModal from "../../../layouts/CustomModal";
import notify from "../../common/Notify";
import { Formik, useFormik } from "formik";
import SelectField from "../../common/SelectField";
import InputField from "../../common/InputField";
import ReactSelect from "../../common/ReactSelect";
import { axiosPost, axiosPut } from "../../../../services/AxiosInstance";
import { URLS } from "../../../../constants";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useAsync } from "../../../utilis/useAsync";

const statusOptions = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 0 },
];

const AddAgent = ({ showModal, setShowModal, editId, setEditId }) => {
  const isEdit = !!editId;
  const url = URLS.AGENT_URL;
  const editUrl = `${URLS.AGENT_URL}/${editId}`;
  const editData = useAsync(editUrl, isEdit);
  const data = editData?.data?.data;

  const dispatch = useDispatch();
  const countryData = useAsync(URLS.COUNTRY_URL);
  
  const initialValues = {
    // Company Details
    companyName: '',
    shortName: '',
    
    // Contact Person Details
    contactName: '',
    email: '',
    phone: '',
    
    // Address Details
    address: '',
    
    // Status
    status: { label: "Active", value: 1 },
    country: null,
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
    resetForm
  } = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        let response;
        const data = {
          name: values.companyName,
          company_name: values.companyName,
          short_name: values.shortName,
          contact_name: values.contactName,
          phone: values.phone,
          email: values.email,
          address: values.address,
          status: values.status.value,
          country_id: values.country?.value,
        };

        if (isEdit) {
          response = await axiosPut(editUrl, data);
        } else {
          response = await axiosPost(url, data);
        }
        
        if (response.success) {
          dispatch(FormAction.setRefresh());
          resetForm();
          setShowModal(false);
          if (isEdit) {
            setEditId("");
          }
          notifyCreate('Agent', isEdit);
        }
      } catch (error) {
        const errMsg = error.response?.data?.data?.errors;
        const firstErr = Object.values(errMsg)[0][0];
        notifyError(firstErr ? firstErr : 'Oops Something Went Wrong');
      }
    }
  });

  useEffect(() => {
    if (isEdit && showModal) {
      const obj = {
        companyName: data?.company_name || data?.name,
        shortName: data?.short_name || '',
        contactName: data?.contact_name || data?.name,
        phone: data?.phone,
        email: data?.email,
        address: data?.address,
        status: data?.status === 1 ? { label: "Active", value: 1 } : { label: "Inactive", value: 0 },
        country: data?.country_id ? { label: data?.country_name, value: data?.country_id } : null,
      };
      setValues(obj);
    }

    return () => {
      resetForm();
    };
  }, [editId, data?.id, showModal]);

  return (
    <>
      <CustomModal
        showModal={showModal}
        title={`${isEdit ? 'Edit' : 'Add'} Agent`}
        handleModalClose={() => {
          setShowModal(false);
          setEditId('');
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Company Details Section */}
          <div className="mb-3">
            <h5 className="mb-2 pb-2 border-bottom" style={{ color: '#6c757d', fontSize: '15px', fontWeight: '600' }}>
              Company Details
            </h5>
            <div className="row">
              <div className="col-md-8 mb-2">
                <InputField
                  label="Agency / Company Full Name"
                  name="companyName"
                  placeholder="e.g. XYZ Holidays"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  values={values}
                />
              </div>
              <div className="col-md-4 mb-2">
                <InputField
                  label="Short Name"
                  name="shortName"
                  placeholder="e.g. XYZ Travels"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  values={values}
                />
              </div>
            </div>
          </div>

          {/* Contact Person Section */}
          <div className="mb-3">
            <h5 className="mb-2 pb-2 border-bottom" style={{ color: '#6c757d', fontSize: '15px', fontWeight: '600' }}>
              Contact Person
            </h5>
            <div className="row">
              <div className="col-md-6 mb-2">
                <InputField
                  label="Name"
                  name="contactName"
                  placeholder="e.g. John Doe"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  values={values}
                />
              </div>
              <div className="col-md-6 mb-2">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="e.g. user@domain.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  values={values}
                />
              </div>
              <div className="col-md-6 mb-2">
                <InputField
                  label="Phone Number"
                  name="phone"
                  placeholder="e.g. 9779212234"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  values={values}
                />
              </div>
              <div className="col-md-6 mb-2">
                <ReactSelect
                  isSearchable={true}
                  label="Country"
                  options={countryData?.data?.data}
                  optionLabel="name"
                  optionValue="id"
                  value={values?.country}
                  onChange={(selected) => setFieldValue("country", selected)}
                />
              </div>
              <div className="col-md-6 mb-2">
                <ReactSelect
                  isSearchable={false}
                  label="Status"
                  options={statusOptions}
                  optionLabel="label"
                  optionValue="value"
                  value={values?.status}
                  onChange={(selected) => setFieldValue("status", selected)}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-3">
            <h5 className="mb-2 pb-2 border-bottom" style={{ color: '#6c757d', fontSize: '15px', fontWeight: '600' }}>
              Address
            </h5>
            <div className="row">
              <div className="col-md-12 mb-2">
                <div className="form-group">
                  <label className="text-label">Full Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    rows="3"
                    placeholder="Enter complete address..."
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-3 pt-2 border-top">
            <button 
              type="submit" 
              className="btn btn-primary px-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : `${isEdit ? 'Update' : 'Save'} Agent`}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary px-4 ms-2"
              onClick={() => {
                setShowModal(false);
                setEditId('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default AddAgent;