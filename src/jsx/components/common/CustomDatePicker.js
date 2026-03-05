import React from "react";
import DatePicker from "react-datepicker";
import { parseDate } from "../../utilis/date";

function CustomDatePicker(props) {
  const {
    label,
    dateFormat = "yyyy-MM-dd",
    name,
    selected,
    onChange,
    className = '',
    labelClassName = '',
    handleBlur,
    formik,
    ...restProps
  } = props;

  const isRequired = restProps.required
  return (
    <>
      {label && <label className={`text-label ${labelClassName}`}>{label} {isRequired && <span>*</span>}</label>}
      <DatePicker
      {...props}
                dateFormat={dateFormat}
                  className={`form-control ${className}`}
                  selected={parseDate(selected)}
                  onChange={onChange}
                />
             {formik?.touched[name] && formik?.errors[name] && (
            <div
            className="invalid-feedback animated fadeInUp" style={{ display: "block" }}>{formik.errors[name]}</div>
          )}
            
    </>
  );
}

export default CustomDatePicker;
