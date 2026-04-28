import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import ReactSelect from "../../common/ReactSelect";
import { SETUP, URLS } from "../../../../constants";
import InputField from "../../common/InputField";
import CustomModal from "../../../layouts/CustomModal";
import DatePicker from "react-datepicker";
import TimePickerPicker from "react-time-picker";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { FormSection } from "../../common/FormSection";
import { useAsync } from "../../../utilis/useAsync";
import { useParams } from "react-router-dom";
const typeOptions = [
  { label: "Type 1", value: "1" },
  { label: "Type 2", value: "2" },
  { label: "Type 3", value: "3" },
  { label: "Type 4", value: "4" },
];
const hotelOptions = [
  { label: "Option 1", value: "Option 1" },
  { label: "Option 2", value: "Option 2" },
  { label: "Option 3", value: "Option 3" },
];
const destinationOptions = [
  { value: "Dubai", label: "Dubai" },
  { value: "Qatar", label: "Qatar" },
  { value: "Europe", label: "Europe" },
  { value: "India", label: "India" },
  { value: "America", label: "America" },
];
const categoryOptions = [
  { label: "Category 1", value: "1" },
  { label: "Category 2", value: "2" },
  { label: "Category 3", value: "3" },
  { label: "Category 4", value: "4" },
];
const mealOptions = [
  { label: "Breakfast - 200 rs", value: "1" },
  { label: "Lunch - 250 rs", value: "2" },
  { label: "Dinner - 220 rs", value: "3" },
];
let roomAllotement

const addDays = (date, days = 1) => {
  if (!date) return date;
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const InsertHotel = ({ showModal, setShowModal, data, onClick, editId, onClose }) => {
  const { itineraryId } = useParams()
  const isItineraryId = !!itineraryId
  const hotelId = data?.id
  const hotelData = useAsync(`${URLS.HOTEL_URL}/${hotelId}`, !!hotelId)
  const hotelDetailData = hotelData?.data?.data
  const marketTypefetchData = useAsync(URLS.MARKET_TYPE_URL)
  const marketTypeData = marketTypefetchData?.data?.data
  const categoryfetchData = useAsync(URLS.PROPERTY_CATEGORY_URL)
  const categoryData = categoryfetchData?.data?.data
  const [selectedRoom, setSelectedRoom] = useState(hotelDetailData?.rooms[0])
  const isEdit = !!editId || editId === 0

  const defaultStartDate = new Date(SETUP.TODAY_DATE);
  const defaultEndDate = addDays(defaultStartDate);
  const initialValues = {
    startDate: defaultStartDate,
    startTime: '15:00',
    endDate: defaultEndDate,
    endTime: '11:00',
    option: hotelOptions[0],
    insertType: 'hotel'
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
  } = useFormik({ initialValues });

  const handleSetup = () => {
    // Calculate hotel amount from room counts × room rates so the pricing page
    // can display correct values immediately (before saving to backend).
    const roomData = values.roomOption?.find((r) => r.id == values.roomType?.value);
    const safeNum = (v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    };
    const singleCount = safeNum(values.single);
    const doubleCount = safeNum(values.double);
    const tripleCount = safeNum(values.triple);
    const extraCount = safeNum(values.extra);
    const childWCount = safeNum(values.childW);
    const childNCount = safeNum(values.childN);
    const totalAmount =
      singleCount * 1 * Number(roomData?.single_bed_amount || 0) +
      doubleCount * 2 * Number(roomData?.double_bed_amount || 0) +
      tripleCount * 3 * Number(roomData?.triple_bed_amount || 0) +
      extraCount * 1 * Number(roomData?.extra_bed_amount || 0) +
      childWCount * 1 * Number(roomData?.child_w_bed_amount || 0) +
      childNCount * 1 * Number(roomData?.child_n_bed_amount || 0);
    onClick({ ...values, amount: totalAmount, markup: values.markup || 0 }, setShowModal);
  };
  useEffect(() => {
    const showScheduleDate = data?.showScheduleDate
    setFieldValue('startDate', showScheduleDate || defaultStartDate)
    setFieldValue('endDate', showScheduleDate ? addDays(showScheduleDate) : defaultEndDate)
    if (isEdit) {
      setValues(data)
    } else {
      if (hotelDetailData) {
        const destinationObj = { label: hotelDetailData?.destination_name, value: hotelDetailData?.destination_id }
        const subDestinationObj = { label: hotelDetailData?.sub_destination_name, value: hotelDetailData?.sub_destination_id }
        const roomTypeObj = { label: hotelDetailData?.rooms[0]?.room_type_name, value: hotelDetailData?.rooms[0]?.id }
        const categoryObj = { label: hotelDetailData?.category_name, value: hotelDetailData?.category_id }
        setFieldValue('destination', destinationObj)
        setFieldValue('subDestination', subDestinationObj)
        setFieldValue('name', hotelDetailData?.name)
        setFieldValue('id', hotelDetailData?.id)
        setFieldValue('roomOption', hotelDetailData?.rooms)
        const initialMealPlan = selectedRoom?.meal_plans[0]
        setFieldValue('mealPlan', [{ label: initialMealPlan?.name, value: initialMealPlan?.id }])
        setFieldValue('roomType', roomTypeObj)
        setFieldValue('category', categoryObj)
        setFieldValue('image', hotelDetailData?.document_2[0]?.file_url)
      }
    }
  }, [editId, hotelId, hotelDetailData, selectedRoom])

  const roomTypeId = values.roomType?.value
  useEffect(() => {
    if (roomTypeId) {
      const data = values.roomOption.find((val) => val.id == roomTypeId)
      if (data) {
        setSelectedRoom(data)
        const typeObj = { label: data?.market_type_name, value: data?.market_type_id }
        setFieldValue('type', typeObj)
        roomAllotement = [
          { name: "single", label: "single", allowed: data.single_bed_amount },
          { name: "double", label: "double", allowed: data.double_bed_amount },
          { name: "triple", label: "triple", allowed: data.triple_bed_amount },
          { name: "extra", label: "extra", allowed: data.extra_bed_amount },
          { name: "childW", label: "child W", allowed: data.child_w_bed_amount },
          { name: "childN", label: "child N", allowed: data.child_n_bed_amount },
        ];
      }
    }
  }, [roomTypeId])
  return (
    <>
      <CustomModal
        showModal={showModal}
        title={`${isEdit ? 'Edit' : 'Create'} Hotel`}
        handleModalClose={() => {
          onClose(setShowModal)
          resetForm()
        }}
      >
        <div className="card-body">
          <div className="basic-form">
            <form>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-6">
                    <ReactSelect
                      label="Sub Destination"
                      value={values.subDestination}
                      onChange={(selected) =>
                        setFieldValue("destination", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={destinationOptions}
                      optionValue="value"
                      optionLabel="label"
                      isDisabled={true}
                    />
                  </div>
                  <div className="col-sm-6">
                    <InputField
                      label="Hotel Name"
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                      disabled={true}
                    />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect
                      label="Market Type"
                      value={values.type}
                      onChange={(selected) => setFieldValue("type", selected)}
                      onBlur={handleBlur}
                      // values={values}
                      options={marketTypeData}
                      optionValue="id"
                      optionLabel="name"
                    />
                  </div>

                  <div className="col-sm-6">
                    <ReactSelect
                      label="Category"
                      value={values.category}
                      onChange={(selected) =>
                        setFieldValue("category", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={categoryData}
                      optionValue="id"
                      optionLabel="name"
                    />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect
                      label="Room Type"
                      value={values.roomType}
                      onChange={(selected) => {
                        console.log('sele', selected)
                        setFieldValue("roomType", selected)
                      }
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={values.roomOption}
                      optionValue="id"
                      optionLabel="room_type_name"
                    />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect
                      label="Meal Plan"
                      value={values.mealPlan}
                      onChange={(selected) =>
                        setFieldValue("mealPlan", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={selectedRoom?.meal_plans}
                      optionValue="id"
                      optionLabel="name"
                      isMulti
                    />
                  </div>
                  <div className="col-sm-6">
                    <ReactSelect
                      label="Hotel Option"
                      value={values.option}
                      onChange={(selected) =>
                        setFieldValue("option", selected)
                      }
                      onBlur={handleBlur}
                      // values={values}
                      options={hotelOptions}
                      optionValue="value"
                      optionLabel="label"
                    />
                  </div>
                  <FormSection bg={'#fffada'}>
                    {/* <div className="col-sm-4">
                    <InputField
                      label="No of person"
                      name="person"
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      values={values}
                    />
                  </div> */}
                    {roomAllotement?.map((data) => (
                      <div className="col-sm-3 col-4 col-md-2">
                        <InputField
                          mb="0"
                          label={data.label}
                          name={data.name}
                          type="number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          values={values}
                        />
                        <p className="text-danger mb-3 mt-1" style={{ fontSize: '10px' }}>{`amount ${data.allowed}`}</p>
                      </div>
                    ))}
                  </FormSection>
                  <FormSection>
                    <div className="col-sm-5">
                      <label>Check In</label>
                      <DatePicker
                        className="form-control"
                        selected={values.startDate}
                        onChange={(date) => setFieldValue("startDate", date)}
                      />
                    </div>

                    <div className="col-sm-5">
                      <InputField
                        label="Start Time"
                        name="startTime"
                        type="time"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                    <div className="col-sm-5">
                      <label>Check Out</label>
                      <DatePicker
                        className="form-control"
                        selected={values.endDate}
                        onChange={(date) => setFieldValue("endDate", date)}
                      />
                    </div>
                    <div className="col-sm-5">
                      <InputField
                        label="End Time"
                        name="endTime"
                        type="time"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                      />
                    </div>
                  </FormSection>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSetup}
              >
                Setup Hotel
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default InsertHotel;
