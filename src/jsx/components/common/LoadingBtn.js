import React from 'react';
import { useSelector } from 'react-redux';

export function LoadingButton({ label, onClick,type='submit',className,disabled=false }) {
  const {loading} = useSelector(state => state.form)
  return (
    <button
      className={`btn btn-primary ${className}`}
      disabled={loading || disabled}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <div
        className="spinner-border text-light spinner-border-sm"
        // style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      ) : (
        label
      )}
    </button>
  );
}
