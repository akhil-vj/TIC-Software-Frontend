import React, { useEffect, useState } from "react";
import CustomModal from "../../../layouts/CustomModal";
import InputField from "../../common/InputField";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";
import { useFormik } from "formik";
import { URLS } from "../../../../constants";
import axiosInstance from '../../../../services/AxiosInstance';

const ShareModal = ({ setShowModal, showModal, packageData }) => {
  const isEdit = !!packageData?.itineraryId;
  const initialValues = {
    mode: "whatsapp",
    priceBreakup: true,
    hideTotalPrice: false,
    itinerary: true,
    pdf: false,
    terms: false,
    name: packageData?.enquiry?.name || packageData?.enquiry?.customer_name || "",
    email: packageData?.enquiry?.email || "",
    number: packageData?.enquiry?.mobile_no || "",
    ccMail: "",
    message: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
  });

  const { values, handleChange, handleBlur, setFieldValue } = formik;
  const [readOnly] = useState(false); // Can be driven by packageData if needed
  const [generatedText, setGeneratedText] = useState("");

  const formatShortDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const generateWhatsAppText = () => {
    if (!packageData) return "";

    const rawTripId = packageData.seq || packageData.itinerary_no || packageData.enquiry?.seq || packageData.itineraryId || "TBA";
    const tripId = String(rawTripId).includes("-") && String(rawTripId).length > 20 
      ? rawTripId.split("-")[0] // Just take the start of UUID if no seq is found, or better, fallback to TBA
      : rawTripId;
    const packageName = packageData.packageName || "Trip Package";

    // Dates
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

    // Pricing Options
    if (!values.hideTotalPrice) {
      // Safely extract the currency code. Since payment form now passes full objects, we prioritize to_currency or clean labels
      let currencyCode = "USD";
      if (packageData.priceIn && packageData.priceIn.to_currency) {
        currencyCode = packageData.priceIn.to_currency;
      } else if (packageData.priceIn?.label && String(packageData.priceIn.label).length < 15) {
        currencyCode = String(packageData.priceIn.label).split(" ")[0]; // Strip out "(Base)"
      } else if (packageData.baseCurrency && String(packageData.baseCurrency).length < 15) {
        currencyCode = packageData.baseCurrency;
      } else if (packageData.currency && String(packageData.currency).length < 15) {
        currencyCode = packageData.currency;
      }

      // Prioritize the backend/formik converted_total when present to accurately reflect exchange rates
      const grandTotal = parseFloat(packageData.converted_total || packageData.grand_total || packageData.total_amount || 0);

      const pricePerPerson = adultCount > 0 ? (grandTotal / adultCount).toFixed(0) : 0;

      text += `*Price (${currencyCode}):*\n`;
      if (values.priceBreakup) {
        text += `• *${parseFloat(pricePerPerson).toLocaleString()} / Person (Double Sharing)* x ${adultCount} Pax\n`;
      }
      text += `*Total: ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} /-* _(exc. Vat)_\n\n`;
    }

    if (values.itinerary && packageData.planArr) {
      const hotelsGrouped = [];
      let currentHotel = null;

      packageData.planArr.forEach((day, index) => {
        const dayDate = new Date(day.date);

        day.schedule?.forEach((item) => {
          if (item.insertType === "hotel" || item?.insertType?.toLowerCase() === "hotel") {
            const hName = item.name || item.hotel_name;
            if (currentHotel && currentHotel.name === hName) {
              currentHotel.nights.push(index + 1);
              currentHotel.checkOutDate = new Date(dayDate.getTime() + 86400000); // add 1 day
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

      if (hotelsGrouped.length > 0) {
        text += `🏨  *_Hotels_*\n`;
        text += `-----------\n`;
        hotelsGrouped.forEach((h) => {
          const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
          };
          const nightsArray = h.nights.map((n) => getOrdinal(parseInt(n)));
          const nightsStr = nightsArray.join(", ") + " Nights";

          text += `*${nightsStr}* _at_ *${h.location}*\n`;
          text += `_Check-in: ${formatShortDate(h.checkInDate)}_ & _Check-out: ${formatShortDate(h.checkOutDate)}_\n`;
          text += `*${h.name}* (${h.star})\n`;
          text += `${h.meal} • ${Math.ceil(adultCount / 2) || 1} ${h.room} (${adultCount} Pax)\n\n`;
        });
      }

      // Transportation and Activities
      let hasActivities = false;
      let activitiesText = `🚖  *Transportation and Activities*\n`;
      activitiesText += `-----------\n`;

      packageData.planArr.forEach((day, index) => {
        const items = day.schedule?.filter((v) => v.insertType !== "hotel" && v?.insertType?.toLowerCase() !== "hotel") || [];
        if (items.length > 0) {
          hasActivities = true;
          const dayDate = new Date(day.date);
          const dayStr = dayDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "2-digit" });
          activitiesText += `*${getOrdinal(index + 1)} Day - ${dayStr}*\n`;
          items.forEach((item) => {
            const itemTypeLabel = item.insertType === "activity" ? "Tour" : "Meals/Transit";
            activitiesText += `• ${item.name} - ${itemTypeLabel} _(${adultCount} Adults)_\n`;
          });
          activitiesText += `\n`;
        }
      });

      if (hasActivities) {
        text += activitiesText;
      }
    }

    if (values.pdf) {
      text += `*Download Full PDF Itinerary:*\nAttached\n\n`;
    }

    if (values.terms) {
      text += `*Terms and Conditions:*\nStandard cancellation and policies apply. Subject to availability.\n\n`;
    }

    return text.trim();
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  useEffect(() => {
    if (values.mode === "whatsapp") {
      setGeneratedText(generateWhatsAppText());
    }
  }, [
    values.priceBreakup,
    values.hideTotalPrice,
    values.itinerary,
    values.pdf,
    values.terms,
    values.name,
    packageData,
    values.mode
  ]);

  const handleWhatsAppSend = () => {
    if (!generatedText) return;
    const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`;
    window.open(url, "_blank");
    setShowModal(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText).then(() => {
      notifyCreate("Text copied to clipboard", true);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      notifyError("Failed to copy text");
    });
  };

  const formSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
  };

  const handleDownloadPdf = async () => {
    if (!packageData?.itineraryId) {
       notifyError("No itinerary found to download");
       return;
    }
    try {
      const url = URLS.PRINT_ITINERARY_URL + packageData.itineraryId;
      const response = await axiosInstance().post(url, null, { responseType: 'blob' });
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `Quotation_${packageData?.itineraryId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('err', error);
      notifyError(error?.response?.data?.message || 'Failed to download PDF');
    }
  };

  return (
    <CustomModal
      showModal={showModal}
      title={"Share Package"}
      handleModalClose={() => setShowModal(false)}
      className="modal-lg"
    >
      <div className="card-body p-4">
        {/* Top Tabs / Toggle */}
        <div className="d-flex align-items-center mb-4 border-bottom pb-2">
          <button
            className={`btn btn-sm me-3 ${values.mode === 'whatsapp' ? 'btn-primary' : 'btn-outline-primary'}`}
            type="button"
            onClick={() => setFieldValue("mode", "whatsapp")}
          >
            <i className="fa-brands fa-whatsapp me-2"></i>
            WhatsApp
          </button>
          <button
            className={`btn btn-sm ${values.mode === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
            type="button"
            onClick={() => setFieldValue("mode", "email")}
          >
            <i className="fa-regular fa-envelope me-2"></i>
            Email
          </button>
        </div>

        {values.mode === "whatsapp" ? (
          <div>
            <p className="text-muted small mb-3">
              <i className="fa fa-info-circle me-1"></i> Use toggles to customize the content according to your needs.
            </p>

            {/* Checkboxes Row */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <div className="form-check custom-checkbox">
                <input type="checkbox" className="form-check-input" id="priceBreakup" checked={values.priceBreakup} onChange={(e) => setFieldValue('priceBreakup', e.target.checked)} />
                <label className="form-check-label ms-1" htmlFor="priceBreakup">Price Breakup</label>
              </div>
              <div className="form-check custom-checkbox">
                <input type="checkbox" className="form-check-input" id="hideTotalPrice" checked={values.hideTotalPrice} onChange={(e) => setFieldValue('hideTotalPrice', e.target.checked)} />
                <label className="form-check-label ms-1" htmlFor="hideTotalPrice">Hide Total Price</label>
              </div>
              <div className="form-check custom-checkbox">
                <input type="checkbox" className="form-check-input" id="itinerary" checked={values.itinerary} onChange={(e) => setFieldValue('itinerary', e.target.checked)} />
                <label className="form-check-label ms-1" htmlFor="itinerary">Itinerary</label>
              </div>
              <div className="form-check custom-checkbox">
                <input type="checkbox" className="form-check-input" id="pdf" checked={values.pdf} onChange={(e) => setFieldValue('pdf', e.target.checked)} />
                <label className="form-check-label ms-1" htmlFor="pdf">PDF</label>
              </div>
              <div className="form-check custom-checkbox">
                <input type="checkbox" className="form-check-input" id="terms" checked={values.terms} onChange={(e) => setFieldValue('terms', e.target.checked)} />
                <label className="form-check-label ms-1" htmlFor="terms">Terms</label>
              </div>
              <div className="ms-auto flex-shrink-0">
                <button 
                  className="btn btn-outline-primary btn-sm rounded-pill px-3" 
                  type="button" 
                  onClick={handleDownloadPdf}
                >
                  <i className="fa fa-download me-1"></i> Download PDF
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div 
              className="p-3 mb-4 rounded" 
              style={{ backgroundColor: "#eaf5ea", minHeight: "250px", border: "1px solid #c3e6cb", whiteSpace: "pre-wrap", fontSize: "13px", color: "#333" }}
            >
              {generatedText}
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center">
              <button className="btn btn-success me-3" onClick={handleWhatsAppSend}>
                <i className="fa-brands fa-whatsapp me-2"></i> Send on WhatsApp
              </button>
              
              <button className="btn btn-outline-secondary" onClick={handleCopy}>
                <i className="fa-regular fa-copy me-2"></i> Copy
              </button>

              <span className="ms-auto text-muted small cursor-pointer" onClick={() => setFieldValue("mode", "email")}>
                Prefer Email? Send via Email instead.
              </span>
            </div>
          </div>
        ) : (
          <div className="basic-form">
            <form onSubmit={formSubmit}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <p>Share your itinerary privately via email to specific recipients. Recipients will be prompted to create a login in order to view this itinerary.</p>
                  <h6 className="mb-1">Clients</h6>
                  <p className="text-muted small">Select client you would like to email this itinerary to.</p>
                </div>
                
                <div className="col-md-4">
                  <InputField label="Name" name="name" onChange={handleChange} onBlur={handleBlur} values={values} formik={formik} required disabled={readOnly} />
                </div>
                <div className="col-md-4">
                  <InputField label="Email" name="email" onChange={handleChange} onBlur={handleBlur} values={values} formik={formik} required disabled={readOnly} />
                </div>
                <div className="col-md-4">
                  <InputField label="Number" name="number" onChange={handleChange} onBlur={handleBlur} values={values} formik={formik} required disabled={readOnly} />
                </div>
                <div className="col-md-12">
                  <InputField label="CC Mail" name="ccMail" onChange={handleChange} onBlur={handleBlur} values={values} formik={formik} disabled={readOnly} />
                </div>
                <div className="col-md-12">
                  <InputField isTextarea={true} label="Add a message" name="message" onChange={handleChange} onBlur={handleBlur} values={values} formik={formik} disabled={readOnly} />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary px-4">Send Email</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default ShareModal;
