import React, { useEffect } from "react";

export function CheckBoxField(props) {
    const {
        index = '',
        name,
        value,
        inputValue = '',
        className = '',
        labelClassName = '',
        inputClassName = '',
        selectedValues=[],
        setValue,
        ...restProps
    } = props;

        const [isChecked,setIsChecked] = React.useState(false)
    
    const handleCheckboxChange = (event) => {
        const selectedId = event.target.value // Parse the ID as an integer
        // const checked = selectedValues.findIndex((item)=>item.id ? item.id == value : item == value)
        // console.log('evn',selectedId)
    
        // Check if the ID is already in the selected values array
        if (selectedValues.includes(selectedId)) {
          // Remove it from the array
          setValue(name,selectedValues.filter((id) => id !== selectedId));
        } else {
          // Add it to the array
          setValue(name,[...selectedValues, selectedId]);
        }
      };
    return (
        <div
            key={value}
            className={`form-check form-check-inline  fw-normal ${className}`}
        >
            <label className={`form-check-label ${labelClassName}`}>
                <input
                    {...restProps}
                    name={name}
                    type="checkbox"
                    className={`form-check-input ${inputClassName}`}
                    value={value}
                    onChange={handleCheckboxChange}
                    checked={selectedValues.includes(value)}
                />
                {inputValue}
            </label>
            {/* <span className="ms-2 amenity-count">{`12${key}`}</span> */}
        </div>
    );
}
