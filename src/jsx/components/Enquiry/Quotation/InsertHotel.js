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

import { useFormDraft } from "../../../utilis/useFormDraft";

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
    insertType: 'hotel',
    roomRows: [],
    hasChildren: false,
    childWithBed: 0,
    childNoBed: 0
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
    resetForm,
    dirty
  } = useFormik({ initialValues });

  const draftEngine = useFormDraft(`itineraryBuilder_InsertHotel_${itineraryId || 'new'}`);
  draftEngine.useDraftAutoSave(values, dirty);

  useEffect(() => {
    const draftData = draftEngine.getDraft();
    if (draftData) {
      if (draftData.startDate) draftData.startDate = new Date(draftData.startDate);
      if (draftData.endDate) draftData.endDate = new Date(draftData.endDate);
      setValues(draftData);
    }
  }, []);

  const handleSetup = () => {
    
    let single = 0, double = 0, triple = 0, quad = 0, extra = 0;
    let twoBedroom = 0, threeBedroom = 0, fourBedroom = 0;
    let totalRoomCost = 0;

    const safeNum = (v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    };

    let totalExtraAdults = 0;

    (values.roomRows || []).forEach(row => {
      const rowRoomTypeId = row.roomTypeId || values.roomType?.value;
      const roomData = values.roomOption?.find((r) => r.id == rowRoomTypeId) || values.roomOption?.find((r) => r.id == values.roomType?.value);
      const numRooms = safeNum(row.numRooms) || 1;
      const pax = safeNum(row.paxStaying) || 1;
      let baseOcc = 2;
      let physicalBedrooms = 1;
      let baseRate = 0;

      if (row.bedType === 'single') {
        single += numRooms;
        baseOcc = 1; physicalBedrooms = 1;
        baseRate = Number(roomData?.single_bed_amount || 0);
      } else if (row.bedType === 'double') {
        double += numRooms;
        baseOcc = 2; physicalBedrooms = 1;
        baseRate = Number(roomData?.double_bed_amount || 0);
      } else if (row.bedType === 'triple') {
        triple += numRooms;
        baseOcc = 3; physicalBedrooms = 1;
        baseRate = Number(roomData?.triple_bed_amount || 0);
      } else if (row.bedType === 'quad') {
        quad += numRooms;
        baseOcc = 4; physicalBedrooms = 1;
        baseRate = Number(roomData?.quad_bed_amount || 0);
      } else if (row.bedType === 'two_bedroom') {
        twoBedroom += numRooms;
        baseOcc = 4; physicalBedrooms = 2;
        baseRate = Number(roomData?.two_bedroom_amount || 0);
      } else if (row.bedType === 'three_bedroom') {
        threeBedroom += numRooms;
        baseOcc = 6; physicalBedrooms = 3;
        baseRate = Number(roomData?.three_bedroom_amount || 0);
      } else if (row.bedType === 'four_bedroom') {
        fourBedroom += numRooms;
        baseOcc = 8; physicalBedrooms = 4;
        baseRate = Number(roomData?.four_bedroom_amount || 0);
      }

      const extraRate = Number(roomData?.extra_bed_amount || 0);
      const extraBedsAllowed = extraRate > 0 ? physicalBedrooms : 0;
      
      const extraPax = parseInt(row.extraBeds) || 0;
      totalExtraAdults += extraPax;

      totalRoomCost += (numRooms * baseRate) + (extraPax * extraRate);
    });

    const childW = values.hasChildren ? safeNum(values.childWithBed) : 0;
    const childN = values.hasChildren ? safeNum(values.childNoBed) : 0;
    
    extra = totalExtraAdults; // Just extra adults, childW is accounted for separately in childTotal and pricing payload

    const primaryRoomData = values.roomOption?.find((r) => r.id == (values.roomRows?.[0]?.roomTypeId || values.roomType?.value)) || values.roomOption?.find((r) => r.id == values.roomType?.value);
    const childTotal = 
      (childW * Number(primaryRoomData?.child_w_bed_amount || 0)) +
      (childN * Number(primaryRoomData?.child_n_bed_amount || 0));

    const totalAmount = totalRoomCost + childTotal;

    draftEngine.clearDraft();
    
    // Pass flat format back to SetupModal.js
    onClick({
      ...values,
      amount: totalAmount,
      markup: values.markup || 0,
      single, double, triple, quad, extra,
      two_bedroom: twoBedroom, three_bedroom: threeBedroom, four_bedroom: fourBedroom,
      childW, childN
    }, setShowModal);
  };

  useEffect(() => {
    const showScheduleDate = data?.showScheduleDate ? new Date(data.showScheduleDate) : null;
    setFieldValue('startDate', showScheduleDate || defaultStartDate)
    setFieldValue('endDate', showScheduleDate ? addDays(showScheduleDate) : defaultEndDate)
    if (isEdit) {
      const parsedData = { ...data };
      if (parsedData.startDate) parsedData.startDate = new Date(parsedData.startDate);
      if (parsedData.endDate) parsedData.endDate = new Date(parsedData.endDate);
      
      // Hydrate roomRows
      let newRoomRows = [];
      if (data.roomRows && data.roomRows.length > 0) {
        newRoomRows = [...data.roomRows];
      } else {
        let rowId = 1;
        let remainingExtra = parseInt(data.extra) || 0;

        const addRows = (bedType, count, baseOcc) => {
          if (count > 0) {
            // Put all remaining extra beds in the first row we create
            let extraToAssign = newRoomRows.length === 0 ? remainingExtra : 0;
            newRoomRows.push({
              _id: rowId++,
              numRooms: count,
              paxStaying: baseOcc,
              extraBeds: extraToAssign,
              bedType: bedType
            });
            if (extraToAssign > 0) remainingExtra = 0;
          }
        };

        addRows('double', parseInt(data.double) || 0, 2);
        addRows('single', parseInt(data.single) || 0, 1);
        addRows('triple', parseInt(data.triple) || 0, 3);
        addRows('quad', parseInt(data.quad) || 0, 4);
        addRows('two_bedroom', parseInt(data.two_bedroom_count) || 0, 4);
        addRows('three_bedroom', parseInt(data.three_bedroom_count) || 0, 6);
        addRows('four_bedroom', parseInt(data.four_bedroom_count) || 0, 8);

        if (newRoomRows.length === 0) {
          newRoomRows.push({ _id: 1, numRooms: 1, paxStaying: 2, extraBeds: 0, bedType: 'double' }); // paxStaying = per-room
        }
      }

      parsedData.roomRows = newRoomRows;
      
      const childW = parseInt(data.childW) || 0;
      const childN = parseInt(data.childN) || 0;
      parsedData.hasChildren = (childW > 0 || childN > 0);
      parsedData.childWithBed = childW;
      parsedData.childNoBed = childN;

      setValues(parsedData)
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
          draftEngine.clearDraft(); // clear draft on manual cancel
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
{/* ── Room Allotment ── */}
                  {(() => {
                    const currencyCode = getDefaultCurrency(itineraryDestination || values.destination?.label);
                    const fmt = (n) => `${currencyCode} ${(n || 0).toLocaleString()}`;

                    const roomRows     = values.roomRows     || [{ _id: 1, numRooms: 1, paxStaying: 2, bedType: 'double' }];
                    const hasChildren  = values.hasChildren  || false;
                    const childWithBed = values.childWithBed || 0;
                    const childNoBed   = values.childNoBed   || 0;

                    // ── per-row calc ──
                    const calcRow = (row) => {
                      const rowRoomTypeId = row.roomTypeId || values.roomType?.value;
                      const d = values.roomOption?.find(rt => rt.id == rowRoomTypeId) || selectedRoom;
                      const bedType = row.bedType || 'double';
                      
                      let base = 0, baseOcc = 2, physicalBedrooms = 1;
                      if (bedType === 'single') {
                         base = Number(d?.single_bed_amount || 0);
                         baseOcc = 1; physicalBedrooms = 1;
                      } else if (bedType === 'double') {
                         base = Number(d?.double_bed_amount || 0);
                         baseOcc = 2; physicalBedrooms = 1;
                      } else if (bedType === 'triple') {
                         base = Number(d?.triple_bed_amount || 0);
                         baseOcc = 3; physicalBedrooms = 1;
                      } else if (bedType === 'quad') {
                         base = Number(d?.quad_bed_amount || 0);
                         baseOcc = 4; physicalBedrooms = 1;
                      } else if (bedType === 'two_bedroom') {
                         base = Number(d?.two_bedroom_amount || 0);
                         baseOcc = 4; physicalBedrooms = 2;
                      } else if (bedType === 'three_bedroom') {
                         base = Number(d?.three_bedroom_amount || 0);
                         baseOcc = 6; physicalBedrooms = 3;
                      } else if (bedType === 'four_bedroom') {
                         base = Number(d?.four_bedroom_amount || 0);
                         baseOcc = 8; physicalBedrooms = 4;
                      }
                      
                      const extraRate = Number(d?.extra_bed_amount || 0);
                      const maxExtraBeds = extraRate > 0 ? physicalBedrooms : 0;
                      const maxOcc = baseOcc + maxExtraBeds;

                      const numRooms  = parseInt(row.numRooms)  || 1;
                      const pax       = parseInt(row.paxStaying) || 1;
                      const roomCost  = numRooms * base;
                      const extraPax  = parseInt(row.extraBeds) || 0;
                      const extraCost = extraPax * extraRate;
                      const total     = roomCost + extraCost;
                      // paxStaying is now per-room; multiply by numRooms for total adults
                      const totalAdultsInRow = (pax * numRooms) + extraPax;
                      const totalPaxInRow = totalAdultsInRow + (hasChildren ? (childWithBed + childNoBed) : 0);
                      const perPax    = totalPaxInRow > 0 ? Math.round(total / totalPaxInRow) : 0;
                      
                      // overCap: per-room check (pax is per room now)
                      const adultOverCap     = pax > baseOcc;
                      const extraNotAllowed  = extraPax > 0 && maxExtraBeds === 0;
                      const extraOverCap     = extraPax > (numRooms * maxExtraBeds) && maxExtraBeds > 0;
                      const overCap = adultOverCap || extraNotAllowed || extraOverCap;
                      
                      return { roomCost, extraCost, total, perPax, overCap, adultOverCap, extraNotAllowed, extraOverCap, base, extraRate, maxOcc, baseOcc, maxExtraBeds };
                    };

                    // ── grand totals ──
                    let grandRoomCost = 0, grandPax = 0;
                    roomRows.forEach((row) => {
                      const { total } = calcRow(row);
                      grandRoomCost += total;
                      grandPax      += ((parseInt(row.paxStaying) || 1) * (parseInt(row.numRooms) || 1)) + (parseInt(row.extraBeds) || 0);
                    });
                    
                    const childWBedRate = Number(selectedRoom?.child_w_bed_amount || 0);
                    const childNBedRate = Number(selectedRoom?.child_n_bed_amount || 0);
                    const childTotal = hasChildren ? (childWithBed * childWBedRate + childNoBed * childNBedRate) : 0;
                    
                    const grandTotal = grandRoomCost + childTotal;
                    const allPax     = grandPax + (hasChildren ? childWithBed + childNoBed : 0);
                    const avgPerPax  = allPax > 0 ? Math.round(grandTotal / allPax) : 0;

                    // ── row helpers ──
                    const updateRow = (id, field, val) => {
                      setFieldValue('roomRows', roomRows.map((r) =>
                        r._id === id ? { ...r, [field]: val } : r
                      ));
                    };
                    const addRow = () => {
                      const nextId = (roomRows[roomRows.length - 1]?._id || 0) + 1;
                      setFieldValue('roomRows', [...roomRows, { _id: nextId, numRooms: 1, paxStaying: 2, extraBeds: 0, bedType: 'double', roomTypeId: values.roomType?.value }]); // paxStaying = per-room
                    };
                    const removeRow = (id) => {
                      setFieldValue('roomRows', roomRows.filter((r) => r._id !== id));
                    };

                    return (
                      <div style={{
                        background: '#fffbea',
                        borderRadius: '12px',
                        border: '0.5px solid #e8e2b0',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1rem',
                        width: '100%'
                      }}>
                        <p style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#a08c30',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          margin: '0 0 1rem'
                        }}>
                          Room Allotment
                        </p>

                        {/* ── Room rows ── */}
                        {roomRows.map((row) => {
                          const { roomCost, extraCost, total, perPax, overCap, adultOverCap, extraNotAllowed, extraOverCap, base, extraRate, maxOcc, baseOcc, maxExtraBeds } = calcRow(row);
                          return (
                            <div key={row._id} style={{
                              background: '#ffffff',
                              border: '0.5px solid #e5e7eb',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              marginBottom: '10px',
                              position: 'relative'
                            }}>
                              {/* remove button */}
                              {roomRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRow(row._id)}
                                  style={{
                                    position: 'absolute', top: 10, right: 12,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '13px', color: '#9ca3af', padding: 0, lineHeight: 1, zIndex: 10
                                  }}
                                >
                                  ✕
                                </button>
                              )}

                              {/* Top Bar: Selector on left, Badge on right */}
                              {selectedRoom && (
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  marginBottom: 10,
                                  paddingRight: roomRows.length > 1 ? '20px' : '0px'
                                }}>
                                  {/* Room Configuration Selector */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, margin: 0 }}>Room Type:</label>
                                      <select
                                        value={row.roomTypeId || values.roomType?.value || ''}
                                        onChange={(e) => {
                                          const newRoomTypeId = e.target.value;
                                          const newRoomData = values.roomOption?.find(rt => rt.id == newRoomTypeId);
                                          // Compute first valid bedType for the new room type
                                          const validConfigs = [
                                            { value: 'single',        show: Number(newRoomData?.single_bed_amount || 0) > 0 },
                                            { value: 'double',        show: Number(newRoomData?.double_bed_amount || 0) > 0 },
                                            { value: 'triple',        show: !!(newRoomData?.is_triple_bed_available) || Number(newRoomData?.triple_bed_amount || 0) > 0 },
                                            { value: 'quad',          show: !!(newRoomData?.is_quad_bed_available) || Number(newRoomData?.quad_bed_amount || 0) > 0 },
                                            { value: 'two_bedroom',   show: Number(newRoomData?.two_bedroom_amount || 0) > 0 },
                                            { value: 'three_bedroom', show: Number(newRoomData?.three_bedroom_amount || 0) > 0 },
                                            { value: 'four_bedroom',  show: Number(newRoomData?.four_bedroom_amount || 0) > 0 },
                                          ].filter(c => c.show);
                                          const firstBedType = validConfigs.length > 0 ? validConfigs[0].value : 'double';
                                          setFieldValue('roomRows', roomRows.map(r =>
                                            r._id === row._id ? { ...r, roomTypeId: newRoomTypeId, bedType: firstBedType } : r
                                          ));
                                        }}
                                        style={{
                                          height: '26px', borderRadius: '5px', border: '0.5px solid #d1d5db',
                                          background: '#f9fafb', fontSize: '12px', padding: '0 6px', outline: 'none',
                                          color: '#374151', cursor: 'pointer', maxWidth: '150px'
                                        }}
                                      >
                                        {values.roomOption?.map(rt => (
                                          <option key={rt.id} value={rt.id}>{rt.room_type_name}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, margin: 0 }}>Room Config:</label>
                                      <select
                                        value={row.bedType}
                                        onChange={(e) => updateRow(row._id, 'bedType', e.target.value)}
                                        style={{
                                          height: '26px', borderRadius: '5px', border: '0.5px solid #d1d5db',
                                          background: '#f9fafb', fontSize: '12px', padding: '0 6px', outline: 'none',
                                          color: '#374151', cursor: 'pointer'
                                        }}
                                      >
                                      {(() => {
                                          const rowRoomData = values.roomOption?.find(rt => rt.id == (row.roomTypeId || values.roomType?.value));
                                          const availableConfigs = [
                                            { value: 'single',        label: 'Single',     show: Number(rowRoomData?.single_bed_amount || 0) > 0 },
                                            { value: 'double',        label: 'Double',     show: Number(rowRoomData?.double_bed_amount || 0) > 0 },
                                            { value: 'triple',        label: 'Triple',     show: !!(rowRoomData?.is_triple_bed_available) || Number(rowRoomData?.triple_bed_amount || 0) > 0 },
                                            { value: 'quad',          label: 'Quad',       show: !!(rowRoomData?.is_quad_bed_available) || Number(rowRoomData?.quad_bed_amount || 0) > 0 },
                                            { value: 'two_bedroom',   label: '2 Bedroom',  show: Number(rowRoomData?.two_bedroom_amount || 0) > 0 },
                                            { value: 'three_bedroom', label: '3 Bedroom',  show: Number(rowRoomData?.three_bedroom_amount || 0) > 0 },
                                            { value: 'four_bedroom',  label: '4 Bedroom',  show: Number(rowRoomData?.four_bedroom_amount || 0) > 0 },
                                          ].filter(c => c.show);
                                          const options = availableConfigs.length > 0 ? availableConfigs : [
                                            { value: 'single', label: 'Single' }, { value: 'double', label: 'Double' },
                                            { value: 'triple', label: 'Triple' }, { value: 'quad',   label: 'Quad'   },
                                            { value: 'two_bedroom', label: '2 Bedroom' }, { value: 'three_bedroom', label: '3 Bedroom' }, { value: 'four_bedroom', label: '4 Bedroom' },
                                          ];
                                          // Auto-correct bedType if current value is not in available options
                                          const validBedType = options.some(o => o.value === row.bedType) ? row.bedType : options[0]?.value;
                                          if (validBedType && validBedType !== row.bedType) {
                                            setTimeout(() => updateRow(row._id, 'bedType', validBedType), 0);
                                          }
                                          return options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                          ));
                                        })()}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Badge */}
                                  <div style={{
                                    fontSize: '11px', background: '#fef7dc', color: '#b08d2a',
                                    borderRadius: '6px', padding: '3px 10px', border: '0.5px solid #e8d98a',
                                    textAlign: 'right', whiteSpace: 'nowrap'
                                  }}>
                                    <div style={{ fontWeight: 600 }}>Base: {fmt(base)}</div>
                                    <div>Max {baseOcc} adults{(maxOcc - baseOcc) > 0 ? ` + ${maxOcc - baseOcc} extra bed(s)` : ''}</div>
                                  </div>
                                </div>
                              )}

                              {/* inputs */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                gap: '10px'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>No. of rooms</label>
                                  <input
                                    type="number" min="1"
                                    value={row.numRooms}
                                    onChange={(e) => updateRow(row._id, 'numRooms', e.target.value)}
                                    style={{
                                      height: '34px', borderRadius: '7px', border: '0.5px solid #d1d5db',
                                      background: '#f9fafb', fontSize: '13px', textAlign: 'center',
                                      padding: '0 8px', outline: 'none', width: '100%', boxSizing: 'border-box'
                                    }}
                                  />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                                    Adults per room <span style={{ color: '#9ca3af' }}>(max {baseOcc})</span>
                                  </label>
                                  <input
                                    type="number" min="1" max={baseOcc}
                                    value={row.paxStaying}
                                    onChange={(e) => {
                                      const val = Math.min(parseInt(e.target.value) || 1, baseOcc);
                                      updateRow(row._id, 'paxStaying', val);
                                    }}
                                    style={{
                                      height: '34px', borderRadius: '7px',
                                      border: `0.5px solid #d1d5db`,
                                      background: '#f9fafb', fontSize: '13px', textAlign: 'center',
                                      padding: '0 8px', outline: 'none', width: '100%', boxSizing: 'border-box'
                                    }}
                                  />
                                </div>

                                {/* Extra bed input — only shown when room supports extra beds */}
                                {extraRate > 0 ? (
                                  <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                                        Extra adult beds <span style={{ color: '#9ca3af' }}>(max {maxExtraBeds}/room)</span>
                                      </label>
                                      <input
                                        type="number" min="0" max={parseInt(row.numRooms) * maxExtraBeds}
                                        value={row.extraBeds || 0}
                                        onChange={(e) => {
                                          const maxAllowed = (parseInt(row.numRooms) || 1) * maxExtraBeds;
                                          const val = Math.min(parseInt(e.target.value) || 0, maxAllowed);
                                          updateRow(row._id, 'extraBeds', val);
                                        }}
                                        style={{
                                          height: '34px', borderRadius: '7px',
                                          border: `0.5px solid ${extraOverCap ? '#f87171' : '#d1d5db'}`,
                                          background: '#f9fafb', fontSize: '13px', textAlign: 'center',
                                          padding: '0 8px', outline: 'none', width: '100%', boxSizing: 'border-box'
                                        }}
                                      />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Extra bed rate</label>
                                      <span style={{
                                        fontSize: '11px', background: '#fef7dc', color: '#b08d2a',
                                        borderRadius: '5px', padding: '3px 8px', textAlign: 'center',
                                        border: '0.5px solid #e8d98a', marginTop: '2px'
                                      }}>
                                        {fmt(extraRate)} / pax
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.4 }}>
                                    <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Extra adult beds</label>
                                    <span style={{
                                      height: '34px', borderRadius: '7px', border: '0.5px solid #d1d5db',
                                      background: '#f3f4f6', fontSize: '12px', textAlign: 'center',
                                      padding: '0 8px', lineHeight: '34px', color: '#9ca3af'
                                    }}>Not available</span>
                                  </div>
                                )}

                              </div>

                              {extraOverCap && (
                                <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>
                                  ⚠ Max {maxOcc - baseOcc} extra bed{(maxOcc - baseOcc) > 1 ? 's' : ''} per room.
                                </p>
                              )}

                              {/* calc bar */}
                              {selectedRoom && (
                                <div style={{
                                  marginTop: '10px', paddingTop: '10px',
                                  borderTop: '0.5px solid #e5e7eb',
                                  display: 'flex', gap: '16px', flexWrap: 'wrap',
                                  fontSize: '12px', color: '#6b7280', alignItems: 'center'
                                }}>
                                  <span>Room cost: <strong>{fmt(roomCost)}</strong></span>
                                  <span>Extra: <strong>{fmt(extraCost)}</strong></span>
                                  <span>Total: <strong>{fmt(total)}</strong></span>
                                  <span style={{ marginLeft: 'auto', color: '#b08d2a' }}>
                                    Avg/pax: <strong>{fmt(perPax)}</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* add row button */}
                        <button
                          type="button"
                          onClick={addRow}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '13px', color: '#b08d2a',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px 0 2px'
                          }}
                        >
                          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add room type
                        </button>

                        {/* ── Children toggle ── */}
                        <div style={{ borderTop: '0.5px solid #e8e2b0', marginTop: '12px', paddingTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: '#374151' }}>Any children travelling?</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setFieldValue('hasChildren', true)}
                                style={{
                                  fontSize: '12px', padding: '4px 14px', borderRadius: '6px', cursor: 'pointer',
                                  border: '0.5px solid #e8d98a',
                                  background: hasChildren ? '#fef7dc' : '#f3f4f6',
                                  color: hasChildren ? '#b08d2a' : '#6b7280',
                                  fontWeight: hasChildren ? 500 : 400
                                }}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFieldValue('hasChildren', false);
                                  setFieldValue('childWithBed', 0);
                                  setFieldValue('childNoBed', 0);
                                }}
                                style={{
                                  fontSize: '12px', padding: '4px 14px', borderRadius: '6px', cursor: 'pointer',
                                  border: '0.5px solid #d1d5db',
                                  background: !hasChildren ? '#f3f4f6' : '#ffffff',
                                  color: !hasChildren ? '#374151' : '#6b7280',
                                  fontWeight: !hasChildren ? 500 : 400
                                }}
                              >
                                No
                              </button>
                            </div>
                          </div>

                          {hasChildren && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Children with bed</label>
                                <input
                                  type="number" min="0"
                                  value={childWithBed}
                                  onChange={(e) => setFieldValue('childWithBed', parseInt(e.target.value) || 0)}
                                  style={{
                                    height: '34px', borderRadius: '7px', border: '0.5px solid #d1d5db',
                                    background: '#f9fafb', fontSize: '13px', textAlign: 'center',
                                    padding: '0 8px', outline: 'none', width: '100%', boxSizing: 'border-box'
                                  }}
                                />
                                <span style={{
                                  fontSize: '11px', background: '#fef7dc', color: '#b08d2a',
                                  borderRadius: '5px', padding: '3px 8px', textAlign: 'center',
                                  border: '0.5px solid #e8d98a'
                                }}>
                                  {fmt(childWBedRate)} / child
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Children no bed</label>
                                <input
                                  type="number" min="0"
                                  value={childNoBed}
                                  onChange={(e) => setFieldValue('childNoBed', parseInt(e.target.value) || 0)}
                                  style={{
                                    height: '34px', borderRadius: '7px', border: '0.5px solid #d1d5db',
                                    background: '#f9fafb', fontSize: '13px', textAlign: 'center',
                                    padding: '0 8px', outline: 'none', width: '100%', boxSizing: 'border-box'
                                  }}
                                />
                                <span style={{
                                  fontSize: '11px', background: '#fef7dc', color: '#b08d2a',
                                  borderRadius: '5px', padding: '3px 8px', textAlign: 'center',
                                  border: '0.5px solid #e8d98a'
                                }}>
                                  {fmt(childNBedRate)} / child
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ── Grand total bar ── */}
                        <div style={{
                          marginTop: '14px', padding: '10px 14px',
                          background: '#fef9e7', borderRadius: '8px',
                          border: '0.5px solid #e8d98a',
                          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                        }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            Rooms: <strong>{fmt(grandRoomCost)}</strong>
                          </span>
                          {hasChildren && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              Children: <strong>{fmt(childTotal)}</strong>
                            </span>
                          )}
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            Grand total: <strong>{fmt(grandTotal)}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: '#b08d2a', marginLeft: 'auto' }}>
                            Pax: <strong>{allPax}</strong> &nbsp;·&nbsp; Avg/pax: <strong>{fmt(avgPerPax)}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
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
