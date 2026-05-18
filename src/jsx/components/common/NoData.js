import React from "react";

const NoData = ({ colSpan = 8, isCard, isLoading }) => {
  return (
    <>
      {isLoading ? (
        <>
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
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </>
      ) : (
        <>
          {isCard ? (
            <h3 className="text-center">No Data Found !</h3>
          ) : (
            <div style={{ textAlign: "center" }}>No Data Found !</div>
          )}
        </>
      )}
    </>
  );
};

export default NoData;
