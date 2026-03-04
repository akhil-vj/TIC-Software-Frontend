import React, { useEffect, useMemo } from "react";
import CustomModal from "../../../layouts/CustomModal";
import { useFormik } from "formik";
import InputField from "../../common/InputField";
import SelectField from "../../common/SelectField";
import { axiosPost, axiosPut } from "../../../../services/AxiosInstance";
import { useDispatch } from "react-redux";
import { FormAction } from "../../../../store/slices/formSlice";
import { URLS } from "../../../../constants";
import { useAsync } from "../../../utilis/useAsync";
import { notifyCreate, notifyError } from "../../../utilis/notifyMessage";

const AddModal = ({ showModal, setShowModal, editId, setEditId }) => {
  const dispatch = useDispatch();
  const isEdit = !!editId;
  const editUrl = `${URLS.DAY_ITINERARY_URL}/${editId}`;
  const editData = useAsync(editUrl, isEdit);

  const destinationData = useAsync(URLS.DESTINATION_URL);
  const destinationList = destinationData?.data?.data;

  const subDestinations = useAsync(URLS.SUB_DESTINATION_URL);
  const subDestinationList = subDestinations?.data?.data;

  const formik = useFormik({
    initialValues: {
      name: "",
      destination_id: "",
      sub_destination_id: "",
      description: "",
    },
    onSubmit: async (values) => {
      try {
        let response;
        if (isEdit) {
          response = await axiosPut(editUrl, values);
        } else {
          response = await axiosPost(URLS.DAY_ITINERARY_URL, values);
        }
        if (response?.success) {
          dispatch(FormAction.setRefresh());
          notifyCreate("Day Itinerary", isEdit);
          setShowModal(false);
          setEditId("");
          formik.resetForm();
        }
      } catch (error) {
        notifyError("Something went wrong");
      }
    },
  });

  const filteredSubDestinations = useMemo(() => {
    const selectedDestination = formik.values.destination_id;
    if (!selectedDestination) return subDestinationList;
    return subDestinationList?.filter(
      (item) => `${item.destination_id}` === `${selectedDestination}`,
    );
  }, [formik.values.destination_id, subDestinationList]);

  useEffect(() => {
    const record = editData?.data?.data;
    if (record && isEdit) {
      formik.setValues({
        name: record.name || "",
        destination_id: record.destination_id || "",
        sub_destination_id: record.sub_destination_id || "",
        description: record.description || "",
      });
    }
    return () => {
      formik.resetForm();
    };
  }, [editId, editData?.loading]);

  return (
    <CustomModal
      showModal={showModal}
      title={`${isEdit ? "Edit" : "Add"} Day Itinerary`}
      handleModalClose={() => {
        setShowModal(false);
        setEditId("");
        formik.resetForm();
      }}
    >
      <div className="card-body">
        <div className="basic-form">
          <form onSubmit={formik.handleSubmit}>
            <div className="row">
              <div className="mb-3 col-md-6">
                <InputField
                  label="Name"
                  name="name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <SelectField
                  label="Destination"
                  name="destination_id"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                  options={destinationList}
                  optionValue="id"
                  optionLabel="name"
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <SelectField
                  label="Sub Destination"
                  name="sub_destination_id"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  values={formik.values}
                  options={filteredSubDestinations}
                  optionValue="id"
                  optionLabel="name"
                />
              </div>
              <div className="mb-3 col-md-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Add a short outline for this day"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Update" : "Add"} Day Itinerary
            </button>
          </form>
        </div>
      </div>
    </CustomModal>
  );
};

export default AddModal;
