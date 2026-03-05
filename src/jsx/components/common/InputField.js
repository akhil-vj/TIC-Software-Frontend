import { isDisabled } from "@testing-library/user-event/dist/utils";
import React from "react";

function InputField(props) {
  const {
    label,
    type = "text",
    isTextarea = false,
    placeholder = "",
    name,
    values,
    inputValue = '',
    className = '',
    mb=3,
    labelClassName = '',
    inputClassName = '',
    handleBlur,
    formik,
    ...restProps
  } = props;

  const isRequired = restProps.required
  const isDisabled = restProps.disabled
  return (
    <div className={`form-group mb-${mb} ${className}`}>
      {label && <label className={`text-label ${labelClassName}`}>{label} {isRequired && !isDisabled && <span>*</span>}</label>}
      {isTextarea ? (
        <textarea
          {...restProps}
          className={`form-control ${inputClassName}`}
          placeholder={placeholder}
          name={name}
          value={values && !!values[name] ? values[name] : inputValue}
        />
      ) : (
        <input
          {...restProps}
          key={name}
          type={type}
          className={`form-control ${inputClassName}`}
          placeholder={placeholder}
          name={name}
          min={0}
          value={values && values[name] || values[name] == 0 ? values[name] : inputValue}
          // onkeyup={handleBlur}
        />
      )}
      {/* {errors && errors[name] && <div
                            id="val-username1-error"
                            className="invalid-feedback animated fadeInUp"
                            style={{ display: "block" }}
                          >
                            {errors[name]}
                          </div>} */}
                          {/* <ErrorMessage name="email">
              {(error) => <div style={{ color: '#f00' }}>{error}</div>}
            </ErrorMessage> */}
             {formik?.touched[name] && formik?.errors[name] && (
            <div
            className="invalid-feedback animated fadeInUp" style={{ display: "block" }}>{formik.errors[name]}</div>
          )}
            
    </div>
  );
}

export default InputField;
