import React, { useEffect } from "react";
import CustomModal from "../../layouts/CustomModal";
import { axiosDelete, axiosGet, axiosPatch, axiosPost, axiosPut } from "../../../services/AxiosInstance";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../store/slices/formSlice";
import { notifyDelete, notifyError, notifySuccess } from "../../utilis/notifyMessage";

const ConfirmationModal = (props) => {
  const { showModal, setShowModal, name = "", url = "", type = 'delete', method = 'DELETE' } = props;
  const dispatch = useDispatch();
  const typeValue = type === 'status' ? '' : 'Delete'
  const isDelete = type === 'delete'

  const onClose = () => {
    setShowModal(false);
  };
  const onPress = async () => {
    try {
      let response
      if (type === 'status') {
        response = await axiosPatch(url);
      } else {
        if (method === 'GET') {
          response = await axiosGet(url);
        } else if (method === 'POST') {
          response = await axiosPost(url);
        } else if (method === 'PUT') {
          response = await axiosPut(url);
        } else {
          response = await axiosDelete(url);
        }
      }
      if (response.success) {
        dispatch(FormAction.setRefresh());
        setShowModal(false);
        if (isDelete) {
          notifyDelete(name);
        } else {
          notifySuccess(`${name} Updated Successfully`)
        }
      }
    } catch (error) {
      notifyError("Something went wrong !");
    }
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (showModal && event.key === 'Enter') {
        event.preventDefault();
        onPress();
      }
    };

    if (showModal) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showModal, url, type, name, dispatch]);
  return (
    <CustomModal showModal={showModal} title={""} handleModalClose={onClose}>
      <div className="row">
        <div className="col-12">
          <h5 className="mb-4">
            Are you sure you want to {typeValue}
            <span className={`fw-bold ${isDelete ? 'text-danger' : 'text-primary'} mx-1`}>{name}</span> ?
          </h5>
          <button className="btn btn-primary" onClick={onClose}>
            Cancel
          </button>
          <button className={`btn ${isDelete ? 'btn-danger' : 'btn-success'} ms-3`} onClick={onPress}>
            {type === 'status' ? 'Update' : typeValue}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ConfirmationModal;
