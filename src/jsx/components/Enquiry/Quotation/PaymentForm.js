import React, { useState, useEffect, useRef } from "react";
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
import { filePost, axiosGet } from "../../../../services/AxiosInstance";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { ModeBtn } from "../../common/ModeBtn";
import { useSelector } from "react-redux";

// ─── Person type definitions ─────────────────────────────────────────────────
const PERSON_TYPES = [
  { key: "single", label: "Person (Single Sharing)" },
  { key: "double", label: "Person (Double Sharing)" },
  { key: "triple", label: "Person (Triple Sharing)" },
  { key: "extra", label: "Person (With Extra Bed)" },
  { key: "childW", label: "Child with Extra Bed" },
  { key: "childN", label: "Child without Extra Bed" },
];

const CURRENCY_SYMBOLS = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ",
  THB: "฿", MYR: "RM", SGD: "S$", AUD: "A$", CAD: "C$",
  JPY: "¥", CNY: "¥", SAR: "﷼", QAR: "﷼", KWD: "د.ك",
  OMR: "ر.ع.", BHD: "BD", LKR: "₨", NPR: "₨", IDR: "Rp",
};
const getSymbol = (code) => CURRENCY_SYMBOLS[code] || code || "";

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
  const [showMarkup, setShowMarkup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const itineraryId = values.itineraryId;
  const isEdit = !!itineraryId;
  const [readOnly, setReadOnly] = useState(isEdit);
  const [includeChildTransfer, setIncludeChildTransfer] = useState(false);

  const taxSettings = useSelector((state) => state.tax);

  const priceOption = [
    { id: "PER", name: "Price Per Traveller" },
    { id: "TOTAL", name: "Total Price" },
  ];
  // Fetch additional taxes from the Tax Settings page
  const taxData = useAsync(URLS.ADDITIONAL_TAXES_URL);
  const taxTypeOption = (taxData?.data?.data || []).map(t => ({ id: t.id, name: t.name, percentage: t.percentage }));

  // Auto-select first tax if no taxType is set and options are available
  useEffect(() => {
    if (taxTypeOption.length > 0 && !values.taxType) {
      setFieldValue("taxType", taxTypeOption[0]);
    }
  }, [taxTypeOption.length]);

  const currencyData = useAsync(URLS.CURRENCY_URL);
  const baseCurrencyData = currencyData?.data?.data?.find(
    (c) => c.id === values.baseCurrency
  );
  const baseCode = baseCurrencyData
    ? baseCurrencyData.from_currency
    : values.baseCurrency || "INR";

  const currencyOptions = [
    {
      label: `${baseCode} (Base)`,
      value: "base",
      to_currency: baseCode,
      exchange_rate: 0,
      symbol: getSymbol(baseCode),
    },
    ...(currencyData?.data?.data
      ?.filter((c) => c.from_currency === baseCode)
      ?.map((c) => ({
        ...c,
        label: c.to_currency || c.code,
        value: c.id,
        symbol: getSymbol(c.to_currency || c.code)
      })) || []),
  ];

  useEffect(() => {
    if (values.priceIn?.value) {
      const matchedOption = currencyOptions.find(
        (opt) => opt.value === values.priceIn.value
      );
      if (matchedOption && matchedOption.label !== values.priceIn.label) {
        setFieldValue("priceIn", matchedOption);
      }
    }
  }, [currencyOptions.length, values.priceIn?.value, values.priceIn?.label]);

  // ─── Fix: convert amounts on first load when PER mode is active ──────────
  const priceModeInitialized = useRef(false);
  useEffect(() => {
    if (priceModeInitialized.current) return;
    const hasScheduleItems = values.planArr?.some(p => p.schedule?.length > 0);
    if (!hasScheduleItems) return;

    // Only act when mode is PER and items are missing baseAmount (= freshly loaded from DB)
    if (values.priceOption?.value === 'PER') {
      const needsConversion = values.planArr.some(p =>
        p.schedule.some(s => s.baseAmount === undefined)
      );
      if (needsConversion) {
        priceModeInitialized.current = true;
        const newData = values.planArr.map(item => ({
          ...item,
          schedule: item.schedule.map(scheduleItem => {
            if (scheduleItem.baseAmount !== undefined) return scheduleItem;

            const shouldDivide = scheduleItem.insertType !== 'hotel';
            const person = scheduleItem.insertType === 'activity'
              ? (scheduleItem.person || 1)
              : ((values.adult || 0) + (values.child || 0)) || 1;

            return {
              ...scheduleItem,
              baseAmount: scheduleItem.amount,
              amount: shouldDivide ? getRoundOfValue(scheduleItem.amount / person) : scheduleItem.amount,
            };
          }),
        }));
        setFieldValue('planArr', newData);
      } else {
        priceModeInitialized.current = true;
      }
    } else {
      // TOTAL mode — just stamp baseAmount so toggles work correctly
      priceModeInitialized.current = true;
      const needsBase = values.planArr.some(p =>
        p.schedule.some(s => s.baseAmount === undefined)
      );
      if (needsBase) {
        const newData = values.planArr.map(item => ({
          ...item,
          schedule: item.schedule.map(scheduleItem => ({
            ...scheduleItem,
            baseAmount: scheduleItem.baseAmount ?? scheduleItem.amount,
          })),
        }));
        setFieldValue('planArr', newData);
      }
    }
  }, [values.planArr?.length, values.priceOption?.value]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const getRoundOfValue = (value, round = 2) => {
    const num = Number(value);
    return Number.isFinite(num) ? Number(num.toFixed(round)) : 0;
  };

  const handleBack = () => setFormComponent("packageForm");

  const handleInputChange = (planIndex, index, newValue, type = "amount") => {
    // Itemized table always shows base currency — no conversion needed
    const inputValue = Number(newValue);
    const newData = values.planArr?.map((item, planArrInd) =>
      planArrInd === planIndex
        ? {
          ...item,
          schedule: item.schedule.map((scheduleItem, ind) => {
            if (ind === index) {
              const result = { ...scheduleItem, [type]: getRoundOfValue(inputValue) };
              if (type === "amount") {
                const person =
                  scheduleItem.insertType === "activity"
                    ? scheduleItem.person
                    : values.adult + values.child;
                result.baseAmount =
                  values.priceOption.value === "TOTAL"
                    ? inputValue
                    : inputValue * person;
              }
              return result;
            }
            return scheduleItem;
          }),
        }
        : item
    );
    setFieldValue("planArr", newData);
  };

  const handleHotelPaxPriceChange = (planIndex, scheduleIndex, occupancyKey, newPaxValue) => {
    // Itemized table always shows base currency — no conversion needed
    const basePaxValue = Number(newPaxValue);

    const divisors = { single: 1, double: 2, triple: 3, extra: 1, childW: 1, childN: 1 };
    const divisor = divisors[occupancyKey] || 1;
    const newBaseRate = basePaxValue * divisor;

    const newData = values.planArr?.map((item, pIdx) =>
      pIdx === planIndex
        ? {
          ...item,
          schedule: item.schedule.map((scheduleItem, sIdx) => {
            if (sIdx === scheduleIndex) {
              // 1. Update roomOption (specific rates for this row)
              const updatedRoomOption = scheduleItem.roomOption?.map(r =>
                String(r.id) === String(scheduleItem.roomType?.value)
                  ? { ...r, [`${occupancyKey}_bed_amount`]: newBaseRate }
                  : r
              );

              // 2. Recalculate Total Amount
              const selectedRoom = updatedRoomOption?.find(r => String(r.id) === String(scheduleItem.roomType?.value));
              const rates = {
                single: Number(selectedRoom?.single_bed_amount || 0),
                double: Number(selectedRoom?.double_bed_amount || 0),
                triple: Number(selectedRoom?.triple_bed_amount || 0),
                extra: Number(selectedRoom?.extra_bed_amount || 0),
                childW: Number(selectedRoom?.child_w_bed_amount || 0),
                childN: Number(selectedRoom?.child_n_bed_amount || 0),
              };
              const counts = {
                single: safeCount(scheduleItem.single),
                double: safeCount(scheduleItem.double),
                triple: safeCount(scheduleItem.triple),
                extra: safeCount(scheduleItem.extra),
                childW: safeCount(scheduleItem.childW),
                childN: safeCount(scheduleItem.childN),
              };

              const newTotalWeight = (counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple) + (counts.extra * rates.extra) + (counts.childW * rates.childW) + (counts.childN * rates.childN);

              return {
                ...scheduleItem,
                roomOption: updatedRoomOption,
                amount: getRoundOfValue(newTotalWeight),
                baseAmount: getRoundOfValue(newTotalWeight),
              };
            }
            return scheduleItem;
          }),
        }
        : item
    );
    setFieldValue("planArr", newData);
  };

  const handlePriceMode = (type) => {
    if (values.priceOption.value !== type) {
      const newData = values.planArr?.map((item) => ({
        ...item,
        schedule: item.schedule.map((scheduleItem) => {
          let person = values.adult + values.child;

          if (scheduleItem.insertType === "activity") {
            person = scheduleItem.person;
          }

          const currentBaseAmount =
            scheduleItem.baseAmount !== undefined
              ? scheduleItem.baseAmount
              : scheduleItem.amount;

          const currentBaseMarkup =
            scheduleItem.baseMarkup !== undefined
              ? scheduleItem.baseMarkup
              : (scheduleItem.markup || 0);

          // For Hotels, we keep the amount as TOTAL (Option A)
          // For Activities/Transfers, we continue to divide for PER mode
          const shouldDivide = scheduleItem.insertType !== "hotel";

          return {
            ...scheduleItem,
            amount: (type === "TOTAL" || !shouldDivide) ? currentBaseAmount : currentBaseAmount / (person || 1),
            markup: (type === "TOTAL" || !shouldDivide) ? currentBaseMarkup : currentBaseMarkup / (person || 1),
            baseAmount: currentBaseAmount,
            baseMarkup: currentBaseMarkup,
          };
        }),
      }));
      setFieldValue("planArr", newData);
    }
  };

  const handleMarkup = () => {
    setFieldValue("baseMarkup", checkFormValue(values.baseMarkupInput, "number"));
    setFieldValue("extraMarkup", checkFormValue(values.extraMarkupInput, "number"));
    setShowMarkup(false);
  };

  // ─── Derived data ─────────────────────────────────────────────────────────────
  const scheduleArr =
    values.planArr?.flatMap(({ date, schedule }, planArrInd) =>
      schedule.map((item, scheduleInd) => ({ date, item, planArrInd, scheduleInd }))
    ) || [];

  const totals = scheduleArr.reduce(
    (acc, { item }) => {
      if (item.insertType !== "hotel") {
        acc.totalAmount += item.amount;
        acc.trueTotalAmount = (acc.trueTotalAmount || 0) + (item.baseAmount !== undefined ? item.baseAmount : item.amount);
        acc.totalMarkup += item.markup;
      }
      return acc;
    },
    { totalAmount: 0, trueTotalAmount: 0, totalMarkup: 0 }
  );

  const getPerPersonCost = (item) => {
    if (item.adultCost && item.childCost)
      return { adultCost: item.adultCost, childCost: item.childCost };
    const totalPersons = values.adult + values.child;
    if (totalPersons > 0 && item.amount) {
      const cpp = item.amount / totalPersons;
      return {
        adultCost: getRoundOfValue(cpp * values.adult),
        childCost: getRoundOfValue(cpp * values.child),
      };
    }
    return { adultCost: 0, childCost: 0 };
  };

  const optionInitialValue = [
    { name: "Option 1", amount: 0, markup: 0, adultCost: 0, childCost: 0, single: 0, double: 0, triple: 0, extra: 0, childW: 0, childN: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, extraTotalCost: 0, childWTotalCost: 0, childNTotalCost: 0 },
    { name: "Option 2", amount: 0, markup: 0, adultCost: 0, childCost: 0, single: 0, double: 0, triple: 0, extra: 0, childW: 0, childN: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, extraTotalCost: 0, childWTotalCost: 0, childNTotalCost: 0 },
    { name: "Option 3", amount: 0, markup: 0, adultCost: 0, childCost: 0, single: 0, double: 0, triple: 0, extra: 0, childW: 0, childN: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, extraTotalCost: 0, childWTotalCost: 0, childNTotalCost: 0 },
  ];

  // Helper to safely parse a count value — treats "", undefined, null, NaN as 0
  const safeCount = (val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const n = parseInt(val, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const hotelOption = scheduleArr.reduce((acc, { item }) => {
    if (item.insertType === "hotel") {
      const optLabel = item.option?.label || (typeof item.option === 'string' ? item.option : '');
      const idx =
        optLabel === "Option 1" ? 0
          : optLabel === "Option 2" ? 1
            : optLabel === "Option 3" ? 2
              : -1;
      if (idx >= 0) {
        acc[idx].amount += Number(item.amount || 0);
        acc[idx].trueBaseAmount = (acc[idx].trueBaseAmount || 0) + Number(item.baseAmount !== undefined ? item.baseAmount : item.amount);
        acc[idx].markup += Number(item.markup || 0);

        // Accurate weighted distribution based on hotel room rates
        const selectedRoom = item.roomOption?.find(r => r.id == item.roomType?.value);
        const rates = {
          single: Number(selectedRoom?.single_bed_amount || 0),
          double: Number(selectedRoom?.double_bed_amount || 0),
          triple: Number(selectedRoom?.triple_bed_amount || 0),
          extra: Number(selectedRoom?.extra_bed_amount || 0),
          childW: Number(selectedRoom?.child_w_bed_amount || 0),
          childN: Number(selectedRoom?.child_n_bed_amount || 0),
        };
        const counts = {
          single: safeCount(item.single),
          double: safeCount(item.double),
          triple: safeCount(item.triple),
          extra: safeCount(item.extra),
          childW: safeCount(item.childW),
          childN: safeCount(item.childN),
        };

        const itemTotalWeight = (counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple) + (counts.extra * rates.extra) + (counts.childW * rates.childW) + (counts.childN * rates.childN);

        let ratio = 1;
        if (itemTotalWeight > 0) {
          ratio = (Number(item.amount || 0)) / itemTotalWeight;
        } else {
          const totalPax = counts.single + counts.double + counts.triple + counts.extra + counts.childW + counts.childN;
          if (totalPax > 0) {
            const avg = Number(item.amount || 0) / totalPax;
            rates.single = rates.double = rates.triple = rates.extra = rates.childW = rates.childN = avg;
            ratio = 1;
          }
        }

        acc[idx].single += counts.single;
        acc[idx].double += counts.double;
        acc[idx].triple += counts.triple;
        acc[idx].extra += counts.extra;
        acc[idx].childW += counts.childW;
        acc[idx].childN += counts.childN;

        acc[idx].singleDisplay = Math.max(acc[idx].singleDisplay || 0, counts.single);
        acc[idx].doubleDisplay = Math.max(acc[idx].doubleDisplay || 0, counts.double);
        acc[idx].tripleDisplay = Math.max(acc[idx].tripleDisplay || 0, counts.triple);
        acc[idx].extraDisplay = Math.max(acc[idx].extraDisplay || 0, counts.extra);
        acc[idx].childWDisplay = Math.max(acc[idx].childWDisplay || 0, counts.childW);
        acc[idx].childNDisplay = Math.max(acc[idx].childNDisplay || 0, counts.childN);

        acc[idx].singleTotalCost += (counts.single * rates.single) * ratio;
        acc[idx].doubleTotalCost += (counts.double * rates.double) * ratio;
        acc[idx].tripleTotalCost += (counts.triple * rates.triple) * ratio;
        acc[idx].extraTotalCost += (counts.extra * rates.extra) * ratio;
        acc[idx].childWTotalCost += (counts.childW * rates.childW) * ratio;
        acc[idx].childNTotalCost += (counts.childN * rates.childN) * ratio;
      }
    }
    return acc;
  }, optionInitialValue);

  const getTotalPerPersonCosts = () => {
    let totalAdultCost = 0;
    let totalChildCost = 0;
    scheduleArr.forEach(({ item }) => {
      const ppc = getPerPersonCost(item);
      totalAdultCost += ppc.adultCost;
      totalChildCost += ppc.childCost;
    });
    return {
      totalAdultCost: getRoundOfValue(totalAdultCost),
      totalChildCost: getRoundOfValue(totalChildCost),
    };
  };
  const allServicesTotalPerPerson = getTotalPerPersonCosts();

  const getHotelOptionTotal = (amount, markup) =>
    getRoundOfValue(amount + markup + totals.totalAmount + totals.totalMarkup);

  const calculateInputMarkup = (amount, markup) => {
    if (values.baseMarkup) {
      return getRoundOfValue(
        getHotelOptionTotal(amount, markup) * values.baseMarkup * 0.01
      );
    }
    return values.extraMarkup;
  };

  const calculateTotal = (amount, markup) => {
    const optionTotal = totals.totalAmount + totals.totalMarkup + amount + markup;
    const discountAmount = optionTotal * checkFormValue(values.discount, "number") * 0.01;
    const grandTotal = optionTotal - discountAmount;
    // Use the selected tax type's percentage
    const selectedTaxPct = parseFloat(values.taxType?.percentage || 0);
    const taxAmount = grandTotal * selectedTaxPct * 0.01;
    return getRoundOfValue(
      grandTotal +
      calculateInputMarkup(amount, markup) +
      taxAmount
    );
  };

  const calculateTrueInputMarkup = (trueAmount, markup) => {
    if (values.baseMarkup) {
      const optionTotal = trueAmount + markup + (totals.trueTotalAmount || 0) + totals.totalMarkup;
      return getRoundOfValue(optionTotal * values.baseMarkup * 0.01);
    }
    return values.extraMarkup;
  };

  const calculateTrueTotal = (trueAmount, markup) => {
    const optionTotal = (totals.trueTotalAmount || 0) + totals.totalMarkup + trueAmount + markup;
    const discountAmount = optionTotal * checkFormValue(values.discount, "number") * 0.01;
    const gTotal = optionTotal - discountAmount;
    const selectedTaxPct = parseFloat(values.taxType?.percentage || 0);
    const taxAmount = gTotal * selectedTaxPct * 0.01;
    return getRoundOfValue(gTotal + calculateTrueInputMarkup(trueAmount, markup) + taxAmount);
  };

  const getVatDisplay = () => values.taxType?.percentage || 0;

  /**
   * Break down a hotel option's totals into per-person-type rows.
   * Adult types (0,1) share adultCost; child types (2,3) share childCost.
   * Adjust the distribution keys here once real per-type data is available.
   */
  const getPersonTypeRows = (item) => {
    // 1. Calculate Hotel rows (Net Hotel Cost per person type)
    const hotelRows = PERSON_TYPES.map((pt) => {
      const count = safeCount(item[pt.key]);
      const displayCount = safeCount(item[`${pt.key}Display`]);
      if (count <= 0) return null;

      // hotelRowCostAll is the TOTAL base cost for ALL travelers of this type in this option
      const hotelRowCostAll = Number(item[`${pt.key}TotalCost`] || 0);

      // Calculate what fraction of the hotel base this type represents 
      const hotelFraction = (item.amount || 0) > 0 ? hotelRowCostAll / item.amount : 0;

      // Markup for this specific hotel row (line-item markup only)
      const hotelMarkupAll = Number(item.markup || 0) * hotelFraction;

      let rowPriceTotal = (hotelRowCostAll + hotelMarkupAll);
      let rowMarkupTotal = hotelMarkupAll;

      // ADJUSTMENT FOR mode-based display
      const isPerMode = values.priceOption?.value === "PER";
      const isSharingType = ['single', 'double', 'triple'].includes(pt.key);

      if (isPerMode) {
        // In PER mode, show the cost per Person
        rowPriceTotal = rowPriceTotal / count;
        rowMarkupTotal = rowMarkupTotal / count;
      } else if (isSharingType) {
        // In TOTAL mode, for sharing types, show the Rate Per Room (unit rate)
        const divisor = (pt.key === 'double' ? 2 : pt.key === 'triple' ? 3 : 1);
        rowPriceTotal = (rowPriceTotal / count) * divisor;
        rowMarkupTotal = (rowMarkupTotal / count) * divisor;
      }

      return {
        key: pt.key,
        label: pt.label,
        count: displayCount,
        markup: getRoundOfValue(rowMarkupTotal),
        vat: getVatDisplay(),
        total: getRoundOfValue(rowPriceTotal)
      };
    }).filter(row => row !== null);

    return hotelRows;
  };

  // ─── Handle billing submission ────────────────────────────────────────────────
  const handleBilling = async () => {
    try {
      if (!itineraryId) { notifyError("Save itinerary before updating pricing"); return; }
      const entriesCount =
        values.planArr?.reduce((acc, { schedule }) => acc + (schedule?.length || 0), 0) || 0;
      if (entriesCount === 0) { notifyError("Add at least one itinerary item before pricing"); return; }

      const formData = new FormData();
      formData.append("package_name", values.packageName || "");
      formData.append("start_date", values.formStartDate ? new Date(values.formStartDate).toLocaleDateString("en-CA") : "");
      formData.append("end_date", values.formEndDate ? new Date(values.formEndDate).toLocaleDateString("en-CA") : "");
      formData.append("valid_until", values.formValidityDate ? new Date(values.formValidityDate).toLocaleDateString("en-CA") : "");
      formData.append("adult_count", checkFormValue(values.adult, "number") || 0);
      formData.append("child_count", checkFormValue(values.child, "number") || 0);
      formData.append("extra_markup_percentage", checkFormValue(values.baseMarkup, "number"));
      formData.append("extra_markup_amount", checkFormValue(values.extraMarkup, "number"));
      formData.append("description", values.paymentDescription || ".");
      const currencyValue = values?.priceIn?.value ?? values?.priceIn?.id;
      formData.append("currency", checkFormValue(currencyValue));
      formData.append("price_mode", checkFormValue(values.priceOption.value === "PER" ? "PER_PERSON" : "TOTAL_PRICE"));
      formData.append("per_person_amounts", values.perPersonAmount ? "1" : "0");
      const destinationId = values.destination?.value || values.destination?.id;
      if (destinationId) formData.append("destination_id", destinationId);
      const selectedTaxPct = parseFloat(values.taxType?.percentage || 0);
      formData.append("tax_type_id", checkFormValue(values.taxType?.id));
      formData.append("tax_type_name", checkFormValue(values.taxType?.name));
      formData.append("cgst_percentage", checkFormValue(selectedTaxPct, "number"));
      formData.append("sgst_percentage", 0);
      formData.append("igst_percentage", 0);
      formData.append("tcs_percentage", 0);
      formData.append("discount_amount", checkFormValue(values.discount_amount || values.discount || 0, "number"));

      const primaryOption = hotelOption[0];
      const grandTotal = calculateTotal(primaryOption.amount, primaryOption.markup);
      const totalAmount = (totals.totalAmount || 0) + (totals.totalMarkup || 0) + (primaryOption.amount || 0) + (primaryOption.markup || 0);
      const rate = parseFloat(values.priceIn?.exchange_rate) || 1;
      const convertedTotal = getRoundOfValue(grandTotal / rate);
      formData.append("total_amount", totalAmount);
      formData.append("grand_total", grandTotal);
      formData.append("converted_total", convertedTotal);
      formData.append("exchange_rate", rate);

      let entryIndex = 0;
      values.planArr?.forEach(({ schedule }) => {
        schedule.forEach((data) => {
          if (!data.entryId) throw new Error("Missing entry id. Please save itinerary items first.");
          formData.append(`entries[${entryIndex}][id]`, checkFormValue(data.entryId));
          // Always save the canonical total amount so future loads are consistent
          const canonicalAmount = data.baseAmount !== undefined ? data.baseAmount : data.amount;
          formData.append(`entries[${entryIndex}][amount]`, checkFormValue(canonicalAmount));
          formData.append(`entries[${entryIndex}][markup]`, checkFormValue(data.markup));
          entryIndex += 1;
        });
      });

      const response = await filePost(`${URLS.ITINERARY_URL}/${itineraryId}/set-pricing`, formData);
      if (response?.success) {
        setFieldValue("grand_total", grandTotal);
        setFieldValue("converted_total", convertedTotal);
        setFieldValue("total_amount", totalAmount);

        if (setShowModal) setShowModal(false);
        notifyCreate("Payment", isEdit);
      }
    } catch (error) {
      notifyError(error);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await axiosGet(`${URLS.ITINERARY_URL}/${itineraryId}/pricing-history`);
      if (response?.success) {
        setHistoryData(response.data);
      }
    } catch (error) {
      notifyError(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    fetchHistory();
    setShowHistory(true);
  };

  const handleRestore = async (snapshotId) => {
    if (!window.confirm("Are you sure you want to restore this pricing version? This will overwrite your current pricing configuration.")) return;
    try {
      const response = await filePost(`${URLS.ITINERARY_URL}/${itineraryId}/restore-pricing/${snapshotId}`, new FormData());
      if (response?.success) {
        notifyCreate("Pricing Restored", true);
        setShowHistory(false);
        // Reload page to refetch everything from the top level
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      notifyError(error);
    }
  };

  const visibleOptions = hotelOption.filter((item) => {
    const personRows = getPersonTypeRows(item);
    return personRows.length > 0;
  });

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <form>
        {/* ── Page Header & Controls ── */}
        <div className="d-flex justify-content-between align-items-center mb-5" style={{ backgroundColor: "#f8fafc", padding: "16px 24px", borderRadius: "12px" }}>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleBack} style={{ borderRadius: "8px", border: "0.5px solid #e2e8f0" }}>
              <i className="fa fa-arrow-left" aria-hidden="true"></i> Back
            </button>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleOpenHistory} style={{ borderRadius: "8px", border: "0.5px solid #e2e8f0" }} disabled={!isEdit}>
              <i className="fa fa-history" aria-hidden="true"></i> History
            </button>
            <div>
              <h4 className="mb-0 text-dark" style={{ fontSize: "20px", fontWeight: 600 }}>Quotation Strategy</h4>
              <span className="text-muted" style={{ fontSize: "13px" }}>Review and finalize pricing details</span>
            </div>
          </div>
          <ModeBtn isEdit={isEdit} readOnly={readOnly} setReadOnly={setReadOnly} />
        </div>

        {/* ── Itemized Pricing Table ── */}
        {(() => {
          // Itemized Breakdown and Executive Summary always show base currency
          const activeRate = 1;
          const activeSymbol = getSymbol(baseCode);

          const categoryTotals = scheduleArr.reduce((acc, { item }) => {
            const rawType = (item.insertType || 'other').toLowerCase();
            const type = (rawType === 'transfer' || rawType === 'car') ? 'car' : rawType;

            // For Hotels, only sum Option 1 totals (which match the default Grand Total)
            if (rawType === 'hotel') {
              const optLabel = item.option?.label || (typeof item.option === 'string' ? item.option : '');
              if (optLabel !== "" && optLabel !== "Option 1") return acc;
            }

            // In ALL summary cards, we show the TOTAL aggregate gross cost (Net + Markup) for all travelers
            // Regardless of whether active mode is PER or TOTAL.
            let itemNetTotal = 0;
            let itemMarkupTotal = 0;

            const isPer = values.priceOption?.value === "PER";
            const person = (rawType === 'activity') ? (item.person || 1) : ((values.adult || 0) + (values.child || 0)) || 1;

            if (isPer && rawType !== 'hotel') {
              // Convert per-person back to total for the summary
              itemNetTotal = (Number(item.amount || 0)) * person;
              itemMarkupTotal = (Number(item.markup || 0)) * person;
            } else {
              // Already total
              itemNetTotal = Number(item.amount || 0);
              itemMarkupTotal = Number(item.markup || 0);
            }

            const itemGrossTotal = itemNetTotal + itemMarkupTotal;
            acc[type] = (acc[type] || 0) + itemGrossTotal;

            // ── Adult / Child Split for Activities & Transfers ──
            if (rawType === 'activity' || type === 'car') {
              const adultCount = Number(values.adult || 0);
              const childCount = Number(values.child || 0);
              const totalPax = adultCount + childCount;
              if (totalPax > 0) {
                const adultPart = (itemGrossTotal * adultCount) / totalPax;
                const childPart = (itemGrossTotal * childCount) / totalPax;
                if (rawType === 'activity') {
                  acc.activityAdult = (acc.activityAdult || 0) + adultPart;
                  acc.activityChild = (acc.activityChild || 0) + childPart;
                } else {
                  acc.carAdult = (acc.carAdult || 0) + adultPart;
                  acc.carChild = (acc.carChild || 0) + childPart;
                }
              } else {
                if (rawType === 'activity') acc.activityAdult = (acc.activityAdult || 0) + itemGrossTotal;
                else acc.carAdult = (acc.carAdult || 0) + itemGrossTotal;
              }
            }

            // ── Hotel sub-totals breakdown ──
            if (rawType === 'hotel') {
              const roomTypeId = item.roomType?.value || item.roomType?.id || item.roomType;
              const selectedRoom = item.roomOption?.find(r => String(r.id) === String(roomTypeId));
              const rates = {
                single: Number(selectedRoom?.single_bed_amount || 0),
                double: Number(selectedRoom?.double_bed_amount || 0),
                triple: Number(selectedRoom?.triple_bed_amount || 0),
                extra: Number(selectedRoom?.extra_bed_amount || 0),
                childW: Number(selectedRoom?.child_w_bed_amount || 0),
                childN: Number(selectedRoom?.child_n_bed_amount || 0),
              };
              const counts = {
                single: safeCount(item.single),
                double: safeCount(item.double),
                triple: safeCount(item.triple),
                extra: safeCount(item.extra),
                childW: safeCount(item.childW),
                childN: safeCount(item.childN),
              };
              const totalWeight = (counts.single * rates.single) + (counts.double * rates.double) +
                (counts.triple * rates.triple) + (counts.extra * rates.extra) +
                (counts.childW * rates.childW) + (counts.childN * rates.childN);

              const ratio = totalWeight > 0 ? itemGrossTotal / totalWeight : 0;

              // Room Rates — sum of sharing types
              const roomCost = ((counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple)) * ratio;
              // Adult Extra Bed
              const extraBedCost = (counts.extra * rates.extra) * ratio;
              // Child Extra Bed
              const childWCost = (counts.childW * rates.childW) * ratio;
              // Child Without Bed
              const childNCost = (counts.childN * rates.childN) * ratio;

              acc.hotelRoom = (acc.hotelRoom || 0) + roomCost;
              acc.hotelExtra = (acc.hotelExtra || 0) + extraBedCost;
              acc.hotelChildW = (acc.hotelChildW || 0) + childWCost;
              acc.hotelChildN = (acc.hotelChildN || 0) + childNCost;
            }

            return acc;
          }, {});

          const convert = (val) => getRoundOfValue(val / activeRate);

          return (
            <>
              <div className="card border-0 mb-4" style={{ border: "0.5px solid #e2e8f0", borderRadius: "12px" }}>
                <div className="card-header bg-white border-0 py-3" style={{ borderBottom: "0.5px solid #e2e8f0", borderRadius: "12px 12px 0 0" }}>
                  <h5 className="card-title mb-0 text-dark" style={{ fontSize: "15px", fontWeight: 600 }}>Itemized Breakdown</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table mb-0 text-dark" style={{ borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "#f8faff", borderBottom: "2px solid #e2e8f0" }}>
                        <tr>
                          <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b" }}>Tours / Hotels</th>
                          <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "15%" }}>Type</th>
                          <th className="py-3 px-4 text-dark text-end" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "15%" }}>Net Price ({activeSymbol})</th>
                          <th className="py-3 px-4 text-dark text-end" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "15%" }}>Gross Price ({activeSymbol})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleArr.map(({ item, planArrInd, scheduleInd }, ind) => {
                          const displayAmount = (val) => {
                            if (val == null || val === "") return val;
                            const converted = Number(val) / activeRate;
                            if (Math.abs((converted * 100) % 1) > 0.00001) {
                              return parseFloat(converted.toFixed(2));
                            }
                            return converted;
                          };

                          const isPer = values.priceOption.value === "PER";
                          const isHotel = item.insertType === "hotel";
                          let breakdownData = [];

                          if (isHotel && isPer) {
                            const selectedRoom = item.roomOption?.find(r => r.id == item.roomType?.value);
                            const rates = {
                              single: Number(selectedRoom?.single_bed_amount || 0),
                              double: Number(selectedRoom?.double_bed_amount || 0),
                              triple: Number(selectedRoom?.triple_bed_amount || 0),
                              extra: Number(selectedRoom?.extra_bed_amount || 0),
                              childW: Number(selectedRoom?.child_w_bed_amount || 0),
                              childN: Number(selectedRoom?.child_n_bed_amount || 0),
                            };
                            const counts = {
                              single: safeCount(item.single),
                              double: safeCount(item.double),
                              triple: safeCount(item.triple),
                              extra: safeCount(item.extra),
                              childW: safeCount(item.childW),
                              childN: safeCount(item.childN),
                            };
                            const weight = (counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple) + (counts.extra * rates.extra) + (counts.childW * rates.childW) + (counts.childN * rates.childN);
                            const ratio = weight > 0 ? (Number(item.amount || 0) / weight) : 0;
                            const markupRatio = Number(item.amount || 0) > 0 ? (Number(item.markup || 0) / Number(item.amount || 0)) : 0;

                            const types = [
                              { k: 'single', l: 'Single', d: 1 },
                              { k: 'double', l: 'Double Sharing', d: 2 },
                              { k: 'triple', l: 'Triple Sharing', d: 3 },
                              { k: 'extra', l: 'Extra Bed', d: 1 },
                              { k: 'childW', l: 'Child With Bed', d: 1 },
                              { k: 'childN', l: 'Child No Bed', d: 1 },
                            ];

                            breakdownData = types
                              .filter(t => counts[t.k] > 0)
                              .map(t => {
                                const netPerPax = (rates[t.k] * ratio) / t.d;
                                const grossPerPax = netPerPax * (1 + markupRatio);
                                return {
                                  key: t.k,
                                  label: t.l,
                                  net: displayAmount(netPerPax),
                                  gross: displayAmount(grossPerPax)
                                };
                              });
                          }

                          const firstBreakdown = breakdownData[0];
                          const otherBreakdowns = breakdownData.slice(1);
                          const showMainBorder = !(isHotel && isPer) || otherBreakdowns.length === 0;
                          const isBreakdown = isHotel && isPer && breakdownData.length > 0;

                          const themes = {
                            hotel: { bg: "#ffffff", hover: "#f8f9fa", accent: "transparent" },
                            activity: { bg: "#ffffff", hover: "#f8f9fa", accent: "transparent" },
                            car: { bg: "#e8f5e9", hover: "#dcedc8", accent: "transparent" },
                            default: { bg: "#fff", hover: "#fcfdff", accent: "transparent" }
                          };
                          const theme = themes[item.insertType] || themes.default;
                          const groupBg = theme.bg;

                          return (
                            <React.Fragment key={ind}>
                              <tr className={showMainBorder ? "" : ""} style={{ transition: "background-color 0.2s", backgroundColor: groupBg, borderBottom: isBreakdown ? "none" : "1px solid #f1f5f9" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hover} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = groupBg }}>
                                <td className={`px-4 align-middle ${isBreakdown ? "pt-1 pb-1" : "py-3"}`} style={{ border: "none" }}>
                                  <div className="d-flex align-items-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", backgroundColor: item.insertType === 'hotel' ? '#EEF4FF' : item.insertType === 'activity' ? '#FFF9E6' : '#E6FCF5' }}>
                                      <i className={`fa fa-lg ${item.insertType === 'hotel' ? 'fa-building text-primary' : item.insertType === 'activity' ? 'fa-ticket' : 'fa-car text-success'}`} style={{ color: item.insertType === 'hotel' ? '#185FA5' : item.insertType === 'activity' ? '#D97706' : '#16A34A' }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <h6 className="text-dark mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                                        {item.name}
                                        {isHotel && item.option?.label && (
                                          <span className="badge ms-2" style={{ fontSize: "11px", letterSpacing: "0.5px", backgroundColor: "#EEF4FF", color: "#185FA5", padding: "4px 12px", borderRadius: "999px", fontWeight: 500 }}>{item.option.label}</span>
                                        )}
                                      </h6>
                                      <div className="d-flex flex-column">
                                        <span className="text-muted" style={{ fontSize: "12px" }}>
                                          {`${item.roomType?.label || item.type?.label || "Service"} • ${formatDate(item.startDate)} to ${formatDate(item.endDate)}`}
                                        </span>
                                        {isHotel && isPer && firstBreakdown && (
                                          <span style={{ fontSize: "11px", fontWeight: 500, marginTop: "8px", color: "#64748b", display: "block" }}>
                                            <i className="fa-solid fa-turn-up fa-rotate-90 me-2 opacity-50"></i> {firstBreakdown.label}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className={`px-4 align-middle ${isBreakdown ? "pt-1 pb-1" : "py-3"}`} style={{ fontSize: "13px", border: "none" }}>
                                  <span className="badge" style={{ backgroundColor: item.insertType === 'hotel' ? '#EEF4FF' : item.insertType === 'activity' ? '#FFF9E6' : '#E6FCF5', color: item.insertType === 'hotel' ? '#185FA5' : item.insertType === 'activity' ? '#995600' : '#187E5B', padding: "4px 12px", borderRadius: "999px", fontWeight: 500, fontSize: "11px", textTransform: "capitalize" }}>
                                    {item.insertType}
                                  </span>
                                </td>
                                <td className={`px-4 text-end ${isBreakdown ? "pt-1 pb-1 align-bottom" : "py-3 align-middle"}`} style={{ border: "none" }}>
                                  {!(isHotel && isPer) ? (
                                    <input
                                      className="form-control text-end fw-bold text-dark"
                                      type="number"
                                      value={displayAmount(item.amount)}
                                      disabled={readOnly}
                                      onChange={(e) => handleInputChange(planArrInd, scheduleInd, e.target.value)}
                                      style={{ border: "1px solid transparent", backgroundColor: "transparent", borderRadius: "6px", transition: "all 0.2s" }}
                                      onFocus={(e) => { e.target.style.border = "1px solid #0d6efd"; e.target.style.backgroundColor = "#fff"; }}
                                      onBlur={(e) => { e.target.style.border = "1px solid transparent"; e.target.style.backgroundColor = "transparent"; handleBlur(e); }}
                                    />
                                  ) : (
                                    firstBreakdown && (
                                      <input
                                        className="form-control form-control-sm text-end fw-bold text-dark"
                                        type="number"
                                        value={firstBreakdown.net}
                                        disabled={readOnly}
                                        onChange={(e) => handleHotelPaxPriceChange(planArrInd, scheduleInd, firstBreakdown.key, e.target.value)}
                                        style={{ border: "1px solid transparent", backgroundColor: "transparent", borderRadius: "4px", width: "100%", fontSize: "12px" }}
                                        onFocus={(e) => { e.target.style.border = "1px solid #0d6efd"; e.target.style.backgroundColor = "#fff"; }}
                                        onBlur={(e) => { e.target.style.border = "1px solid transparent"; e.target.style.backgroundColor = "transparent"; handleBlur(e); }}
                                      />
                                    )
                                  )}
                                </td>
                                <td className={`px-4 text-end fw-bold text-dark fs-15 ${isBreakdown ? "pt-1 pb-1 align-bottom" : "py-3 align-middle"}`} style={{ border: "none" }}>
                                  {!(isHotel && isPer) ? (
                                    getRoundOfValue(item.amount + item.markup)
                                  ) : (
                                    firstBreakdown && (
                                      <span className="text-dark fw-bold" style={{ fontSize: "12px" }}>
                                        {firstBreakdown.gross}
                                      </span>
                                    )
                                  )}
                                </td>
                              </tr>

                              {/* Additional Breakdown Sub-Rows */}
                              {isHotel && isPer && otherBreakdowns.map((row, i) => {
                                const isLastBreakdown = i === otherBreakdowns.length - 1;
                                return (
                                  <tr key={`${ind}_${i}`} className={`${isLastBreakdown ? "" : ""}`} style={{ backgroundColor: theme.bg, borderBottom: isLastBreakdown ? "1px solid #f1f5f9" : "none", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hover} onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.bg}>
                                    <td className="px-4 py-1 border-0 align-middle" style={{ border: "none" }}>
                                      <span className="text-dark" style={{ fontSize: "11px", fontWeight: 500, paddingLeft: "48px", color: "#64748b" }}>
                                        <i className="fa-solid fa-turn-up fa-rotate-90 me-2 opacity-50"></i>
                                        {row.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-1 border-0 align-middle" style={{ border: "none" }}></td>
                                    <td className="px-4 py-1 border-0 align-middle text-end" style={{ border: "none" }}>
                                      <input
                                        className="form-control form-control-sm text-end fw-bold text-dark"
                                        type="number"
                                        value={row.net}
                                        disabled={readOnly}
                                        onChange={(e) => handleHotelPaxPriceChange(planArrInd, scheduleInd, row.key, e.target.value)}
                                        style={{ border: "1px solid transparent", backgroundColor: "transparent", borderRadius: "4px", width: "100%", fontSize: "12px" }}
                                        onFocus={(e) => { e.target.style.border = "1px solid #0d6efd"; e.target.style.backgroundColor = "#fff"; }}
                                        onBlur={(e) => { e.target.style.border = "1px solid transparent"; e.target.style.backgroundColor = "transparent"; handleBlur(e); }}
                                      />
                                    </td>
                                    <td className="px-4 py-2 border-0 align-middle text-end" style={{ border: "none" }}>
                                      <span className="text-dark fw-bold" style={{ fontSize: "12px" }}>
                                        {row.gross}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── Executive Summary Table ── */}
              <div className="card border-0 mb-5 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <div className="card-header bg-white py-3 border-bottom">
                  <h6 className="mb-0 text-dark fw-bold" style={{ fontSize: "15px" }}>
                    <i className="fa fa-list-ul me-2 text-primary"></i> Executive Summary
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead style={{ backgroundColor: "#f8faff" }}>
                      <tr>
                        <th className="ps-4 py-3" style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 600, width: "25%" }}>Category</th>
                        <th className="py-3" style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Description</th>
                        <th className="pe-4 py-3 text-end" style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 600, width: "20%" }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Hotels Section */}
                      {[
                        { label: 'Main Room Rate', value: categoryTotals.hotelRoom, type: 'Hotels' },
                        { label: 'Adult Extra Bed', value: categoryTotals.hotelExtra, type: 'Hotels' },
                        { label: 'Child With Bed', value: categoryTotals.hotelChildW, type: 'Hotels' },
                        { label: 'Child Without Bed', value: categoryTotals.hotelChildN, type: 'Hotels' },
                      ].filter(row => row.value > 0).map((row, idx, arr) => (
                        <tr key={`hotel-${idx}`} style={{ borderBottom: idx === arr.length - 1 ? "2px solid #f1f5f9" : "1px solid #f1f5f9" }}>
                          {idx === 0 && (
                            <td rowSpan={arr.length} className="ps-4 align-middle fw-bold text-primary" style={{ backgroundColor: "#fcfdff" }}>
                              <i className="fa fa-hotel me-2"></i> Hotels
                            </td>
                          )}
                          <td className="text-dark fw-medium" style={{ fontSize: "13px" }}>{row.label}</td>
                          <td className="pe-4 text-end text-dark fw-bold" style={{ fontSize: "14px" }}>
                            {activeSymbol} {convert(row.value)}
                          </td>
                        </tr>
                      ))}

                      {/* Activities Section */}
                      {[
                        { label: 'Adult Activities', value: categoryTotals.activityAdult },
                        { label: 'Child Activities', value: categoryTotals.activityChild },
                      ].filter(row => row.value > 0).map((row, idx, arr) => (
                        <tr key={`act-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {idx === 0 && (
                            <td rowSpan={arr.length} className="ps-4 align-middle fw-bold" style={{ color: "#D97706", backgroundColor: "#fffcf5" }}>
                              <i className="fa fa-ticket me-2"></i> Activities
                            </td>
                          )}
                          <td className="text-dark fw-medium" style={{ fontSize: "13px" }}>{row.label}</td>
                          <td className="pe-4 text-end text-dark fw-bold" style={{ fontSize: "14px" }}>
                            {activeSymbol} {convert(row.value)}
                          </td>
                        </tr>
                      ))}

                      {/* Transfers Section */}
                      {[
                        { label: 'Adult Transfers', value: categoryTotals.carAdult },
                        { label: 'Child Transfers', value: categoryTotals.carChild },
                      ].filter(row => row.value > 0).map((row, idx, arr) => (
                        <tr key={`car-${idx}`}>
                          {idx === 0 && (
                            <td rowSpan={arr.length} className="ps-4 align-middle fw-bold" style={{ color: "#16A34A", backgroundColor: "#f6fff9" }}>
                              <i className="fa fa-car me-2"></i> Transfers
                            </td>
                          )}
                          <td className="text-dark fw-medium" style={{ fontSize: "13px" }}>{row.label}</td>
                          <td className="pe-4 text-end text-dark fw-bold" style={{ fontSize: "14px" }}>
                            {activeSymbol} {convert(row.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          );
        })()}

        {/* ── Pricing Mode & Extra Markup Bar ── */}
        <div className="card border-0 mb-5" style={{ backgroundColor: "#f8faff", border: "0.5px solid #e2e8f0", borderRadius: "12px" }}>
          <div className="card-body p-3 px-4 d-flex justify-content-between align-items-center flex-wrap">

            {/* Mode & Tax Toggles */}
            <div className="d-flex align-items-center gap-4">
              <div>
                <span className="text-dark d-block mb-1" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#64748b" }}>Calculation Mode</span>
                <div style={{ width: "200px" }}>
                  <ReactSelect
                    options={priceOption}
                    value={values.priceOption}
                    onChange={(selected) => {
                      setFieldValue("priceOption", selected);
                      handlePriceMode(selected.value);
                    }}
                    isDisabled={readOnly}
                    optionValue="id"
                    optionLabel="name"
                    formik={formik}
                    onBlur={handleBlur}
                    required
                  />
                </div>
              </div>

              <div className="border-start ps-4">
                <span className="text-dark d-block mb-1" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#64748b" }}>Tax Type</span>
                <div style={{ width: "160px" }}>
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
            </div>

            {/* Markup Info & Edit */}
            <div className="d-flex align-items-center gap-4 mt-3 mt-md-0">
              <div className="text-end" style={{ backgroundColor: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "8px 16px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#64748b" }}>Base Markup</span>
                <span className="text-dark" style={{ fontWeight: 600, fontSize: "15px" }}>{values.baseMarkup}%</span>
              </div>
              <div className="text-end" style={{ backgroundColor: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "8px 16px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#64748b" }}>Extra Markup</span>
                <span className="text-dark" style={{ fontWeight: 600, fontSize: "15px" }}>{getSymbol(baseCode)} {values.extraMarkup || 0}</span>
              </div>
              <button
                type="button"
                className="btn ms-3 d-flex justify-content-center align-items-center"
                onClick={() => setShowMarkup(true)}
                disabled={readOnly}
                style={{ borderRadius: "8px", width: "40px", height: "40px", border: "0.5px solid #e2e8f0", backgroundColor: "#fff" }}
                title="Edit Markup"
              >
                <i className="fa fa-pencil fa-lg" style={{ color: "#64748b" }}></i>
              </button>
            </div>

          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            REDESIGNED PRICING TABLE
            Header : Options | Person | Markup | VAT | Total
            Each option row is split into 4 person-type sub-rows
        ════════════════════════════════════════════════════ */}
        <div className="card border-0 mb-4 mt-5" style={{ border: "0.5px solid #e2e8f0", borderRadius: "12px" }}>
          <div className="card-header bg-white border-0 py-3" style={{ borderBottom: "0.5px solid #e2e8f0" }}>
            <h5 className="card-title mb-0 text-dark" style={{ fontSize: "15px", fontWeight: 600 }}>Quoted Options Breakdown</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive" id="pricing_table_wrapper">
              <table className="table mb-0 text-dark" style={{ borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f8faff", borderBottom: "2px solid #e2e8f0" }}>
                  <tr>
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "120px" }}>Options</th>
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b" }}>Person</th>
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b" }}>Markup</th>
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b" }}>{values.taxType?.name || "Tax"} (%)</th>
                    <th className="py-3 px-4 text-dark text-end" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b" }}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleOptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-5">
                        <div className="mb-2"><i className="fa fa-info-circle fa-2x"></i></div>
                        <div>No valid hotel options or room counts found. Please check your itinerary setup.</div>
                      </td>
                    </tr>
                  ) : (
                    visibleOptions.map((item, optIdx) => {
                      const personRows = getPersonTypeRows(item);
                      const exchangeRate = parseFloat(values.priceIn?.exchange_rate) || 0;
                      const hasConversion = exchangeRate > 0;
                      const currSymbol = values.priceIn?.symbol || getSymbol(values.priceIn?.to_currency || values.priceIn?.label || baseCode);
                      const convert = (val) => hasConversion ? getRoundOfValue(val / exchangeRate) : val;

                      const grandTotal = convert(calculateTrueTotal(item.trueBaseAmount, item.markup));

                      return (
                        <React.Fragment key={optIdx}>
                          {personRows.map((pt, ptIdx) => (
                            <tr
                              key={`${optIdx}-${ptIdx}`}
                              style={{
                                backgroundColor: ptIdx % 2 === 0 ? "#fff" : "#f8faff",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              {/* Option label — merged cell spanning person rows + grand total row */}
                              {ptIdx === 0 && (
                                <td
                                  rowSpan={personRows.length + 1}
                                  className="align-middle text-center"
                                  style={{
                                    verticalAlign: "middle",
                                    borderRight: "0.5px solid #e2e8f0",
                                    backgroundColor: "#f8faff",
                                  }}
                                >
                                  <span
                                    className="badge px-3 py-2"
                                    style={{ fontSize: "12px", backgroundColor: "#EEF4FF", color: "#185FA5", padding: "4px 12px", borderRadius: "999px", fontWeight: 500 }}
                                  >
                                    {item.name}
                                  </span>
                                </td>
                              )}

                              {/* Person type label */}
                              <td style={{ paddingLeft: "16px", color: "#333", borderRight: '0.5px solid #e2e8f0', fontWeight: 500 }}>
                                <span>{pt.label}</span>
                              </td>

                              {/* Markup */}
                              <td style={{ borderRight: '0.5px solid #e2e8f0' }}>{currSymbol} {convert(pt.markup)}</td>

                              {/* VAT */}
                              <td style={{ borderRight: '0.5px solid #e2e8f0' }}>{pt.vat} %</td>

                              {/* Total (aggregate for all pax of this type) */}
                              <td className="text-dark" style={{ fontWeight: 600 }}>{currSymbol} {convert(pt.total)}</td>
                            </tr>
                          ))}

                          {/* Grand Total row */}
                          <tr
                            style={{
                              backgroundColor: "#f0f7ff",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            <td
                              colSpan={3}
                              className="text-end pe-3"
                              style={{ color: "#185FA5", fontSize: "14px", fontWeight: 600 }}
                            >
                              Grand Total:
                            </td>
                            <td style={{ color: "#185FA5", fontSize: "15px", fontWeight: 600 }}>
                              {currSymbol} {grandTotal}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Summary / billing controls ── */}
        <div className="mt-5">
          <div className="card border-0 w-100" style={{ backgroundColor: "#fff" }}>
            <div className="card-body p-4 p-md-5">
              <div className="row">

                {/* ── Left Column: Settings ── */}
                <div className="col-lg-5 col-xl-4 border-end pe-lg-4 mb-4 mb-lg-0">
                  <h5 className="card-title mb-4 text-dark pb-2" style={{ fontSize: "15px", fontWeight: 600 }}>Billing Settings</h5>

                  {/* Price In */}
                  <div className="mb-4">
                    <label className="text-secondary mb-2 d-block" style={{ fontSize: "14px", fontWeight: 500, color: "#64748b" }}>Display Price In Currency</label>
                    <ReactSelect
                      options={currencyOptions}
                      value={values.priceIn}
                      onChange={(selected) => setFieldValue("priceIn", selected)}
                      optionValue="value"
                      optionLabel="label"
                      formik={formik}
                      onBlur={handleBlur}
                      isDisabled={readOnly}
                    />
                  </div>

                  {/* Discount % */}
                  <div>
                    <label className="text-secondary mb-2 d-block" style={{ fontSize: "14px", fontWeight: 500, color: "#64748b" }}>Apply Discount (%)</label>
                    <div className="input-group mb-3" style={{ border: "0.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <input
                        type="number"
                        className="form-control text-primary"
                        name="discount"
                        onChange={handleChange}
                        disabled={readOnly}
                        onBlur={handleBlur}
                        value={values.discount || ""}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        style={{ height: "42px", backgroundColor: "#fff", border: "none", fontWeight: 600 }}
                      />
                      <span className="input-group-text" style={{ backgroundColor: "#f8faff", border: "none", color: "#64748b", fontWeight: 500 }}>%</span>
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Summary & Actions ── */}
                <div className="col-lg-7 col-xl-8 ps-lg-5">
                  <h5 className="card-title mb-4 text-dark pb-2" style={{ fontSize: "15px", fontWeight: 600 }}>Converted Output</h5>

                  {/* Converted totals (only shown when exchange rate exists) */}
                  {values.priceIn?.exchange_rate ? (
                    <div className="mb-4">

                      <div className="card border-0 rounded-3 overflow-hidden" style={{ border: "0.5px solid #e2e8f0", borderRadius: "12px" }}>
                        <div className="card-body p-0 bg-white">
                          {hotelOption.map((item, ind) => {
                            if (item.amount === 0) return null;
                            const total = calculateTotal(item.amount, item.markup);
                            const rate = parseFloat(values.priceIn.exchange_rate) || 1;
                            const convertedTotal = getRoundOfValue(total / rate);
                            const toCurrency =
                              values.priceIn.to_currency ||
                              values.priceIn.code ||
                              values.priceIn.value;
                            const isLast = ind === hotelOption.length - 1 || hotelOption.slice(ind + 1).every(h => h.amount === 0);

                            return (
                              <div key={ind} className={`p-4 ${isLast ? '' : 'border-bottom'}`} style={{ borderBottom: isLast ? "none" : "0.5px solid #e2e8f0" }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="text-dark text-truncate pe-3" style={{ fontSize: "15px", maxWidth: "60%", fontWeight: 600 }}>{item.name}</span>
                                  <h4 className="mb-0" style={{ color: "#185FA5", fontWeight: 600, fontSize: "18px" }}>
                                    {values.priceIn?.symbol || getSymbol(values.priceIn?.to_currency || values.priceIn?.label || baseCode)} {convertedTotal}
                                  </h4>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                  <span className="text-secondary" style={{ fontSize: "13px" }}>Final Option Total</span>
                                  <span className="text-muted" style={{ fontSize: "12px", fontWeight: 500 }}>
                                    Rate: 1 {toCurrency} = {rate} {baseCode}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 rounded text-center text-muted" style={{ backgroundColor: "#f8f9fa", border: "1px dashed #ced4da" }}>
                      <i className="fa fa-info-circle mb-2" style={{ fontSize: "20px" }}></i>
                      <p className="mb-0">Selected currency is base currency. See amounts in the table above.</p>
                    </div>
                  )}

                  {/* Update Billing button */}
                  <div className="d-flex justify-content-end mt-auto pt-3">
                    <button
                      type="button"
                      className="btn w-100"
                      onClick={handleBilling}
                      disabled={readOnly}
                      style={{ backgroundColor: "#185FA5", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 500, color: "#fff" }}
                    >
                      <i className="fa fa-refresh me-2"></i> Update Billing
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── Markup modal ── */}
      <CustomModal
        showModal={showMarkup}
        title="Add Extra Markup"
        handleModalClose={() => setShowMarkup(false)}
      >
        <div className="card-body">
          <div className="basic-form">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="mb-3 col-md-12">
                  <InputField
                    label="Base Markup %"
                    name="baseMarkupInput"
                    type="number"
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("extraMarkupInput", 0);
                    }}
                    onBlur={handleBlur}
                    values={values}
                    inputClassName="w-25"
                  />
                </div>
                <div className="mb-3 col-md-12">
                  <InputField
                    label="Extra Markup"
                    name="extraMarkupInput"
                    type="number"
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("baseMarkupInput", 0);
                    }}
                    onBlur={handleBlur}
                    values={values}
                    inputClassName="w-25"
                  />
                </div>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleMarkup}>
                Update
              </button>
            </form>
          </div>
        </div>
      </CustomModal>

      {/* ── History Modal ── */}
      <CustomModal
        showModal={showHistory}
        title="Pricing History"
        handleModalClose={() => setShowHistory(false)}
        className="modal-lg"
      >
        <div className="card-body p-4" style={{ backgroundColor: "#f8f9fa", position: "relative" }}>
          {loadingHistory ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted fw-medium">Loading history...</div>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div className="mb-3">
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e9ecef", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <i className="fa fa-history fa-2x text-secondary"></i>
                </div>
              </div>
              <h5 className="fw-bold text-dark">No history available</h5>
              <p>Save the itinerary pricing at least once to see history.</p>
            </div>
          ) : (
            <div className="timeline-container position-relative" style={{ maxHeight: "65vh", overflowY: "auto", padding: "10px 10px 10px 30px" }}>
              {/* Vertical Timeline Line */}
              <div style={{ position: "absolute", left: "15px", top: "25px", bottom: "25px", width: "3px", backgroundColor: "#dde1e6", borderRadius: "3px" }}></div>

              {historyData.map((snapshot, idx) => {
                const isCurrent = idx === 0;
                let snapData = {};
                try {
                  snapData = typeof snapshot.snapshot_data === "string" ? JSON.parse(snapshot.snapshot_data) : (snapshot.snapshot_data || {});
                } catch (e) { console.error("Could not parse snapshot data"); }
                const itinData = snapData?.itinerary || {};
                const totalTax = (Number(itinData.cgst_percentage) || 0) + (Number(itinData.sgst_percentage) || 0) + (Number(itinData.igst_percentage) || 0);

                let snapCurrencySymbol = getSymbol(baseCode);
                let snapExchangeRate = 1;
                if (snapshot.currency && snapshot.currency !== 'base' && snapshot.currency !== baseCode) {
                  const matchedCur = currencyOptions.find(c => c.value === snapshot.currency);
                  if (matchedCur) {
                    snapCurrencySymbol = getSymbol(matchedCur.to_currency || matchedCur.code);
                  } else if (snapshot.currency.length < 10) {
                    snapCurrencySymbol = getSymbol(snapshot.currency);
                  } else {
                    snapCurrencySymbol = ""; // Mask raw database UUIDs
                  }
                  snapExchangeRate = parseFloat(snapshot.exchange_rate || snapData.exchange_rate || itinData.exchange_rate) || 1;
                }
                const snapConvert = (val) => snapExchangeRate > 0 ? getRoundOfValue((val || 0) / snapExchangeRate) : val;
                const convertedGrandTotal = snapConvert(snapshot.grand_total);


                return (
                  <div key={snapshot.id} className="position-relative mb-4">
                    {/* Timeline Dot */}
                    <div
                      className="position-absolute shadow-sm"
                      style={{
                        left: "-21px", top: "20px", width: "16px", height: "16px",
                        borderRadius: "50%",
                        backgroundColor: isCurrent ? "#28a745" : "#0d6efd",
                        border: "3px solid #fff", zIndex: 2
                      }}
                    ></div>

                    {/* Premium Card */}
                    <div
                      className={`card shadow-sm border-0 rounded-4 ${isCurrent ? "border-start border-success" : ""}`}
                      style={{ transition: "transform 0.2s, box-shadow 0.2s", cursor: "default", borderLeftWidth: isCurrent ? "4px" : "0" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-0">
                          <div className="mb-3 mb-md-0">
                            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: "15px" }}>
                              <i className="fa fa-calendar-alt text-primary me-2 opacity-75"></i>
                              {new Date(snapshot.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </h6>
                            <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                              <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill" style={{ fontSize: "12px", letterSpacing: "0.2px" }}>
                                <i className="fa fa-user me-2 text-primary opacity-75"></i> {snapshot.created_by || "System"}
                              </span>
                              {isCurrent && (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "12px" }}>
                                  <i className="fa fa-check-circle me-1"></i> Active Version
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-md-end text-start mt-2 mt-md-0">
                            <span className="text-muted d-block fw-bold" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Total Overview</span>
                            <h3 className="fw-bolder text-dark mb-0 mt-1" style={{ letterSpacing: "-0.5px" }}>
                              <span className="text-primary me-1">{snapCurrencySymbol}</span>{convertedGrandTotal}
                            </h3>
                          </div>
                        </div>

                        {/* Snapshot Detail Grid */}
                        <div className="bg-light bg-opacity-50 rounded-4 p-3 mt-4 border border-light">
                          <div className="row g-3">
                            <div className="col-6 col-md-3">
                              <div className="text-muted fw-bold mb-1" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pricing Mode</div>
                              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                                {itinData.price_mode === 'PER_PERSON' ? (
                                  <><i className="fa fa-user me-1 text-info opacity-75"></i> Per Person</>
                                ) : (
                                  <><i className="fa fa-users me-1 text-warning opacity-75"></i> Total Run</>
                                )}
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="text-muted fw-bold mb-1" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Margin Config</div>
                              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>{itinData.extra_markup_percentage || 0}% <span className="text-muted fw-normal">applied</span></div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="text-muted fw-bold mb-1" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Discount</div>
                              <div className="fw-bold text-danger" style={{ fontSize: "13px" }}>
                                - {snapCurrencySymbol} {snapConvert(itinData.discount_amount || 0)}
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="text-muted fw-bold mb-1" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Taxes</div>
                              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                                {totalTax}% <span className="text-muted fw-normal">Added</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Area */}
                        {!isCurrent && (
                          <div className="mt-4 text-end border-top pt-3">
                            <button
                              className="btn btn-outline-info fw-bold rounded-pill mx-1 px-4 py-2 text-uppercase"
                              onClick={() => setPreviewSnapshot(snapshot)}
                              style={{ fontSize: "12px", transition: "all 0.2s", letterSpacing: "0.5px", borderWidth: "2px" }}
                              onMouseEnter={(e) => { e.currentTarget.className = "btn btn-info text-dark fw-bold rounded-pill mx-1 px-4 py-2 text-uppercase"; }}
                              onMouseLeave={(e) => { e.currentTarget.className = "btn btn-outline-info fw-bold rounded-pill mx-1 px-4 py-2 text-uppercase"; }}
                            >
                              <i className="fa fa-eye me-2"></i> View
                            </button>
                            <button
                              className="btn btn-outline-primary fw-bold rounded-pill mx-1 px-4 py-2 text-uppercase"
                              onClick={() => handleRestore(snapshot.id)}
                              style={{ fontSize: "12px", transition: "all 0.2s", letterSpacing: "0.5px", borderWidth: "2px" }}
                              onMouseEnter={(e) => { e.currentTarget.className = "btn btn-primary text-white fw-bold rounded-pill mx-1 px-4 py-2 text-uppercase"; }}
                              onMouseLeave={(e) => { e.currentTarget.className = "btn btn-outline-primary fw-bold rounded-pill mx-1 px-4 py-2 text-uppercase"; }}
                            >
                              <i className="fa fa-history me-2"></i> Restore Version
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CustomModal>

      {/* ── Preview Modal ── */}
      <CustomModal
        showModal={!!previewSnapshot}
        title="Snapshot Items Breakdown"
        handleModalClose={() => setPreviewSnapshot(null)}
        className="modal-lg"
      >
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <table className="table mb-0 text-dark">
              <thead className="bg-light sticky-top">
                <tr>
                  <th className="py-3 px-4 fw-bold text-uppercase" style={{ fontSize: "12px" }}>Activity / Hotel</th>
                  <th className="py-3 px-4 fw-bold text-uppercase text-end" style={{ fontSize: "12px" }}>Net Price</th>
                  <th className="py-3 px-4 fw-bold text-uppercase text-end" style={{ fontSize: "12px" }}>Markup</th>
                  <th className="py-3 px-4 fw-bold text-uppercase text-end" style={{ fontSize: "12px" }}>Gross Price</th>
                </tr>
              </thead>
              <tbody>
                {previewSnapshot && scheduleArr.map(({ item }, ind) => {
                  let snapData = {};
                  try { snapData = typeof previewSnapshot.snapshot_data === "string" ? JSON.parse(previewSnapshot.snapshot_data) : (previewSnapshot.snapshot_data || {}); } catch (e) { }

                  const snapEntries = snapData.entries || [];
                  const snapEntry = snapEntries.find(e => e.id === item.entryId) || { amount: 0, markup: 0 };
                  const net = Number(snapEntry.amount) || 0;
                  const markup = Number(snapEntry.markup) || 0;

                  let snapCurrencySymbol = getSymbol(baseCode);
                  let snapExchangeRate = 1;
                  if (previewSnapshot.currency && previewSnapshot.currency !== 'base' && previewSnapshot.currency !== baseCode) {
                    const matchedCur = currencyOptions.find(c => c.value === previewSnapshot.currency);
                    if (matchedCur) snapCurrencySymbol = getSymbol(matchedCur.to_currency || matchedCur.code);
                    else if (previewSnapshot.currency.length < 10) snapCurrencySymbol = getSymbol(previewSnapshot.currency);
                    else snapCurrencySymbol = "";
                    snapExchangeRate = parseFloat(previewSnapshot.exchange_rate || snapData.exchange_rate || snapData.itinerary?.exchange_rate) || 1;
                  }
                  const snapConvert = (val) => snapExchangeRate > 0 ? getRoundOfValue((val || 0) / snapExchangeRate) : val;

                  return (
                    <tr key={ind} className="border-bottom" style={{ transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fcfdff'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="px-4 py-3 align-middle">
                        <div className="fw-bold fs-14 text-dark">{item.name}</div>
                        <div className="text-muted text-capitalize mt-1" style={{ fontSize: "11px", letterSpacing: "0.2px" }}>{item.insertType}</div>
                      </td>
                      <td className="px-4 py-3 align-middle text-end fw-medium">{snapCurrencySymbol} {snapConvert(net)}</td>
                      <td className="px-4 py-3 align-middle text-end fw-medium">{snapCurrencySymbol} {snapConvert(markup)}</td>
                      <td className="px-4 py-3 align-middle text-end fw-bold text-dark fs-15">{snapCurrencySymbol} {snapConvert(net + markup)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-end bg-light border-top">
            <button className="btn btn-outline-secondary rounded-pill fw-bold px-4 py-2 me-3" onClick={() => setPreviewSnapshot(null)} style={{ fontSize: "13px" }}>Close Preview</button>
            {previewSnapshot && historyData[0] && previewSnapshot.id !== historyData[0].id && (
              <button className="btn btn-danger rounded-pill fw-bold shadow-sm px-4 py-2" onClick={() => { handleRestore(previewSnapshot.id); setPreviewSnapshot(null); }} style={{ fontSize: "13px" }}>
                <i className="fa fa-history me-2"></i> Restore This Version
              </button>
            )}
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default PaymentForm;