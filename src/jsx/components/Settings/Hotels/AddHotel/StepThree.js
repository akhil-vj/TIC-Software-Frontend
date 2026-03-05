import React from "react";
import { useAsync } from "../../../../utilis/useAsync";
import { URLS } from "../../../../../constants";
import { CheckBoxField } from "../../../common/CheckBoxField";

const StepThree = ({ formik }) => {

  const { data } = useAsync(URLS.HOTEL_AMENITIES_URL)

  return (
    <section>
      <div className="row">
        <div className="col-12">
          <h4>Amentities *</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            {data?.data?.map((data, key) => (
              // <div
              //   key={key}
              //   className="form-check form-check-inline  fw-normal"
              // >
              //   <label className="form-check-label">
              //     <input
              //       type="checkbox"
              //       className="form-check-input"
              //       value=""
              //     //   defaultChecked
              //     />
              //     {data.name}
              //   </label>
              //   <span className="ms-2 amenity-count">{`12${key}`}</span>
              // </div>
              <CheckBoxField
                index={key}
                name='hotelAmentity'
                // onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                setValue={formik.setFieldValue}
                value={data.id}
                inputValue={data.name}
                selectedValues={formik.values.hotelAmentity}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepThree;
