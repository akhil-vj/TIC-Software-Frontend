import React, { useMemo, useState } from "react";
import CustomModal from "../../../layouts/CustomModal";
import notify from "../../common/Notify";
import Img1 from "../../../../images/course/hotel-1.jpg";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import NoData from "../../common/NoData";

const getDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) return null;
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : null;
};

function InsertModal({ showModal, setShowModal, onInsert }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error } = useAsync(URLS.ITINERARY_URL, showModal);
  const itineraries = data?.data || [];

  const filteredItineraries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return itineraries;
    return itineraries.filter((item) => {
      const haystack = [
        item?.package_name,
        item?.name,
        item?.id,
        item?.destination?.name,
      ]
        .filter(Boolean)
        .map((val) => String(val).toLowerCase());
      return haystack.some((val) => val.includes(term));
    });
  }, [itineraries, searchTerm]);

  const handleInsert = (itinerary) => {
    if (onInsert) {
      onInsert(itinerary);
    }
    setShowModal(false);
    notify({ message: "Added Successfully" });
    setSearchTerm("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchTerm("");
  };

  return (
    <>
      <CustomModal
        showModal={showModal}
        title={"Insert itinerary"}
        handleModalClose={handleClose}
        modalClass="insert-modal"
      >
        <div className="d-flex flex-column">
          <div>
            <div className="input-group search-area flex-1">
              <input
                type="text"
                className={`form-control ${searchTerm ? "active" : ""} border-0`}
                placeholder="Search name or itinerary id ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="input-group-text">
                {/* <Link to={"#"}> */}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5605 15.4395L13.7527 11.6317C14.5395 10.446 15 9.02625 15 7.5C15 3.3645 11.6355 0 7.5 0C3.3645 0 0 3.3645 0 7.5C0 11.6355 3.3645 15 7.5 15C9.02625 15 10.446 14.5395 11.6317 13.7527L15.4395 17.5605C16.0245 18.1462 16.9755 18.1462 17.5605 17.5605C18.1462 16.9747 18.1462 16.0252 17.5605 15.4395V15.4395ZM2.25 7.5C2.25 4.605 4.605 2.25 7.5 2.25C10.395 2.25 12.75 4.605 12.75 7.5C12.75 10.395 10.395 12.75 7.5 12.75C4.605 12.75 2.25 10.395 2.25 7.5V7.5Z"
                    fill="#01A3FF"
                  />
                </svg>
                {/* </Link> */}
              </span>
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <div className="mt-5 d-flex flex-wrap justify-content-center">
              {filteredItineraries.length ? (
                filteredItineraries.map((item, key) => {
                  const duration =
                    item?.days ||
                    item?.total_days ||
                    getDayCount(item?.start_date, item?.end_date);
                  const price =
                    item?.net_amount !== undefined && item?.net_amount !== null
                      ? `${item.net_amount} ${item?.currency || ""}`.trim()
                      : "N/A";
                  const coverImage =
                    item?.document_2?.[0]?.file_url ||
                    item?.image ||
                    item?.thumbnail ||
                    Img1;
                  return (
                    <div className="itinery-card me-2 mb-2" key={item?.id || key}>
                      <div>
                        <img src={coverImage} className="itinery-img" alt="itinerary" />
                      </div>
                      <div className="d-flex justify-content-between p-3 pt-3 details">
                        <div>
                          <h6 className="mb-0">
                            {item?.package_name || item?.name || `Itinerary ${key + 1}`}
                          </h6>
                          <p className="mb-0">
                            {duration ? `${duration} days` : "Duration not set"}
                          </p>
                          <p className="mb-0">
                            {item?.start_date && item?.end_date
                              ? `${item.start_date} - ${item.end_date}`
                              : ""}
                          </p>
                          <p className="mb-0">Price : {price}</p>
                        </div>
                        <div>
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => handleInsert(item)}
                          >
                            <i className="fa-solid fa-plus text-white"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <NoData isCard isLoading={loading} />
              )}
              {error && !loading ? (
                <div className="text-danger text-center w-100 mt-3">
                  Failed to load itineraries. Please try again.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
}

export default InsertModal;
