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
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const { values, handleChange, handleBlur, setFieldValue } = formik;
  const [generatedText, setGeneratedText] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
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

    // Common styles for email compatibility
    const styles = {
      body: 'font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; background-color: #ffffff;',
      header: 'background: linear-gradient(135deg, #1a237e 0%, #283593 100%); color: #ffffff; padding: 30px 35px; border-radius: 8px 8px 0 0;',
      headerTitle: 'margin: 0 0 5px 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;',
      headerSubtitle: 'margin: 0; font-size: 14px; opacity: 0.85; font-weight: 400;',
      infoBar: 'background-color: #f5f7ff; padding: 20px 35px; border-bottom: 2px solid #e8eaf6;',
      infoItem: 'display: inline-block; margin-right: 30px; font-size: 13px;',
      infoLabel: 'color: #7986cb; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; display: block; margin-bottom: 3px;',
      infoValue: 'color: #1a237e; font-weight: 700; font-size: 15px;',
      sectionTitle: 'font-size: 16px; font-weight: 700; color: #1a237e; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e8eaf6;',
      table: 'width: 100%; border-collapse: collapse; font-size: 13px;',
      th: 'background-color: #f5f7ff; color: #1a237e; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.8px; padding: 12px 15px; border: 1px solid #e0e3f0; text-align: left;',
      td: 'padding: 10px 15px; border: 1px solid #e8eaf6; vertical-align: top;',
      tdAlt: 'padding: 10px 15px; border: 1px solid #e8eaf6; vertical-align: top; background-color: #fafbff;',
      badge: 'display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase;',
      badgeHotel: 'background-color: #e8f5e9; color: #2e7d32;',
      badgeActivity: 'background-color: #fff3e0; color: #e65100;',
      badgeTransfer: 'background-color: #e3f2fd; color: #1565c0;',
      totalRow: 'background-color: #1a237e; color: #ffffff; font-weight: 700;',
      footer: 'background-color: #f5f7ff; padding: 20px 35px; border-radius: 0 0 8px 8px; border-top: 2px solid #e8eaf6; font-size: 12px; color: #666;',
    };

    const getBadgeStyle = (type) => {
      switch (type?.toLowerCase()) {
        case 'hotel': return styles.badge + styles.badgeHotel;
        case 'activity': return styles.badge + styles.badgeActivity;
        case 'transfer': return styles.badge + styles.badgeTransfer;
        default: return styles.badge;
      }
    };

    let html = '';

    // ── Outer container ──
    html += `<div style="${styles.body}">`;

    // ── Header ──
    html += `<div style="${styles.header}">`;
    html += `<h1 style="${styles.headerTitle}">${packageName}</h1>`;
    html += `<p style="${styles.headerSubtitle}">Trip ID: ${tripId}${refId ? ` &nbsp;|&nbsp; Ref: ${refId}` : ''}</p>`;
    html += `</div>`;

    // ── Info Bar ──
    html += `<table style="width: 100%; background-color: #f5f7ff; border-bottom: 2px solid #e8eaf6;" cellpadding="0" cellspacing="0"><tr>`;
    html += `<td style="padding: 20px 35px;">`;
    html += `<table cellpadding="0" cellspacing="0"><tr>`;
    html += `<td style="padding-right: 35px; vertical-align: top;">
      <div style="${styles.infoLabel}">Travel Dates</div>
      <div style="${styles.infoValue}">${formatFullDate(startDate)} — ${formatFullDate(endDate)}</div>
    </td>`;
    html += `<td style="padding-right: 35px; vertical-align: top;">
      <div style="${styles.infoLabel}">Duration</div>
      <div style="${styles.infoValue}">${nightsCount}N / ${daysCount}D</div>
    </td>`;
    html += `<td style="padding-right: 35px; vertical-align: top;">
      <div style="${styles.infoLabel}">Travellers</div>
      <div style="${styles.infoValue}">${adultCount} Adults${childCount > 0 ? `, ${childCount} Children` : ''}</div>
    </td>`;
    html += `</tr></table>`;
    html += `</td></tr></table>`;

    // ── Greeting ──
    html += `<div style="padding: 25px 35px 0 35px;">`;
    html += `<p style="margin: 0 0 5px 0;">Dear <strong>${clientName}</strong>,</p>`;
    html += `<p style="margin: 0 0 20px 0; color: #555;">Thank you for your enquiry. Please find below the detailed itinerary and pricing for your package.</p>`;
    html += `</div>`;

    // ── Day-wise Itinerary Table ──
    if (values.itinerary && packageData.planArr) {
      html += `<div style="padding: 0 35px;">`;
      html += `<h3 style="${styles.sectionTitle}">📋 Day-wise Itinerary</h3>`;

      const dayWise = getDayWiseItinerary();
      dayWise.forEach(({ dayIndex, dayDate, dayDestination, schedule }) => {
        const dayStr = dayDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
        const destLabel = dayDestination?.label || dayDestination?.name || "";

        html += `<table style="${styles.table} margin-bottom: 20px;" cellpadding="0" cellspacing="0">`;
        // Day header
        html += `<tr><td colspan="4" style="background-color: #1a237e; color: #ffffff; padding: 10px 15px; font-weight: 700; font-size: 14px; border: 1px solid #1a237e;">`;
        html += `Day ${dayIndex + 1} &mdash; ${dayStr}`;
        if (destLabel) html += ` &nbsp;<span style="opacity: 0.8; font-weight: 400; font-size: 12px;">| ${destLabel}</span>`;
        html += `</td></tr>`;

        if (schedule.length > 0) {
          // Table header
          html += `<tr>`;
          html += `<th style="${styles.th} width: 15%;">Time</th>`;
          html += `<th style="${styles.th} width: 12%;">Type</th>`;
          html += `<th style="${styles.th} width: 50%;">Details</th>`;
          html += `<th style="${styles.th} width: 23%;">Location</th>`;
          html += `</tr>`;

          schedule.forEach((item, idx) => {
            const rowStyle = idx % 2 === 0 ? styles.td : styles.tdAlt;
            const timeStart = item.startTime ? parseTime(item.startTime) : '';
            const timeEnd = item.endTime ? parseTime(item.endTime) : '';
            const timeStr = (timeStart || timeEnd) ? `${timeStart} - ${timeEnd}` : '—';
            const typeLower = item.insertType?.toLowerCase() || '';
            const itemName = item.name || item.activity_name || item.vehicle_name || '';
            const location = item.subDestination?.label || item.subDestination?.name || item.destination?.label || destLabel || '';

            let badgeColor = '#e65100'; let badgeBg = '#fff3e0';
            if (typeLower === 'hotel') { badgeColor = '#2e7d32'; badgeBg = '#e8f5e9'; }
            if (typeLower === 'transfer') { badgeColor = '#1565c0'; badgeBg = '#e3f2fd'; }

            html += `<tr>`;
            html += `<td style="${rowStyle}">${timeStr}</td>`;
            html += `<td style="${rowStyle}"><span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; background-color: ${badgeBg}; color: ${badgeColor};">${item.insertType?.toUpperCase() || 'N/A'}</span></td>`;

            // Details cell
            html += `<td style="${rowStyle}">`;
            html += `<strong>${itemName}</strong>`;
            if (item.description) html += `<br/><span style="color: #888; font-size: 12px;">${item.description}</span>`;
            if (typeLower === 'hotel') {
              html += `<br/><span style="color: #666; font-size: 12px;">`;
              if (item.roomType?.label) html += `Room: ${item.roomType.label}`;
              if (item.option?.label) html += ` &nbsp;|&nbsp; Meal: ${item.option.label}`;
              html += `</span>`;
              // Check-in / Check-out
              if (item.startDate || item.endDate) {
                const cin = item.startDate ? formatFullDate(new Date(item.startDate)) : '';
                const cout = item.endDate ? formatFullDate(new Date(item.endDate)) : '';
                html += `<br/><span style="color: #888; font-size: 11px;">Check-in: ${cin} &bull; Check-out: ${cout}</span>`;
              }
            }
            if (typeLower === 'transfer' && item.type?.label) {
              html += `<br/><span style="color: #666; font-size: 12px;">Transfer Type: ${item.type.label}</span>`;
            }
            html += `</td>`;

            html += `<td style="${rowStyle}">${location}</td>`;
            html += `</tr>`;
          });
        } else {
          html += `<tr><td colspan="4" style="${styles.td} text-align: center; color: #999; font-style: italic;">No activities scheduled</td></tr>`;
        }

        html += `</table>`;
      });

      // ── Hotel Summary Table ──
      const hotelsGrouped = getGroupedHotels();
      if (hotelsGrouped.length > 0) {
        html += `<h3 style="${styles.sectionTitle}">🏨 Accommodation Summary</h3>`;
        html += `<table style="${styles.table}" cellpadding="0" cellspacing="0">`;
        html += `<tr>`;
        html += `<th style="${styles.th}">Hotel</th>`;
        html += `<th style="${styles.th}">Location</th>`;
        html += `<th style="${styles.th}">Check-in</th>`;
        html += `<th style="${styles.th}">Check-out</th>`;
        html += `<th style="${styles.th}">Nights</th>`;
        html += `<th style="${styles.th}">Room Type</th>`;
        html += `<th style="${styles.th}">Meal Plan</th>`;
        html += `</tr>`;
        hotelsGrouped.forEach((h, idx) => {
          const rowStyle = idx % 2 === 0 ? styles.td : styles.tdAlt;
          html += `<tr>`;
          html += `<td style="${rowStyle}"><strong>${h.name}</strong>${h.star ? `<br/><span style="color: #888; font-size: 11px;">${h.star}</span>` : ''}</td>`;
          html += `<td style="${rowStyle}">${h.location}</td>`;
          html += `<td style="${rowStyle}">${formatShortDate(h.checkInDate)}</td>`;
          html += `<td style="${rowStyle}">${formatShortDate(h.checkOutDate)}</td>`;
          html += `<td style="${rowStyle} text-align: center; font-weight: 700;">${h.nights.length}</td>`;
          html += `<td style="${rowStyle}">${h.room}</td>`;
          html += `<td style="${rowStyle}">${h.meal}</td>`;
          html += `</tr>`;
        });
        html += `</table>`;
      }

      html += `</div>`;
    }

    // ── Pricing Section ──
    if (!values.hideTotalPrice) {
      html += `<div style="padding: 0 35px;">`;
      html += `<h3 style="${styles.sectionTitle}">💰 Pricing Summary</h3>`;
      html += `<table style="${styles.table}" cellpadding="0" cellspacing="0">`;
      html += `<tr>`;
      html += `<th style="${styles.th}">Description</th>`;
      html += `<th style="${styles.th} text-align: right;">Amount (${currencyCode})</th>`;
      html += `</tr>`;

      if (values.priceBreakup) {
        html += `<tr>`;
        html += `<td style="${styles.td}">Per Person Cost (Double Sharing) × ${adultCount} Pax</td>`;
        html += `<td style="${styles.td} text-align: right; font-weight: 600;">${parseFloat(pricePerPerson).toLocaleString()}</td>`;
        html += `</tr>`;
      }

      html += `<tr style="${styles.totalRow}">`;
      html += `<td style="padding: 14px 15px; border: 1px solid #1a237e; font-size: 15px;">Grand Total</td>`;
      html += `<td style="padding: 14px 15px; border: 1px solid #1a237e; text-align: right; font-size: 16px;">${currencyCode} ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /-</td>`;
      html += `</tr>`;
      html += `</table>`;

      html += `<p style="color: #888; font-size: 11px; margin-top: 6px; font-style: italic;">* Prices are exclusive of applicable taxes/VAT unless mentioned otherwise.</p>`;
      html += `</div>`;
    }

    // ── Terms ──
    if (values.terms) {
      html += `<div style="padding: 0 35px 10px 35px;">`;
      html += `<h3 style="${styles.sectionTitle}">📝 Terms & Conditions</h3>`;
      html += `<ul style="color: #555; font-size: 13px; padding-left: 20px; margin: 0;">`;
      html += `<li style="margin-bottom: 6px;">Standard cancellation and refund policies apply.</li>`;
      html += `<li style="margin-bottom: 6px;">All bookings are subject to availability.</li>`;
      html += `<li style="margin-bottom: 6px;">Prices may vary based on seasonal changes.</li>`;
      html += `</ul>`;
      html += `</div>`;
    }

    // ── Footer ──
    html += `<div style="${styles.footer}">`;
    html += `<p style="margin: 0 0 5px 0;">For any queries, please feel free to reach out to us.</p>`;
    html += `<p style="margin: 0; font-weight: 600; color: #1a237e;">Warm Regards,<br/>TIC Tours Team</p>`;
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

  const handleEmailSend = () => {
    const subject = encodeURIComponent(generateEmailSubject());
    const body = encodeURIComponent(generatedText);
    const toEmail = values.email ? encodeURIComponent(values.email) : "";
    const mailtoUrl = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, "_self");
  };

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
      className="modal-xl"
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
              <button className="btn btn-primary" onClick={handleCopy}>
                <i className="fa-regular fa-copy me-2"></i> Copy Formatted
              </button>
              <button className="btn btn-outline-primary" onClick={handleEmailSend}>
                <i className="fa-regular fa-paper-plane me-2"></i> Open in Mail Client
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
