import React from "react";

export const ModeBtn = ({ isEdit, readOnly, setReadOnly, className = "" }) => {
  return (
    <>
      {isEdit && (
        <div className={className}>
          <button
            className="btn btn-primary mb-3"
            type="button"
            onClick={() => {
              setReadOnly((prev) => !prev);
            }}
          >
            {/* {readOnly?'Read Mode':'Write Mode'} */}
            <i className={`fas ${readOnly ? "fa-pen" : "fa-eye"}`}></i>
          </button>
        </div>
      )}
    </>
  );
};
