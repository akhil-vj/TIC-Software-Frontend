import { Formik } from "formik";
import React from "react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import InputField from "../../../common/InputField";
import SelectField from "../../../common/SelectField";
import ReactSelect from "../../../common/ReactSelect";
import { Button, Dropdown, Table } from "react-bootstrap";
import { SETUP, URLS } from "../../../../../constants";
import { useAsync } from "../../../../utilis/useAsync";
import { CheckBoxField } from "../../../common/CheckBoxField";
import { FileUploader } from "../../../common/FileUploader";
import { notifyError } from "../../../../utilis/notifyMessage";

const SelectInputComponent = ({
  label,
  name,
  values,
  handleChange,
  handleBlur,
  setFieldValue,
}) => {
  const booleanOptions = [
    { label: "No", value: false },
    { label: "Yes", value: true },
  ];
  return (
    <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-2">
      <SelectField
        label={label}
        name={`${name}Select`}
        onChange={(e) =>
          setFieldValue(
            `${name}Select`,
            e.target.value == "true" ? true : false,
          )
        }
        onBlur={handleBlur}
        values={values}
        options={booleanOptions}
        optionValue="value"
        optionLabel="label"
      />
      {values[`${name}Select`] && (
        <>
          {/* <div className="form-group mb-3"> */}
          <InputField
            name={name}
            type="number"
            onChange={handleChange}
            onBlur={handleBlur}
            values={values}
          />
          {/* </div> */}
        </>
      )}
    </div>
  );
};
const StepTwo = ({ formik: parentFormik }) => {

  const tableData = parentFormik?.values?.addRoom
  const marketTypeData = useAsync(URLS.MARKET_TYPE_URL)
  const roomTypeData = useAsync(URLS.ROOM_TYPE_URL)
  const mealTypeData = useAsync(URLS.MEAL_PLAN_URL)
  const roomAmenityData = useAsync(URLS.ROOM_AMENITIES_URL)

  const showPassword = true;
  const initialValues = {
    marketType: "",
    roomType: "",
    roomImg: [],
    roomAmentity: [],
    mealPlan: [],
    alloment: false,
    cutOff: 0,
    roomStartDate: SETUP.TODAY_DATE,
    roomEndDate: SETUP.TODAY_DATE,
    singleBed: 0,
    doubleBed: 0,
    tripleBedSelect: false,
    tripleBed: 0,
    extraBedSelect: false,
    extraBed: 0,
    childWBedSelect: false,
    childWBed: 0,
    childNBedSelect: false,
    childNBed: 0,
    occupancy: 0,
    mealType: [],
    mealAmount: 0,
    availableFrom: SETUP.TODAY_DATE,
    availableTo: SETUP.TODAY_DATE,
    editRoom:-1
  };
  const marketTypeOptions = ["Type 1", "Type 2", "Type 3"];
  const mealOptions = [
    { label: "Break fast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Dinner", value: "dinner" },
  ];
  const amenityData = [1, 2, 3, 4, 5];
  const formatDate = (date) => {
    const localDate = new Date(date).toLocaleDateString();
    return localDate;
  };
  const addDays = (date, days = 1) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const handleEdit = (id, value, setValue, name = 'addRoom') => {
    const filteredVal = value.filter((val, i) => i == id);
    setValue({...filteredVal[0],editRoom:id});
  };
  const handleDelete = (id, value, setValue, name = 'addRoom') => {
    const filteredVal = value.filter((val, i) => i !== id);
    setValue(name, filteredVal);
  };
  return (
    <section>
      <Formik
        initialValues={initialValues}
        // validationSchema={loginSchema}
        onSubmit={(values, { setSubmitting }) => {
          // setTimeout(() => {
          //   alert(JSON.stringify(values, null, 2));
          //   setSubmitting(false);
          // }, 400);
        }}
      >
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          setValues,
          resetForm
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                <h4>Room Details</h4>
              </div>
              <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-2">
                <ReactSelect
                        label="Market Type"
                        options={marketTypeData?.data?.data}
                        value={values.marketType}
                        onChange={(selected) =>
                          setFieldValue("marketType", selected)
                        }
                        optionValue="id"
                        optionLabel="name"
                        required
                      />
              </div>
              <div className="col-6 col-sm-4 col-md-3 col-lg-2 m-b30">
                <label>From Date</label>
                <DatePicker
                dateFormat="yyyy-MM-dd"
                  className="form-control"
                  selected={new Date(values.roomStartDate)}
                  onChange={(date) => {
                    setFieldValue("roomStartDate", date)
                    if(new Date(values.roomEndDate) <= new Date(date)){
                      setFieldValue("roomEndDate", addDays(date,1))
                    }
                  }}
                />
              </div>
              <div className="col-6 col-sm-4 col-md-3 col-lg-2 m-b30">
                <label>To Date</label>
                <DatePicker
                dateFormat="yyyy-MM-dd"
                  className="form-control"
                  selected={new Date(values.roomEndDate)}
                  onChange={(date) => {
                    if(new Date(date) <= new Date(values.roomStartDate)){
                      notifyError('To Date must be after From Date');
                      setFieldValue("roomEndDate", addDays(values.roomStartDate,1))
                    }else{
                      setFieldValue("roomEndDate", date)
                    }
                  }}
                />
              </div>
              <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-2">
                <div className="form-group mb-3">
                <ReactSelect
                  label="Room Type"
                  options={roomTypeData?.data?.data}
                  value={values.roomType}
                  onChange={(selected) => setFieldValue("roomType", selected)}
                  optionValue="id"
                  optionLabel="name"
                  required
                />
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-3 col-lg-2  mb-2">
                <div className="form-group mb-3">
                  <InputField
                    label="Single Bed"
                    name="singleBed"
                    type="number"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                  />
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-3 col-lg-2  mb-2">
                <div className="form-group mb-3">
                  <InputField
                    label="Double Bed"
                    name="doubleBed"
                    type="number"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    values={values}
                  />
                </div>
              </div>
              <SelectInputComponent
                label={"Triple Bed"}
                name="tripleBed"
                values={values}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />
              <SelectInputComponent
                label={"Extra Bed"}
                name="extraBed"
                values={values}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />
              <SelectInputComponent
                label={"Child W Bed"}
                name="childWBed"
                values={values}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />
              <SelectInputComponent
                label={"Child N Bed"}
                name="childNBed"
                values={values}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />
              <div className="col-6 col-sm-4 col-md-3 col-lg-2  mb-2">
                <InputField
                  label="Occupancy"
                  name="occupancy"
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  values={values}
                />
              </div>
              <div className="row mb-3">
                <div className="col-12">
                  <h4>Amentities *</h4>
                </div>
                <div className="col-12">
                  <div className="form-group">
                    {roomAmenityData?.data?.data?.map((data, key) => (
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
                      //   {/* <span className="ms-2 amenity-count">{`12${key}`}</span> */}
                      // </div>
                      <>
                      <CheckBoxField
                        index={key}
                        name='roomAmentity'
                        // onChange={handleChange}
                        setValue={setFieldValue}
                        selectedValues={values.roomAmentity}
                        onBlur={handleBlur}
                        value={data.id}
                        inputValue={data.name}
                        checkValue={values.roomAmentity}
                      />
                      </>
                    ))}
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12">
                  <h4>Room Images *</h4>
                </div>
                <div className="col-lg-6">
                  {/* <div className="form-group">
                    <div className="my-3">
                      <label htmlFor="formFileMultiple" className="form-label">
                        Multiple files uploader
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultiple"
                        multiple
                      />
                    </div>
                  </div> */}
                  <FileUploader
                    // label='Room images'
                    name="roomImg"
                    // onChange={onChange}
                    onBlur={handleBlur}
                    values={values}
                    setFieldValue={setFieldValue}
                    isMulti
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <h4>Meals Plan *</h4>
                </div>
                <div className="col-lg-6">
                  <div className="row">
                    <div className="col-6">
                      <ReactSelect
                        options={mealTypeData?.data?.data}
                        // isMulti
                        value={values.mealType}
                        onChange={(selected) =>
                          setFieldValue("mealType", selected)
                        }
                        optionValue="id"
                        optionLabel="name"
                      />
                    </div>
                    <div className="col-3">
                      <div className="form-group mb-3">
                        <InputField
                          name="mealAmount"
                          type="number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          values={values}
                        />
                      </div>
                    </div>
                    <div className="col-3">
                      <Button
                        className="me-2"
                        variant="primary"
                        onClick={() => {
                          const amountVal = Number(values.mealAmount);
                          if(!values.mealType?.value){
                            notifyError('Select a meal plan');
                            return;
                          }
                          if(!(amountVal > 0)){
                            notifyError('Meal plan amount must be greater than 0');
                            return;
                          }
                          setFieldValue("mealPlan", [
                            ...values.mealPlan,
                            {
                              id: values.mealType.value,
                              name: values.mealType.label,
                              amount: amountVal,
                            },
                          ])
                        }}
                      >
                        <i className="fa-brands fa-plus fa-lg me-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                  {values.mealPlan?.length !== 0 && (
                    <div className="mt-3">
                      <Table responsive className="custom-table-bordered">
                        <thead className="thead-table">
                          <tr>
                            <th>#</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {values.mealPlan.map((plan, key) => (
                            <tr key={key}>
                              <th>{key + 1}</th>
                              <td>
                                {/* {plan.type
                                  ?.map((type) => type.label)
                                  .join(" - ")} */}
                                {plan?.name}
                              </td>
                              <td>{plan.amount}</td>
                              <td>
                                <div className="d-flex">
                                  {/* <button
                                    className="btn bg-main btn-xs sharp me-1"
                                    onClick={() =>
                                      handleEdit(key, values.mealPlan, setFieldValue, 'mealPlan')
                                    }
                                  >
                                    <i className="fas fa-pencil-alt"></i>
                                  </button> */}
                                  <button
                                    className="btn bg-main btn-xs sharp"
                                    onClick={() =>
                                      handleDelete(
                                        key,
                                        values.mealPlan,
                                        setFieldValue,
                                        'mealPlan'
                                      )
                                    }
                                  >
                                    <i className="fa fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
                <div className="col-lg-6">
                  <div className="row">
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="col-form-label  pt-0">
                          Alloment
                        </label>
                        <div className="form-group mb-0">
                          <label className="radio-inline me-3">
                            <input
                              type="radio"
                              name="optradio"
                              onClick={() => setFieldValue("alloment", true)}
                            />{" "}
                            Yes
                          </label>
                          <label className="radio-inline me-3">
                            <input
                              type="radio"
                              name="optradio"
                              defaultChecked
                              onClick={() => setFieldValue("alloment", false)}
                            />{" "}
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* <div className="col-6 col-lg-4">
                      <label>From Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values.availableFrom}
                        onChange={(date) =>
                          setFieldValue("availableFrom", date)
                        }
                      />
                    </div>
                    <div className="col-6 col-lg-4">
                      <label>To Date</label>
                      <DatePicker
                        className="form-control"
                        selected={values.availableTo}
                        onChange={(date) => setFieldValue("availableTo", date)}
                      />
                    </div> */}
                    <div className="col-6 col-lg-4">
                      <InputField
                        label="Cut Off"
                        name="cutOff"
                        type="number"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                 
                    <div className="col-12 d-flex">
                    {values.editRoom !== -1  && <div className="me-2">
                      <Button
                        className="me-0"
                        variant="primary"
                        onClick={() => {
                          resetForm()
                        }
                        }
                      >
                        Cancel
                      </Button>
                    </div>}
                      <Button
                        className="me-0"
                        variant="primary"
                        onClick={() => {
                          if(!values.roomAmentity?.length){
                            notifyError('Select at least one room amenity');
                            return;
                          }
                          if(values.editRoom === -1){
                          parentFormik.setFieldValue("addRoom", [
                            ...tableData,
                            { ...values },
                          ])}else{
                            const filterData = tableData.map((data,ind)=>{
                              if(ind == values.editRoom){
                                return values
                              }
                              else{
                                return data
                              }
                            })
                            parentFormik.setFieldValue('addRoom',filterData)
                          }
                          resetForm()
                        }
                        }
                      >
                        {values.editRoom !== -1?'Edit':'Add'} Room Details
                      </Button>
                    </div>
                  </div>
                </div>
                {!!tableData?.length && (
                  <div className="col-12 mt-4">
                    <Table responsive className="custom-table-bordered">
                      <thead className="thead-table">
                        <tr>
                          <th>#</th>
                          <th>From Date</th>
                          <th>To Date</th>
                          <th>Market Type</th>
                          <th>Room Type</th>
                          {/* <th>Meal Plan</th> */}
                          <th>Single Bed</th>
                          <th>Double Bed</th>
                          <th>Triple Bed</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((data, key) => {
                          return (
                            <tr key={key}>
                              <th>{key + 1}</th>
                              <td>{formatDate(data.roomStartDate)}</td>
                              <td>{formatDate(data.roomEndDate)}</td>
                              <td>{data.marketType.label}</td>
                              <td>{data.roomType.label}</td>
                              {/* <td>{data.type?.map((type)=>type.label).join(' - ')}</td> */}
                              <td>{data.singleBed}</td>
                              <td>{data.doubleBed}</td>
                              <td>{data.tripleBed}</td>
                              <td>
                                <div className="d-flex">
                                  <button
                                    className="btn bg-main btn-xs sharp me-1"
                                    onClick={() =>
                                      handleEdit(key, tableData, setValues)
                                    }
                                  >
                                    <i className="fas fa-pencil-alt"></i>
                                  </button>
                                  <button
                                    className="btn bg-main btn-xs sharp"
                                    onClick={() =>
                                      handleDelete(
                                        key,
                                        tableData,
                                        parentFormik.setFieldValue,
                                      )
                                    }
                                  >
                                    <i className="fa fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </Formik>
    </section>
  );
};

export default StepTwo;
