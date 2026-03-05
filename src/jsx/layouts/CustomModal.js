import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

const CustomModal = ({
  showModal,
  handleModalClose,
  title,
  children,
  modalClass = "",
  style,
  ...props
}) => {
  return (
    <>
      <Modal
        show={showModal}
        onHide={handleModalClose}
        dialogClassName={`custom-modal ${modalClass}`}
        style={style}
        {...props}
        // centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{children}</Modal.Body>
      </Modal>
    </>
  );
};

export default CustomModal;
