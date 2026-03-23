import React from "react";
import { FileUploader } from "../../../common/FileUploader";

const StepFour = ({ formik }) => {
  return (
    <section>
      <FileUploader
        label='Hotel image'
        name="hotelImg"
        onBlur={formik.handleBlur}
        values={formik.values}
        setFieldValue={formik.setFieldValue}
        isMulti
      />
    </section>
  );
};

export default StepFour;
