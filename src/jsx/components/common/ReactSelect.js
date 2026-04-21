import React from "react";
import Select from "react-select";

function ReactSelect(props) {
  const { label, optionLabel = 'label', optionValue = 'value',className='',formik,showBorderOnDisabled, ...restProps } = props;
  const selectStyle = {
    borderColor: "#D5DFE7",
    padding: "2px 20px",
    borderRadius: "0.625rem",
  };
  const options = props.options
  const data = options?.map((opt) => {
    return { ...opt, label: opt[optionLabel], value: opt[optionValue] }
  })

  const isRequired = restProps.required
  const isDisabled = restProps.isDisabled
  const name = restProps.inputId
  let value = restProps.value
  
  // FIX: Ensure value matches the structure of data options
  // If value exists but label/value don't match data structure, find and reconstruct it
  if (value && data && data.length > 0) {
    const valueToCompare = value[optionValue] !== undefined ? value[optionValue] : value.value;
    const matchedOption = data.find(d => d.value === valueToCompare);
    if (matchedOption && (!value.label || value.label !== matchedOption.label)) {
      // Value object is incomplete or mismatched, use the matched option from data
      value = matchedOption;
    }
  }
  
  return (
    <div className="form-group mb-3">
      {label && <label className="text-label">{label} {isRequired && !isDisabled && <span>*</span>}</label>}
      <Select
        {...restProps}
        value={value}
        options={data}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            ...selectStyle,
            // borderColor: state.isDisabled ? 'transparent' : 'white',
            backgroundColor: state.isDisabled ? 'transparent' : 'white',
            cursor: state.isDisabled ? 'not-allowed' : 'default',
            borderColor: state.isDisabled && !showBorderOnDisabled ? 'transparent !important' : baseStyles.borderColor,
            padding: state.isDisabled ? '0px 0px !important' : '2px 20px',
            // height: state.isDisabled ? '0px !important' : '50px',
          }),
          indicatorSeparator: (provided, state) => ({
            ...provided,
            display: state.isDisabled ? 'none' : provided.display,
          }),
          dropdownIndicator: (provided, state) => ({
            ...provided,
            display: state.isDisabled ? 'none' : provided.display,
          }),
        }}
        classNames={{
          control: (state) => `form-control ${className}`,
        }}
      />
      {!value && formik?.touched[name] && formik?.errors[name] && (
            <div
            className="invalid-feedback animated fadeInUp" style={{ display: "block" }}>{formik.errors[name]}</div>
          )}
    </div>
  );
}

export default ReactSelect;
