import React from "react";
import { Modal, Button } from "react-bootstrap";

// Simple iframe-based PDF preview to avoid worker/setup issues with react-pdf
export const ViewerModal = ({ file, showModal, handleClose }) => {
  const hasFile = !!file;
  const downloadFile = () => {
    if (!file) return;
    const link = document.createElement("a");
    link.href = file;
    link.target = "_blank";
    link.download = "document.pdf";
    link.click();
  };

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>PDF Viewer</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: "80vh", padding: 0 }}>
        {hasFile ? (
          <iframe
            title="PDF Preview"
            src={file}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div className="p-4 text-center">No preview available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={downloadFile} disabled={!hasFile}>
          Download
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
