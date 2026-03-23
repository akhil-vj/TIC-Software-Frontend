import React, { useState } from "react";
import DatePicker from "react-datepicker";
import SelectField from "../../common/SelectField";
import Img1 from "../../../../images/course/hotel-1.jpg";
import ActionDropdown from "../../Dashboard/ActionDropdown";
import { useNavigate } from "react-router-dom";
import notify from "../../common/Notify";
import InputField from "../../common/InputField";
import { formatDate } from "../../../utilis/date";
import ReactSelect from "../../common/ReactSelect";
import CustomModal from "../../../layouts/CustomModal";
import { URLS } from "../../../../constants";
import { useAsync } from "../../../utilis/useAsync";
import { checkFormValue } from "../../../utilis/check";
import { filePost } from "../../../../services/AxiosInstance";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { ModeBtn } from "../../common/ModeBtn";
import { useSelector } from "react-redux";

const PaymentForm = ({ formik, setFormComponent, setShowModal }) => {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = formik;
  const navigate = useNavigate();
  const [showMarkup, setShowMarkup] = useState(false)
  const itineraryId = values.itineraryId
  const isEdit = !!itineraryId
  const [readOnly, setReadOnly] = useState(isEdit);

  // Get tax values from Redux store
  const taxSettings = useSelector((state) => state.tax);

  const dayList = [1, 2, 3, 4];
  const scheduleData = [1, 2];
  const destinationOptions = ["Destination 1", "Destination 2"];
  const categoryOptions = ["Hotel", "Activity", "Transfer"];
  const dataList = [1, 2, 3, 4];

  // // Step 1: Parse the date strings into Date objects
  // const startDate = new Date(values.formStartDate);
  // const endDate = new Date(values.formEndDate);

  // // Step 2 and Step 3: Generate all dates between the two dates and store in an array
  // const datesArray = [];
  // let currentDate = startDate;
  // while (currentDate <= endDate) {
  //   datesArray.push(new Date(currentDate));
  //   currentDate.setDate(currentDate.getDate() + 1);
  // }

  const handleAddCategory = () => {
    if (values.categoryOptions === "Hotel") {
      navigate("/add-hotel");
    }
  };
  const formSubmit = () => {
    // setShowModal(false)
    // setFormComponent('setupForm')
    notify({ message: "Itinary Created Successfully" });
    navigate("/enquiry/quotation");
  };
  const tableBlog = [1, 2];
  const handleBack = () => {
    setFormComponent("packageForm")
  }
  // console.log('payment',values)
  const priceOption = [
    { id: 'TOTAL', name: 'Total Price' },
    { id: 'PER', name: 'Price Per Traveller' },
  ]
  // const gstOption = [
  //   {id:1,name:'GST on Total'},
  //   // {id:2,name:'GST on Per'},
  // ]
  const currencyOption = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
  ];
  const taxTypeOption = [
    { id: "gst", name: "GST" },
  ];
  const handleMarkup = () => {
    setFieldValue('baseMarkup', checkFormValue(values.baseMarkupInput, 'number'))
    setFieldValue('extraMarkup', checkFormValue(values.extraMarkupInput, 'number'))
    setShowMarkup(false)
  }
  const getRoundOfValue = (value, round = 2) => {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return Number(num.toFixed(round))
    }
    return 0
  }
  const handleInputChange = (planIndex, index, newValue, type = 'amount') => {
    const inputValue = Number(newValue)
    const newData = values.planArr?.map((item, planArrInd) => (
      planArrInd === planIndex ? {
        ...item,
        schedule: item.schedule.map((scheduleItem, ind) => {
          if (ind === index) {
            const result = { ...scheduleItem, [type]: getRoundOfValue(inputValue) }
            if (type === 'amount') {
              const person = scheduleItem.insertType === 'activity' ? scheduleItem.person : values.adult + values.child;
              result.baseAmount = values.priceOption.value === 'TOTAL' ? inputValue : inputValue * person;
            }
            return result;
          }
          return scheduleItem;
        })
      } : item
    ));
    setFieldValue('planArr', newData);
  };
  const handlePriceMode = (type) => {
    // check select price option with current quotation price option
    if (values.priceOption.value !== type) {
      const newData = values.planArr?.map((item, planArrInd) => (
        {
          ...item,
          schedule: item.schedule.map((scheduleItem, ind) => {
            const person = scheduleItem.insertType === 'activity' ? scheduleItem.person : values.adult + values.child;
            const currentBaseAmount = scheduleItem.baseAmount !== undefined ? scheduleItem.baseAmount : scheduleItem.amount;
            const result = { 
              ...scheduleItem, 
              amount: type === 'TOTAL' ? currentBaseAmount : currentBaseAmount / person,
              baseAmount: currentBaseAmount
            };
            return result;
          })
        }
      ));
      setFieldValue('planArr', newData);
    }
  }
  // console.log('valuss',values)
  const handleBilling = async () => {
    try {
      if (!itineraryId) {
        notifyError('Save itinerary before updating pricing');
        return;
      }
      const entriesCount = values.planArr?.reduce((acc, { schedule }) => acc + (schedule?.length || 0), 0) || 0;
      if (entriesCount === 0) {
        notifyError('Add at least one itinerary item before pricing');
        return;
      }
      const formData = new FormData()
      formData.append('package_name', values.packageName || '')
      formData.append('start_date', values.formStartDate ? new Date(values.formStartDate).toLocaleDateString("en-CA") : '')
      formData.append('end_date', values.formEndDate ? new Date(values.formEndDate).toLocaleDateString("en-CA") : '')
      formData.append('valid_until', values.formValidityDate ? new Date(values.formValidityDate).toLocaleDateString("en-CA") : '')
      formData.append('adult_count', checkFormValue(values.adult, 'number') || 0)
      formData.append('child_count', checkFormValue(values.child, 'number') || 0)
      formData.append('extra_markup_percentage', checkFormValue(values.baseMarkup, 'number'))
      formData.append('extra_markup_amount', checkFormValue(values.extraMarkup, 'number'))
      formData.append('description', values.paymentDescription || '.')
      const currencyValue = values?.priceIn?.value ?? values?.priceIn?.id;
      formData.append('currency', checkFormValue(currencyValue))
      formData.append('price_mode', checkFormValue(values.priceOption.value === 'PER' ? 'PER_PERSON' : 'TOTAL_PRICE'))
      formData.append('per_person_amounts', values.perPersonAmount ? '1' : '0')
      // Destination
      const destinationId = values.destination?.value || values.destination?.id;
      if (destinationId) {
        formData.append('destination_id', destinationId)
      }
      // Use Redux tax values instead of form values
      formData.append('cgst_percentage', checkFormValue(taxSettings.cgst_percentage, 'number'))
      formData.append('sgst_percentage', checkFormValue(taxSettings.sgst_percentage, 'number'))
      formData.append('igst_percentage', checkFormValue(taxSettings.igst_percentage, 'number'))
      formData.append('tcs_percentage', checkFormValue(taxSettings.tcs_percentage, 'number'))
      // Always append discount_amount (even if 0)
      formData.append('discount_amount', checkFormValue(values.discount_amount || values.discount || 0, 'number'))
      let entryIndex = 0
      values.planArr?.forEach(({ schedule }) => {
        schedule.forEach((data) => {
          if (!data.entryId) {
            throw new Error('Missing entry id. Please save itinerary items first.');
          }
          formData.append(`entries[${entryIndex}][id]`, checkFormValue(data.entryId))
          formData.append(`entries[${entryIndex}][amount]`, checkFormValue(data.amount))
          formData.append(`entries[${entryIndex}][markup]`, checkFormValue(data.markup))
          entryIndex = entryIndex + 1
        })
      })
      // formData.append('assigned_to',checkFormValue(values.assigned?.value))
      let response
      const url = `${URLS.ITINERARY_URL}/${itineraryId}/set-pricing`
      // if(isEdit){
      //   response = await axiosPut(editUrl,formData)
      // }else{
      //   console.log('url',url,formData)
      response = await filePost(url, formData)
      // }

      if (setShowModal) {
        setShowModal(false)
        // navigate('add/profile')
      }
      if (response?.success) {
        // formik.setFieldValue('itineraryId',response?.data?.id)
        // navigate(response?.data?.id)
        notifyCreate('Payment', isEdit)
      }
    } catch (error) {
      console.log('er', error)
      notifyError(error)
    }
  }

  const scheduleArr = values.planArr?.flatMap(({ date, schedule }, planArrInd) => {
    return schedule.map((item, scheduleInd) => ({
      date,
      item,
      planArrInd,
      scheduleInd
    }));
  }) || [];
  // Calculate total using reduce
  const totals = scheduleArr.reduce((accumulator, currentValue) => {
    const { item } = currentValue
    if (item.insertType !== 'hotel') {

      // Add amount to totalAmount
      accumulator.totalAmount += item.amount;

      // Add markup to totalMarkup
      accumulator.totalMarkup += item.markup;
    }
    return accumulator;

  }, { totalAmount: 0, totalMarkup: 0 });

  // Calculate per-person pricing for hotels based on adult/child breakdown
  const getPerPersonPricing = () => {
    const perPersonData = {};
    scheduleArr.forEach(({ item }) => {
      if (item.insertType === 'hotel') {
        const optionKey = item.option?.label || 'Default';
        if (!perPersonData[optionKey]) {
          perPersonData[optionKey] = { totalAdultCost: 0, totalChildCost: 0, entryCount: 0 };
        }
        perPersonData[optionKey].totalAdultCost += item.adultCost || 0;
        perPersonData[optionKey].totalChildCost += item.childCost || 0;
        perPersonData[optionKey].entryCount += 1;
      }
    });
    return perPersonData;
  };
  const perPersonPricing = getPerPersonPricing();

  // Calculate total using reduce
  // Helper function to calculate per-person costs if not available
  const getPerPersonCost = (item) => {
    // If adultCost and childCost are already set, use them
    if (item.adultCost && item.childCost) {
      return { adultCost: item.adultCost, childCost: item.childCost };
    }

    // Otherwise calculate based on amount and number of persons
    const totalPersons = values.adult + values.child;
    if (totalPersons > 0 && item.amount) {
      // For hotels and activities, distribute cost proportionally
      const costPerPerson = item.amount / totalPersons;
      return {
        adultCost: getRoundOfValue(costPerPerson * values.adult),
        childCost: getRoundOfValue(costPerPerson * values.child)
      };
    }

    return { adultCost: 0, childCost: 0 };
  };

  const optionInitialValue = [{ name: 'Option 1', amount: 0, markup: 0, adultCost: 0, childCost: 0 }, { name: 'Option 2', amount: 0, markup: 0, adultCost: 0, childCost: 0 }, { name: 'Option 3', amount: 0, markup: 0, adultCost: 0, childCost: 0 }]
  const hotelOption = scheduleArr.reduce((accumulator, currentValue) => {
    const { item } = currentValue
    if (item.insertType == 'hotel') {
      const perPersonCost = getPerPersonCost(item);
      if (item.option?.label === 'Option 1') {
        accumulator[0].amount += item.amount
        accumulator[0].markup += item.markup
        accumulator[0].adultCost += perPersonCost.adultCost
        accumulator[0].childCost += perPersonCost.childCost
      }
      if (item.option?.label === 'Option 2') {
        accumulator[1].amount += item.amount
        accumulator[1].markup += item.markup
        accumulator[1].adultCost += perPersonCost.adultCost
        accumulator[1].childCost += perPersonCost.childCost
      }
      if (item.option?.label === 'Option 3') {
        accumulator[2].amount += item.amount
        accumulator[2].markup += item.markup
        accumulator[2].adultCost += perPersonCost.adultCost
        accumulator[2].childCost += perPersonCost.childCost
      }

    }
    return accumulator;

  }, optionInitialValue);

  // Calculate TOTAL adult and child costs across ALL services
  const getTotalPerPersonCosts = () => {
    let totalAdultCost = 0;
    let totalChildCost = 0;

    scheduleArr.forEach(({ item }) => {
      const perPersonCost = getPerPersonCost(item);
      totalAdultCost += perPersonCost.adultCost;
      totalChildCost += perPersonCost.childCost;
    });

    return { totalAdultCost: getRoundOfValue(totalAdultCost), totalChildCost: getRoundOfValue(totalChildCost) };
  };

  const allServicesTotalPerPerson = getTotalPerPersonCosts();

  const getHotelOptionTotal = (amount, markup, type = 'amount') => {
    // const typeTotal = type === 'amount' ? totals.totalAmount : totals.totalMarkup
    const total = amount + markup + totals.totalAmount + totals.totalMarkup
    const roundOfTotal = getRoundOfValue(total)
    return roundOfTotal
  }
  const calculateInputMarkup = (amount, markup) => {
    if (values.baseMarkup) {
      const optionTotal = getHotelOptionTotal(amount, markup)
      const val = optionTotal * values.baseMarkup * 0.01
      const roundOfVal = getRoundOfValue(val)
      return roundOfVal
    } else {
      return values.extraMarkup
    }
  }
  const calculateTotal = (amount, markup) => {
    const optionTotal = totals.totalAmount + totals.totalMarkup + amount + markup
    const discountAmount = optionTotal * checkFormValue(values.discount, 'number') * 0.01
    const grandTotal = optionTotal - discountAmount
    const getPercentValue = (val) => {
      let result
      if (val) {
        result = grandTotal * val * 0.01
      } else {
        result = 0
      }
      return result
    }
    // Use Redux tax values instead of form values
    const percentValue = grandTotal + calculateInputMarkup(amount, markup) + getPercentValue(taxSettings.cgst_percentage) + getPercentValue(taxSettings.sgst_percentage) + getPercentValue(taxSettings.igst_percentage) + getPercentValue(taxSettings.tcs_percentage)
    const roundOfPercentValue = getRoundOfValue(percentValue)
    return roundOfPercentValue
  }

  // Detect if in single mode (all other taxes are 0)
  const isSingleTaxMode = taxSettings.sgst_percentage === 0 && taxSettings.igst_percentage === 0 && taxSettings.tcs_percentage === 0;
  return (
    <>
      <form
      // onSubmit={formSubmit}
      >

        <div className="d-flex justify-content-between">
          <button className="btn btn-outline-light" type="button" onClick={handleBack}><i class="fa fa-arrow-left fa-xl" aria-hidden="true"></i></button>
          <ModeBtn className="" isEdit={isEdit}
            readOnly={readOnly} setReadOnly={setReadOnly} />
        </div>
        <div
          className="table-responsive  full-data dataTables_wrapper"
          id="example2_wrapperr"
        >
          <table
            className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer package-table"
            id="example2"
          >
            <thead className="bg-white">
              <tr className="">
                {/* <th className="sorting_asc ">
                                                <input type="checkbox" onClick={() => chackboxFun("all")} className="form-check-input" id="checkAll" required="" />
                                            </th> */}
                {/* <th>#</th> */}
                <th>Item</th>
                <th>Type</th>
                <th>Net</th>
                <th>Mark up</th>
                <th>Gross</th>
                {/* <th className="text-center">Date</th>
                <th className="text-end">Status</th> */}
                {/* <th></th> */}
              </tr>
            </thead>
            <tbody>
              {scheduleArr.map(({ item, planArrInd, scheduleInd }, ind) => (
                <tr key={ind}>
                  {/* <td className="sorting_1">
                                                    <div className="checkbox me-0 align-self-center">
                                                        <div className="custom-control custom-checkbox ">
                                                            <input type="checkbox" className="form-check-input" id={"customCheckBox2"+ ind} required="" 
                                                                onClick={() => chackboxFun()} 
                                                            />
                                                            <label className="custom-control-label" htmlFor={"customCheckBox2"+ ind} ></label>
                                                        </div>
                                                    </div>
                                                </td> */}
                  {/* <td>{ind+1}</td> */}
                  <td className="whitesp-no p-0">
                    <div className="py-sm-3 py-1 ps-3">
                      <div>

                        <h6 className="font-w500 fs-15 mb-0">{item.name} {
                          item.insertType == 'hotel' && item.option?.label &&
                          // <div className="">
                          <span className="bg-success text-white p-1 rounded ms-2" style={{ fontSize: '10px' }}>{item.option?.label}</span>
                          // </div>
                        }</h6>
                        <span className="fs-14 font-w400">
                          {/* Delux - 24/6/23 to 28/6/23 */}
                          {`${item.roomType?.label || item.type?.label || ''} ( ${formatDate(item.startDate)} to ${formatDate(item.endDate)} )`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{item.insertType}</td>
                  <td className="package-td">
                    <input className="form-control" type="number" value={item.amount} disabled={readOnly} onChange={(e) => handleInputChange(planArrInd, scheduleInd, e.target.value)} />
                  </td>
                  <td className="package-td">
                    <input className="form-control" type="number" value={item.markup} disabled={readOnly} onChange={(e) => handleInputChange(planArrInd, scheduleInd, e.target.value, 'markup')} />
                  </td>
                  <td className="package-td">
                    {getRoundOfValue(item.amount + item.markup)}
                  </td>
                </tr>
              ))
              }
              {/* <tr className="custom-tr">
                <td>Total</td>
                <td></td>
                <td></td>
                <td>9000</td>
                <td>0 %</td>
                <td>9000</td>
              </tr>
              <tr className="">
                <td>Discount</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-primary">2000</td>
              </tr> */}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 p-2" style={{ backgroundColor: '#eee' }}>
          <div className="d-flex align-items-center">
            <div className="me-2">
              <ReactSelect
                // label="priceOption"
                options={priceOption}
                value={values.priceOption}
                onChange={(selected) => {
                  setFieldValue("priceOption", selected)
                  handlePriceMode(selected.value)
                }}
                isDisabled={readOnly}
                optionValue="id"
                optionLabel="name"
                formik={formik}
                onBlur={handleBlur}
                // inputId='destination'
                // className='custom-input'
                required
              />
            </div>
            <div className="" >
              <ReactSelect
                options={taxTypeOption}
                value={values.taxType}
                onChange={(selected) => setFieldValue("taxType", selected)}
                isDisabled={readOnly}
                optionValue="id"
                optionLabel="name"
                formik={formik}
                onBlur={handleBlur}
                required
              />
            </div>

          </div>
          <div className="">
            <h6 className="">{values.baseMarkup ? `Base Markup - ${values.baseMarkup} %` : `Extra Markup -  ${values.extraMarkup || 0} Rs`}</h6>
            <button type="button" className="btn bg-white p-2 mx-auto" disabled={readOnly} onClick={() => setShowMarkup(true)}>Update</button>
          </div>
        </div>
        <div
          className="table-responsive  full-data dataTables_wrapper mt-5"
          id="example2_wrapperr"
        >
          <table
            className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer package-table"
            id="example2"
          >
            <thead className="bg-primary">
              <tr className="">
                {/* <th className="sorting_asc ">
                                                <input type="checkbox" onClick={() => chackboxFun("all")} className="form-check-input" id="checkAll" required="" />
                                            </th> */}
                {/* <th>#</th> */}
                <th>Service</th>
                {values.priceOption.value === 'TOTAL' ? <th>Price</th> : <><th>Adult</th><th>Child</th></>}
                <th>Markup</th>
                <th>GST (%)</th>
                <th>Discount</th>
                <th>Total</th>
                {/* <th className="text-center">Date</th>
                                            <th className="text-end">Status</th> */}
                {/* <th></th> */}
              </tr>
            </thead>
            <tbody>
              {hotelOption?.map((item, ind) => (
                // item.insertType === 'hotel' &&
                item.amount !== 0 && <tr key={ind}>
                  {/* <td className="sorting_1">
                                                    <div className="checkbox me-0 align-self-center">
                                                        <div className="custom-control custom-checkbox ">
                                                            <input type="checkbox" className="form-check-input" id={"customCheckBox2"+ ind} required="" 
                                                                onClick={() => chackboxFun()} 
                                                            />
                                                            <label className="custom-control-label" htmlFor={"customCheckBox2"+ ind} ></label>
                                                        </div>
                                                    </div>
                                                </td> */}
                  {/* <td>{ind+1}</td> */}
                  <td className="whitesp-no p-0">
                    <div className="py-sm-3 py-1 ps-3">
                      <div>

                        <h6 className="font-w500 fs-15 mb-0">{item.name}
                          {/* {
                          item.insertType == 'hotel' && 
                          // <div className="">
                        <span className="bg-success text-white p-1 rounded ms-2" style={{fontSize:'10px'}}>{item.option?.label}</span>
                        // </div>
                        } */}
                        </h6>

                      </div>
                    </div>
                  </td>
                  {values.priceOption.value === 'TOTAL' ? <td>{getHotelOptionTotal(item.amount, item.markup)}</td> : <><td>{allServicesTotalPerPerson.totalAdultCost}</td><td>{allServicesTotalPerPerson.totalChildCost}</td></>}
                  <td>{calculateInputMarkup(item.amount, item.markup)}</td>
                  {/* Display combined tax value from Redux store */}
                  <td className="package-td">
                    {isSingleTaxMode ? taxSettings.cgst_percentage : (parseFloat(taxSettings.cgst_percentage || 0) + parseFloat(taxSettings.sgst_percentage || 0) + parseFloat(taxSettings.igst_percentage || 0) + parseFloat(taxSettings.tcs_percentage || 0)).toFixed(2)}
                  </td>
                  <td className="package-td">0</td>
                  <td className="package-td">
                    {calculateTotal(item.amount, item.markup)}
                  </td>
                </tr>
              ))
              }
              {/* <tr className="custom-tr">
                <td>Total</td>
                <td></td>
                <td></td>
                <td>9000</td>
                <td>0 %</td>
                <td>9000</td>
              </tr>
              <tr className="">
                <td>Discount</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-primary">2000</td>
              </tr> */}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-4">
          <div>
            {/* Discount % */}
            <div className="d-flex justify-content-end align-items-center mb-2">
              <h6 className="me-3">Discount (%):</h6>
              <input
                type="number"
                className="form-control"
                name={'discount'}
                onChange={handleChange}
                disabled={readOnly}
                onBlur={handleBlur}
                value={values.discount || ''}
                style={{ width: '80px' }}
                min="0"
                step="0.01"
              />
            </div>
            {/* Price Currency */}
            <div className="d-flex justify-content-end align-items-center mb-2">
              <h6 className="me-3">Price In:</h6>
              <ReactSelect
                options={currencyOption}
                value={values.priceIn}
                onChange={(selected) => setFieldValue("priceIn", selected)}
                optionValue="value"
                optionLabel="label"
                formik={formik}
                onBlur={handleBlur}
                isDisabled={readOnly}
              />
            </div>
            <div className="d-flex flex-column justify-content-center align-items-end mb-2">
              <input
                className="form-control ms-3"
                placeholder="Early Bird Offer"
                name={'paymentDescription'}
                onChange={handleChange}
                disabled={readOnly}
                onBlur={handleBlur}
                value={values.paymentDescription}
                style={{ width: '50%' }}
              />
              <button
                type="button"
                className="btn btn-primary mt-4"
                onClick={handleBilling}
                disabled={readOnly}
              >
                Update Billing
              </button>
            </div>
          </div>
        </div>
      </form>
      <CustomModal
        showModal={showMarkup}
        title={`Add Extra Markup`}
        handleModalClose={() => {
          setShowMarkup(false);
        }}
      >
        <div className="card-body">
          <div className="basic-form">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="mb-3 col-md-12">
                  <InputField
                    label="Base Markup %"
                    name="baseMarkupInput"
                    type='number'
                    onChange={(e) => {
                      handleChange(e)
                      setFieldValue('extraMarkupInput', 0)
                    }}
                    onBlur={handleBlur}
                    values={values}
                    inputClassName='w-25'
                  />
                </div>
                <div className="mb-3 col-md-12">
                  <InputField
                    label="Extra Markup"
                    name="extraMarkupInput"
                    type='number'
                    onChange={(e) => {
                      handleChange(e)
                      setFieldValue('baseMarkupInput', 0)
                    }}
                    onBlur={handleBlur}
                    values={values}
                    inputClassName='w-25'
                  />
                </div>

              </div>
              <button type="button" className="btn btn-primary" onClick={handleMarkup}>
                {`Update`}
              </button>
            </form>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default PaymentForm;
