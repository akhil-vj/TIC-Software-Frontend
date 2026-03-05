import React, { Fragment, useEffect, useState } from "react";
//import Multistep from "react-multistep";
import { Stepper, Step } from "react-form-stepper";

import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";
import StepOne from "./StepOne";
import PageTitle from "../../../../layouts/PageTitle";
import { useNavigate, useParams } from "react-router-dom";
import notify from "../../../common/Notify";
import { useDispatch, useSelector } from "react-redux";
import { FormAction } from "../../../../../store/slices/formSlice";
import { useFormik } from "formik";
import { URLS } from "../../../../../constants";
import { axiosPost, axiosPut, filePost } from "../../../../../services/AxiosInstance";
import { notifyCreate, notifyError } from "../../../../utilis/notifyMessage";
import { useAsync } from "../../../../utilis/useAsync";
import * as Yup from "yup";
import { checkFormValue, checkIsFile } from "../../../../utilis/check";
import { LoadingButton } from "../../../common/LoadingBtn";

const AddHotel = () => {
  const [goSteps, setGoSteps] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {id} = useParams()
  // const formId = useSelector((data) => data.form);
  // const isEdit = !!formId.editId;
  const isEdit = !!id;
  const initialValues = {
    // destination:{label:'',value:''},
    addRoom: [],
    hotelAmentity: [],
    hotelImg: [],
    roomId:''
  }
  const url = URLS.HOTEL_URL
  const editUrl = `${URLS.HOTEL_URL}/${id}`
  const updateUrl = `${URLS.HOTEL_UPDATE_URL}/${id}`

  const editData = useAsync(editUrl,isEdit)
  // console.log('editData',editData)

  const formSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Your name must consist of at least 3 characters ")
      .max(50, "Your name must consist of at limit 50 characters ")
      .required("Please enter a name"),
    place: Yup.string()
      .min(5, "Your place must be at least 5 characters long")
      .max(50, "Your place must be at limit 50 characters long")
      .required("Please provide a place"),
    destination: Yup.object().required('Please select a destination'),
    subDestination: Yup.object().required('Please select a sub destination'),
    category: Yup.string()
      .required("Please select a category"),
    propertyType: Yup.string()
      .required("Please select a property type"),
    salesEmail: Yup.string()
      .required("Please select a sales email").email("Please provide valid email"),
    phoneNumber: Yup.string()
      .min(5, "Your phone number must be at least 5 characters long")
      .max(15, "Your phone number must be at limit 15 characters long")
      .required("Please provide a phone number"),
    address: Yup.string()
      .min(5, "Your address must be at least 5 characters long")
      .max(100, "Your address must be at limit 100 characters long")
      .required("Please provide a address"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema:formSchema,
    onSubmit: async (values) => {
      // Handle form submission here
      try {
        dispatch(FormAction.setLoading(true))
        if(!values.addRoom || values.addRoom.length === 0){
          notifyError('Add at least one room before saving the hotel');
          dispatch(FormAction.setLoading(false))
          return;
        }
        const formData = new FormData();
        formData.append('name',values.name)
        // formData.append('name', values.name);
        formData.append('destination_id', values.destination?.value);
        formData.append('sub_destination_id', values.subDestination?.value);
        formData.append('place', values.place);
        formData.append('category_id', values.category);
        formData.append('property_type_id', values.propertyType);
        formData.append('sales_email', values.salesEmail);
        formData.append('sales_no', checkFormValue(values.salesNumber));
        formData.append('reservation_email', checkFormValue(values.reservationEmail));
        formData.append('reservation_no', checkFormValue(values.reservationNumber));
        formData.append('phone_number', values.phoneNumber);
        formData.append('address', values.address);
        for (let [ind,item] of (values.addRoom || []).entries()){
          const start = new Date(item.roomStartDate);
          const end = new Date(item.roomEndDate);
          if(end <= start){
            notifyError(`Room ${ind+1}: To Date must be after From Date`);
            dispatch(FormAction.setLoading(false));
            return;
          }
          const invalidMeal = item.mealPlan?.some(mp => !(Number(mp.amount) > 0));
          if(invalidMeal){
            notifyError(`Room ${ind+1}: Meal plan amount must be greater than 0`);
            dispatch(FormAction.setLoading(false));
            return;
          }
          if(!!item.roomId){
            formData.append(`rooms[${ind}][id]`,item.roomId)
          }
          formData.append(`rooms[${ind}][market_type_id]`, item.marketType.value);
          formData.append(`rooms[${ind}][from_date]`, start.toLocaleDateString('en-CA'));
          formData.append(`rooms[${ind}][to_date]`, end.toLocaleDateString('en-CA'));
          formData.append(`rooms[${ind}][room_type_id]`, item.roomType.value);
          formData.append(`rooms[${ind}][single_bed_amount]`, item.singleBed);
          formData.append(`rooms[${ind}][double_bed_amount]`, item.doubleBed);
          formData.append(`rooms[${ind}][triple_bed_amount]`, item.tripleBed);
          formData.append(`rooms[${ind}][is_triple_bed_available]`, item.tripleBedSelect ? 1 : 0);
          formData.append(`rooms[${ind}][extra_bed_amount]`, item.extraBed);
          formData.append(`rooms[${ind}][is_extra_bed_available]`, item.extraBedSelect ? 1 : 0);
          formData.append(`rooms[${ind}][child_w_bed_amount]`, item.childWBed);
          formData.append(`rooms[${ind}][is_child_w_bed_available]`, item.childWBedSelect ? 1 : 0);
          formData.append(`rooms[${ind}][child_n_bed_amount]`, item.childNBed);
          formData.append(`rooms[${ind}][is_child_n_bed_available]`, item.childNBedSelect ? 1 : 0);
          formData.append(`rooms[${ind}][occupancy]`, item.occupancy);
          item.roomAmentity?.forEach((item,i)=>{
            formData.append(`rooms[${ind}][amenities][${i}]`, item);
          })
          item.roomImg?.forEach((item,i)=>{
            if(checkIsFile(item)){
            formData.append(`rooms[${ind}][images][${i}]`, item);
            }
          })
          item.mealPlan?.forEach((item,i)=>{
            formData.append(`rooms[${ind}][meal_plans][${i}][id]`, item.id);
            formData.append(`rooms[${ind}][meal_plans][${i}][amount]`, item.amount);
          })
          formData.append(`rooms[${ind}][is_allotted]`, item.alloment ? 1 : 0);
          // formData.append(`rooms[${ind}][]`, item.availableFrom);
          // formData.append(`rooms[${ind}][]`, item.availableTo);
          formData.append(`rooms[${ind}][allotted_cut_off_days]`, item.cutOff);
        }
        if(values.hotelAmentity?.length){
          values.hotelAmentity.forEach((item,ind)=>{
            formData.append(`amenities[${ind}]`, item);
          })
        }else{
          // keep amenities key present to avoid backend undefined index
          formData.append('amenities','');
        }
        values.hotelImg?.forEach((item,ind)=>{
          if(checkIsFile(item)){
            formData.append(`document_2[${ind}]`, item);
          }
        })
        let response;
        if (isEdit) {
          response = await filePost(updateUrl, formData);
        } else {
          response = await filePost(url, formData);
        }
        console.log('Hotel save response:', response);
        if (response.success) {
          // If response includes the hotel data with images, use it to refresh the store
          // Otherwise, the next page fetch will get the updated data
          dispatch(FormAction.setRefresh());
          // formik.setFieldValue("name", "");
          // setShowModal(false);
          if (isEdit) {
            dispatch(FormAction.setEditId())
          }
          notifyCreate('Hotel', isEdit)
          // Add a small delay to ensure backend has processed images before redirect
          setTimeout(() => {
            navigate('/hotels')
          }, 500);
        }
      } catch (error) {
        const errObj = error?.response?.data?.data?.errors;
        const firstErr =
          errObj && Object.values(errObj)?.flat()?.[0]
            ? Object.values(errObj).flat()[0]
            : error?.response?.data?.message || error?.message || 'Save failed';
        console.log('err', error);
        notifyError(firstErr);
      }finally{
        dispatch(FormAction.setLoading(false))
      }
    },
  })

  const editValues = editData?.data?.data
  useEffect(()=>{
    if(!!editValues){
    console.log('Edit Values - document_2:', editValues.document_2);
    const obj = {
      name: editValues.name,
      destination: {label:editValues.destination_name,value:editValues.destination_id},
      subDestination: {label:editValues.sub_destination_name,value:editValues.sub_destination_id},
      place: editValues.place,
      category: editValues.category_id,
      propertyType: editValues.property_type_id  ,
      salesEmail: editValues.sales_email  ,
      salesNumber: editValues.sales_no  ,
      reservationEmail: editValues.reservation_email  ,
      reservationNumber: editValues.reservation_no  ,
      phoneNumber: editValues.phone_number ,
      address: editValues.address ,
      // addRoom:editValues.rooms,
      // hotelAmentity: editValues.amenities,
      hotelImg: editValues.document_2,
     }
     const hotelAmentityArr = editValues.amenities.map((item)=>item.id)
     const addRoomArr = editValues.rooms?.map((item,ind)=>{
      const obj = {
        roomId:item.id,
        marketType: {label:item.market_type_name,value:item.market_type_id},
        // marketTypeLabel: item.market_type_name,
        roomStartDate: item.from_date,
        roomEndDate: item.to_date,
        roomType:  {label:item.room_type_name,value:item.room_type_id},
        // roomTypeLabel: item.room_type_name,
        singleBed: item.single_bed_amount,
        doubleBed: item.double_bed_amount,
        tripleBed: item.triple_bed_amount,
        tripleBedSelect: item.is_triple_bed_available == 1 ? true : false,
        extraBed: item.extra_bed_amount,
        extraBedSelect: item.is_extra_bed_available == 1 ? true : false,
        childWBed: item.child_w_bed_amount,
        childWBedSelect: item.is_child_w_bed_available == 1 ? true : false,
        childNBed: item.child_n_bed_amount,
        childNBedSelect: item.is_child_n_bed_available == 1 ? true : false,
        occupancy: item.occupancy,
        // roomAmentity: item.amenities,
        roomImg:item.media,
        mealPlan:item.meal_plans,
        allotted: item.is_allotted == 1 ? true : false,
        cutOff:item.allotted_cut_off_days,

      }
      const roomAmentityArr = item.amenities.map((item)=>(item.id))
      const newObj = {...obj,roomAmentity:roomAmentityArr}
      return newObj
      // formData.append(`rooms[${ind}][market_type_id]`, item.marketType);
      // formData.append(`rooms[${ind}][from_date]`, item.roomStartDate.toLocaleDateString('en-CA'));
      // formData.append(`rooms[${ind}][to_date]`, item.roomEndDate.toLocaleDateString('en-CA'));
      // formData.append(`rooms[${ind}][room_type_id]`, item.roomType);
      // formData.append(`rooms[${ind}][single_bed_amount]`, item.singleBed);
      // formData.append(`rooms[${ind}][double_bed_amount]`, item.doubleBed);
      // formData.append(`rooms[${ind}][triple_bed_amount]`, item.tripleBed);
      // formData.append(`rooms[${ind}][is_triple_bed_available]`, item.tripleBedSelect ? 1 : 0);
      // formData.append(`rooms[${ind}][extra_bed_amount]`, item.extraBed);
      // formData.append(`rooms[${ind}][is_extra_bed_available]`, item.extraBedSelect ? 1 : 0);
      // formData.append(`rooms[${ind}][child_w_bed_amount]`, item.childWBed);
      // formData.append(`rooms[${ind}][is_child_w_bed_available]`, item.childWBedSelect ? 1 : 0);
      // formData.append(`rooms[${ind}][child_n_bed_amount]`, item.childNBed);
      // formData.append(`rooms[${ind}][is_child_n_bed_available]`, item.childNBedSelect ? 1 : 0);
      // formData.append(`rooms[${ind}][occupancy]`, item.occupancy);
      // item.roomAmentity.forEach((item,i)=>{
      //   formData.append(`rooms[${ind}][amenities][${i}]`, item);
      // })
      // item.roomImg.forEach((item,i)=>{
      //   formData.append(`rooms[${ind}][images][${i}]`, item);
      // })
      // item.mealPlan.forEach((item,i)=>{
      //   formData.append(`rooms[${ind}][meal_plans][${i}][id]`, item.type.value);
      //   formData.append(`rooms[${ind}][meal_plans][${i}][amount]`, item.amount);
      // })
      // formData.append(`rooms[${ind}][is_allotted]`, item.alloment ? 1 : 0);
      // // formData.append(`rooms[${ind}][]`, item.availableFrom);
      // // formData.append(`rooms[${ind}][]`, item.availableTo);
      // formData.append(`rooms[${ind}][allotted_cut_off_days]`, item.cutOff);
    })
    const newObj = {...obj,addRoom:addRoomArr,hotelAmentity:hotelAmentityArr} 
     formik.setValues(newObj)
    // formik.setFieldValue('addRoom',addRoomArr)

    }
  },[id,editValues])

  const handleSubmit = () => {

    // notify({ message: "Hotel Added Successfully" });
    // navigate("/hotels");
    // dispatch(FormAction.setEditId(""));
  };
  useEffect(() => {
    return () => {
      dispatch(FormAction.setEditId(""));
    };
  }, []);

  return (
    <Fragment>
      <PageTitle activeMenu="Components" motherMenu="Home" />

      <div className="row">
        <div className="col-xl-12 col-xxl-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">{`${isEdit ? "Edit" : "Add"
                } Hotel`}</h4>
            </div>
            <div className="card-body">
              <div className="form-wizard ">
                <Stepper
                  className="nav-wizard"
                  activeStep={goSteps}
                >
                  <Step className="nav-link" onClick={() => setGoSteps(0)} />
                  <Step className="nav-link" onClick={() => setGoSteps(1)} />
                  <Step className="nav-link" onClick={() => setGoSteps(2)} />
                  <Step className="nav-link" onClick={() => setGoSteps(3)} />
                </Stepper>
                {goSteps === 0 && (
                  <>
                    <StepOne formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-primary sw-btn-next"
                        onClick={() => setGoSteps(1)}
                        disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {goSteps === 1 && (
                  <>
                    <StepTwo formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-secondary sw-btn-prev me-1"
                        onClick={() => setGoSteps(0)}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-primary sw-btn-next ms-1"
                        onClick={() => setGoSteps(2)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {goSteps === 2 && (
                  <>
                    <StepThree formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-secondary sw-btn-prev me-1"
                        onClick={() => setGoSteps(1)}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-primary sw-btn-next ms-1"
                        onClick={() => setGoSteps(3)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {goSteps === 3 && (
                  <>
                    <StepFour formik={formik} />
                    <div className="text-end toolbar toolbar-bottom p-2">
                      <button
                        className="btn btn-secondary sw-btn-prev me-2"
                        onClick={() => setGoSteps(2)}
                      >
                        Prev
                      </button>
                      {/* <button
                        className="btn btn-primary sw-btn-next ms-1"
                        type="submit"
                        onClick={() => formik.handleSubmit()}
                      >
                        Submit
                      </button> */}
                      <LoadingButton label='Submit'  onClick={formik.handleSubmit}/>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AddHotel;
