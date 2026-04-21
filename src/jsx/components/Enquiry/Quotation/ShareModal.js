import React, { useEffect, useState, useRef } from "react";
import CustomModal from "../../../layouts/CustomModal";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useFormik } from "formik";
import { formatDate, parseTime } from "../../../utilis/date";
import { URLS } from "../../../../constants/Urls";
import { axiosGet } from "../../../../services/AxiosInstance";

const ShareModal = ({ setShowModal, showModal, packageData }) => {
  const initialValues = {
    mode: "whatsapp",
    priceBreakup: true,
    hideTotalPrice: false,
    itinerary: true,
    terms: false,
    name: packageData?.enquiry?.name || packageData?.enquiry?.customer_name || "",
    email: packageData?.enquiry?.email || "",
    subject: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const { values, handleChange, handleBlur, setFieldValue } = formik;
  const [generatedText, setGeneratedText] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showMailSetup, setShowMailSetup] = useState(false);
  const emailPreviewRef = useRef(null);

  const formatShortDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const formatFullDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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
    const priceInVal = packageData.priceIn?.value;
    const priceInLabel = packageData.priceIn?.label;
    const isBase = priceInVal === "base" || String(priceInLabel).toLowerCase() === "base";

    if (!isBase && packageData.priceIn?.to_currency) {
      // Converted currency selected (e.g. USD, EUR) — use its code
      currencyCode = packageData.priceIn.to_currency;
    } else if (packageData.baseCurrency && String(packageData.baseCurrency).length < 15) {
      // Base currency or "base" value — resolve from baseCurrency field
      currencyCode = packageData.baseCurrency;
    } else if (!isBase && priceInLabel && String(priceInLabel).length < 15) {
      // Fallback: use the label (strip suffix like "(Base)")
      currencyCode = String(priceInLabel).split(" ")[0];
    } else if (packageData.currency && String(packageData.currency).length < 15) {
      currencyCode = packageData.currency;
    }

    // Determine base grand total
    const baseGrandTotal = parseFloat(packageData.grand_total || packageData.total_amount || 0);
    let grandTotal = baseGrandTotal;

    // Apply dynamic conversion if a converted currency (with exchange_rate) is selected
    const exchangeRate = parseFloat(packageData.priceIn?.exchange_rate) || 0;
    if (!isBase && exchangeRate > 0) {
      grandTotal = baseGrandTotal / exchangeRate;
    } else if (packageData.converted_total && !isBase) {
      // Fallback to pre-calculated converted_total if available and we know it's not base
      grandTotal = parseFloat(packageData.converted_total);
    }
    const travelDate = startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const destinationName = packageData.destination?.label || packageData.destinationName || "Destination";
    const pricePerPerson = adultCount > 0 ? (grandTotal / adultCount).toFixed(0) : 0;

    return {
      tripId, packageName, startDate, endDate, nightsCount, daysCount,
      adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson,
      travelDate, destinationName, isBase, exchangeRate
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
              location: item.dayDestination?.label || item.subDestination?.name || item.destination?.label || "Destination",
              star: item.starRating || "",
              nights: [index + 1],
              checkInDate: dayDate,
              checkOutDate: new Date(dayDate.getTime() + 86400000),
              meal: item.mealPlan?.label || item.mealPlan?.name || item.option?.label || "Bed and Breakfast",
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

  const getDayWiseItinerary = () => {
    if (!packageData?.planArr) return [];
    return packageData.planArr.map((day, index) => ({
      dayIndex: index,
      dayDate: new Date(day.date),
      dayDestination: day.dayDestination,
      schedule: day.schedule || [],
    }));
  };

  // ═══════════════════════════════════════════════════
  // WhatsApp Text Generator (unchanged)
  // ═══════════════════════════════════════════════════
  const getCurrencySymbol = (code) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'THB': '฿',
      'AUD': 'A$',
      'CAD': 'C$',
      'JPY': '¥',
      'SGD': 'S$',
      'HKD': 'HK$',
      'MYR': 'RM',
      'PHP': '₱',
      'VND': '₫',
      'IDR': 'Rp',
    };
    return symbols[code] || code;
  };

  const computePriceBreakdown = (info) => {
    if (!packageData?.quoted_options) return [];
    
    // Parse quoted_options if string
    const options = typeof packageData.quoted_options === "string" 
      ? JSON.parse(packageData.quoted_options) 
      : packageData.quoted_options;
    
    if (!Array.isArray(options) || options.length === 0) return [];
    
    const primaryOption = options[0];
    return primaryOption.rows || [];
  };

  const generateWhatsAppText = () => {
    const info = extractPackageInfo();
    if (!info) return "Sharing my travel plan...";

    // Helper for ordinals
    const getOrdinalStr = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    let text = `Hi ${info.clientName},\n\n`;
    text += `Greetings from *TIC Tours.*\n\n`;
    text += `Thank you for your query with us. As per your requirements, following are the package details.\n\n`;

    text += `*Trip ID ${info.tripId}*\n`;
    text += `----------\n`;
    text += `*${info.packageName}*\n`;
    text += `• *${info.travelDate}* _for_ *${info.nightsCount} Nights, ${info.daysCount} Days*\n`;
    text += `• *${info.adultCount} Adults*${info.childCount > 0 ? ` and ${info.childCount} Child` : ""}\n\n`;

    if (!values.hideTotalPrice) {
      const breakdown = computePriceBreakdown(info);
      const options = typeof packageData.quoted_options === "string" 
        ? JSON.parse(packageData.quoted_options) 
        : packageData.quoted_options;
      const primaryOption = options?.[0] || {};
      
      const displayCurrency = primaryOption.currencyCode || ((!info.isBase && info.exchangeRate > 0 && packageData.priceIn?.to_currency)
        ? packageData.priceIn.to_currency
        : info.currencyCode);
      const displaySymbol = primaryOption.currencySymbol || getCurrencySymbol(displayCurrency);

      text += `*Price (${displayCurrency}):*\n`;

      if (values.priceBreakup && breakdown.length > 0) {
        const priceMode = packageData.price_mode || "TOTAL_PRICE";
        const isPERMode = priceMode === "PER_PERSON" || priceMode === "PER_TRAVELLER";

        breakdown.forEach(row => {
          const isDoubleOrTriple = row.label.toLowerCase().includes("double") || row.label.toLowerCase().includes("triple");
          
          let perPerson, rowTotal;
          if (isPERMode) {
              // If row has perPerson from new data, use it. 
              // Otherwise, if row.total exists and it's already divided, don't divide it again if it matches the total sum logic.
              // Logic: In old PER data, row.total WAS the per-person rate.
              perPerson = row.perPerson || row.total || 0;
              rowTotal = perPerson * row.count;
          } else {
              rowTotal = row.total || (row.perPerson * row.count);
              perPerson = row.count > 0 ? rowTotal / row.count : 0;
          }
          
          if (isDoubleOrTriple && isPERMode) {
            const countSuffix = row.count > 1 ? ` x ${row.count}` : '';
            text += `• *${row.label}*\t\t${displaySymbol} ${perPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${countSuffix}\n`;
          } else {
            const countSuffix = (row.count > 1) ? ` x ${row.count}` : '';
            text += `• *${row.label}*\t\t- ${displaySymbol} ${rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${countSuffix}\n`;
          }
        });
      }

      // Use the grandTotal from metadata if available for the final line
      const displayTotal = primaryOption.grandTotal || breakdown.reduce((sum, row) => sum + (row.total || (row.perPerson * row.count)), 0);
      text += `*Total: ${displaySymbol} ${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /-* _(exc. Vat)_\n\n`;
    }

    if (values.itinerary && packageData.planArr) {
      const hotelsGrouped = getGroupedHotels();
      if (hotelsGrouped.length > 0) {
        text += `🏨  *_Hotels_*\n`;
        text += `-----------\n`;
        hotelsGrouped.forEach((h) => {
          const nightOrdinals = h.nights.map(n => getOrdinalStr(n));
          const nightStr = nightOrdinals.join(", ") + (h.nights.length > 1 ? " Nights" : " Night");
          
          text += `*${nightStr}* _at_ *${h.location}*\n`;
          text += `_Check-in: ${formatShortDate(h.checkInDate)}_ & _Check-out: ${formatShortDate(h.checkOutDate)}_\n`;
          text += `*${h.name}*\n`;
          const roomCount = Math.ceil(info.adultCount / 2) || 1;
          text += `Option 1 • ${roomCount} ${h.room} (${info.adultCount} Pax)\n\n`;
        });
      }

      text += `🚖  *Transportation and Activities*\n`;
      text += `-----------\n`;
      packageData.planArr.forEach((day, index) => {
        const date = new Date(packageData.start_date);
        date.setDate(date.getDate() + index);
        const dayStr = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "2-digit" });
        
        text += `*${getOrdinalStr(index + 1)} Day - ${dayStr}*\n`;
        const activities = day.activities?.map(a => a.activity_name).filter(Boolean) || [];
        activities.forEach(act => {
          text += `• ${act} - Tour _(${info.adultCount} Adults)_\n`;
        });
        const transfers = day.transfers?.map(t => t.description || "Transfer").filter(Boolean) || [];
        transfers.forEach(trans => {
          text += `• ${trans} - Meals/Transit _(${info.adultCount} Adults)_\n`;
        });
        text += `\n`;
      });
    }

    if (values.terms) {
      text += `*Terms and Conditions:*\n`;
      text += `Standard cancellation and policies apply. Subject to availability.\n\n`;
    }

    text += `Looking forward to hearing from you!\n\n`;
    text += `Warm Regards,\nTIC Tours Team\n`;
    return text.trim();
  };



  // Plain text fallback for mailto
  const generateEmailPlainText = () => {
    const info = extractPackageInfo();
    if (!info) return "";

    const { tripId, packageName, startDate, nightsCount, daysCount, adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson } = info;
    const currencySymbol = getCurrencySymbol(currencyCode);

    let text = `Dear ${clientName},\n\n`;
    text += `Greetings from TIC Tours!\n\n`;
    text += `Thank you for your enquiry. Please find below the package details.\n\n`;
    text += `TRIP ID: ${tripId}\n`;
    text += `PACKAGE: ${packageName}\n`;
    text += `Travel Dates: ${formatFullDate(startDate)} — ${nightsCount} Nights / ${daysCount} Days\n`;
    text += `Travellers: ${adultCount} Adults${childCount > 0 ? `, ${childCount} Children` : ""}\n`;
    if (refId) text += `Reference ID: ${refId}\n`;
    text += `\n`;

    if (!values.hideTotalPrice) {
      if (values.priceBreakup) {
        text += `Per Person (Double Sharing): ${parseFloat(pricePerPerson).toLocaleString()} x ${adultCount} Pax\n`;
      }
      text += `Grand Total: ${currencySymbol} ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /- (excl. VAT)\n\n`;
    }

    if (values.itinerary && packageData.planArr) {
      const hotelsGrouped = getGroupedHotels();
      if (hotelsGrouped.length > 0) {
        text += `ACCOMMODATION:\n`;
        hotelsGrouped.forEach((h) => {
          text += `  ${h.name} at ${h.location} — ${h.nights.length} Night(s)\n`;
          text += `  Check-in: ${formatShortDate(h.checkInDate)} | Check-out: ${formatShortDate(h.checkOutDate)}\n`;
          text += `  Room: ${h.room} | Meal: ${h.meal}\n\n`;
        });
      }
      const activeDays = getActivitiesByDay();
      if (activeDays.length > 0) {
        text += `ACTIVITIES & TRANSFERS:\n`;
        activeDays.forEach(({ dayIndex, dayDate, items }) => {
          const dayStr = dayDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
          text += `  Day ${dayIndex + 1} — ${dayStr}\n`;
          items.forEach((item) => {
            text += `    • ${item.name} (${item.insertType})\n`;
          });
          text += `\n`;
        });
      }
    }

    if (values.terms) {
      text += `TERMS & CONDITIONS:\n`;
      text += `  • Standard cancellation and refund policies apply.\n`;
      text += `  • All bookings are subject to availability.\n\n`;
    }

    text += `Warm Regards,\nTIC Tours Team\n`;
    return text.trim();
  };

  const generateEmailSubject = () => {
    const info = extractPackageInfo();
    if (!info) return "Your Travel Package from TIC Tours";
    return `${info.packageName} — ${info.nightsCount}N/${info.daysCount}D | Trip ID: ${info.tripId} | TIC Tours`;
  };

  // ----- Regenerate content when toggles/mode change -----
  useEffect(() => {
    const itineraryId = packageData?.itineraryId || packageData?.id;
    const queryParams = `?priceBreakup=${values.priceBreakup}&hideTotalPrice=${values.hideTotalPrice}&itinerary=${values.itinerary}&terms=${values.terms}`;

    if (values.mode === "whatsapp") {
      // Fetch WhatsApp text from backend - SAME AS EMAIL
      if (itineraryId) {
        setGeneratedText("Loading message...");
        axiosGet(`${URLS.ITINERARY_URL}/${itineraryId}/preview-whatsapp${queryParams}`)
          .then((res) => {
            if (res?.success && res?.data?.text) {
              setGeneratedText(res.data.text);
            } else {
              console.warn('Backend /preview-whatsapp not available, using quoted_options or fallback');
              setGeneratedText(generateWhatsAppText());
            }
          })
          .catch((err) => {
            console.warn('Backend /preview-whatsapp endpoint error, using quoted_options or fallback:', err?.message);
            setGeneratedText(generateWhatsAppText());
          });
      } else {
        // Before saving, use client-side generation
        setGeneratedText(generateWhatsAppText());
      }
    } else {
      setGeneratedText(generateEmailPlainText());
      // Fetch HTML from backend instead of generating on client
      if (itineraryId) {
        setGeneratedHtml("<p class='text-muted p-3'>Loading original PDF template...</p>");
        axiosGet(`${URLS.ITINERARY_URL}/${itineraryId}/preview-html${queryParams}`)
          .then((res) => {
            if (res?.success && res?.data?.html) {
              setGeneratedHtml(res.data.html);
            } else {
              setGeneratedHtml("<p class='text-danger p-3'>Failed to load preview.</p>");
            }
          })
          .catch((err) => {
            setGeneratedHtml("<p class='text-danger p-3'>Failed to load preview error.</p>");
          });
      } else {
        setGeneratedHtml("<p class='text-warning p-3'>Please save the itinerary first to preview the exact PDF template.</p>");
      }
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

  /*
  const handleEmailSend = () => {
    setFieldValue("subject", generateEmailSubject());
    setShowMailSetup(true);
  };

  const confirmEmailSend = () => {
    const subject = values.subject || generateEmailSubject();
    const toEmail = values.email || "";
    
    // mailto only supports plain text. To support tables/colors, 
    // we copy the HTML content so the user can paste it into their mail app.
    try {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const plainBlob = new Blob([generatedText], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': plainBlob,
      });
      navigator.clipboard.write([clipboardItem]).then(() => {
        notifyCreate("Formatted email copied! Please paste (Ctrl+V) into your mail app body.", true);
        
        // Now open mail client with just to and subject
        const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}`;
        window.open(mailtoUrl, "_self");
        setShowMailSetup(false);
      });
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      // Fallback: just open mail client with plain text if copy fails
      const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedText)}`;
      window.open(mailtoUrl, "_self");
      setShowMailSetup(false);
    }
  };
  */

  const handleCopy = () => {
    if (values.mode === "whatsapp") {
      // WhatsApp: copy plain text
      navigator.clipboard.writeText(generatedText).then(() => {
        notifyCreate("Copied to clipboard", true);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        notifyError("Failed to copy text");
      });
    } else {
      // Email: copy HTML so it pastes with formatting in Gmail/Outlook
      try {
        const blob = new Blob([generatedHtml], { type: 'text/html' });
        const plainBlob = new Blob([generatedText], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
          'text/html': blob,
          'text/plain': plainBlob,
        });
        navigator.clipboard.write([clipboardItem]).then(() => {
          notifyCreate("Copied formatted content to clipboard — paste into Gmail/Outlook", true);
        }).catch(err => {
          // Fallback to plain text
          navigator.clipboard.writeText(generatedText).then(() => {
            notifyCreate("Copied as plain text", true);
          });
        });
      } catch (err) {
        navigator.clipboard.writeText(generatedText).then(() => {
          notifyCreate("Copied as plain text", true);
        });
      }
    }
  };

  // ----- Toggle checkboxes config -----
  const toggleOptions = [
    { id: "priceBreakup", label: "Price Breakup", field: "priceBreakup" },
    { id: "hideTotalPrice", label: "Hide Price", field: "hideTotalPrice" },
    { id: "itinerary", label: "Itinerary", field: "itinerary" },
    { id: "terms", label: "Terms", field: "terms" },
  ];

  const isWhatsApp = values.mode === "whatsapp";
  const visibleOptions = isWhatsApp
    ? toggleOptions
    : toggleOptions.filter(opt => opt.id !== "priceBreakup" && opt.id !== "hideTotalPrice");

  return (
    <CustomModal
      showModal={showModal}
      title={"Share Package"}
      handleModalClose={() => setShowModal(false)}
      size="xl"
      centered
    >
      <div className="card-body p-4">
        <>
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
              : 'Preview your email content below. Use "Copy Formatted" to paste into Gmail/Outlook with full table formatting.'
            }
          </p>

          {/* ── Toggle Options ── */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: "1px solid #e9ecef" }}>
            {visibleOptions.map((opt) => (
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

          {/* ── Email "To" field removed from standard view as requested ── */}

          {/* ── Preview Box ── */}
          {isWhatsApp ? (
            <div
              className="p-3 mb-3 rounded"
              style={{
                backgroundColor: "#e7f5e7",
                border: "1px solid #b7ddb7",
                minHeight: "220px",
                maxHeight: "400px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                fontSize: "13px",
                color: "#333",
                lineHeight: "1.6",
              }}
            >
              {generatedText || <span className="text-muted">No content to preview.</span>}
            </div>
          ) : (
            <div
              ref={emailPreviewRef}
              className="mb-3 rounded"
              style={{
                border: "1px solid #c5d3f0",
                minHeight: "220px",
                maxHeight: "500px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
              }}
              dangerouslySetInnerHTML={{ __html: generatedHtml || '<p class="text-muted p-3">No content to preview.</p>' }}
            />
          )}

          {/* ── Mail Setup Popup ── */}
          {/* {showMailSetup && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setShowMailSetup(false)}
          >
            <div
              style={{
                backgroundColor: "#fff", borderRadius: "12px", padding: "28px",
                width: "100%", maxWidth: "460px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="mb-0 fw-bold">
                  <i className="fa-regular fa-envelope me-2 text-primary"></i>
                  Open in Mail Client
                </h6>
                <button
                  type="button" className="btn-close"
                  onClick={() => setShowMailSetup(false)}
                ></button>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1">Recipient Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter recipient email address"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold mb-1">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Email subject"
                  name="subject"
                  value={values.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-light" type="button" onClick={() => setShowMailSetup(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary px-4" type="button" onClick={confirmEmailSend}>
                  <i className="fa-regular fa-paper-plane me-2"></i> Send
                </button>
              </div>
            </div>
          </div>
        )} */}

          {/* ── Action Buttons ── */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            {isWhatsApp ? (
              <>
                <button className="btn btn-success" onClick={handleWhatsAppSend}>
                  <i className="fa-brands fa-whatsapp me-2"></i> Send on WhatsApp
                </button>
                <button className="btn btn-outline-secondary" onClick={handleCopy}>
                  <i className="fa-regular fa-copy me-2"></i> Copy for WhatsApp
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
                <button className="btn btn-primary" onClick={handleCopy}>
                  <i className="fa-regular fa-copy me-2"></i> Copy for Email
                </button>
                {/* <button className="btn btn-outline-primary" onClick={handleEmailSend}>
                <i className="fa-regular fa-paper-plane me-2"></i> Open in Mail Client
              </button> */}
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
        </>
      </div>
    </CustomModal>
  );
};

export default ShareModal;
