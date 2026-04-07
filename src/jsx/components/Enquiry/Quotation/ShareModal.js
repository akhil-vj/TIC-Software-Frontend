import React, { useEffect, useState, useRef } from "react";
import CustomModal from "../../../layouts/CustomModal";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useFormik } from "formik";
import { formatDate, parseTime } from "../../../utilis/date";

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
          text += `*${h.name}* ${h.star ? `(${h.star})` : ""}\n`;
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

  // ═══════════════════════════════════════════════════
  // HTML Email Generator (PDF-like format with tables)
  // ═══════════════════════════════════════════════════
  const generateEmailHtml = () => {
    const info = extractPackageInfo();
    if (!info) return "";

    const { tripId, packageName, startDate, endDate, nightsCount, daysCount, adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson } = info;

    // ── Color palette (TIC Tours brand: Blue + Red) ──
    const C = {
      primary:     '#0d6efd',   // TIC bright blue
      primaryDark: '#0a47a0',   // dark blue
      primaryDeep: '#062d6e',   // very dark blue (header)
      primaryLight:'#e8f0fe',   // very light blue tint
      accent:      '#c62828',   // TIC crimson red
      accentLight: '#fce8e8',   // light red tint
      accentDark:  '#8e1c1c',   // darker red
      text:        '#1e293b',   // dark slate
      textMuted:   '#64748b',   // muted blue-grey
      textLight:   '#94a3b8',   // light grey
      border:      '#cbd5e1',   // soft blue-grey border
      borderLight: '#e2e8f0',   // very light border
      bgAlt:       '#f8fafc',   // alternating row blue tint
      bgCard:      '#fafbfd',   // card background
      white:       '#ffffff',
      badgeHotelBg:    '#e3f2fd', badgeHotelTx:    '#1565c0',
      badgeActivityBg: '#fff3e0', badgeActivityTx: '#e65100',
      badgeTransferBg: '#f3e5f5', badgeTransferTx: '#7b1fa2',
    };

    let html = '';

    // ── Outer wrapper ──
    html += `<div style="font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: ${C.text}; line-height: 1.6; max-width: 820px; margin: 0 auto; background-color: ${C.white}; border: 1px solid ${C.borderLight}; border-radius: 10px; overflow: hidden;">`;

    // ── Header ──
    html += `<div style="background: linear-gradient(135deg, ${C.primaryDeep} 0%, ${C.primaryDark} 50%, ${C.primary} 100%); color: ${C.white}; padding: 32px 40px 28px 40px;">`;
    html += `<h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 700; letter-spacing: 0.3px;">${packageName}</h1>`;
    html += `<p style="margin: 0; font-size: 14px; opacity: 0.9;">Trip ID: <strong>${tripId}</strong>${refId ? ` &nbsp;&bull;&nbsp; Ref: <strong>${refId}</strong>` : ''}</p>`;
    // Decorative red accent divider (matches TIC logo swoosh)
    html += `<div style="width: 60px; height: 3px; background-color: ${C.accent}; margin-top: 16px; border-radius: 2px;"></div>`;
    html += `</div>`;

    // ── Info Cards Bar ──
    html += `<table style="width: 100%; background-color: ${C.primaryLight}; border-bottom: 1px solid ${C.border};" cellpadding="0" cellspacing="0"><tr>`;
    html += `<td style="padding: 22px 40px;">`;
    html += `<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr>`;

    const infoCards = [
      { label: 'Travel Dates', value: `${formatFullDate(startDate)} — ${formatFullDate(endDate)}` },
      { label: 'Duration', value: `${nightsCount} Nights / ${daysCount} Days` },
      { label: 'Travellers', value: `${adultCount} Adults${childCount > 0 ? `, ${childCount} Children` : ''}` },
    ];
    infoCards.forEach((card, i) => {
      html += `<td style="vertical-align: top;${i < infoCards.length - 1 ? ' padding-right: 20px;' : ''}">
        <div style="background-color: ${C.white}; border: 1px solid ${C.border}; border-radius: 8px; padding: 12px 16px;">
          <div style="color: ${C.textMuted}; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.8px; margin-bottom: 4px;">${card.label}</div>
          <div style="color: ${C.primaryDark}; font-weight: 700; font-size: 14px;">${card.value}</div>
        </div>
      </td>`;
    });
    html += `</tr></table></td></tr></table>`;

    // ── Greeting ──
    html += `<div style="padding: 28px 40px 0 40px;">`;
    html += `<p style="margin: 0 0 4px 0; font-size: 15px;">Dear <strong style="color: ${C.primary};">${clientName}</strong>,</p>`;
    html += `<p style="margin: 0 0 22px 0; color: ${C.textMuted}; font-size: 14px;">Thank you for your enquiry. Please find below the detailed itinerary and pricing for your travel package.</p>`;
    html += `</div>`;

    // ── Section Title Helper ──
    const sectionTitle = (emoji, title) =>
      `<div style="font-size: 16px; font-weight: 700; color: ${C.primary}; margin: 28px 0 14px 0; padding-bottom: 8px; border-bottom: 2px solid ${C.border};">${emoji} &nbsp;${title}</div>`;

    // Table styles
    const thStyle = `background-color: ${C.primaryLight}; color: ${C.primaryDark}; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.8px; padding: 11px 14px; border: 1px solid ${C.border}; text-align: left;`;
    const tdStyle = `padding: 10px 14px; border: 1px solid ${C.borderLight}; vertical-align: top; font-size: 13px;`;
    const tdAltStyle = `padding: 10px 14px; border: 1px solid ${C.borderLight}; vertical-align: top; font-size: 13px; background-color: ${C.bgAlt};`;

    // ── Day-wise Itinerary ──
    if (values.itinerary && packageData.planArr) {
      html += `<div style="padding: 0 40px;">`;
      html += sectionTitle('📋', 'Day-wise Itinerary');

      const dayWise = getDayWiseItinerary();
      dayWise.forEach(({ dayIndex, dayDate, dayDestination, schedule }) => {
        const dayStr = dayDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
        const destLabel = dayDestination?.label || dayDestination?.name || "";

        html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px;" cellpadding="0" cellspacing="0">`;

        // Day header with left accent bar
        html += `<tr><td colspan="4" style="background-color: ${C.primaryDark}; color: ${C.white}; padding: 0; border: 1px solid ${C.primaryDark};">`;
        html += `<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr>`;
        html += `<td style="width: 5px; background-color: ${C.accent};"></td>`;
        html += `<td style="padding: 10px 16px;">`;
        html += `<span style="font-weight: 700; font-size: 14px;">Day ${dayIndex + 1}</span>`;
        html += `<span style="opacity: 0.85; font-weight: 400; font-size: 13px;"> &mdash; ${dayStr}</span>`;
        if (destLabel) html += `<span style="opacity: 0.7; font-size: 12px; margin-left: 8px;">| ${destLabel}</span>`;
        html += `</td></tr></table></td></tr>`;

        if (schedule.length > 0) {
          html += `<tr>`;
          html += `<th style="${thStyle} width: 14%;">Time</th>`;
          html += `<th style="${thStyle} width: 12%;">Type</th>`;
          html += `<th style="${thStyle} width: 51%;">Details</th>`;
          html += `<th style="${thStyle} width: 23%;">Location</th>`;
          html += `</tr>`;

          schedule.forEach((item, idx) => {
            const rs = idx % 2 === 0 ? tdStyle : tdAltStyle;
            const timeStart = item.startTime ? parseTime(item.startTime) : '';
            const timeEnd = item.endTime ? parseTime(item.endTime) : '';
            const timeStr = (timeStart || timeEnd) ? `${timeStart} - ${timeEnd}` : '—';
            const typeLower = item.insertType?.toLowerCase() || '';
            const itemName = item.name || item.activity_name || item.vehicle_name || '';
            const location = item.subDestination?.label || item.subDestination?.name || item.destination?.label || destLabel || '';

            let bColor = C.badgeActivityTx, bBg = C.badgeActivityBg;
            if (typeLower === 'hotel') { bColor = C.badgeHotelTx; bBg = C.badgeHotelBg; }
            if (typeLower === 'transfer') { bColor = C.badgeTransferTx; bBg = C.badgeTransferBg; }

            html += `<tr>`;
            html += `<td style="${rs} color: ${C.textMuted};">${timeStr}</td>`;
            html += `<td style="${rs}"><span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; background-color: ${bBg}; color: ${bColor};">${item.insertType?.toUpperCase() || 'N/A'}</span></td>`;

            html += `<td style="${rs}">`;
            html += `<strong style="color: ${C.text};">${itemName}</strong>`;
            if (item.description) html += `<br/><span style="color: ${C.textLight}; font-size: 12px;">${item.description}</span>`;
            if (typeLower === 'hotel') {
              html += `<br/><span style="color: ${C.textMuted}; font-size: 12px;">`;
              if (item.roomType?.label) html += `🛏️ ${item.roomType.label}`;
              if (item.option?.label) html += ` &nbsp;·&nbsp; 🍽️ ${item.option.label}`;
              html += `</span>`;
              if (item.startDate || item.endDate) {
                const cin = item.startDate ? formatFullDate(new Date(item.startDate)) : '';
                const cout = item.endDate ? formatFullDate(new Date(item.endDate)) : '';
                html += `<br/><span style="color: ${C.textLight}; font-size: 11px;">Check-in: ${cin} &bull; Check-out: ${cout}</span>`;
              }
            }
            if (typeLower === 'transfer' && item.type?.label) {
              html += `<br/><span style="color: ${C.textMuted}; font-size: 12px;">🚗 ${item.type.label}</span>`;
            }
            html += `</td>`;
            html += `<td style="${rs} color: ${C.textMuted};">${location}</td>`;
            html += `</tr>`;
          });
        } else {
          html += `<tr><td colspan="4" style="${tdStyle} text-align: center; color: ${C.textLight}; font-style: italic; padding: 16px;">No activities scheduled for this day</td></tr>`;
        }
        html += `</table>`;
      });

      // ── Hotels Summary ──
      const hotelsGrouped = getGroupedHotels();
      if (hotelsGrouped.length > 0) {
        html += sectionTitle('🏨', 'Accommodation Summary');
        html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;" cellpadding="0" cellspacing="0">`;
        html += `<tr>`;
        html += `<th style="${thStyle}">Hotel</th>`;
        html += `<th style="${thStyle}">Location</th>`;
        html += `<th style="${thStyle} text-align: center;">Check-in</th>`;
        html += `<th style="${thStyle} text-align: center;">Check-out</th>`;
        html += `<th style="${thStyle} text-align: center;">Nights</th>`;
        html += `<th style="${thStyle}">Room Type</th>`;
        html += `<th style="${thStyle}">Meal Plan</th>`;
        html += `</tr>`;
        hotelsGrouped.forEach((h, idx) => {
          const rs = idx % 2 === 0 ? tdStyle : tdAltStyle;
          html += `<tr>`;
          html += `<td style="${rs}"><strong style="color: ${C.primary};">${h.name}</strong>${h.star ? `<br/><span style="color: ${C.textLight}; font-size: 11px;">${h.star}</span>` : ''}</td>`;
          html += `<td style="${rs}">${h.location}</td>`;
          html += `<td style="${rs} text-align: center;">${formatShortDate(h.checkInDate)}</td>`;
          html += `<td style="${rs} text-align: center;">${formatShortDate(h.checkOutDate)}</td>`;
          html += `<td style="${rs} text-align: center; font-weight: 700; color: ${C.primary};">${h.nights.length}</td>`;
          html += `<td style="${rs}">${h.room}</td>`;
          html += `<td style="${rs}">${h.meal}</td>`;
          html += `</tr>`;
        });
        html += `</table>`;
      }

      html += `</div>`;
    }

    // ── Pricing Section ──
    if (!values.hideTotalPrice) {
      html += `<div style="padding: 0 40px;">`;
      html += sectionTitle('💰', 'Pricing Summary');

      html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;" cellpadding="0" cellspacing="0">`;
      html += `<tr>`;
      html += `<th style="${thStyle}">Description</th>`;
      html += `<th style="${thStyle} text-align: right;">Amount (${currencyCode})</th>`;
      html += `</tr>`;

      if (values.priceBreakup) {
        html += `<tr>`;
        html += `<td style="${tdStyle}">Per Person Cost (Double Sharing) × ${adultCount} Pax</td>`;
        html += `<td style="${tdStyle} text-align: right; font-weight: 600; color: ${C.text};">${parseFloat(pricePerPerson).toLocaleString()}</td>`;
        html += `</tr>`;
      }

      // Grand total row — brand red accent border
      html += `<tr>`;
      html += `<td style="padding: 14px; border: 1px solid ${C.accent}; background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary}); color: ${C.white}; font-weight: 700; font-size: 15px;">Grand Total</td>`;
      html += `<td style="padding: 14px; border: 1px solid ${C.accent}; background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary}); color: ${C.white}; text-align: right; font-weight: 700; font-size: 17px; letter-spacing: 0.3px;">${currencyCode} ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /-</td>`;
      html += `</tr>`;
      html += `</table>`;

      html += `<p style="color: ${C.textLight}; font-size: 11px; margin-top: 8px; font-style: italic;">* Prices are exclusive of applicable taxes/VAT unless mentioned otherwise.</p>`;
      html += `</div>`;
    }

    // ── Terms ──
    if (values.terms) {
      html += `<div style="padding: 0 40px 10px 40px;">`;
      html += sectionTitle('📝', 'Terms & Conditions');
      html += `<ul style="color: ${C.textMuted}; font-size: 13px; padding-left: 20px; margin: 0;">`;
      html += `<li style="margin-bottom: 6px;">Standard cancellation and refund policies apply.</li>`;
      html += `<li style="margin-bottom: 6px;">All bookings are subject to availability.</li>`;
      html += `<li style="margin-bottom: 6px;">Prices may vary based on seasonal changes.</li>`;
      html += `</ul>`;
      html += `</div>`;
    }

    // ── Footer ──
    html += `<div style="background-color: ${C.primaryLight}; padding: 22px 40px; border-top: 1px solid ${C.border}; font-size: 12px; color: ${C.textMuted};">`;
    html += `<p style="margin: 0 0 6px 0;">For any queries, please feel free to reach out to us.</p>`;
    html += `<p style="margin: 0; font-weight: 700; color: ${C.primary}; font-size: 13px;">Warm Regards,<br/>TIC Tours Team</p>`;
    // Red accent divider (matches logo swoosh)
    html += `<div style="width: 40px; height: 2px; background-color: ${C.accent}; margin-top: 12px; border-radius: 1px;"></div>`;
    html += `</div>`;

    html += `</div>`;

    return html;
  };

  // Plain text fallback for mailto
  const generateEmailPlainText = () => {
    const info = extractPackageInfo();
    if (!info) return "";

    const { tripId, packageName, startDate, nightsCount, daysCount, adultCount, childCount, refId, clientName, currencyCode, grandTotal, pricePerPerson } = info;

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
      text += `Grand Total: ${currencyCode} ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /- (excl. VAT)\n\n`;
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
    if (values.mode === "whatsapp") {
      setGeneratedText(generateWhatsAppText());
    } else {
      setGeneratedHtml(generateEmailHtml());
      setGeneratedText(generateEmailPlainText());
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
