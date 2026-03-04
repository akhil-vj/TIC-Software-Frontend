import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const LockPINSetup = () => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Check if PIN already exists
    const existingPin = localStorage.getItem("lockPIN");
    if (existingPin) {
      setCurrentPin(existingPin);
    }
  }, []);

  const handleSetPIN = (e) => {
    e.preventDefault();

    if (!pin.trim()) {
      Swal.fire("Error", "Please enter a PIN", "error");
      return;
    }

    if (pin.length < 4) {
      Swal.fire("Error", "PIN must be at least 4 characters", "error");
      return;
    }

    if (pin !== confirmPin) {
      Swal.fire("Error", "PINs do not match", "error");
      return;
    }

    // Save PIN to localStorage
    localStorage.setItem("lockPIN", pin);
    setCurrentPin(pin);
    setPin("");
    setConfirmPin("");
    setShowForm(false);

    Swal.fire("Success", "Lock PIN set successfully!", "success");
  };

  const handleRemovePIN = () => {
    Swal.fire({
      title: "Remove Lock PIN?",
      text: "You will need to set a new PIN to use the lock screen feature.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("lockPIN");
        setCurrentPin("");
        Swal.fire("Removed", "Lock PIN has been removed.", "success");
      }
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Lock Screen PIN</h5>
        <span className="text-muted d-block mt-1">
          Set a PIN code to unlock your screen when locked due to inactivity
        </span>
      </div>
      <div className="card-body">
        {currentPin ? (
          <div className="alert alert-success" role="alert">
            <strong>PIN is set</strong>
            <p className="mb-2 mt-2">Your lock screen PIN is configured.</p>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Change PIN"}
            </button>
            <button
              className="btn btn-sm btn-danger ms-2"
              onClick={handleRemovePIN}
            >
              Remove PIN
            </button>
          </div>
        ) : (
          <div className="alert alert-warning" role="alert">
            <strong>No PIN set</strong>
            <p className="mb-2 mt-2">
              You need to set a PIN to use the lock screen feature.
            </p>
          </div>
        )}

        {!currentPin || showForm ? (
          <form onSubmit={handleSetPIN} className="mt-3">
            <div className="mb-3">
              <label htmlFor="pin" className="form-label">
                Enter PIN (4+ digits/characters)
              </label>
              <input
                type="password"
                className="form-control"
                id="pin"
                placeholder="e.g., 1234 or MyPin123"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPin" className="form-label">
                Confirm PIN
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPin"
                placeholder="Re-enter PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
              />
            </div>

            <div className="form-text text-muted mb-3">
              <i className="fa fa-info-circle"></i> Use a PIN you'll remember.
              This is stored locally on your device.
            </div>

            <button type="submit" className="btn btn-primary">
              {currentPin ? "Update PIN" : "Set PIN"}
            </button>
            {currentPin && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            )}
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default LockPINSetup;
