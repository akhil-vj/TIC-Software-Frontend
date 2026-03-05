import React from "react";
import InputField from "../../../common/InputField";
import { useAsync } from "../../../../utilis/useAsync";
import { URLS } from "../../../../../constants";
import SelectField from "../../../common/SelectField";
import ReactSelect from "../../../common/ReactSelect";

const StepOne = ({ formik }) => {

  const destinationId = formik.values.destination?.value
  const subDestinationUrl = `${URLS.SUB_DESTINATION_URL}?destination_id=${destinationId}`

  const destinationData = useAsync(URLS.DESTINATION_URL)
  const subDestinationData = useAsync(subDestinationUrl, destinationId)
  const categoryData = useAsync(URLS.PROPERTY_CATEGORY_URL)
  const propertyTypeData = useAsync(URLS.PROPERTY_TYPE_URL)

  const errors = formik.errors
  // console.log(subDestinationUrl, 'data', subDestinationData,)
  // console.log('err',errors)
  return (
    <section>
      <div className="row">
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Hotel Name"
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
              formik={formik}
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          {/* <SelectField
            label={'Destination'}
            name={'destination'}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            values={formik.values}
            options={destinationData?.data?.data}
            optionValue="id"
            optionLabel="name"
          /> */}
          <ReactSelect
                  label="Destination"
                  options={destinationData?.data?.data}
                  value={formik.values.destination}
                  onChange={(selected) => formik.setFieldValue("destination", selected)}
                  optionValue="id"
                  optionLabel="name"
                  inputId='destination'
                  formik={formik}
                  onBlur={formik.handleBlur}
                  required
                />
        </div>
        <div className="col-lg-6 mb-2">
          {/* <SelectField
            label={'Sub Destination'}
            name={'subDestination'}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            values={formik.values}
            options={subDestinationData?.data?.data}
            optionValue="id"
            optionLabel="name"
          /> */}
          <ReactSelect
                  label="Sub Destination"
                  options={subDestinationData?.data?.data}
                  value={formik.values.subDestination}
                  onChange={(selected) => formik.setFieldValue("subDestination", selected)}
                  optionValue="id"
                  optionLabel="name"
                  inputId='subDestination'
                  formik={formik}
                  onBlur={formik.handleBlur}
                  required
                />
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Place"
              name="place"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
              formik={formik}
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <SelectField
            label={'Category'}
            name={'category'}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            values={formik.values}
            options={categoryData?.data?.data}
            optionValue="id"
            optionLabel="name"
            formik={formik}
            required
          />
        </div>
        <div className="col-lg-6 mb-2">
          <SelectField
            label={'Property Type'}
            name={'propertyType'}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            values={formik.values}
            options={propertyTypeData?.data?.data}
            optionValue="id"
            optionLabel="name"
            required
          />
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Sales Email"
              name="salesEmail"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
              formik={formik}
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Sales Number"
              name="salesNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Reservation Email"
              name="reservationEmail"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Reservation Number"
              name="reservationNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <InputField
              label="Phone Number"
              name="phoneNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              values={formik.values}
              formik={formik}
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <InputField
            isTextarea
            label="Address"
            name="address"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            values={formik.values}
            formik={formik}
            required
          />
        </div>
      </div>
    </section>
  );
};

export default StepOne;
