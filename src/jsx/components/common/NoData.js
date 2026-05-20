import React from "react";

const NoData = ({ colSpan = 8, isCard, isLoading, isTableRow = false }) => {
  const content = isLoading ? (
    <div className="d-flex justify-content-center my-5">
      <div
        className="spinner-border text-primary"
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : isCard ? (
    <h3 className="text-center">No Data Found !</h3>
  ) : (
    <div style={{ textAlign: "center" }}>No Data Found !</div>
  );

  // If used inside a table tbody, return a tr with td
  if (isTableRow) {
    return (
      <tr>
        <td colSpan={colSpan} style={{ textAlign: "center", padding: "20px" }}>
          {content}
        </td>
      </tr>
    );
  }

  // Otherwise return as div
  return <>{content}</>;
};

export default NoData;
