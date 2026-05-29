import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import ReactSelect from "../../common/ReactSelect";
import { SETUP, URLS } from "../../../../constants";
import { getDefaultCurrency } from "../../../../constants/destinationCurrency";
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

const InsertHotel = ({ showModal, setShowModal, data, onClick, editId, onClose, itineraryDestination }) => {
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
    const quadCount = safeNum(values.quad);
    const extraCount = safeNum(values.extra);
    const childWCount = safeNum(values.childW);
    const childNCount = safeNum(values.childN);
    const totalAmount =
      singleCount * 1 * Number(roomData?.single_bed_amount || 0) +
      doubleCount * 2 * Number(roomData?.double_bed_amount || 0) +
      tripleCount * 3 * Number(roomData?.triple_bed_amount || 0) +
      quadCount * 4 * Number(roomData?.quad_bed_amount || 0) +
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
        const initialMealPlan = hotelDetailData?.rooms[0]?.meal_plans[0]
        if (initialMealPlan) {
          setFieldValue('mealPlan', [{ label: initialMealPlan?.name, value: initialMealPlan?.id }])
        }
        setFieldValue('roomType', roomTypeObj)
        setFieldValue('category', categoryObj)
        setFieldValue('image', hotelDetailData?.document_2[0]?.file_url)
      }
    }
  }, [editId, hotelId, hotelDetailData])

  const roomTypeId = values.roomType?.value
  useEffect(() => {
    if (roomTypeId) {
      const data = values.roomOption.find((val) => val.id == roomTypeId)
      if (data) {
        setSelectedRoom(data)
        const typeObj = { label: data?.market_type_name, value: data?.market_type_id }
        setFieldValue('type', typeObj)
        const currentMealPlan = data?.meal_plans && data.meal_plans[0];
        if (currentMealPlan) {
          setFieldValue('mealPlan', [{ label: currentMealPlan.name, value: currentMealPlan.id }]);
        } else {
          setFieldValue('mealPlan', []);
        }
        roomAllotement = [
          { name: "single", label: "single", allowed: data.single_bed_amount },
          { name: "double", label: "double", allowed: data.double_bed_amount },
          { name: "triple", label: "triple", allowed: data.triple_bed_amount },
          { name: "quad", label: "quad", allowed: data.quad_bed_amount },
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
                  <div style={{
                    background: '#fffbea',
                    borderRadius: '12px',
                    border: '0.5px solid #e8e2b0',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1rem',
                    width: '100%'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#a08c30',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      margin: '0 0 1rem'
                    }}>
                      Room Allotment
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                      gap: '12px'
                    }}>
                      {roomAllotement?.map((room) => {
                        const hasAmount = room.allowed !== undefined && room.allowed !== null && room.allowed !== 0;
                        const currencyCode = getDefaultCurrency(itineraryDestination || values.destination?.label);
                        return (
                          <div key={room.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              fontWeight: 500,
                              textTransform: 'capitalize'
                            }}>
                              {room.label}
                            </label>

                            <input
                              type="number"
                              name={room.name}
                              value={values[room.name] || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="0"
                              style={{
                                width: '100%',
                                background: '#ffffff',
                                border: '0.5px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                fontSize: '14px',
                                textAlign: 'center',
                                outline: 'none'
                              }}
                            />

                            <span style={{
                              fontSize: '11px',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              textAlign: 'center',
                              background: hasAmount ? '#fdf3c0' : '#f3f4f6',
                              color: hasAmount ? '#a08c30' : '#9ca3af'
                            }}>
                              {hasAmount ? `${currencyCode} ${room.allowed}` : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
