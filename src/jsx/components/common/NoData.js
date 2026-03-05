import React from "react";

const NoData = ({ colSpan = 8, isCard, isLoading }) => {
  return (
    <>
      {isLoading ? (
        <>
          {/* <div className="d-flex justify-content-center my-5">
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div> */}
          {isCard ? (
            <div className="d-flex justify-content-center my-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <tr id="empty-table-data">
              <td colSpan={colSpan} style={{ textAlign: "center" }}>
                <div
                  className="spinner-border text-primary"
                  style={{ width: "3rem", height: "3rem" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          )}
        </>
      ) : (
        <>
          {isCard ? (
            <h3 className="text-center">No Data Found !</h3>
          ) : (
            <tr id="empty-table-data">
              <td colSpan={colSpan} style={{ textAlign: "center" }}>
                No Data Found !
              </td>
            </tr>
          )}
        </>
      )}
    </>
  );
};

export default NoData;
