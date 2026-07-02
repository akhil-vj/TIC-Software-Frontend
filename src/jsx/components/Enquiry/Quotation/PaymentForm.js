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
  { key: "single", label: "Person in Single Room" },
  { key: "double", label: "Person in Double sharing" },
  { key: "triple", label: "Person in Triple sharing" },
  { key: "quad", label: "Person in Quad sharing" },
  { key: "two_bedroom", label: "Person in 2-Bedroom " },
  { key: "three_bedroom", label: "Person in 3-Bedroom" },
  { key: "four_bedroom", label: "Person in 4-Bedroom " },
  { key: "adult", label: "Person" },
  { key: "extra", label: "Person (Extra Bed)" },
  { key: "childW", label: "Child (With Bed)" },
  { key: "childN", label: "Child (No Bed)" },
  { key: "child", label: "Child" },
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
  const [globalMarkupMode, setGlobalMarkupMode] = useState('val');

  useEffect(() => {
    if (values.quoted_options && Array.isArray(values.quoted_options) && !customMarkupsLoaded) {
      const isBase = values.priceIn?.value === 'base' || values.priceIn?.value === values.baseCurrency || values.priceIn?.label === values.baseCurrency;
      if (!isBase && values.priceIn && values.priceIn.exchange_rate === undefined) {
        return; // Wait for currency matching to resolve the exchange rate
      }

      const loadedMarkups = {};
      const isPERMode = values.priceOption?.value === "PER" || values.priceOption === "PER";

      values.quoted_options.forEach((opt, optIdx) => {
        const rateToUse = parseFloat(opt.exchange_rate) || parseFloat(values.exchange_rate) || parseFloat(values.priceIn?.exchange_rate) || 1;
        if (isPERMode) {
          opt.rows?.forEach(r => {
            const pCount = r.count > 0 ? r.count : 1;
            const mode = r.markup_mode || 'val';
            if (optIdx === 0) setGlobalMarkupMode(mode);
            const value = mode === 'pct' ? r.markup_percent : getRoundOfValue(r.markup / pCount);
            loadedMarkups[`${optIdx}_${r.key}`] = { value, rate: rateToUse, mode };
          });
        } else {
          const mode = opt.markup_mode || 'val';
          if (optIdx === 0) setGlobalMarkupMode(mode);
          const value = mode === 'pct' ? opt.markup_percent : getRoundOfValue(opt.rows?.reduce((sum, r) => sum + r.markup, 0) || 0);
          loadedMarkups[`${optIdx}_total`] = { value, rate: rateToUse, mode };
        }
      });

      if (Object.keys(loadedMarkups).length > 0) {
        setCustomMarkups(loadedMarkups);
      }
      setCustomMarkupsLoaded(true);
    }
    // Reset customMarkupsLoaded when quoted_options identity changes (e.g. after a save)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.quoted_options, customMarkupsLoaded, values.priceOption, values.priceIn, values.exchange_rate]);

  // Reset stale markup cache whenever the saved quoted_options reference changes
  const prevQuotedOptionsRef = React.useRef(values.quoted_options);
  useEffect(() => {
    if (prevQuotedOptionsRef.current !== values.quoted_options) {
      prevQuotedOptionsRef.current = values.quoted_options;
      setCustomMarkupsLoaded(false);
    }
  }, [values.quoted_options]);
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

  // ─── Stamp baseAmount/baseMarkup on schedule items ───────────────────────────
  // On first load from DB, items have `base_amount` (from backend) but the
  // frontend field is `baseAmount`. We map them here without dividing.
  // Only if base_amount is absent (brand-new items not yet saved) do we compute it.
  useEffect(() => {
    const hasScheduleItems = values.planArr?.some(p => p.schedule?.length > 0);
    if (!hasScheduleItems) return;

    if (values.priceOption?.value === 'PER') {
      const needsStamping = values.planArr.some(p =>
        p.schedule.some(s => s.baseAmount === undefined)
      );
      if (!needsStamping) return;

      const newData = values.planArr.map(item => ({
        ...item,
        schedule: item.schedule.map(scheduleItem => {
          if (scheduleItem.baseAmount !== undefined) return scheduleItem;

          // If the backend already sent base_amount, trust it — no division needed.
          if (scheduleItem.base_amount !== undefined && scheduleItem.base_amount !== null) {
            return {
              ...scheduleItem,
              baseAmount: Number(scheduleItem.base_amount),
              baseMarkup: Number(scheduleItem.base_markup ?? scheduleItem.markup ?? 0),
            };
          }

          // Brand-new item (never priced): derive from amount by dividing by pax.
          const shouldDivide = scheduleItem.insertType !== 'hotel';
          const isTransferItem = scheduleItem.insertType === 'transfer' || scheduleItem.insertType === 'car';
          const person = scheduleItem.insertType === 'activity'
            ? ((Number(scheduleItem.adult || 0) + Number(scheduleItem.child || 0)) || 1)
            : isTransferItem
              ? (((values.adult || 0) + (values.child || 0)) || 1)
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
    } else {
      // TOTAL mode — stamp baseAmount so mode-toggles work correctly
      const needsBase = values.planArr.some(p =>
        p.schedule.some(s => s.baseAmount === undefined)
      );
      if (!needsBase) return;

      const newData = values.planArr.map(item => ({
        ...item,
        schedule: item.schedule.map(scheduleItem => {
          if (scheduleItem.baseAmount !== undefined) return scheduleItem;

          const trueBase = scheduleItem.base_amount !== undefined && scheduleItem.base_amount !== null
            ? Number(scheduleItem.base_amount)
            : scheduleItem.amount;
          const trueMarkup = scheduleItem.base_markup !== undefined
            ? Number(scheduleItem.base_markup)
            : (scheduleItem.markup || 0);

          return {
            ...scheduleItem,
            baseAmount: trueBase,
            baseMarkup: trueMarkup,
          };
        }),
      }));
      setFieldValue('planArr', newData);
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
                  : (scheduleItem.insertType === "transfer" || scheduleItem.insertType === "car")
                    ? (includeChildTransfer ? ((values.adult || 0) + (values.child || 0)) : (values.adult || 0)) || 1
                    : ((values.adult || 0) + (values.child || 0)) || 1;

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
    { name: "Option 1", amount: 0, markup: 0, adultCost: 0, childCost: 0, adult: 0, extra: 0, child: 0, adultDisplay: 0, extraDisplay: 0, childDisplay: 0, adultTotalCost: 0, extraTotalCost: 0, childTotalCost: 0, single: 0, double: 0, triple: 0, quad: 0, two_bedroom: 0, three_bedroom: 0, four_bedroom: 0, singleDisplay: 0, doubleDisplay: 0, tripleDisplay: 0, quadDisplay: 0, two_bedroomDisplay: 0, three_bedroomDisplay: 0, four_bedroomDisplay: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, quadTotalCost: 0, two_bedroomTotalCost: 0, three_bedroomTotalCost: 0, four_bedroomTotalCost: 0 },
    { name: "Option 2", amount: 0, markup: 0, adultCost: 0, childCost: 0, adult: 0, extra: 0, child: 0, adultDisplay: 0, extraDisplay: 0, childDisplay: 0, adultTotalCost: 0, extraTotalCost: 0, childTotalCost: 0, single: 0, double: 0, triple: 0, quad: 0, two_bedroom: 0, three_bedroom: 0, four_bedroom: 0, singleDisplay: 0, doubleDisplay: 0, tripleDisplay: 0, quadDisplay: 0, two_bedroomDisplay: 0, three_bedroomDisplay: 0, four_bedroomDisplay: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, quadTotalCost: 0, two_bedroomTotalCost: 0, three_bedroomTotalCost: 0, four_bedroomTotalCost: 0 },
    { name: "Option 3", amount: 0, markup: 0, adultCost: 0, childCost: 0, adult: 0, extra: 0, child: 0, adultDisplay: 0, extraDisplay: 0, childDisplay: 0, adultTotalCost: 0, extraTotalCost: 0, childTotalCost: 0, single: 0, double: 0, triple: 0, quad: 0, two_bedroom: 0, three_bedroom: 0, four_bedroom: 0, singleDisplay: 0, doubleDisplay: 0, tripleDisplay: 0, quadDisplay: 0, two_bedroomDisplay: 0, three_bedroomDisplay: 0, four_bedroomDisplay: 0, singleTotalCost: 0, doubleTotalCost: 0, tripleTotalCost: 0, quadTotalCost: 0, two_bedroomTotalCost: 0, three_bedroomTotalCost: 0, four_bedroomTotalCost: 0 },
  ];

  // Helper to safely parse a count value — treats "", undefined, null, NaN as 0
  const safeCount = (val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const n = parseInt(val, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const hotelOptionRaw = scheduleArr.reduce((acc, { item }) => {
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
          extra: safeCount(item.extra),
          childW: safeCount(item.childW),
          childN: safeCount(item.childN),
        };

        let hotelAdultCost = 0;
        let hotelExtraCost = 0;
        let hotelChildCost = 0;
        let hotelInRoomAdults = 0;
        let hotelExtraAdults = 0;
        let hotelChildCount = 0;

        const typeStats = {
          single: { cost: 0, adults: 0 },
          double: { cost: 0, adults: 0 },
          triple: { cost: 0, adults: 0 },
          quad: { cost: 0, adults: 0 },
          two_bedroom: { cost: 0, adults: 0 },
          three_bedroom: { cost: 0, adults: 0 },
          four_bedroom: { cost: 0, adults: 0 },
        };

        acc[idx].bedTypes = acc[idx].bedTypes || new Set();
        acc[idx].childTypes = acc[idx].childTypes || new Set();

        if (item.roomRows && item.roomRows.length > 0) {
          item.roomRows.forEach(row => {
            const bedType = row.bedType || 'double';
            acc[idx].bedTypes.add(bedType);
            let baseRate = rates.double;
            if (bedType === 'single') baseRate = rates.single;
            else if (bedType === 'triple') baseRate = rates.triple;
            else if (bedType === 'quad') baseRate = rates.quad;
            else if (bedType === 'two_bedroom') baseRate = rates.twoB;
            else if (bedType === 'three_bedroom') baseRate = rates.threeB;
            else if (bedType === 'four_bedroom') baseRate = rates.fourB;

            const numRooms = parseInt(row.numRooms) || 1;
            const pax = parseInt(row.paxStaying) || 0;
            const extraPax = parseInt(row.extraBeds) || 0;
            const childStaying = row.showChildInput ? (parseInt(row.childStaying) || 0) : 0;

            const roomCost = numRooms * baseRate;
            const inRoomAdults = pax * numRooms;
            const roomChildren = childStaying * numRooms;
            const roomOccupants = inRoomAdults + roomChildren;

            if (roomOccupants > 0) {
              const costPerPax = roomCost / roomOccupants;
              const typeAdultCost = inRoomAdults * costPerPax;
              if (typeStats[bedType]) {
                typeStats[bedType].cost += typeAdultCost;
                typeStats[bedType].adults += inRoomAdults;
              }
              hotelAdultCost += typeAdultCost;
              hotelChildCost += roomChildren * costPerPax;
            }
            hotelExtraCost += extraPax * rates.extra;

            hotelInRoomAdults += inRoomAdults;
            hotelExtraAdults += extraPax;
            hotelChildCount += roomChildren;

            if (roomChildren > 0) acc[idx].childTypes.add('childStaying');
          });
        }

        const childWCost = counts.childW * rates.childW;
        const childNCost = counts.childN * rates.childN;
        if (counts.childW > 0) acc[idx].childTypes.add('childW');
        if (counts.childN > 0) acc[idx].childTypes.add('childN');

        const itemTotalWeight = hotelAdultCost + hotelExtraCost + hotelChildCost + childWCost + childNCost;
        let ratio = 1;
        if (itemTotalWeight > 0) {
          ratio = (Number(item.amount || 0)) / itemTotalWeight;
        }

        const perAdultCost = hotelInRoomAdults > 0 ? (hotelAdultCost / hotelInRoomAdults) : 0;
        const perExtraCost = hotelExtraAdults > 0 ? (hotelExtraCost / hotelExtraAdults) : perAdultCost;

        acc[idx].perAdultCost = (acc[idx].perAdultCost || 0) + perAdultCost * ratio;
        acc[idx].perExtraCost = (acc[idx].perExtraCost || 0) + perExtraCost * ratio;

        acc[idx].maxInRoomAdults = Math.max(acc[idx].maxInRoomAdults || 0, hotelInRoomAdults);
        acc[idx].maxExtraAdults = Math.max(acc[idx].maxExtraAdults || 0, hotelExtraAdults);
        acc[idx].maxTotalAdults = Math.max(acc[idx].maxTotalAdults || 0, hotelInRoomAdults + hotelExtraAdults);

        Object.keys(typeStats).forEach(key => {
          const stats = typeStats[key];
          acc[idx][`max_${key}_adults`] = Math.max(acc[idx][`max_${key}_adults`] || 0, stats.adults);
          acc[idx][`per_${key}_cost`] = (acc[idx][`per_${key}_cost`] || 0) + (stats.adults > 0 ? (stats.cost / stats.adults) * ratio : 0);
        });

        acc[idx].childWTotalCost = (acc[idx].childWTotalCost || 0) + childWCost * ratio;
        acc[idx].childNTotalCost = (acc[idx].childNTotalCost || 0) + childNCost * ratio;
        acc[idx].childTotalCost = (acc[idx].childTotalCost || 0) + hotelChildCost * ratio;

        acc[idx].childWDisplay = Math.max(acc[idx].childWDisplay || 0, counts.childW);
        acc[idx].childNDisplay = Math.max(acc[idx].childNDisplay || 0, counts.childN);
        acc[idx].childDisplay = Math.max(acc[idx].childDisplay || 0, hotelChildCount);
      }
    }
    return acc;
  }, createOptionInitialValue());

  const hotelOption = hotelOptionRaw.map(opt => {
    const totalA = opt.maxTotalAdults || 0;
    const extraA = opt.maxExtraAdults || 0;
    const regularA = Math.max(0, totalA - extraA);

    opt.adultDisplay = regularA;
    opt.extraDisplay = extraA;
    opt.adult = regularA;
    opt.extra = extraA;

    opt.childWDisplay = opt.childWDisplay || 0;
    opt.childNDisplay = opt.childNDisplay || 0;
    opt.childDisplay = opt.childDisplay || 0;

    opt.childW = opt.childWDisplay;
    opt.childN = opt.childNDisplay;
    opt.child = opt.childDisplay;

    opt.adultTotalCost = (opt.perAdultCost || 0) * regularA;
    opt.extraTotalCost = (opt.perExtraCost || 0) * extraA;

    const bedKeys = ['single', 'double', 'triple', 'quad', 'two_bedroom', 'three_bedroom', 'four_bedroom'];
    let hasSpecificBeds = false;
    bedKeys.forEach(k => {
      const count = opt[`max_${k}_adults`] || 0;
      if (count > 0) hasSpecificBeds = true;
      opt[`${k}Display`] = count;
      opt[k] = count;
      opt[`${k}TotalCost`] = (opt[`per_${k}_cost`] || 0) * count;
    });

    if (hasSpecificBeds) {
      opt.adultDisplay = 0;
      opt.adult = 0;
      opt.adultTotalCost = 0;
    }

    if (opt.bedTypes && opt.bedTypes.size === 1) {
      const bt = Array.from(opt.bedTypes)[0];
      const BED_TYPE_LABELS = {
        single: 'Person in Single Room',
        double: 'Person in Double sharing',
        triple: 'Person in Triple sharing',
        quad: 'Person in Quad sharing',
        two_bedroom: 'Person in 2-Bedroom ',
        three_bedroom: 'Person in 3-Bedroom',
        four_bedroom: 'Person in 4-Bedroom '
      };
      opt.adultLabel = BED_TYPE_LABELS[bt] || 'Person';
      opt.extraLabel = 'Person (Extra Bed)';
    } else {
      opt.adultLabel = 'Person';
      opt.extraLabel = 'Person (Extra Bed)';
    }

    opt.childLabel = 'Child';
    opt.childWLabel = 'Child (With Bed)';
    opt.childNLabel = 'Child (No Bed)';

    return opt;
  });

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
  const getPersonTypeRows = (item, shouldIncludeChildTransfer = false, optIdx = 0, markups = {}, exRate = 1, globalMode = 'val') => {
    let activeTypes = PERSON_TYPES.map((pt) => {
      const count = safeCount(item[pt.key]);
      const displayCount = safeCount(item[`${pt.key}Display`]);
      if (count <= 0) return null;
      const hotelRowCostAll = Number(item[`${pt.key}TotalCost`] || 0);
      const label = item[`${pt.key}Label`] || pt.label;
      return { pt: { ...pt, label }, count, displayCount, hotelRowCostAll };
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

    let actTransferBasePerAdult = 0;
    let actTransferBasePerChild = 0;
    let actTransferMarkupPerAdult = 0;
    let actTransferMarkupPerChild = 0;

    if (activeTypes.length === 0 && item.name === "Option 1") {
      const hotelAmount = item.amount || 0;
      if (adultCount > 0) activeTypes.push({ pt: { key: "adult", label: item.adultLabel || "Adult" }, count: adultCount, displayCount: adultCount, hotelRowCostAll: hotelAmount });
      if (childCount > 0) activeTypes.push({ pt: { key: "child", label: "Child" }, count: childCount, displayCount: childCount, hotelRowCostAll: 0 });
    }

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

        // 2. Add per-person rates
        if (rawType === 'activity') {
          if (schedItem.adultCost && schedItem.childCost && (Number(schedItem.adultCost) + Number(schedItem.childCost)) > 0) {
            // explicit costs for activities are total rates across all pax from the database
            const explicitAdultTotal = Number(schedItem.adultCost);
            const explicitChildTotal = Number(schedItem.childCost);
            const explicitTotal = explicitAdultTotal + explicitChildTotal;

            const adultMarkup = explicitTotal > 0 ? (trueMarkup * explicitAdultTotal / explicitTotal) : 0;
            const childMarkup = explicitTotal > 0 ? (trueMarkup * explicitChildTotal / explicitTotal) : 0;

            if (itemAdultCount > 0) {
              actTransferBasePerAdult += explicitAdultTotal / itemAdultCount;
              actTransferMarkupPerAdult += adultMarkup / itemAdultCount;
            }
            if (itemChildCount > 0) {
              actTransferBasePerChild += explicitChildTotal / itemChildCount;
              actTransferMarkupPerChild += childMarkup / itemChildCount;
            }
          } else {
            const perPaxBase = itemTotalCount > 0 ? trueBaseAmount / itemTotalCount : 0;
            const perPaxMarkup = itemTotalCount > 0 ? trueMarkup / itemTotalCount : 0;

            actTransferBasePerAdult += perPaxBase;
            actTransferBasePerChild += perPaxBase;
            actTransferMarkupPerAdult += perPaxMarkup;
            actTransferMarkupPerChild += perPaxMarkup;
          }
        } else if (rawType === 'transfer' || rawType === 'car') {
          const perPaxBase = totalTripPersons > 0 ? trueBaseAmount / totalTripPersons : 0;
          const perPaxMarkup = totalTripPersons > 0 ? trueMarkup / totalTripPersons : 0;

          if (shouldIncludeChildTransfer) {
            actTransferBasePerAdult += perPaxBase;
            actTransferBasePerChild += perPaxBase;
            actTransferMarkupPerAdult += perPaxMarkup;
            actTransferMarkupPerChild += perPaxMarkup;
          } else {
            // All to adults
            const perAdultBase = adultCount > 0 ? trueBaseAmount / adultCount : 0;
            const perAdultMarkup = adultCount > 0 ? trueMarkup / adultCount : 0;
            actTransferBasePerAdult += perAdultBase;
            actTransferMarkupPerAdult += perAdultMarkup;
          }
        } else {
          // General fallback
          const perPaxBase = totalTripPersons > 0 ? trueBaseAmount / totalTripPersons : 0;
          const perPaxMarkup = totalTripPersons > 0 ? trueMarkup / totalTripPersons : 0;
          actTransferBasePerAdult += perPaxBase;
          actTransferBasePerChild += perPaxBase;
          actTransferMarkupPerAdult += perPaxMarkup;
          actTransferMarkupPerChild += perPaxMarkup;
        }
      }
    });

    // If global childCount is 0, we fallback to adult's per-person rate for hypothetical child display
    if (childCount === 0) {
      actTransferBasePerChild = actTransferBasePerAdult;
      actTransferMarkupPerChild = actTransferMarkupPerAdult;
    }

    const useBaseMarkup = Number(values.baseMarkup) > 0;
    const useExtraMarkup = !useBaseMarkup && Number(values.extraMarkup) > 0;
    const extraMarkupValue = useExtraMarkup ? Number(values.extraMarkup) * exRate : 0;

    const rowsWithNet = activeTypes.map(({ pt, count, displayCount, hotelRowCostAll }) => {
      const isPerMode = values.priceOption?.value === "PER";
      const sharingFactor = 1;

      const hotelFraction = (item.amount || 0) > 0 ? hotelRowCostAll / item.amount : 0;
      const hotelLineMarkup = Number(item.markup || 0);

      const rowHotelNet = hotelRowCostAll;
      const rowHotelMarkup = hotelLineMarkup * hotelFraction;

      const isChildType = pt.key === 'child' || pt.key === 'childW' || pt.key === 'childN';
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
    const occupancyFactors = { adult: 1, extra: 1, child: 1 };

    const hotelRows = rowsWithNet.map((r) => {
      let finalMarkup = r.originalMarkup;
      let finalMarkupMode = 'val';
      let finalMarkupPercent = null;

      if (isPERMode) {
        let customObj = markups[`${optIdx}_${r.pt.key}`];
        if (customObj === undefined && r.pt.key !== 'adult' && r.pt.key !== 'child' && r.pt.key !== 'childW' && r.pt.key !== 'childN') {
           customObj = markups[`${optIdx}_adult`];
        }
        if (customObj !== undefined && customObj !== "") {
          const customVal = typeof customObj === 'object' ? customObj.value : customObj;
          const customRate = typeof customObj === 'object' ? customObj.rate : exRate;
          const mode = globalMode;
          if (customVal !== "") {
            finalMarkupMode = mode;
            if (mode === 'pct') {
              finalMarkupPercent = Number(customVal);
              finalMarkup = r.netCost * (finalMarkupPercent / 100);
            } else {
              const perPersonInBase = Number(customVal) * customRate;
              const pCount = r.displayCount * (occupancyFactors[r.pt.key] || 1);
              finalMarkup = perPersonInBase * pCount;
            }
          }
        }
      } else {
        const customObj = markups[`${optIdx}_total`];
        if (customObj !== undefined && customObj !== "") {
          const customVal = typeof customObj === 'object' ? customObj.value : customObj;
          const customRate = typeof customObj === 'object' ? customObj.rate : exRate;
          const mode = globalMode;
          if (customVal !== "") {
            finalMarkupMode = mode;
            if (mode === 'pct') {
              finalMarkupPercent = Number(customVal);
              const ratio = optionTotalNetCost > 0 ? r.netCost / optionTotalNetCost : (1 / rowsWithNet.length);
              finalMarkup = optionTotalNetCost * (finalMarkupPercent / 100) * ratio;
            } else {
              const totalMarkupInBase = Number(customVal) * customRate;
              const ratio = optionTotalNetCost > 0 ? r.netCost / optionTotalNetCost : (1 / rowsWithNet.length);
              finalMarkup = totalMarkupInBase * ratio;
            }
          }
        }
      }

      return {
        key: r.pt.key,
        label: r.pt.label,
        count: r.displayCount,
        markup: finalMarkup,           // keep full precision — display layer rounds for UI
        markup_mode: finalMarkupMode,
        markup_percent: finalMarkupPercent,
        vat: getVatDisplay(),
        total: r.netCost + finalMarkup, // keep full precision — display layer rounds for UI
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
        const pRows = getPersonTypeRows(item, includeChildTransfer, optIdx, customMarkups, rate, globalMarkupMode);
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
            markup_mode: pt.markup_mode,
            markup_percent: pt.markup_percent,
            vat: pt.vat,
            total: getRoundOfValue(itemizedTotal)
          };
        });

        const newGrandTotal = mappedRows.reduce((sum, r) => sum + r.total, 0);
        
        // Find total mode settings from the first row (since it's an option-level setting in TOTAL mode)
        const totalMode = pRows[0]?.markup_mode;
        const totalPercent = pRows[0]?.markup_percent;

        return {
          optionName: item.name,
          grandTotal: getRoundOfValue(newGrandTotal),
          currencyCode: currentCurrencyCode,
          currencySymbol: currentCurrencySymbol,
          exchange_rate: rate,
          markup_mode: totalMode,
          markup_percent: totalPercent,
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
      setFieldValue("exchange_rate", rate);

      let entryIndex = 0;
      values.planArr?.forEach(({ schedule }) => {
        schedule.forEach((data) => {
          if (!data.entryId) return; // Skip items without entry ID
          formData.append(`entries[${entryIndex}][id]`, checkFormValue(data.entryId));
          // Always send the canonical TOTAL amount (base_amount) to the backend.
          // This is what the backend stores, and what it returns on the next load.
          const canonicalAmount = data.baseAmount !== undefined ? data.baseAmount : data.amount;
          const canonicalMarkup = data.baseMarkup !== undefined ? data.baseMarkup : (data.markup || 0);
          formData.append(`entries[${entryIndex}][amount]`, checkFormValue(canonicalAmount) || 0);
          formData.append(`entries[${entryIndex}][markup]`, checkFormValue(data.markup) || 0);
          // Send base_amount/base_markup explicitly so backend can persist them
          formData.append(`entries[${entryIndex}][base_amount]`, checkFormValue(canonicalAmount) || 0);
          formData.append(`entries[${entryIndex}][base_markup]`, checkFormValue(canonicalMarkup) || 0);
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
                              quad: Number(selectedRoom?.quad_bed_amount || 0),
                              twoB: Number(selectedRoom?.two_bedroom_amount || 0),
                              threeB: Number(selectedRoom?.three_bedroom_amount || 0),
                              fourB: Number(selectedRoom?.four_bedroom_amount || 0)
                            };
                            const counts = {
                              extra: safeCount(item.extra),
                              childW: safeCount(item.childW),
                              childN: safeCount(item.childN),
                            };

                            // Track per-bed-type cost separately so mixed configs (double + single) show separate rows
                            const BED_TYPE_LABELS = {
                              single: 'Adult (Single Room)',
                              double: 'Adult (Double Sharing)',
                              triple: 'Adult (Triple Sharing)',
                              quad: 'Adult (Quad Sharing)',
                              two_bedroom: 'Adult (2-Bedroom)',
                              three_bedroom: 'Adult (3-Bedroom)',
                              four_bedroom: 'Adult (4-Bedroom)',
                            };

                            const bedTypeGroups = {}; // { bedType: { netCost, count } }
                            let extraNetCost = 0;
                            let extraCount = 0;
                            let childNetCost = 0;
                            let childCount = 0;

                            if (item.roomRows && item.roomRows.length > 0) {
                              item.roomRows.forEach(row => {
                                const bedType = row.bedType || 'double';
                                let baseRate = rates.double;
                                if (bedType === 'single') baseRate = rates.single;
                                else if (bedType === 'triple') baseRate = rates.triple;
                                else if (bedType === 'quad') baseRate = rates.quad;
                                else if (bedType === 'two_bedroom') baseRate = rates.twoB;
                                else if (bedType === 'three_bedroom') baseRate = rates.threeB;
                                else if (bedType === 'four_bedroom') baseRate = rates.fourB;

                                const numRooms = parseInt(row.numRooms) || 1;
                                const pax = parseInt(row.paxStaying) || 0;
                                const childStaying = row.showChildInput ? (parseInt(row.childStaying) || 0) : 0;
                                const extraPax = parseInt(row.extraBeds) || 0;

                                const roomCost = numRooms * baseRate;
                                // Room cost shared only between in-room occupants (NOT extra bed adults)
                                const inRoomAdults = pax * numRooms;
                                const roomChildren = childStaying * numRooms;
                                const roomOccupants = inRoomAdults + roomChildren;

                                // Group in-room adult cost by bed type
                                if (!bedTypeGroups[bedType]) bedTypeGroups[bedType] = { netCost: 0, count: 0 };
                                if (roomOccupants > 0) {
                                  const costPerPax = roomCost / roomOccupants;
                                  bedTypeGroups[bedType].netCost += inRoomAdults * costPerPax;
                                  childNetCost += roomChildren * costPerPax;
                                }
                                bedTypeGroups[bedType].count += inRoomAdults;
                                // Extra bed adults each pay their own fixed rate
                                extraNetCost += extraPax * rates.extra;
                                extraCount += extraPax;
                                childCount += roomChildren;
                              });
                            }

                            const childWCost = counts.childW * rates.childW;
                            const childNCost = counts.childN * rates.childN;

                            const totalInRoomAdultCost = Object.values(bedTypeGroups).reduce((s, g) => s + g.netCost, 0);
                            const totalComputedWeight = totalInRoomAdultCost + extraNetCost + childNetCost + childWCost + childNCost;
                            let ratio = 1;
                            if (totalComputedWeight > 0) {
                              ratio = Number(item.amount || 0) / totalComputedWeight;
                            }

                            const markupRatio = Number(item.amount || 0) > 0 ? (Number(item.markup || 0) / Number(item.amount || 0)) : 0;

                            breakdownData = [];
                            // One row per bed config type
                            const BED_ORDER = ['single', 'double', 'triple', 'quad', 'two_bedroom', 'three_bedroom', 'four_bedroom'];
                            BED_ORDER.forEach(bt => {
                              const grp = bedTypeGroups[bt];
                              if (grp && grp.count > 0) {
                                const netPerPax = (grp.netCost * ratio) / grp.count;
                                breakdownData.push({
                                  key: bt,
                                  label: BED_TYPE_LABELS[bt] || 'Adult rate',
                                  net: displayAmount(netPerPax),
                                  gross: displayAmount(netPerPax * (1 + markupRatio))
                                });
                              }
                            });
                            if (extraCount > 0) {
                              const netPerExtra = (extraNetCost * ratio) / extraCount;
                              breakdownData.push({
                                key: 'extra',
                                label: 'Adult (Extra Bed) rate',
                                net: displayAmount(netPerExtra),
                                gross: displayAmount(netPerExtra * (1 + markupRatio))
                              });
                            }
                            if (childCount > 0) {
                              const netPerChild = (childNetCost * ratio) / childCount;
                              breakdownData.push({
                                key: 'child',
                                label: 'Child rate',
                                net: displayAmount(netPerChild),
                                gross: displayAmount(netPerChild * (1 + markupRatio))
                              });
                            }
                            if (counts.childW > 0) {
                              const netPerChildW = (childWCost * ratio) / counts.childW;
                              breakdownData.push({
                                key: 'childW',
                                label: 'Child (With Bed) rate',
                                net: displayAmount(netPerChildW),
                                gross: displayAmount(netPerChildW * (1 + markupRatio))
                              });
                            }
                            if (counts.childN > 0) {
                              const netPerChildN = (childNCost * ratio) / counts.childN;
                              breakdownData.push({
                                key: 'childN',
                                label: 'Child (Without Bed) rate',
                                net: displayAmount(netPerChildN),
                                gross: displayAmount(netPerChildN * (1 + markupRatio))
                              });
                            }
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
                                      value={firstBreakdown && values.priceOption?.value === "PER" ? displayAmount(firstBreakdown.net) : displayAmount(item.amount)}
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
                                    firstBreakdown && values.priceOption?.value === "PER" ? displayAmount(firstBreakdown.gross) : getRoundOfValue(item.amount + item.markup)
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
                                    <td className="px-4 py-0 border-0 align-middle" style={{ border: "none" }}>
                                      <span className="text-dark" style={{ fontSize: "11px", fontWeight: 500, paddingLeft: "48px", color: "#64748b" }}>
                                        <i className="fa-solid fa-turn-up fa-rotate-90 me-2 opacity-50"></i>
                                        {row.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-0 border-0 align-middle" style={{ border: "none" }}></td>
                                    <td className="px-4 py-0 border-0 align-middle text-end" style={{ border: "none" }}>
                                      <input
                                        className="form-control form-control-sm text-end fw-bold text-dark"
                                        type="number"
                                        value={displayAmount(row.net)}
                                        disabled={readOnly || isTransferPer}
                                        onChange={(e) => isHotelPer ? handleHotelPaxPriceChange(planArrInd, scheduleInd, row.key, e.target.value) : null}
                                        style={{ border: "1px solid transparent", backgroundColor: "transparent", borderRadius: "4px", width: "100%", fontSize: "12px", padding: "2px 8px", minHeight: "24px" }}
                                        onFocus={(e) => { if (isHotelPer && !readOnly) { e.target.style.border = "1px solid #0d6efd"; e.target.style.backgroundColor = "#fff"; } }}
                                        onBlur={(e) => { e.target.style.border = "1px solid transparent"; e.target.style.backgroundColor = "transparent"; handleBlur(e); }}
                                      />
                                    </td>
                                    <td className="px-4 py-0 border-0 align-middle text-end" style={{ border: "none" }}>
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
                    <th className="py-3 px-4 text-dark" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", color: "#64748b", width: "20%" }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span>Markup</span>
                        {!readOnly && (
                          <select
                            className="form-select form-select-sm ms-2 flex-shrink-0 shadow-none"
                            style={{ width: 'auto', fontSize: '11px', padding: '2px 20px 2px 8px', backgroundPosition: 'right 4px center', borderColor: '#cbd5e1', cursor: 'pointer', height: '24px', lineHeight: '1' }}
                            value={globalMarkupMode}
                            onChange={(e) => setGlobalMarkupMode(e.target.value)}
                          >
                            <option value="val">Value ({values.priceIn?.symbol || getSymbol(values.priceIn?.to_currency || values.priceIn?.label || "USD")})</option>
                            <option value="pct">Percent (%)</option>
                          </select>
                        )}
                      </div>
                    </th>
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
                      const personRows = getPersonTypeRows(item, includeChildTransfer, optIdx, customMarkups, rateToUse, globalMarkupMode);
                      const currSymbol = values.priceIn?.symbol || getSymbol(values.priceIn?.to_currency || values.priceIn?.label || baseCode);
                      const convert = (val) => hasConversion ? getRoundOfValue(val / exchangeRate) : val;

                      const occupancyFactors = { adult: 1, extra: 1, child: 1 };
                      const isPERModeGT = values.priceOption?.value === "PER";
                      const grandTotal = getRoundOfValue(personRows.reduce((sum, pt) => {
                        const pCount = pt.count * (occupancyFactors[pt.key] || 1);
                        return sum + (convert(pt.netCost) / pCount) + (convert(pt.markup) / pCount);
                      }, 0));
                      const grandMarkup = getRoundOfValue(personRows.reduce((sum, pt) => sum + convert(pt.markup) / (pt.count * (occupancyFactors[pt.key] || 1)), 0));
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
                              {!readOnly ? (() => {
                                const totKey = `${optIdx}_total`;
                                const totObj = customMarkups[totKey];
                                const totRawVal = totObj !== undefined
                                  ? (typeof totObj === 'object'
                                    ? (totObj.value === '' ? '' : (
                                        globalMarkupMode === 'pct'
                                          ? totObj.value
                                          : getRoundOfValue((Number(totObj.value) * (totObj.rate || rateToUse)) / rateToUse)
                                      ))
                                    : totObj)
                                  : grandMarkup;
                                return (
                                  <div className="d-flex align-items-center justify-content-end gap-1">
                                    <input
                                      type="number"
                                      className="form-control form-control-sm text-end p-1"
                                      style={{ width: '70px', display: 'inline-block' }}
                                      placeholder={globalMarkupMode === 'pct' ? '0 %' : '0'}
                                      value={totRawVal}
                                      onChange={(e) => setCustomMarkups(prev => ({
                                        ...prev,
                                        [totKey]: { value: e.target.value, rate: rateToUse, mode: globalMarkupMode }
                                      }))}
                                    />
                                    <span style={{ fontSize: '11px', color: '#666', minWidth: '12px' }}>{globalMarkupMode === 'pct' ? '%' : ''}</span>
                                  </div>
                                );
                              })() : (
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

                              <td style={{ paddingLeft: "16px", color: "#333", borderRight: '0.5px solid #e2e8f0', fontWeight: 500 }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <span>{pt.label}</span>
                                  {(pt.label === "Adult" || pt.label === "Child") && pt.count > 0 && (
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

                              <td className="text-end pe-3" style={{ borderRight: '0.5px solid #e2e8f0', color: "#374151" }}>
                                {!readOnly ? (() => {
                                const rowKey = `${optIdx}_${pt.key}`;
                                const rowObj = customMarkups[rowKey];
                                const defaultMarkupVal = getRoundOfValue(convert(pt.markup) / (pt.count * (occupancyFactors[pt.key] || 1)));
                                const rowRawVal = rowObj !== undefined
                                  ? (typeof rowObj === 'object'
                                    ? (rowObj.value === '' ? '' : (
                                        globalMarkupMode === 'pct'
                                          ? rowObj.value
                                          : getRoundOfValue((Number(rowObj.value) * (rowObj.rate || rateToUse)) / rateToUse)
                                      ))
                                    : rowObj)
                                  : defaultMarkupVal;
                                return (
                                  <div className="d-flex align-items-center justify-content-end gap-1">
                                    <input
                                      type="number"
                                      className="form-control form-control-sm text-end p-1"
                                      style={{ width: '70px', display: 'inline-block' }}
                                      placeholder={globalMarkupMode === 'pct' ? '0 %' : '0'}
                                      value={rowRawVal}
                                      onChange={(e) => setCustomMarkups(prev => ({
                                        ...prev,
                                        [rowKey]: { value: e.target.value, rate: rateToUse, mode: globalMarkupMode }
                                      }))}
                                    />
                                    <span style={{ fontSize: '11px', color: '#666', minWidth: '12px' }}>{globalMarkupMode === 'pct' ? '%' : ''}</span>
                                  </div>
                                );
                              })() : (
                                <>{currSymbol} {getRoundOfValue(convert(pt.markup) / (pt.count * (occupancyFactors[pt.key] || 1)))}</>
                              )}
                              </td>

                              {/* VAT */}
                              <td className="text-end pe-3" style={{ borderRight: '0.5px solid #e2e8f0', color: "#374151" }}>{pt.vat} %</td>

                              {/* Total per person: net and markup converted separately, then summed */}
                              <td className="text-end pe-3 text-dark" style={{ fontWeight: 600 }}>
                                {currSymbol} {getRoundOfValue(
                                  (convert(pt.netCost) / (pt.count * (occupancyFactors[pt.key] || 1))) +
                                  (convert(pt.markup) / (pt.count * (occupancyFactors[pt.key] || 1)))
                                )}
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