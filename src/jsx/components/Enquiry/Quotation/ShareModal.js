import React, { useEffect, useState } from "react";
import CustomModal from "../../../layouts/CustomModal";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useFormik } from "formik";

const ShareModal = ({ setShowModal, showModal, packageData }) => {
  const initialValues = {
    mode: "whatsapp",
    priceBreakup: true,
    hideTotalPrice: false,
    itinerary: true,
    terms: false,
    name: packageData?.enquiry?.name || packageData?.enquiry?.customer_name || "",
    email: packageData?.enquiry?.email || "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const { values, handleChange, handleBlur, setFieldValue } = formik;
  const [generatedText, setGeneratedText] = useState("");

  const formatShortDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // ----- Shared data extraction -----
  const extractPackageInfo = () => {
    if (!packageData) return null;

    const rawTripId = packageData.seq || packageData.itinerary_no || packageData.enquiry?.seq || packageData.itineraryId || "TBA";
    const tripId = String(rawTripId).includes("-") && String(rawTripId).length > 20
      ? rawTripId.split("-")[0]
      : rawTripId;
    const packageName = packageData.packageName || "Trip Package";

    const startDate = packageData.formStartDate ? new Date(packageData.formStartDate) : new Date();
    const endDate = packageData.formEndDate ? new Date(packageData.formEndDate) : new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(endDate - startDate);
    const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
    const daysCount = nightsCount + 1;

    const adultCount = packageData.adult || 0;
    const childCount = packageData.child || 0;
    const refId = packageData.enquiry?.ref_no || "";
    const clientName = values.name || "Customer";

    let currencyCode = "USD";
    if (packageData.priceIn && packageData.priceIn.to_currency) {
      currencyCode = packageData.priceIn.to_currency;
    } else if (packageData.priceIn?.label && String(packageData.priceIn.label).length < 15) {
      currencyCode = String(packageData.priceIn.label).split(" ")[0];
    } else if (packageData.baseCurrency && String(packageData.baseCurrency).length < 15) {
      currencyCode = packageData.baseCurrency;
    } else if (packageData.currency && String(packageData.currency).length < 15) {
      currencyCode = packageData.currency;
    }

    const grandTotal = parseFloat(packageData.converted_total || packageData.grand_total || packageData.total_amount || 0);
    const pricePerPerson = adultCount > 0 ? (grandTotal / adultCount).toFixed(0) : 0;

    return {
      tripId, packageName, startDate, endDate, nightsCount, daysCount,
      adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson
    };
  };

  // ----- Hotel & Activity grouping -----
  const getGroupedHotels = () => {
    if (!packageData?.planArr) return [];
    const hotelsGrouped = [];
    let currentHotel = null;

    packageData.planArr.forEach((day, index) => {
      const dayDate = new Date(day.date);
      day.schedule?.forEach((item) => {
        if (item.insertType === "hotel" || item?.insertType?.toLowerCase() === "hotel") {
          const hName = item.name || item.hotel_name;
          if (currentHotel && currentHotel.name === hName) {
            currentHotel.nights.push(index + 1);
            currentHotel.checkOutDate = new Date(dayDate.getTime() + 86400000);
          } else {
            if (currentHotel) hotelsGrouped.push(currentHotel);
            currentHotel = {
              name: hName,
              location: item.dayDestination?.label || item.subDestination?.name || "Destination",
              star: item.starRating || "4 Star",
              nights: [index + 1],
              checkInDate: dayDate,
              checkOutDate: new Date(dayDate.getTime() + 86400000),
              meal: item.mealPlan?.label || item.mealPlan?.name || "Bed and Breakfast",
              room: item.roomType?.label || item.roomType?.name || "Deluxe Room",
            };
          }
        }
      });
    });
    if (currentHotel) hotelsGrouped.push(currentHotel);
    return hotelsGrouped;
  };

  const getActivitiesByDay = () => {
    if (!packageData?.planArr) return [];
    const result = [];
    packageData.planArr.forEach((day, index) => {
      const items = day.schedule?.filter((v) => v.insertType !== "hotel" && v?.insertType?.toLowerCase() !== "hotel") || [];
      if (items.length > 0) {
        const dayDate = new Date(day.date);
        result.push({ dayIndex: index, dayDate, items });
      }
    });
    return result;
  };

  // ----- WhatsApp Text Generator -----
  const generateWhatsAppText = () => {
    const info = extractPackageInfo();
    if (!info) return "";

    const { tripId, packageName, startDate, nightsCount, daysCount, adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson } = info;

    let text = `Hi ${clientName},\n\n`;
    text += `Greetings from TIC Tours.\n\n`;
    text += `Thank you for your query with us. As per your requirements, following are the package details.\n\n`;

    text += `*Trip ID ${tripId}*\n`;
    text += `----------\n`;
    text += `*${packageName}*\n`;
    text += `• *${startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}* _for_ *${nightsCount} Nights, ${daysCount} Days*\n`;
    text += `• *${adultCount} Adults*${childCount > 0 ? ` and ${childCount} Child` : ""}\n`;
    if (refId) text += `• *Ref ID: ${refId}*\n`;
    text += `\n`;

    if (!values.hideTotalPrice) {
      text += `*Price (${currencyCode}):*\n`;
      if (values.priceBreakup) {
        text += `• *${parseFloat(pricePerPerson).toLocaleString()} / Person (Double Sharing)* x ${adultCount} Pax\n`;
      }
      text += `*Total: ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /-* _(exc. Vat)_\n\n`;
    }

    if (values.itinerary && packageData.planArr) {
      const hotelsGrouped = getGroupedHotels();
      if (hotelsGrouped.length > 0) {
        text += `🏨  *_Hotels_*\n`;
        text += `-----------\n`;
        hotelsGrouped.forEach((h) => {
          const nightsArray = h.nights.map((n) => getOrdinal(parseInt(n)));
          const nightsStr = nightsArray.join(", ") + " Nights";
          text += `*${nightsStr}* _at_ *${h.location}*\n`;
          text += `_Check-in: ${formatShortDate(h.checkInDate)}_ & _Check-out: ${formatShortDate(h.checkOutDate)}_\n`;
          text += `*${h.name}* (${h.star})\n`;
          text += `${h.meal} • ${Math.ceil(adultCount / 2) || 1} ${h.room} (${adultCount} Pax)\n\n`;
        });
      }

      const activeDays = getActivitiesByDay();
      if (activeDays.length > 0) {
        text += `🚖  *Transportation and Activities*\n`;
        text += `-----------\n`;
        activeDays.forEach(({ dayIndex, dayDate, items }) => {
          const dayStr = dayDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "2-digit" });
          text += `*${getOrdinal(dayIndex + 1)} Day - ${dayStr}*\n`;
          items.forEach((item) => {
            const itemTypeLabel = item.insertType === "activity" ? "Tour" : "Meals/Transit";
            text += `• ${item.name} - ${itemTypeLabel} _(${adultCount} Adults)_\n`;
          });
          text += `\n`;
        });
      }
    }

    if (values.terms) {
      text += `*Terms and Conditions:*\nStandard cancellation and policies apply. Subject to availability.\n\n`;
    }

    return text.trim();
  };

  // ----- Email Text Generator (plain text, no markdown formatting) -----
  const generateEmailText = () => {
    const info = extractPackageInfo();
    if (!info) return "";

    const { tripId, packageName, startDate, nightsCount, daysCount, adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson } = info;

    let text = `Dear ${clientName},\n\n`;
    text += `Greetings from TIC Tours!\n\n`;
    text += `Thank you for your enquiry. Please find below the package details as per your requirements.\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `TRIP ID: ${tripId}\n`;
    text += `PACKAGE: ${packageName}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `Travel Dates: ${startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} — ${nightsCount} Nights / ${daysCount} Days\n`;
    text += `Travellers: ${adultCount} Adults${childCount > 0 ? `, ${childCount} Children` : ""}\n`;
    if (refId) text += `Reference ID: ${refId}\n`;
    text += `\n`;

    if (!values.hideTotalPrice) {
      text += `── PRICING (${currencyCode}) ──────────────\n`;
      if (values.priceBreakup) {
        text += `  Per Person (Double Sharing): ${parseFloat(pricePerPerson).toLocaleString()} x ${adultCount} Pax\n`;
      }
      text += `  Grand Total: ${currencyCode} ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /- (excl. VAT)\n\n`;
    }

    if (values.itinerary && packageData.planArr) {
      const hotelsGrouped = getGroupedHotels();
      if (hotelsGrouped.length > 0) {
        text += `── ACCOMMODATION ──────────────\n`;
        hotelsGrouped.forEach((h) => {
          const nightsArray = h.nights.map((n) => getOrdinal(parseInt(n)));
          const nightsStr = nightsArray.join(", ") + " Night(s)";
          text += `\n  ${nightsStr} at ${h.location}\n`;
          text += `  Hotel: ${h.name} (${h.star})\n`;
          text += `  Check-in: ${formatShortDate(h.checkInDate)} | Check-out: ${formatShortDate(h.checkOutDate)}\n`;
          text += `  Room: ${Math.ceil(adultCount / 2) || 1}x ${h.room} | Meal Plan: ${h.meal}\n`;
        });
        text += `\n`;
      }

      const activeDays = getActivitiesByDay();
      if (activeDays.length > 0) {
        text += `── ACTIVITIES & TRANSFERS ─────\n`;
        activeDays.forEach(({ dayIndex, dayDate, items }) => {
          const dayStr = dayDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
          text += `\n  Day ${dayIndex + 1} — ${dayStr}\n`;
          items.forEach((item) => {
            const itemTypeLabel = item.insertType === "activity" ? "Tour" : "Transfer";
            text += `    • ${item.name} (${itemTypeLabel}) — ${adultCount} Adults\n`;
          });
        });
        text += `\n`;
      }
    }

    if (values.terms) {
      text += `── TERMS & CONDITIONS ────────\n`;
      text += `  • Standard cancellation and refund policies apply.\n`;
      text += `  • All bookings are subject to availability.\n`;
      text += `  • Prices may vary based on seasonal changes.\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `For any queries, please feel free to reach out to us.\n\n`;
    text += `Warm Regards,\n`;
    text += `TIC Tours Team\n`;

    return text.trim();
  };

  const generateEmailSubject = () => {
    const info = extractPackageInfo();
    if (!info) return "Your Travel Package from TIC Tours";
    return `${info.packageName} — ${info.nightsCount}N/${info.daysCount}D | Trip ID: ${info.tripId} | TIC Tours`;
  };

  // ----- Regenerate text when toggles/mode change -----
  useEffect(() => {
    if (values.mode === "whatsapp") {
      setGeneratedText(generateWhatsAppText());
    } else {
      setGeneratedText(generateEmailText());
    }
  }, [
    values.priceBreakup,
    values.hideTotalPrice,
    values.itinerary,
    values.terms,
    values.name,
    packageData,
    values.mode
  ]);

  // ----- Action handlers -----
  const handleWhatsAppSend = () => {
    if (!generatedText) return;
    const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`;
    window.open(url, "_blank");
    setShowModal(false);
  };

  const handleEmailSend = () => {
    const subject = encodeURIComponent(generateEmailSubject());
    const body = encodeURIComponent(generatedText);
    const toEmail = values.email ? encodeURIComponent(values.email) : "";
    const mailtoUrl = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, "_self");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText).then(() => {
      notifyCreate("Copied to clipboard", true);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      notifyError("Failed to copy text");
    });
  };

  // ----- Toggle checkboxes config -----
  const toggleOptions = [
    { id: "priceBreakup", label: "Price Breakup", field: "priceBreakup" },
    { id: "hideTotalPrice", label: "Hide Price", field: "hideTotalPrice" },
    { id: "itinerary", label: "Itinerary", field: "itinerary" },
    { id: "terms", label: "Terms", field: "terms" },
  ];

  const isWhatsApp = values.mode === "whatsapp";

  return (
    <CustomModal
      showModal={showModal}
      title={"Share Package"}
      handleModalClose={() => setShowModal(false)}
      className="modal-lg"
    >
      <div className="card-body p-4">
        {/* ── Mode Tabs ── */}
        <div className="d-flex align-items-center mb-3">
          <button
            className={`btn btn-sm me-2 ${isWhatsApp ? 'btn-success' : 'btn-outline-secondary'}`}
            type="button"
            onClick={() => setFieldValue("mode", "whatsapp")}
            style={{ borderRadius: "20px", padding: "6px 18px" }}
          >
            <i className="fa-brands fa-whatsapp me-2"></i>
            WhatsApp
          </button>
          <button
            className={`btn btn-sm ${!isWhatsApp ? 'btn-primary' : 'btn-outline-secondary'}`}
            type="button"
            onClick={() => setFieldValue("mode", "email")}
            style={{ borderRadius: "20px", padding: "6px 18px" }}
          >
            <i className="fa-regular fa-envelope me-2"></i>
            Email
          </button>
        </div>

        {/* ── Info hint ── */}
        <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
          <i className="fa fa-info-circle me-1"></i>
          {isWhatsApp
            ? "Customize the WhatsApp message using the toggles below, then send or copy."
            : "Preview your email content below. You can copy it or open it directly in your mail client."
          }
        </p>

        {/* ── Toggle Options ── */}
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: "1px solid #e9ecef" }}>
          {toggleOptions.map((opt) => (
            <div className="form-check form-switch" key={opt.id}>
              <input
                type="checkbox"
                className="form-check-input"
                id={`${opt.id}_${values.mode}`}
                checked={values[opt.field]}
                onChange={(e) => setFieldValue(opt.field, e.target.checked)}
                role="switch"
              />
              <label className="form-check-label ms-1 small" htmlFor={`${opt.id}_${values.mode}`}>{opt.label}</label>
            </div>
          ))}
        </div>

        {/* ── Email "To" field (only in email mode) ── */}
        {!isWhatsApp && (
          <div className="mb-3">
            <label className="form-label small fw-semibold mb-1">Recipient Email</label>
            <input
              type="email"
              className="form-control form-control-sm"
              placeholder="Enter recipient email address"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ maxWidth: "400px", borderRadius: "8px" }}
            />
          </div>
        )}

        {/* ── Preview Box ── */}
        <div
          className="p-3 mb-3 rounded"
          style={{
            backgroundColor: isWhatsApp ? "#e7f5e7" : "#f0f4ff",
            border: `1px solid ${isWhatsApp ? "#b7ddb7" : "#c5d3f0"}`,
            minHeight: "220px",
            maxHeight: "400px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontSize: "13px",
            color: "#333",
            fontFamily: isWhatsApp ? "inherit" : "'Segoe UI', sans-serif",
            lineHeight: "1.6",
          }}
        >
          {generatedText || <span className="text-muted">No content to preview.</span>}
        </div>

        {/* ── Action Buttons ── */}
        <div className="d-flex align-items-center flex-wrap gap-2">
          {isWhatsApp ? (
            <>
              <button className="btn btn-success" onClick={handleWhatsAppSend}>
                <i className="fa-brands fa-whatsapp me-2"></i> Send on WhatsApp
              </button>
              <button className="btn btn-outline-secondary" onClick={handleCopy}>
                <i className="fa-regular fa-copy me-2"></i> Copy
              </button>
              <span
                className="ms-auto text-primary small"
                style={{ cursor: "pointer" }}
                onClick={() => setFieldValue("mode", "email")}
              >
                <i className="fa-regular fa-envelope me-1"></i> Switch to Email
              </span>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleEmailSend}>
                <i className="fa-regular fa-paper-plane me-2"></i> Send via Email
              </button>
              <button className="btn btn-outline-secondary" onClick={handleCopy}>
                <i className="fa-regular fa-copy me-2"></i> Copy
              </button>
              <span
                className="ms-auto text-success small"
                style={{ cursor: "pointer" }}
                onClick={() => setFieldValue("mode", "whatsapp")}
              >
                <i className="fa-brands fa-whatsapp me-1"></i> Switch to WhatsApp
              </span>
            </>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default ShareModal;
