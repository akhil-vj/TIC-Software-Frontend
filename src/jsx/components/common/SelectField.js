import React from "react";

function SelectField(props) {
  const {
    formClass='',
    selectClass='',
    label,
    name,
    values,
    setValue,
    selected = '',
    suffix='',
    options,
    optionValue,
    optionLabel,
    onChange,
    showLabelValue=false,
    formik,
    ...restProps
  } = props;

  const isRequired = restProps.required
  const isDisabled = restProps.disabled

  const handleSelectChange = (e) => {
    
    if(showLabelValue){
      const value = e.target.value
      const label = e.target.options[e.target.selectedIndex].text;
      const obj = {value,label}
      setValue(name,obj)
    }else{
      onChange(e)
    }
  } 
  return (
    <div className={`form-group mb-3 ${formClass}`}>
      {!!label && <label className="text-label">{label} {isRequired && !isDisabled && <span>*</span>}</label>}
      <div className="position-relative">
        <select
          {...restProps}
          id="inputState"
          className={`form-control ${selectClass}`}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            paddingRight: '35px'
          }}
          name={name}
          value={values && !!values[name] ? values[name] : selected}
          onChange={handleSelectChange}
        >
          {!!options?.length ? (
            <>
              
              {options.map((option, key) => (
                <option
                  key={key}
                  value={optionValue ? option[optionValue] : option}
                >
                  {`${suffix} ${optionLabel ? option[optionLabel] : option}`}
                </option>
              ))}
            </>
          ) : (
            <option value="option" disabled>
              Empty !
            </option>
          )}
        </select>
        <i 
          className="fa fa-chevron-down position-absolute" 
          style={{
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#666',
            fontSize: '12px'
          }}
        ></i>
      </div>
      {formik?.touched[name] && formik?.errors[name] && (
        <div
          className="invalid-feedback animated fadeInUp" 
          style={{ display: "block" }}
        >
          {formik.errors[name]}
        </div>
      )}
    </div>
  );
}

export default SelectField;