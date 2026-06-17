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
import { URLS } from "../../../../constants";
import { useAsync } from "../../../utilis/useAsync";
import { checkFormValue } from "../../../utilis/check";
import { filePost } from "../../../../services/AxiosInstance";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { ModeBtn } from "../../common/ModeBtn";
import { useSelector } from "react-redux";

// ─── Person type definitions ─────────────────────────────────────────────────
const PERSON_TYPES = [
  { key: "single", label: "Person (Single Sharing)" },
  { key: "double", label: "Person (Double Sharing)" },
  { key: "triple", label: "Person (Triple Sharing)" },
  { key: "quad", label: "Person (Quad Sharing)" },
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
  const [customMarkups, setCustomMarkups] = useState({});
  const [customMarkupsLoaded, setCustomMarkupsLoaded] = useState(false);

  useEffect(() => {
    if (values.quoted_options && Array.isArray(values.quoted_options) && !customMarkupsLoaded) {
      const isBase = values.priceIn?.value === 'base' || values.priceIn?.value === values.baseCurrency || values.priceIn?.label === values.baseCurrency;
      if (!isBase && values.priceIn && values.priceIn.exchange_rate === undefined) {
        return; // Wait for currency matching to resolve the exchange rate
      }

      const loadedMarkups = {};
      const isPERMode = values.priceOption?.value === "PER" || values.priceOption === "PER";

      values.quoted_options.forEach((opt, optIdx) => {
        const rateToUse = parseFloat(values.exchange_rate) || parseFloat(values.priceIn?.exchange_rate) || 1;
        if (isPERMode) {
          opt.rows?.forEach(r => {
            const pCount = r.count > 0 ? r.count : 1;
            loadedMarkups[`${optIdx}_${r.key}`] = { value: Math.round(r.markup / pCount), rate: rateToUse };
          });
        } else {
          const totalMarkup = opt.rows?.reduce((sum, r) => sum + r.markup, 0) || 0;
          loadedMarkups[`${optIdx}_total`] = { value: Math.round(totalMarkup), rate: rateToUse };
        }
      });

      if (Object.keys(loadedMarkups).length > 0) {
        setCustomMarkups(loadedMarkups);
      }
      setCustomMarkupsLoaded(true);
    }
  }, [values.quoted_options, customMarkupsLoaded, values.priceOption]);
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
    if (values.priceIn) {
      const matchedOption = currencyOptions.find(
        (opt) =>
          String(opt.value) === String(values.priceIn.value) ||
          opt.label === values.priceIn.label ||
          opt.to_currency === values.priceIn.label ||
          opt.label === values.priceIn.value
      );
      if (
        matchedOption &&
        (matchedOption.label !== values.priceIn.label ||
          matchedOption.exchange_rate !== values.priceIn.exchange_rate ||
          matchedOption.value !== values.priceIn.value)
      ) {
        setFieldValue("priceIn", matchedOption);
      }
    }
  }, [currencyOptions.length, values.priceIn?.value, values.priceIn?.label, values.priceIn?.exchange_rate]);

  // ─── Fix: convert amounts when PER mode is active and baseAmount is missing ──────────
  useEffect(() => {
    const hasScheduleItems = values.planArr?.some(p => p.schedule?.length > 0);
    if (!hasScheduleItems) return;

    // Only act when mode is PER and items are missing baseAmount (= freshly loaded from DB)
    if (values.priceOption?.value === 'PER') {
      const needsConversion = values.planArr.some(p =>
        p.schedule.some(s => s.baseAmount === undefined)
      );
      if (needsConversion) {
        const newData = values.planArr.map(item => ({
          ...item,
          schedule: item.schedule.map(scheduleItem => {
            if (scheduleItem.baseAmount !== undefined) return scheduleItem;

            const shouldDivide = scheduleItem.insertType !== 'hotel';
            const isTransferItem = scheduleItem.insertType === 'transfer' || scheduleItem.insertType === 'car';
            const person = scheduleItem.insertType === 'activity'
              ? ((Number(scheduleItem.adult || 0) + Number(scheduleItem.child || 0)) || 1)
              : isTransferItem
                ? ((values.adult || 0) || 1)
                : ((values.adult || 0) + (values.child || 0)) || 1;

            return {
              ...scheduleItem,
              baseAmount: scheduleItem.amount,
              baseMarkup: scheduleItem.markup || 0,
              amount: shouldDivide ? getRoundOfValue(scheduleItem.amount / person) : scheduleItem.amount,
              markup: shouldDivide ? getRoundOfValue((scheduleItem.markup || 0) / person) : (scheduleItem.markup || 0),
            };
          }),
        }));
        setFieldValue('planArr', newData);
      }
    } else {
      // TOTAL mode — just stamp baseAmount so toggles work correctly
      const needsBase = values.planArr.some(p =>
        p.schedule.some(s => s.baseAmount === undefined)
      );
      if (needsBase) {
        const newData = values.planArr.map(item => ({
          ...item,
          schedule: item.schedule.map(scheduleItem => ({
            ...scheduleItem,
            baseAmount: scheduleItem.baseAmount ?? scheduleItem.amount,
            baseMarkup: scheduleItem.baseMarkup ?? (scheduleItem.markup || 0),
          })),
        }));
        setFieldValue('planArr', newData);
      }
    }
  }, [values.planArr, values.priceOption?.value]);

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
              const person =
                scheduleItem.insertType === "activity"
                  ? (Number(scheduleItem.adult || 0) + Number(scheduleItem.child || 0)) || 1
                  : values.adult + values.child;

              if (type === "amount") {
                result.baseAmount =
                  values.priceOption.value === "TOTAL"
                    ? inputValue
                    : inputValue * person;

                // For transfers: sync cost values with amount
                if (scheduleItem.insertType === "transfer" || scheduleItem.insertType === "car") {
                  const adultCount = Number(values.adult || 0);
                  const childCount = Number(values.child || 0);
                  const totalCount = adultCount + childCount;

                  if (scheduleItem.type?.value?.toUpperCase() === "SIC" || scheduleItem.adultCost) {
                    // SIC transfer: split amount proportionally between adults and children
                    if (totalCount > 0) {
                      const adultPortion = (inputValue * adultCount) / totalCount;
                      const childPortion = (inputValue * childCount) / totalCount;
                      result.adultCost = getRoundOfValue(adultPortion);
                      result.childCost = getRoundOfValue(childPortion);
                    }
                  } else {
                    // PRIVATE transfer: cost is the total amount
                    result.cost = getRoundOfValue(inputValue);
                  }
                }
              } else if (type === "markup") {
                result.baseMarkup =
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

    const divisors = { single: 1, double: 2, triple: 3, quad: 4, extra: 1, childW: 1, childN: 1 };
    const divisor = divisors[occupancyKey] || 1;
    const newBaseRate = basePaxValue;

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
                quad: Number(selectedRoom?.quad_bed_amount || 0),
                twoB: Number(selectedRoom?.two_bedroom_amount || 0),
                threeB: Number(selectedRoom?.three_bedroom_amount || 0),
                fourB: Number(selectedRoom?.four_bedroom_amount || 0),
                extra: Number(selectedRoom?.extra_bed_amount || 0),
                childW: Number(selectedRoom?.child_w_bed_amount || 0),
                childN: Number(selectedRoom?.child_n_bed_amount || 0),
              };
              const counts = {
                single: safeCount(scheduleItem.single),
                double: safeCount(scheduleItem.double),
                triple: safeCount(scheduleItem.triple),
                quad: safeCount(scheduleItem.quad),
                twoB: safeCount(scheduleItem.two_bedroom),
                threeB: safeCount(scheduleItem.three_bedroom),
                fourB: safeCount(scheduleItem.four_bedroom),
                extra: safeCount(scheduleItem.extra),
                childW: safeCount(scheduleItem.childW),
                childN: safeCount(scheduleItem.childN),
              };

              const newTotalWeight = (counts.single * rates.single * 1) + (counts.double * rates.double * 2) + (counts.triple * rates.triple * 3) + (counts.quad * rates.quad * 4) + (counts.twoB * rates.twoB * 4) + (counts.threeB * rates.threeB * 6) + (counts.fourB * rates.fourB * 8) + (counts.extra * rates.extra * 1) + (counts.childW * rates.childW * 1) + (counts.childN * rates.childN * 1);

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
          let person = (values.adult || 0) + (values.child || 0);

          if (scheduleItem.insertType === "activity") {
            person = (Number(scheduleItem.adult || 0) + Number(scheduleItem.child || 0)) || person;
          } else if (scheduleItem.insertType === "transfer" || scheduleItem.insertType === "car") {
            person = includeChildTransfer ? ((values.adult || 0) + (values.child || 0)) || 1 : (values.adult || 0) || 1;
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

  const hasHotelInSchedule = scheduleArr.some(s => s.item.insertType === "hotel");

  const totals = scheduleArr.reduce(
    (acc, { item }) => {
      if (item.insertType !== "hotel") {
        const person = (item.insertType === "activity")
          ? ((Number(item.adult || 0) + Number(item.child || 0)) || 1)
          : (item.insertType === "transfer" || item.insertType === "car")
            ? (includeChildTransfer ? ((values.adult || 0) + (values.child || 0)) : (values.adult || 0)) || 1
            : (((values.adult || 0) + (values.child || 0)) || 1);

        const trueBase = item.baseAmount !== undefined ? item.baseAmount : (values.priceOption.value === "PER" ? item.amount * person : item.amount);
        const trueMarkup = item.baseMarkup !== undefined ? item.baseMarkup : (values.priceOption.value === "PER" ? item.markup * person : item.markup);

        acc.totalAmount += item.amount;
        acc.trueTotalAmount = (acc.trueTotalAmount || 0) + trueBase;
        acc.totalMarkup = (acc.totalMarkup || 0) + trueMarkup;
      }
      return acc;
    },
    { totalAmount: 0, trueTotalAmount: 0, totalMarkup: 0 }
  );

  const getPerPersonCost = (item) => {
    // For transfers and activities: use explicit cost values if available
    if ((item.adultCost !== undefined && item.adultCost !== null) || (item.childCost !== undefined && item.childCost !== null)) {
      return {
        adultCost: item.adultCost ?? 0,
        childCost: item.childCost ?? 0
      };
    }

    const adultCount = (item.insertType === "activity" ? Number(item.adult) : Number(values.adult)) || 0;
    const childCount = (item.insertType === "activity" ? Number(item.child) : Number(values.child)) || 0;
    const isTransferType = item.insertType === "transfer" || item.insertType === "car";

    console.log('TRANSFER:', item.name, {
      insertType: item.insertType,
      isTransferType,
      amount: item.amount,
      baseAmount: item.baseAmount,
      valuesAdult: values.adult,
      valuesChild: values.child,
      adultCount,
      childCount,
      includeChildTransfer,
      effectiveDivisorWouldBe: isTransferType
        ? (includeChildTransfer ? (adultCount + childCount) : adultCount)
        : (adultCount + childCount),
    });
    const totalPersons = adultCount + childCount;

    if (totalPersons > 0 && item.amount) {
      const cpp = item.amount / totalPersons;
      return {
        adultCost: getRoundOfValue(cpp * adultCount),
        childCost: getRoundOfValue(cpp * childCount),
      };
    }
    return { adultCost: 0, childCost: 0 };
  };

  const createOptionInitialValue = () => [
    { name: "Option 1", amount: 0, markup: 0, adultCost: 0, childCost: 0, single: 0, double: 0, triple: 0, quad: 0, extra: 0, childW: 0, childN: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, quadTotalCost: 0, extraTotalCost: 0, childWTotalCost: 0, childNTotalCost: 0 },
    { name: "Option 2", amount: 0, markup: 0, adultCost: 0, childCost: 0, single: 0, double: 0, triple: 0, quad: 0, extra: 0, childW: 0, childN: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, quadTotalCost: 0, extraTotalCost: 0, childWTotalCost: 0, childNTotalCost: 0 },
    { name: "Option 3", amount: 0, markup: 0, adultCost: 0, childCost: 0, single: 0, double: 0, triple: 0, quad: 0, extra: 0, childW: 0, childN: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, quadTotalCost: 0, extraTotalCost: 0, childWTotalCost: 0, childNTotalCost: 0 },
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
          quad: Number(selectedRoom?.quad_bed_amount || 0),
          twoB: Number(selectedRoom?.two_bedroom_amount || 0),
          threeB: Number(selectedRoom?.three_bedroom_amount || 0),
          fourB: Number(selectedRoom?.four_bedroom_amount || 0),
          extra: Number(selectedRoom?.extra_bed_amount || 0),
          childW: Number(selectedRoom?.child_w_bed_amount || 0),
          childN: Number(selectedRoom?.child_n_bed_amount || 0),
        };
        const counts = {
          single: safeCount(item.single),
          double: safeCount(item.double),
          triple: safeCount(item.triple),
          quad: safeCount(item.quad),
          twoB: safeCount(item.two_bedroom),
          threeB: safeCount(item.three_bedroom),
          fourB: safeCount(item.four_bedroom),
          extra: safeCount(item.extra),
          childW: safeCount(item.childW),
          childN: safeCount(item.childN),
        };

        const itemTotalWeight = (counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple) + (counts.quad * rates.quad) + (counts.twoB * rates.twoB) + (counts.threeB * rates.threeB) + (counts.fourB * rates.fourB) + (counts.extra * rates.extra) + (counts.childW * rates.childW) + (counts.childN * rates.childN);

        let ratio = 1;
        if (itemTotalWeight > 0) {
          ratio = (Number(item.amount || 0)) / itemTotalWeight;
        } else {
          const totalPax = counts.single + counts.double + counts.triple + counts.quad + counts.extra + counts.childW + counts.childN;
          if (totalPax > 0) {
            const avg = Number(item.amount || 0) / totalPax;
            rates.single = rates.double = rates.triple = rates.quad = rates.extra = rates.childW = rates.childN = avg;
            ratio = 1;
          }
        }

        acc[idx].single += counts.single;
        acc[idx].double += counts.double;
        acc[idx].triple += counts.triple;
        acc[idx].quad += counts.quad;
        acc[idx].extra += counts.extra;
        acc[idx].childW += counts.childW;
        acc[idx].childN += counts.childN;

        acc[idx].singleDisplay = Math.max(acc[idx].singleDisplay || 0, counts.single);
        acc[idx].doubleDisplay = Math.max(acc[idx].doubleDisplay || 0, counts.double);
        acc[idx].tripleDisplay = Math.max(acc[idx].tripleDisplay || 0, counts.triple);
        acc[idx].quadDisplay = Math.max(acc[idx].quadDisplay || 0, counts.quad);
        acc[idx].extraDisplay = Math.max(acc[idx].extraDisplay || 0, counts.extra);
        acc[idx].childWDisplay = Math.max(acc[idx].childWDisplay || 0, counts.childW);
        acc[idx].childNDisplay = Math.max(acc[idx].childNDisplay || 0, counts.childN);

        acc[idx].singleTotalCost += (counts.single * rates.single) * ratio;
        acc[idx].doubleTotalCost += (counts.double * rates.double) * ratio;
        acc[idx].tripleTotalCost += (counts.triple * rates.triple) * ratio;
        acc[idx].quadTotalCost += (counts.quad * rates.quad) * ratio;
        acc[idx].extraTotalCost += (counts.extra * rates.extra) * ratio;
        acc[idx].childWTotalCost += (counts.childW * rates.childW) * ratio;
        acc[idx].childNTotalCost += (counts.childN * rates.childN) * ratio;
      }
    }
    return acc;
  }, createOptionInitialValue());

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
    if (Number(values.baseMarkup) > 0) {
      return getRoundOfValue(
        getHotelOptionTotal(amount, markup) * Number(values.baseMarkup) * 0.01
      );
    }
    if (Number(values.extraMarkup) > 0) {
      return Number(values.extraMarkup);
    }
    return 0;
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
    if (Number(values.baseMarkup) > 0) {
      const optionTotal = trueAmount + markup + (totals.trueTotalAmount || 0) + totals.totalMarkup;
      return getRoundOfValue(optionTotal * Number(values.baseMarkup) * 0.01);
    }
    if (Number(values.extraMarkup) > 0) {
      return Number(values.extraMarkup);
    }
    return 0;
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
  const getPersonTypeRows = (item, shouldIncludeChildTransfer = false, optIdx = 0, markups = {}, exRate = 1) => {
    let activeTypes = PERSON_TYPES.map((pt) => {
      const count = safeCount(item[pt.key]);
      const displayCount = safeCount(item[`${pt.key}Display`]);
      if (count <= 0) return null;
      const hotelRowCostAll = Number(item[`${pt.key}TotalCost`] || 0);
      return { pt, count, displayCount, hotelRowCostAll };
    }).filter(Boolean);

    let baseAdultCount = Number(values.adult) || 1;
    let baseChildCount = Number(values.child) || 0;

    // Discover true maximum participant counts across any activity/transfer if global is 0 or less
    scheduleArr.forEach(({ item: schedItem }) => {
      if (schedItem.insertType !== "hotel") {
        const rawType = (schedItem.insertType || "other").toLowerCase();
        if (rawType === "activity") {
          const actAdult = Number(schedItem.adult) || 0;
          const actChild = Number(schedItem.child) || 0;
          if (actAdult > baseAdultCount) baseAdultCount = actAdult;
          if (actChild > baseChildCount) baseChildCount = actChild;
        }
      }
    });

    const adultCount = baseAdultCount;
    const childCount = baseChildCount;
    const totalTripPersons = adultCount + childCount;

    if (activeTypes.length === 0 && item.name === "Option 1") {
      const hotelAmount = item.amount || 0;
      if (adultCount > 0) activeTypes.push({ pt: { key: "adult", label: "Adult" }, count: adultCount, displayCount: adultCount, hotelRowCostAll: hotelAmount });
      if (childCount > 0) activeTypes.push({ pt: { key: "child", label: "Child" }, count: childCount, displayCount: childCount, hotelRowCostAll: 0 });
    }

    // ── Always split proportionally (same as old code) ──────────────────────
    let adultActivityTransferBase = 0;
    let childActivityTransferBase = 0;
    let adultActivityTransferMarkup = 0;
    let childActivityTransferMarkup = 0;

    scheduleArr.forEach(({ item: schedItem }) => {
      if (schedItem.insertType !== "hotel") {
        const rawType = (schedItem.insertType || 'other').toLowerCase();

        // 1. Recover the true total amount for this item
        let personDivisor = 1;
        const itemAdultCount = (rawType === 'activity' ? Number(schedItem.adult) : adultCount) || 0;
        const itemChildCount = (rawType === 'activity' ? Number(schedItem.child) : childCount) || 0;
        const itemTotalCount = itemAdultCount + itemChildCount;

        if (rawType === 'activity') {
          personDivisor = itemTotalCount || (totalTripPersons || 1);
        } else if (rawType === 'transfer' || rawType === 'car') {
          personDivisor = shouldIncludeChildTransfer ? (totalTripPersons || 1) : (adultCount || 1);
        } else {
          personDivisor = totalTripPersons || 1;
        }

        const isPerMode = values.priceOption?.value === "PER";
        const trueBaseAmount = schedItem.baseAmount !== undefined
          ? Number(schedItem.baseAmount)
          : (isPerMode ? (Number(schedItem.amount || 0) * personDivisor) : Number(schedItem.amount || 0));

        const trueMarkup = schedItem.baseMarkup !== undefined
          ? Number(schedItem.baseMarkup)
          : (isPerMode ? (Number(schedItem.markup || 0) * personDivisor) : Number(schedItem.markup || 0));

        // 2. Split between adult and child buckets
        if (rawType === 'activity') {
          if (schedItem.adultCost && schedItem.childCost && (Number(schedItem.adultCost) + Number(schedItem.childCost)) > 0) {
            const explicitAdultBase = Number(schedItem.adultCost);
            const explicitChildBase = Number(schedItem.childCost);
            const explicitTotal = explicitAdultBase + explicitChildBase;

            const adultMarkup = explicitTotal > 0 ? (trueMarkup * explicitAdultBase / explicitTotal) : 0;
            const childMarkup = explicitTotal > 0 ? (trueMarkup * explicitChildBase / explicitTotal) : 0;

            adultActivityTransferBase += explicitAdultBase;
            childActivityTransferBase += explicitChildBase;
            adultActivityTransferMarkup += adultMarkup;
            childActivityTransferMarkup += childMarkup;
          } else {
            const ratio = itemTotalCount > 0 ? itemAdultCount / itemTotalCount : 1;
            adultActivityTransferBase += trueBaseAmount * ratio;
            childActivityTransferBase += trueBaseAmount * (1 - ratio);
            adultActivityTransferMarkup += trueMarkup * ratio;
            childActivityTransferMarkup += trueMarkup * (1 - ratio);
          }
        } else if (rawType === 'transfer' || rawType === 'car') {
          if (shouldIncludeChildTransfer) {
            const ratio = totalTripPersons > 0 ? adultCount / totalTripPersons : 1;
            adultActivityTransferBase += trueBaseAmount * ratio;
            childActivityTransferBase += trueBaseAmount * (1 - ratio);
            adultActivityTransferMarkup += trueMarkup * ratio;
            childActivityTransferMarkup += trueMarkup * (1 - ratio);
          } else {
            // All to adults
            adultActivityTransferBase += trueBaseAmount;
            adultActivityTransferMarkup += trueMarkup;
          }
        } else {
          // General fallback
          const ratio = totalTripPersons > 0 ? adultCount / totalTripPersons : 1;
          adultActivityTransferBase += trueBaseAmount * ratio;
          childActivityTransferBase += trueBaseAmount * (1 - ratio);
          adultActivityTransferMarkup += trueMarkup * ratio;
          childActivityTransferMarkup += trueMarkup * (1 - ratio);
        }
      }
    });

    const actTransferBasePerAdult = adultCount > 0 ? adultActivityTransferBase / adultCount : 0;
    const actTransferBasePerChild = childCount > 0 ? childActivityTransferBase / childCount : 0;
    const actTransferMarkupPerAdult = adultCount > 0 ? adultActivityTransferMarkup / adultCount : 0;
    const actTransferMarkupPerChild = childCount > 0 ? childActivityTransferMarkup / childCount : 0;

    const useBaseMarkup = Number(values.baseMarkup) > 0;
    const useExtraMarkup = !useBaseMarkup && Number(values.extraMarkup) > 0;
    const extraMarkupValue = useExtraMarkup ? Number(values.extraMarkup) : 0;

    const rowsWithNet = activeTypes.map(({ pt, count, displayCount, hotelRowCostAll }) => {
      const isPerMode = values.priceOption?.value === "PER";
      const personShareDivisors = { single: 1, double: 2, triple: 3, quad: 4, twoB: 2, threeB: 3, extra: 1, childW: 1, childN: 1, adult: 1, child: 1 };
      const sharingFactor = personShareDivisors[pt.key] || 1;

      const hotelFraction = (item.amount || 0) > 0 ? hotelRowCostAll / item.amount : 0;
      const hotelLineMarkup = Number(item.markup || 0);

      const rowHotelNet = hotelRowCostAll;
      const rowHotelMarkup = hotelLineMarkup * hotelFraction;

      const isChildType = pt.key === 'childW' || pt.key === 'childN' || pt.key === 'child';
      const actTransferBasePerPersonType = isChildType ? actTransferBasePerChild : actTransferBasePerAdult;
      const actTransferMarkupPerPersonType = isChildType ? actTransferMarkupPerChild : actTransferMarkupPerAdult;

      const actTotalBaseToAdd = actTransferBasePerPersonType * sharingFactor * displayCount;
      const actTotalMarkupToAdd = actTransferMarkupPerPersonType * sharingFactor * displayCount;

      const rowNetCost = rowHotelNet + actTotalBaseToAdd;
      const rowOriginalMarkup = rowHotelMarkup + actTotalMarkupToAdd;

      let legacyGlobalMarkupShare = 0;
      const rowGrossBeforeFinalMarkup = rowNetCost + rowOriginalMarkup;

      if (useBaseMarkup) {
        legacyGlobalMarkupShare = rowGrossBeforeFinalMarkup * Number(values.baseMarkup) * 0.01;
      } else if (useExtraMarkup) {
        const totalPackageGross = (item.amount || 0) + (item.markup || 0) + (totals.trueTotalAmount || 0) + (totals.totalMarkup || 0);
        const rowTotalPackageShare = rowGrossBeforeFinalMarkup;
        const totalOptionMarkupShare = totalPackageGross > 0
          ? (extraMarkupValue * rowTotalPackageShare / totalPackageGross)
          : (extraMarkupValue / activeTypes.length);
        legacyGlobalMarkupShare = totalOptionMarkupShare;
      }

      // If there was legacy global markup applied previously, it was added to original markup
      const totalOriginalMarkup = rowOriginalMarkup + legacyGlobalMarkupShare;

      return { pt, count, displayCount, netCost: rowNetCost, originalMarkup: totalOriginalMarkup };
    });

    const optionTotalNetCost = rowsWithNet.reduce((sum, r) => sum + r.netCost, 0);

    const isPERMode = values.priceOption?.value === "PER" || values.priceOption === "PER";
    const occupancyFactors = { single: 1, double: 2, triple: 3, quad: 4, twoB: 2, threeB: 3, extra: 1, childW: 1, childN: 1, adult: 1, child: 1 };

    const hotelRows = rowsWithNet.map((r) => {
      let finalMarkup = r.originalMarkup;

      if (isPERMode) {
        const customObj = markups[`${optIdx}_${r.pt.key}`];
        if (customObj !== undefined && customObj !== "") {
          const customVal = typeof customObj === 'object' ? customObj.value : customObj;
          const customRate = typeof customObj === 'object' ? customObj.rate : exRate;
          if (customVal !== "") {
            const perPersonInBase = Number(customVal) * customRate;
            const pCount = r.displayCount * (occupancyFactors[r.pt.key] || 1);
            finalMarkup = perPersonInBase * pCount;
          }
        }
      } else {
        const customObj = markups[`${optIdx}_total`];
        if (customObj !== undefined && customObj !== "") {
          const customVal = typeof customObj === 'object' ? customObj.value : customObj;
          const customRate = typeof customObj === 'object' ? customObj.rate : exRate;
          if (customVal !== "") {
            const totalMarkupInBase = Number(customVal) * customRate;
            const ratio = optionTotalNetCost > 0 ? r.netCost / optionTotalNetCost : (1 / rowsWithNet.length);
            finalMarkup = totalMarkupInBase * ratio;
          }
        }
      }

      return {
        key: r.pt.key,
        label: r.pt.label,
        count: r.displayCount,
        markup: getRoundOfValue(finalMarkup),
        vat: getVatDisplay(),
        total: getRoundOfValue(r.netCost + finalMarkup),
        netCost: r.netCost
      };
    });

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
      formData.append("extra_markup_percentage", checkFormValue(values.baseMarkup, "number") || 0);
      formData.append("extra_markup_amount", checkFormValue(values.extraMarkup, "number") || 0);
      formData.append("description", values.paymentDescription || ".");

      const currencyValue = values?.priceIn?.value ?? values?.priceIn?.id ?? values?.currency;
      formData.append("currency", checkFormValue(currencyValue) || 1); // fallback to ID 1 if not set

      const pMode = values.priceOption?.value === "PER" || values.priceOption === "PER" ? "PER_PERSON" : "TOTAL_PRICE";
      formData.append("price_mode", pMode);
      formData.append("per_person_amounts", values.perPersonAmount ? "1" : "0");

      const destinationId = values.destination?.value || values.destination?.id;
      if (destinationId) formData.append("destination_id", destinationId);

      const selectedTaxPct = parseFloat(values.taxType?.percentage || 0);
      formData.append("tax_type_id", checkFormValue(values.taxType?.id) || 1);
      formData.append("tax_type_name", checkFormValue(values.taxType?.name) || "GST");
      formData.append("cgst_percentage", checkFormValue(selectedTaxPct, "number") || 0);
      formData.append("sgst_percentage", 0);
      formData.append("igst_percentage", 0);
      formData.append("tcs_percentage", 0);
      formData.append("discount_amount", checkFormValue(values.discount_amount || values.discount || 0, "number") || 0);

      const currentCurrencyCode = values.priceIn?.to_currency || values.priceIn?.label || "USD";
      const currentCurrencySymbol = values.priceIn?.symbol || getSymbol(currentCurrencyCode);

      // use the hotelOption variable already defined in the component scope
      if (!hotelOption || hotelOption.length === 0) { notifyError("Please add at least one hotel option."); return; }

      // --- Calculate Quoted Options Breakdown (needed for grand_total below) ---
      const baseVisibleOptions = hotelOption.filter((item) => {
        const personRows = getPersonTypeRows(item, includeChildTransfer);
        return personRows.length > 0;
      });

      const rate = parseFloat(values.priceIn?.exchange_rate) || 1;
      const visibleOptionsData = baseVisibleOptions.map((item, optIdx) => {
        const pRows = getPersonTypeRows(item, includeChildTransfer, optIdx, customMarkups, rate);
        const hasConversion = rate > 0;
        const convert = (val) => hasConversion ? getRoundOfValue(val / rate) : val;

        const occupancyFactors = { single: 1, double: 2, triple: 3, quad: 4, twoB: 2, threeB: 3, extra: 1, childW: 1, childN: 1, adult: 1, child: 1 };
        const isPERMode = values.priceOption?.value === "PER" || values.priceOption === "PER";

        const mappedRows = pRows.map(pt => {
          const pCount = pt.count * (occupancyFactors[pt.key] || 1);
          const rowPriceInUI = convert(pt.total);

          const itemizedTotal = rowPriceInUI;
          const perPerson = pCount > 0 ? (itemizedTotal / pCount) : 0;

          return {
            key: pt.key,
            label: pt.label,
            count: pCount,
            perPerson: getRoundOfValue(perPerson),
            markup: convert(pt.markup),
            vat: pt.vat,
            total: getRoundOfValue(itemizedTotal)
          };
        });

        const newGrandTotal = mappedRows.reduce((sum, r) => sum + r.total, 0);

        return {
          optionName: item.name,
          grandTotal: getRoundOfValue(newGrandTotal),
          currencyCode: currentCurrencyCode,
          currencySymbol: currentCurrencySymbol,
          rows: mappedRows
        };
      });

      // Use the primary option's occupancy-aware grand total for backend
      const grandTotal = visibleOptionsData.length > 0 ? visibleOptionsData[0].grandTotal : 0;
      const convertedTotal = grandTotal; // already converted in visibleOptionsData
      const totalAmount = grandTotal; // backend expects total_amount

      formData.append("total_amount", getRoundOfValue(totalAmount));
      formData.append("grand_total", getRoundOfValue(grandTotal));
      formData.append("converted_total", getRoundOfValue(convertedTotal));
      formData.append("exchange_rate", rate);

      formData.append("quoted_options", JSON.stringify(visibleOptionsData));
      setFieldValue("quoted_options", visibleOptionsData);

      console.log('--- SUBMITTING BILLING ---');
      for (var pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }

      let entryIndex = 0;
      values.planArr?.forEach(({ schedule }) => {
        schedule.forEach((data) => {
          if (!data.entryId) return; // Skip items without entry ID
          formData.append(`entries[${entryIndex}][id]`, checkFormValue(data.entryId));
          const canonicalAmount = data.baseAmount !== undefined ? data.baseAmount : data.amount;
          formData.append(`entries[${entryIndex}][amount]`, checkFormValue(canonicalAmount) || 0);
          formData.append(`entries[${entryIndex}][markup]`, checkFormValue(data.markup) || 0);
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

  const visibleOptions = hotelOption.filter((item) => {
    const personRows = getPersonTypeRows(item, includeChildTransfer);
    return personRows.length > 0;
  });

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <form>
        {/* ── Page Header & Controls ── */}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ backgroundColor: "#f8fafc", padding: "16px 24px", borderRadius: "12px" }}>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleBack} style={{ borderRadius: "8px", border: "0.5px solid #e2e8f0" }}>
              <i className="fa fa-arrow-left" aria-hidden="true"></i> Back
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
          const globalAdultCount = Number(values.adult || 0);
          const globalTotalCount = (Number(values.adult || 0) + Number(values.child || 0));

          const categoryTotals = scheduleArr.reduce((acc, { item }) => {
            const rawType = (item.insertType || 'other').toLowerCase();
            const type = (rawType === 'transfer' || rawType === 'car') ? 'car' : rawType;

            // For Hotels, group by option instead of filtering them out
            let hotelOptionKey = null;
            if (rawType === 'hotel') {
              const optLabel = item.option?.label || (typeof item.option === 'string' ? item.option : 'Option 1');
              hotelOptionKey = optLabel === "" ? "Option 1" : optLabel;
              // Initialize hotel options structure if needed
              if (!acc.hotelsByOption) acc.hotelsByOption = {};
              if (!acc.hotelsByOption[hotelOptionKey]) {
                acc.hotelsByOption[hotelOptionKey] = {
                  hotelRoom: 0,
                  hotelExtra: 0,
                  hotelChildW: 0,
                  hotelChildN: 0
                };
              }
            }

            // In ALL summary cards, we show the TOTAL aggregate gross cost (Net + Markup) for all travelers
            // Regardless of whether active mode is PER or TOTAL.
            let itemNetTotal = 0;
            let itemMarkupTotal = 0;

            const isPer = values.priceOption?.value === "PER";
            let person = 1;
            if (rawType === 'activity') {
              person = (Number(item.adult || 0) + Number(item.child || 0)) || (globalTotalCount || 1);
            } else if (rawType === 'transfer' || rawType === 'car') {
              person = includeChildTransfer ? (globalTotalCount || 1) : (globalAdultCount || 1);
            } else {
              person = globalTotalCount || 1;
            }

            if (isPer && rawType !== 'hotel') {
              // Prioritize baseAmount/baseMarkup (unrounded totals) for the summary
              itemNetTotal = item.baseAmount !== undefined ? Number(item.baseAmount) : (Number(item.amount || 0)) * person;
              itemMarkupTotal = item.baseMarkup !== undefined ? Number(item.baseMarkup) : (Number(item.markup || 0)) * person;
            } else {
              // Already total
              itemNetTotal = Number(item.amount || 0);
              itemMarkupTotal = Number(item.markup || 0);
            }

            const itemGrossTotal = itemNetTotal + itemMarkupTotal;
            if (!hotelOptionKey) {
              acc[type] = (acc[type] || 0) + itemGrossTotal;
            }

            // ── Adult / Child Split for Activities & Transfers ──
            // ── Adult / Child Split for Activities & Transfers ──
            if (rawType === 'activity' || type === 'car') {
              const adultCount = (rawType === 'activity' ? Number(item.adult) : Number(values.adult)) || 0;
              const childCount = (rawType === 'activity' ? Number(item.child) : Number(values.child)) || 0;

              if (rawType === 'activity') {
                if (item.adultCost && item.childCost && (Number(item.adultCost) + Number(item.childCost)) > 0) {
                  const adultTotalCost = Number(item.adultCost) || 0;
                  const childTotalCost = Number(item.childCost) || 0;
                  const totalExplicitCost = adultTotalCost + childTotalCost;
                  const adultMarkup = totalExplicitCost > 0 ? (itemMarkupTotal * adultTotalCost / totalExplicitCost) : 0;
                  const childMarkup = totalExplicitCost > 0 ? (itemMarkupTotal * childTotalCost / totalExplicitCost) : 0;

                  // Round the per-person rates to match the breakdown rows
                  const adultRate = getRoundOfValue((adultTotalCost + adultMarkup) / (adultCount || 1));
                  const childRate = getRoundOfValue((childTotalCost + childMarkup) / (childCount || 1));

                  acc.activityAdult = (acc.activityAdult || 0) + (adultRate * adultCount);
                  acc.activityChild = (acc.activityChild || 0) + (childRate * childCount);
                } else {
                  const totalPax = adultCount + childCount;
                  const rate = getRoundOfValue(itemGrossTotal / (totalPax || 1));
                  acc.activityAdult = (acc.activityAdult || 0) + (rate * adultCount);
                  acc.activityChild = (acc.activityChild || 0) + (rate * childCount);
                }
              } else if (type === 'car') {
                const divisor = includeChildTransfer ? (adultCount + childCount) : adultCount;

                if (includeChildTransfer) {
                  const totalPax = adultCount + childCount;
                  if (totalPax > 0) {
                    acc.carAdult = (acc.carAdult || 0) + (itemGrossTotal * adultCount) / totalPax;
                    acc.carChild = (acc.carChild || 0) + (itemGrossTotal * childCount) / totalPax;
                  } else {
                    acc.carAdult = (acc.carAdult || 0) + itemGrossTotal;
                  }
                } else {
                  // If children excluded, 100% of transfer cost is assigned to adults
                  acc.carAdult = (acc.carAdult || 0) + itemGrossTotal;
                }
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
              // Weight without occupancy multipliers - just count * rate
              const totalWeight = (counts.single * rates.single) + (counts.double * rates.double) +
                (counts.triple * rates.triple) + (counts.extra * rates.extra) +
                (counts.childW * rates.childW) + (counts.childN * rates.childN);

              const ratio = totalWeight > 0 ? itemGrossTotal / totalWeight : 0;

              // Room Rates — sum of sharing types (without occupancy multipliers)
              const roomCost = ((counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple)) * ratio;
              // Adult Extra Bed
              const extraBedCost = (counts.extra * rates.extra) * ratio;
              // Child Extra Bed
              const childWCost = (counts.childW * rates.childW) * ratio;
              // Child Without Bed
              const childNCost = (counts.childN * rates.childN) * ratio;

              acc.hotelsByOption[hotelOptionKey].hotelRoom = (acc.hotelsByOption[hotelOptionKey].hotelRoom || 0) + roomCost;
              acc.hotelsByOption[hotelOptionKey].hotelExtra = (acc.hotelsByOption[hotelOptionKey].hotelExtra || 0) + extraBedCost;
              acc.hotelsByOption[hotelOptionKey].hotelChildW = (acc.hotelsByOption[hotelOptionKey].hotelChildW || 0) + childWCost;
              acc.hotelsByOption[hotelOptionKey].hotelChildN = (acc.hotelsByOption[hotelOptionKey].hotelChildN || 0) + childNCost;
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
                          <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "55%" }}>Tours / Hotels</th>
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
                            // Weight without occupancy multipliers - just count * rate
                            const weight = (counts.single * rates.single) + (counts.double * rates.double) + (counts.triple * rates.triple) + (counts.extra * rates.extra) + (counts.childW * rates.childW) + (counts.childN * rates.childN);

                            let ratio = 1;
                            if (weight > 0) {
                              ratio = Number(item.amount || 0) / weight;
                            } else {
                              const totalRooms = counts.single + counts.double + counts.triple + counts.extra + counts.childW + counts.childN;
                              if (totalRooms > 0) {
                                const avg = Number(item.amount || 0) / totalRooms;
                                rates.single = rates.double = rates.triple = rates.extra = rates.childW = rates.childN = avg;
                              }
                              ratio = 1;
                            }
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
                                // Calculate per-person rate: (room_rate * ratio) / occupancy_divisor
                                const netPerPax = (rates[t.k] * ratio) / t.d;
                                const grossPerPax = netPerPax * (1 + markupRatio);
                                return {
                                  key: t.k,
                                  label: t.l,
                                  net: displayAmount(netPerPax),
                                  gross: displayAmount(grossPerPax)
                                };
                              });
                          } else if ((item.insertType === "transfer" || item.insertType === "car" || item.insertType === "activity") && isPer) {
                            const adultCount = (item.insertType === "activity" ? Number(item.adult) : Number(values.adult)) || 0;
                            const childCount = (item.insertType === "activity" ? Number(item.child) : Number(values.child)) || 0;
                            const isTransferType = item.insertType === "transfer" || item.insertType === "car";

                            // Recover the true total cost using the same person count logic as during conversion
                            const activityPersonCount = (Number(item.adult || 0) + Number(item.child || 0));
                            const globalAdultCount = Number(values.adult || 0);
                            const globalTotalCount = (Number(values.adult || 0) + Number(values.child || 0));

                            let person = 1;
                            if (item.insertType === "activity") {
                              person = activityPersonCount > 0 ? activityPersonCount : (globalTotalCount || 1);
                            } else if (item.insertType === "transfer" || item.insertType === "car") {
                              // Synchronize with the divisor logic: if children aren't ticked, the per-person rate was divided by adults only
                              person = includeChildTransfer ? (globalTotalCount || 1) : (globalAdultCount || 1);
                            } else {
                              person = globalTotalCount || 1;
                            }

                            const totalAmount = item.baseAmount !== undefined
                              ? Number(item.baseAmount)
                              : Number(item.amount) * (person || 1);
                            const totalMarkup = item.baseMarkup !== undefined
                              ? Number(item.baseMarkup)
                              : Number(item.markup || 0) * (person || 1);

                            const hasExplicitCosts = item.insertType === "activity" && item.adultCost && item.childCost && (Number(item.adultCost) + Number(item.childCost)) > 0 && (adultCount + childCount) > 0;

                            if (hasExplicitCosts) {
                              const adultTotalCost = Number(item.adultCost) || 0;
                              const childTotalCost = Number(item.childCost) || 0;
                              const totalExplicitCost = adultTotalCost + childTotalCost;
                              const adultMarkup = totalExplicitCost > 0 ? (totalMarkup * adultTotalCost / totalExplicitCost) : 0;
                              const childMarkup = totalExplicitCost > 0 ? (totalMarkup * childTotalCost / totalExplicitCost) : 0;

                              if (adultCount > 0) {
                                breakdownData.push({
                                  key: 'adult',
                                  label: 'Adult rate',
                                  net: getRoundOfValue(adultTotalCost / adultCount),
                                  gross: getRoundOfValue((adultTotalCost + adultMarkup) / adultCount)
                                });
                              }
                              if (childCount > 0) {
                                breakdownData.push({
                                  key: 'child',
                                  label: 'Child rate',
                                  net: getRoundOfValue(childTotalCost / childCount),
                                  gross: getRoundOfValue((childTotalCost + childMarkup) / childCount)
                                });
                              }
                            } else {
                              // Transfers and general fallback
                              const effectiveDivisor = isTransferType
                                ? (includeChildTransfer ? (adultCount + childCount) : adultCount)
                                : (adultCount + childCount);

                              const safeDivisor = effectiveDivisor > 0 ? effectiveDivisor : 1;
                              const perPersonNet = getRoundOfValue(totalAmount / safeDivisor);
                              const perPersonGross = getRoundOfValue((totalAmount + totalMarkup) / safeDivisor);

                              if (adultCount > 0) {
                                breakdownData.push({ key: 'adult', label: 'Adult rate', net: perPersonNet, gross: perPersonGross });
                              }

                              if (childCount > 0 && (!isTransferType || includeChildTransfer)) {
                                breakdownData.push({ key: 'child', label: 'Child rate', net: perPersonNet, gross: perPersonGross });
                              }
                            }
                          }


                          const firstBreakdown = breakdownData[0];
                          const otherBreakdowns = breakdownData.slice(1);
                          const isHotelPer = isHotel && isPer;
                          const isTransferPer = (item.insertType === "transfer" || item.insertType === "car" || item.insertType === "activity") && isPer && breakdownData.length > 1;
                          const showMainBorder = !(isHotelPer || isTransferPer) || otherBreakdowns.length === 0;
                          const isBreakdown = (isHotelPer || isTransferPer) && breakdownData.length > 0;

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
                                <td className={`px-4 align-middle ${isBreakdown ? "pt-1 pb-1" : "py-3"}`} style={{ border: "none", whiteSpace: "normal", wordBreak: "break-word" }}>
                                  <div className="d-flex align-items-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", backgroundColor: item.insertType === 'hotel' ? '#EEF4FF' : item.insertType === 'activity' ? '#FFF9E6' : '#E6FCF5', minWidth: "36px" }}>
                                      <i className={`fa fa-lg ${item.insertType === 'hotel' ? 'fa-building text-primary' : item.insertType === 'activity' ? 'fa-ticket' : 'fa-car text-success'}`} style={{ color: item.insertType === 'hotel' ? '#185FA5' : item.insertType === 'activity' ? '#D97706' : '#16A34A' }}></i>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <h6 className="text-dark mb-1" style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "normal", wordBreak: "break-word" }}>
                                        {item.name}
                                        {isHotel && item.option?.label && (
                                          <span className="badge ms-2" style={{ fontSize: "11px", letterSpacing: "0.5px", backgroundColor: "#EEF4FF", color: "#185FA5", padding: "4px 12px", borderRadius: "999px", fontWeight: 500 }}>{item.option.label}</span>
                                        )}
                                      </h6>
                                      <div className="d-flex flex-column">
                                        <span className="text-muted" style={{ fontSize: "12px" }}>
                                          {`${item.roomType?.label || item.type?.label || "Service"}${(item.insertType === 'transfer' || item.insertType === 'car') && (item.vehicleType?.label || item.vehicle_type || item.vehicle_name)
                                              ? ` • ${item.vehicleType?.label || item.vehicle_type || item.vehicle_name}`
                                              : ''
                                            } • ${formatDate(item.startDate)} to ${formatDate(item.endDate)}`}
                                        </span>
                                        {(isHotelPer || (isTransferPer && otherBreakdowns.length > 0)) && firstBreakdown && (
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
                                  {!(isHotelPer || isTransferPer) ? (
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
                                        value={displayAmount(firstBreakdown.net)}
                                        disabled={readOnly}
                                        onChange={(e) => isHotelPer ? handleHotelPaxPriceChange(planArrInd, scheduleInd, firstBreakdown.key, e.target.value) : handleInputChange(planArrInd, scheduleInd, e.target.value)}
                                        style={{ border: "1px solid transparent", backgroundColor: "transparent", borderRadius: "4px", width: "100%", fontSize: "12px" }}
                                        onFocus={(e) => { e.target.style.border = "1px solid #0d6efd"; e.target.style.backgroundColor = "#fff"; }}
                                        onBlur={(e) => { e.target.style.border = "1px solid transparent"; e.target.style.backgroundColor = "transparent"; handleBlur(e); }}
                                      />
                                    )
                                  )}
                                </td>
                                <td className={`px-4 text-end fw-bold text-dark fs-15 ${isBreakdown ? "pt-1 pb-1 align-bottom" : "py-3 align-middle"}`} style={{ border: "none" }}>
                                  {!(isHotelPer || isTransferPer) ? (
                                    getRoundOfValue(item.amount + item.markup)
                                  ) : (
                                    firstBreakdown && (
                                      <span className="text-dark fw-bold" style={{ fontSize: "12px" }}>
                                        {displayAmount(firstBreakdown.gross)}
                                      </span>
                                    )
                                  )}
                                </td>
                              </tr>

                              {/* Additional Breakdown Sub-Rows */}
                              {(isHotelPer || isTransferPer) && otherBreakdowns.map((row, i) => {
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
                                        value={displayAmount(row.net)}
                                        disabled={readOnly || isTransferPer}
                                        onChange={(e) => isHotelPer ? handleHotelPaxPriceChange(planArrInd, scheduleInd, row.key, e.target.value) : null}
                                        style={{ border: "1px solid transparent", backgroundColor: "transparent", borderRadius: "4px", width: "100%", fontSize: "12px" }}
                                        onFocus={(e) => { if (isHotelPer && !readOnly) { e.target.style.border = "1px solid #0d6efd"; e.target.style.backgroundColor = "#fff"; } }}
                                        onBlur={(e) => { e.target.style.border = "1px solid transparent"; e.target.style.backgroundColor = "transparent"; handleBlur(e); }}
                                      />
                                    </td>
                                    <td className="px-4 py-2 border-0 align-middle text-end" style={{ border: "none" }}>
                                      <span className="text-dark fw-bold" style={{ fontSize: "12px" }}>
                                        {displayAmount(row.gross)}
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
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-dark fw-bold" style={{ fontSize: "15px" }}>
                    <i className="fa fa-list-ul me-2 text-primary"></i> Executive Summary
                  </h6>
                  <div className="form-check" style={{ marginBottom: 0 }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="includeChildTransferCheck"
                      checked={includeChildTransfer}
                      onChange={(e) => setIncludeChildTransfer(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                    <label className="form-check-label" htmlFor="includeChildTransferCheck" style={{ cursor: "pointer", fontSize: "13px", marginBottom: 0 }}>
                      Include Child Transfers
                    </label>
                  </div>
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
                      {/* Hotels Section - grouped by option */}
                      {categoryTotals.hotelsByOption && (() => {
                        const hotelOptions = Object.entries(categoryTotals.hotelsByOption);
                        const hasMultipleOptions = hotelOptions.length > 1;

                        return hotelOptions.map(([optionName, optionTotals]) => {
                          const hotelRows = [
                            { label: 'Main Room Rate', value: optionTotals.hotelRoom },
                            { label: 'Adult Extra Bed', value: optionTotals.hotelExtra },
                            { label: 'Child With Bed', value: optionTotals.hotelChildW },
                            { label: 'Child Without Bed', value: optionTotals.hotelChildN },
                          ].filter(row => row.value > 0);

                          if (hotelRows.length === 0) return null;

                          const categoryLabel = hasMultipleOptions ? `Hotels - ${optionName}` : `Hotels`;

                          return (
                            <React.Fragment key={`hotel-${optionName}`}>
                              {hotelRows.map((row, idx) => (
                                <tr key={`hotel-${optionName}-${idx}`} style={{ borderBottom: idx === hotelRows.length - 1 ? "2px solid #f1f5f9" : "1px solid #f1f5f9" }}>
                                  {idx === 0 && (
                                    <td rowSpan={hotelRows.length} className="ps-4 align-middle fw-bold text-primary" style={{ backgroundColor: "#fcfdff" }}>
                                      <i className="fa fa-hotel me-2"></i> {categoryLabel}
                                    </td>
                                  )}
                                  <td className="text-dark fw-medium" style={{ fontSize: "13px" }}>{row.label}</td>
                                  <td className="pe-4 text-end text-dark fw-bold" style={{ fontSize: "14px" }}>
                                    {activeSymbol} {convert(row.value)}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        });
                      })()}

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
                      {(categoryTotals.carAdult > 0 || categoryTotals.carChild > 0) && (
                        <>
                          <tr>
                            <td rowSpan={includeChildTransfer && categoryTotals.carChild > 0 ? 2 : 1} className="ps-4 align-middle fw-bold" style={{ color: "#16A34A", backgroundColor: "#f6fff9" }}>
                              <i className="fa fa-car me-2"></i> Transfers
                            </td>
                            <td className="text-dark fw-medium" style={{ fontSize: "13px" }}>Adult Transfers</td>
                            <td className="pe-4 text-end text-dark fw-bold" style={{ fontSize: "14px" }}>
                              {activeSymbol} {convert(includeChildTransfer ? (categoryTotals.carAdult || 0) : ((categoryTotals.carAdult || 0) + (categoryTotals.carChild || 0)))}
                            </td>
                          </tr>
                          {includeChildTransfer && categoryTotals.carChild > 0 && (
                            <tr>
                              <td className="text-dark fw-medium" style={{ fontSize: "13px" }}>Child Transfers</td>
                              <td className="pe-4 text-end text-dark fw-bold" style={{ fontSize: "14px" }}>
                                {activeSymbol} {convert(categoryTotals.carChild)}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                    <tfoot style={{ backgroundColor: "#f0f7ff", borderTop: "2px solid #e2e8f0" }}>
                      {(() => {
                        const firstOpt = hotelOption.find(opt => opt.name === 'Option 1') || hotelOption[0] || { trueBaseAmount: 0, markup: 0, amount: 0 };
                        const trueAmount = firstOpt.trueBaseAmount || firstOpt.amount || 0;
                        const markup = firstOpt.markup || 0;

                        const optionTotal = (totals.trueTotalAmount || 0) + totals.totalMarkup + trueAmount + markup;
                        const discountPct = checkFormValue(values.discount, "number");
                        const discountAmount = optionTotal * discountPct * 0.01;
                        const gTotal = optionTotal - discountAmount;
                        const selectedTaxPct = parseFloat(values.taxType?.percentage || 0);
                        const taxAmount = gTotal * selectedTaxPct * 0.01;
                        const additionalMarkup = calculateTrueInputMarkup(trueAmount, markup);
                        const trueGrandTotal = getRoundOfValue(gTotal + additionalMarkup + taxAmount);

                        return (
                          <>
                            {discountAmount > 0 && (
                              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td colSpan={2} className="text-end pe-3 py-2" style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
                                  Discount ({discountPct}%):
                                </td>
                                <td className="pe-4 py-2 text-end" style={{ color: "#ef4444", fontSize: "13px", fontWeight: 500 }}>
                                  - {activeSymbol} {convert(discountAmount)}
                                </td>
                              </tr>
                            )}
                            {taxAmount > 0 && (
                              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td colSpan={2} className="text-end pe-3 py-2" style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
                                  Tax ({values.taxType?.name || "GST"} {selectedTaxPct}%):
                                </td>
                                <td className="pe-4 py-2 text-end" style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
                                  {activeSymbol} {convert(taxAmount)}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
                    </tfoot>
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

            {/* Markup Info & Edit (Hidden) */}
            {/* <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
               ...legacy markup fields...
            </div> */}

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
              <table className="table mb-0 text-dark" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead style={{ backgroundColor: "#f8faff", borderBottom: "2px solid #e2e8f0" }}>
                  <tr>
                    {hasHotelInSchedule && (
                      <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "120px" }}>Options</th>
                    )}
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "30%" }}>Person</th>
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "20%" }}>Markup</th>
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "15%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{values.taxType?.name || "Tax"} (%)</th>
                    <th className="py-3 px-4 text-dark text-end" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "20%" }}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleOptions.length === 0 ? (
                    <tr>
                      <td colSpan={hasHotelInSchedule ? 5 : 4} className="text-center text-muted py-5">
                        <div className="mb-2"><i className="fa fa-info-circle fa-2x"></i></div>
                        <div>No valid hotel options or room counts found. Please check your itinerary setup.</div>
                      </td>
                    </tr>
                  ) : (
                    visibleOptions.map((item, optIdx) => {
                      const exchangeRate = parseFloat(values.priceIn?.exchange_rate) || 0;
                      const hasConversion = exchangeRate > 0;
                      const rateToUse = hasConversion ? exchangeRate : 1;
                      const personRows = getPersonTypeRows(item, includeChildTransfer, optIdx, customMarkups, rateToUse);
                      const currSymbol = values.priceIn?.symbol || getSymbol(values.priceIn?.to_currency || values.priceIn?.label || baseCode);
                      const convert = (val) => hasConversion ? getRoundOfValue(val / exchangeRate) : val;

                      const occupancyFactors = { single: 1, double: 2, triple: 3, quad: 4, twoB: 2, threeB: 3, extra: 1, childW: 1, childN: 1, adult: 1, child: 1 };
                      const isPERModeGT = values.priceOption?.value === "PER";
                      const grandTotal = Math.round(getRoundOfValue(personRows.reduce((sum, pt) => sum + convert(pt.total), 0)));
                      const grandMarkup = Math.round(getRoundOfValue(personRows.reduce((sum, pt) => sum + convert(pt.markup), 0)));
                      const vatDisplay = personRows[0]?.vat ?? 0;
                      // Number of columns: 5 with Options, 4 without
                      const totalCols = hasHotelInSchedule ? 5 : 4;

                      // ── TOTAL mode: single consolidated row ──────────────────
                      if (!isPERModeGT) {
                        return (
                          <React.Fragment key={optIdx}>
                            <tr style={{ backgroundColor: "#fff", borderBottom: "1px solid #f1f5f9" }}>
                              {hasHotelInSchedule && (
                                <td
                                  className="align-middle text-center"
                                  style={{ verticalAlign: "middle", borderRight: "0.5px solid #e2e8f0", backgroundColor: "#f8faff" }}
                                >
                                  <span className="badge px-3 py-2" style={{ fontSize: "12px", backgroundColor: "#EEF4FF", color: "#185FA5", padding: "4px 12px", borderRadius: "999px", fontWeight: 500 }}>
                                    {item.name}
                                  </span>
                                </td>
                              )}
                              <td style={{ paddingLeft: "16px", color: "#333", borderRight: "0.5px solid #e2e8f0", fontWeight: 500 }}>
                                Package Total
                              </td>
                              <td className="text-end pe-3" style={{ borderRight: "0.5px solid #e2e8f0", color: "#374151" }}>
                                {!readOnly ? (
                                  <div className="d-flex align-items-center justify-content-end">
                                    <span className="me-1">{currSymbol}</span>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm text-end p-1"
                                      style={{ width: "80px", display: "inline-block" }}
                                      value={
                                        customMarkups[`${optIdx}_total`] !== undefined
                                          ? (typeof customMarkups[`${optIdx}_total`] === 'object'
                                            ? (customMarkups[`${optIdx}_total`].value === "" ? "" : Math.round((Number(customMarkups[`${optIdx}_total`].value) * (customMarkups[`${optIdx}_total`].rate || rateToUse)) / rateToUse))
                                            : customMarkups[`${optIdx}_total`])
                                          : grandMarkup
                                      }
                                      onChange={(e) => setCustomMarkups({ ...customMarkups, [`${optIdx}_total`]: { value: e.target.value, rate: rateToUse } })}
                                    />
                                  </div>
                                ) : (
                                  <>{currSymbol} {grandMarkup}</>
                                )}
                              </td>
                              <td className="text-end pe-3" style={{ borderRight: "0.5px solid #e2e8f0", color: "#374151" }}>
                                {vatDisplay} %
                              </td>
                              <td className="text-end pe-3 text-dark" style={{ fontWeight: 700, fontSize: "15px", color: "#185FA5" }}>
                                {currSymbol} {grandTotal}
                              </td>
                            </tr>
                            {/* Grand Total row */}
                            <tr style={{ backgroundColor: "#f0f7ff", borderBottom: "1px solid #e2e8f0" }}>
                              <td
                                colSpan={totalCols}
                                className="text-end pe-4"
                                style={{ color: "#185FA5", fontSize: "14px", fontWeight: 600, padding: "10px 16px" }}
                              >
                                Grand Total:&nbsp;&nbsp;{currSymbol} {grandTotal}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      }

                      // ── PER mode: per-person-type rows + grand total footer ──
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
                              {/* Option label — merged cell spanning person rows + grand total row — only shown when hotel exists */}
                              {hasHotelInSchedule && ptIdx === 0 && (
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
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <span>{pt.label}</span>
                                  {/* Only show count badge for generic adult/child rows, not for hotel room types */}
                                  {(pt.key === "adult" || pt.key === "child") && pt.count > 0 && (
                                    <span style={{
                                      fontSize: "11px", color: "#fff", fontWeight: 500,
                                      background: "#185FA5", borderRadius: "999px",
                                      padding: "1px 8px", letterSpacing: "0.02em"
                                    }}>
                                      × {pt.count}
                                    </span>
                                  )}
                                </span>
                              </td>

                              {/* Markup */}
                              <td className="text-end pe-3" style={{ borderRight: '0.5px solid #e2e8f0', color: "#374151" }}>
                                {!readOnly ? (
                                  <div className="d-flex align-items-center justify-content-end">
                                    <span className="me-1">{currSymbol}</span>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm text-end p-1"
                                      style={{ width: "80px", display: "inline-block" }}
                                      value={
                                        customMarkups[`${optIdx}_${pt.key}`] !== undefined
                                          ? (typeof customMarkups[`${optIdx}_${pt.key}`] === 'object'
                                            ? (customMarkups[`${optIdx}_${pt.key}`].value === "" ? "" : Math.round((Number(customMarkups[`${optIdx}_${pt.key}`].value) * (customMarkups[`${optIdx}_${pt.key}`].rate || rateToUse)) / rateToUse))
                                            : customMarkups[`${optIdx}_${pt.key}`])
                                          : Math.round(getRoundOfValue(convert(pt.markup) / (pt.count * (occupancyFactors[pt.key] || 1))))
                                      }
                                      onChange={(e) => setCustomMarkups({ ...customMarkups, [`${optIdx}_${pt.key}`]: { value: e.target.value, rate: rateToUse } })}
                                    />
                                  </div>
                                ) : (
                                  <>{currSymbol} {Math.round(getRoundOfValue(convert(pt.markup) / (pt.count * (occupancyFactors[pt.key] || 1))))}</>
                                )}
                              </td>

                              {/* VAT */}
                              <td className="text-end pe-3" style={{ borderRight: '0.5px solid #e2e8f0', color: "#374151" }}>{pt.vat} %</td>

                              {/* Total per person */}
                              <td className="text-end pe-3 text-dark" style={{ fontWeight: 600 }}>
                                {currSymbol} {Math.round(getRoundOfValue(convert(pt.total) / (pt.count * (occupancyFactors[pt.key] || 1))))}
                              </td>
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
                              colSpan={totalCols}
                              className="text-end pe-4"
                              style={{ color: "#185FA5", fontSize: "14px", fontWeight: 600, padding: "10px 16px" }}
                            >
                              Grand Total:&nbsp;&nbsp;{currSymbol} {grandTotal}
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
                            const rate = parseFloat(values.priceIn.exchange_rate) || 1;
                            const personRows = getPersonTypeRows(item, includeChildTransfer, ind, customMarkups, rate);
                            const convertLocal = (val) => getRoundOfValue(val / rate);

                            const convertedTotal = getRoundOfValue(personRows.reduce((sum, pt) => {
                              const rowTotalConverted = convertLocal(pt.total);
                              return sum + rowTotalConverted;
                            }, 0));
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
    </>
  );
};

export default PaymentForm;