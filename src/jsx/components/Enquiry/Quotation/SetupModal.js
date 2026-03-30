import React, { useEffect, useState } from "react";
import CustomModal from "../../../layouts/CustomModal";
import notify from "../../common/Notify";
import SetupForm from "./SetupForm";
import { Formik, useFormik } from "formik";
import PackageForm from "./PackageForm";
import PaymentForm from "./PaymentForm";
import { checkFormValue } from "../../../utilis/check";
import { filePost, filePut } from "../../../../services/AxiosInstance";
import { URLS } from "../../../../constants";
import { getDefaultCurrency } from "../../../../constants/destinationCurrency";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate, formatTimeToHis, parseDate, parseTime } from "../../../utilis/date";
import { useAsync } from "../../../utilis/useAsync";

function SetupModal() {
  const navigate = useNavigate()
  const {id,itineraryId} = useParams()
  const itineraryByIdUrl = `${URLS.ITINERARY_URL}/${itineraryId}`
  const isEdit = !!itineraryId
  const fetchItinerary= useAsync(itineraryByIdUrl,isEdit)
  const editItineraryData = fetchItinerary?.data?.data

  const isEquiryId = id && id !== 'add'
  const url = URLS.ENQUIRY_URL
  const equiryIdUrl = `${url}/${id}`
  const fetchEnquiry = useAsync(equiryIdUrl,!!isEquiryId)
  const equiryIdData = fetchEnquiry?.data?.data

  const [showModal, setShowModal] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [formStartDate, setFormStartDate] = useState(new Date());
  const [formComponent, setFormComponent] = useState("setupForm");

  const date = new Date();
  const initialValues = {
    categoryOptions: "Hotel",
    formStartDate: date,
    formEndDate: date,
    formValidityDate: date,
    planArr:[],
    planIndex:0,
    priceOption:{value:'PER',label:'Price Per Traveller'},
    gstOption:{value:1,label:'GST on Total'},
    priceIn:{value:'INR',label:'INR'},
    baseCurrency: 'INR',
    selectedSubDestinations:[],
    discount: 0,
    discount_amount: 0,
  };
  const mapSubDestinations = (items = []) =>
    items
      .map((item) => ({
        id: item?.id ?? item?.value,
        name: item?.name ?? item?.label,
      }))
      .filter((item) => item.id && item.name);

  const handleFormValue = (data) => {
    if(data && data?.id){
      setFieldValue('packageName',checkFormValue(data.package_name))
      setFieldValue('formStartDate',parseDate(data.start_date))
      setFieldValue('formEndDate',parseDate(data.end_date))
      setFieldValue('adult',checkFormValue(data.adult_count))
      setFieldValue('child',checkFormValue(data.child_count))
      setFieldValue('baseMarkupInput',checkFormValue(data.extra_markup_percentage))
      setFieldValue('extraMarkupInput',checkFormValue(data.extra_markup_amount))
      setFieldValue('baseMarkup',checkFormValue(data.extra_markup_percentage))
      setFieldValue('extraMarkup',checkFormValue(data.extra_markup_amount))
      setFieldValue('cgst',checkFormValue(data.cgst_percentage))
      setFieldValue('sgst',checkFormValue(data.sgst_percentage))
      setFieldValue('igst',checkFormValue(data.igst_percentage))
      setFieldValue('tcs',checkFormValue(data.tcs_percentage))
      setFieldValue('discount',checkFormValue(data.discount_amount))
      setFieldValue('paymentDescription',checkFormValue(data.description))
      setFieldValue('priceOption',data.price_mode === 'PER_PERSON'?{value:'PER',label:'Price Per Traveller'}:{value:'TOTAL',label:'Total Price'})
      setFieldValue('perPersonAmount',data.per_person_amounts)
      const priceInObj = {label:data.currency,value:data.currency}
      setFieldValue('priceIn',priceInObj)
      setFieldValue('baseCurrency', data.currency)
      const destinationObj = {label:data.destination.name,value:data.destination.id}
      setFieldValue('destination',checkFormValue(destinationObj))
      const getSubDestinationOption = (entry) => {
        const sub =
          entry.sub_destination ||
          entry.sub_destination_id && { id: entry.sub_destination_id, name: entry.sub_destination_name } ||
          entry.subject?.sub_destination ||
          entry.subject?.sub_destination_id && { id: entry.subject?.sub_destination_id, name: entry.subject?.sub_destination_name };
        return sub ? { value: sub.id, label: sub.name } : undefined;
      };
      const sortedArray = data.entries?.reduce((acc, entry) => {
        const existingEntry = acc.find((item) => item.date === entry.date);
        const insertType = entry.entry_type.toLowerCase()
        const transferType = {label:entry.transfer_type,value:entry.transfer_type}
        const hotelOption = {label:entry.option,value:entry.option}
        const image = insertType === 'hotel' ? entry.subject?.document_2[0]?.file_url : entry.subject.image
        const dayDestination = getSubDestinationOption(entry)
        const obj = {
          insertType:insertType,
          entryId:entry.id,
          id:entry.subject_id,
          name:entry.subject.name || entry.subject.activity_name || entry.subject.vehicle_name,
          image:image,
          option:hotelOption,
          roomType:{value:entry.room?.id,label:entry.room?.room_type_name},
          destination:{value:entry.subject?.destination?.id || entry.subject?.destination_id,label:entry.subject?.destination?.name || entry.subject?.destination_name},
          roomOption:entry.subject.rooms,
          single:entry.single_count,
          double:entry.double_count,
          triple:entry.triple_count,
          extra:entry.extra_count,
          childW:entry.child_w_count,
          childN:entry.child_n_count,
          date:entry.date,
          person:entry.no_of_person,
          description:entry.description,
          type:transferType,
          cost:entry.cost,
          amount:entry.amount,
          markup:entry.markup,
          adultCost:entry.adult_cost,
          childCost:entry.child_cost,
          startDate:parseDate(entry.start_date),
          startTime:parseTime(entry.start_time),
          endDate:parseDate(entry.end_date),
          endTime:parseTime(entry.end_time),
          subDestination: dayDestination,
        }
        if (existingEntry) {
          existingEntry.schedule.push(obj);
          if(!existingEntry.dayDestination && dayDestination){
            existingEntry.dayDestination = dayDestination;
          }
        } else {
          acc.push({ date: entry.date, schedule: [obj], dayDestination });
        }
    
        return acc;
      }, []);
      setFieldValue('planArr',checkFormValue(sortedArray))
      const uniqueSubDests = Array.from(
        new Map(
          data.entries
            ?.map((entry) => getSubDestinationOption(entry))
            ?.filter(Boolean)
            .map((sub) => [sub.value, { id: sub.value, name: sub.label }]) || []
        ).values()
      );
      if (uniqueSubDests.length) {
        setFieldValue('selectedSubDestinations', uniqueSubDests);
      }
    }
  }

  const handleFormClick = async(values) => {
    try {
      const getDateStr = (dateVal) => {
        const d = new Date(dateVal);
        return isNaN(d) ? null : d.toLocaleDateString("en-CA");
      }
      const getTimeStr = (timeVal) => {
        if(!timeVal){return null}
        return formatTimeToHis(timeVal)
      }
      const headerDateStart = getDateStr(values.formStartDate)
      const headerDateEnd = getDateStr(values.formEndDate)
      const validityDate = getDateStr(values.formValidityDate)
      if(!values.packageName){
        notifyError('Package name is required')
        return
      }
      if(!values.destination?.value){
        notifyError('Destination is required')
        return
      }
      if(!headerDateStart || !headerDateEnd){
        notifyError('Start and End dates are required')
        return
      }
      const formData = new FormData()
      // formData.append('currency',values.priceIn)
      formData.append('package_name',values.packageName)
      formData.append('enquiry_id',id)
      formData.append('start_date',checkFormValue(headerDateStart))
      formData.append('end_date',checkFormValue(headerDateEnd))
      formData.append('adult_count',checkFormValue(values.adult))
      formData.append('child_count',checkFormValue(values.child))
      formData.append('destination_id',checkFormValue(values.destination?.value))
      formData.append('valid_until',checkFormValue(validityDate))
      const priceMode = values?.priceOption?.value === 'PER' ? 'PER_PERSON' : 'TOTAL_PRICE'
      formData.append('price_mode',priceMode)
      const currencyValue = values?.priceIn?.value ?? values?.priceIn?.id
      formData.append('currency', checkFormValue(currencyValue))
      // Backend update endpoint uses URL param; no itinerary_id field required
      const totalEntries = values.planArr?.reduce((acc,{schedule})=>acc + (schedule?.length || 0),0) || 0
      if(totalEntries === 0){
        notifyError('Add at least one itinerary item before saving')
        return
      }
      let index = 0
      values.planArr?.flatMap(({ date, schedule, dayDestination },arrInd) =>
      schedule.map((data,ind) => {
          console.log('date',data,index)
        // if(data.isExist){
        //   formData.append(`requirements[id]`,data?.value)
        // }
        const entryDate = getDateStr(date)
        const startDateVal = getDateStr(data.startDate || date)
        const endDateVal = getDateStr(data.endDate || date)
        const startTimeVal = getTimeStr(data.startTime) || '00:00:00'
        const endTimeVal = getTimeStr(data.endTime) || '00:00:00'
        if(!entryDate || !startDateVal || !endDateVal){
          throw new Error('Invalid or missing dates in itinerary entries')
        }
        if(data.entryId){
          formData.append(`entries[${index}][id]`,checkFormValue(data.entryId))
        }
        const personCount = data.person ?? values.adult + values.child;
        formData.append(`entries[${index}][subject_id]`,checkFormValue(data.id))
        formData.append(`entries[${index}][entry_type]`,checkFormValue(data.insertType?.toUpperCase()))
        formData.append(`entries[${index}][date]`,checkFormValue(entryDate))
        const subDestValue = dayDestination?.value || data.subDestination?.value;
        formData.append(`entries[${index}][sub_destination_id]`,checkFormValue(subDestValue))
        formData.append(`entries[${index}][no_of_person]`,checkFormValue(personCount,'number'))
        if(data.insertType === 'hotel'){
          formData.append(`entries[${index}][option]`,checkFormValue(data.option?.value))
          formData.append(`entries[${index}][room_id]`,checkFormValue(data.roomType?.value))
          formData.append(`entries[${index}][single_count]`,checkFormValue(data.single,'number'))
          formData.append(`entries[${index}][double_count]`,checkFormValue(data.double,'number'))
          formData.append(`entries[${index}][triple_count]`,checkFormValue(data.triple,'number'))
          formData.append(`entries[${index}][extra_count]`,checkFormValue(data.extra,'number'))
          formData.append(`entries[${index}][child_w_count]`,checkFormValue(data.childW,'number'))
          formData.append(`entries[${index}][child_n_count]`,checkFormValue(data.childN,'number'))
        }
      
        if(data.insertType === 'activity'){
          formData.append(`entries[${index}][description]`,checkFormValue(data.description))
        }
        if(data.insertType === 'transfer'){
          formData.append(`entries[${index}][transfer_type]`,checkFormValue(data.type?.value))
          formData.append(`entries[${index}][cost]`,checkFormValue(data.cost,'number'))
          formData.append(`entries[${index}][adult_cost]`,checkFormValue(data.adultCost,'number'))
          formData.append(`entries[${index}][child_cost]`,checkFormValue(data.childCost,'number'))
        }

        formData.append(`entries[${index}][start_date]`,checkFormValue(startDateVal))
        formData.append(`entries[${index}][start_time]`,checkFormValue(startTimeVal))
        formData.append(`entries[${index}][end_date]`,checkFormValue(endDateVal))
        formData.append(`entries[${index}][end_time]`,checkFormValue(endTimeVal))
        index = index + 1
      }))
      // formData.append('assigned_to',checkFormValue(values.assigned?.value))
      let response
      const url = URLS.ITINERARY_URL
      const editUrl = `${URLS.ITINERARY_UPDATE_URL}${itineraryId}`
      if(isEdit){
        response = await filePost(editUrl,formData)
      }else{
        response = await filePost(url,formData)
      }

      if(setShowModal){
      setShowModal(false)
      // navigate('add/profile')
    }
    if(response?.success){
      if(!isEdit){
        formik.setFieldValue('itineraryId',response?.data?.id)
        navigate(response?.data?.id)
      }
      handleFormValue(response?.data)
      notifyCreate('Quotation',isEdit)
    }
    } catch (error) {
      // Helpful debugging to surface backend validation errors
      console.error('itinerary save error', error?.response?.data || error);
      notifyError(error?.response?.data?.message || error)
    }
   
  }
  const formik = useFormik({
    initialValues,
        // validationSchema={loginSchema}
        onSubmit:(values, { setSubmitting }) => {
          console.log('submit',values)
          handleFormClick(values)
          //   setTimeout(() => {
          //     alert(JSON.stringify(values, null, 2));
          //     setSubmitting(false);
          //   }, 400);
        }
  })
  const {setFieldValue} = formik
  

  useEffect(()=>{
    if(equiryIdData && !isEdit){
      setFieldValue('formStartDate',parseDate(equiryIdData.start_date))
      setFieldValue('formEndDate',parseDate(equiryIdData.end_date))
      setFieldValue('adult',checkFormValue(equiryIdData.adult_count))
      setFieldValue('child',checkFormValue(equiryIdData.child_count))
      const destinationObj = {label:equiryIdData.destination.name,value:equiryIdData.destination.id}
      setFieldValue('destination',checkFormValue(destinationObj))
      // Auto-set currency based on destination
      const currencyCode = getDefaultCurrency(equiryIdData.destination?.name);
      setFieldValue('baseCurrency', currencyCode);
      setFieldValue('priceIn', { value: currencyCode, label: currencyCode });
    }
  },[equiryIdData?.id,isEdit])
  useEffect(() => {
    if (equiryIdData?.sub_destinations?.length) {
      const subDestOptions = mapSubDestinations(equiryIdData.sub_destinations);
      if (subDestOptions.length) {
        setFieldValue('selectedSubDestinations', subDestOptions);
      }
    }
  }, [equiryIdData?.sub_destinations?.length]);
  

  const formSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
    notify({ message: "Added Successfully" });
  };

  useEffect(()=>{
    formik.setFieldValue('itineraryId',itineraryId)
  },[itineraryId])
  useEffect(()=>{
    // console.log('test',data)
    handleFormValue(editItineraryData)

  },[itineraryId,editItineraryData?.id])
  
  return (
    <>
      {/* <Formik
        
      >
        {(formik) => ( */}
          {/* <> */}
            {formComponent === "setupForm" ? (
              <SetupForm
                formik={formik}
                setFormComponent={setFormComponent}
                showModal={showModal}
                setShowModal={setShowModal}
                isEdit={isEdit}
              />
            ) : (
              <div className="bg-white mt-4 p-4 rounded">
                {formComponent === "packageForm" ? (
                  <PackageForm
                    formik={formik}
                    setFormComponent={setFormComponent}
                    setShowModal={setShowModal}
                  />
                ) : (
                  <PaymentForm
                    formik={formik}
                    setFormComponent={setFormComponent}
                    setShowModal={setShowModal}
                  />
                )}
              </div>
            )}
       {/* </>   
         )}
       </Formik> */}
    </>
  );
}

export default SetupModal;
