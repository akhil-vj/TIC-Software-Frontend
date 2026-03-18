import React, { useState } from "react";
import { checkIsFile } from "../../utilis/check";
import { getApiBaseUrl } from "../../../services/apiConfig";
import { deleteHotelImage } from "../../../services/HotelService";

const baseUrl = getApiBaseUrl();

export function FileUploader(props) {
  const {
    key = "",
    type = "file",
    label,
    name,
    values,
    setFieldValue,
    inputValue = "",
    className = "",
    labelClassName = "",
    inputClassName = "",
    onChange,
    required = false,
    ...restProps
  } = props;

  const fileData = values[name];
  const isMulti = !!restProps.isMulti;

  // Debug: Log file data when it changes
  React.useEffect(() => {
    console.log(`FileUploader [${name}] - fileData:`, fileData);
  }, [fileData, name]);

  // Build proper image URL from file_url
  const buildImageUrl = (image) => {
    if (!image) return '';
    
    // If it's a File object, create blob URL
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    
    // If it's an API response object with file_url
    const rawUrl = image?.file_url || image?.file || image?.url || image?.original_url || image?.path || '';
    if (!rawUrl) return '';
    
    // If already a full URL, return as is
    if (typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
      return rawUrl;
    }
    
    // Construct full URL with baseUrl
    const separator = rawUrl.startsWith('/') ? '' : '/';
    return `${baseUrl}${separator}${rawUrl}`;
  };

  // This function will be triggered when the file field change
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (isMulti) {
        setFieldValue(name, [e.target.files[0], ...fileData]);
      } else {
        setFieldValue(name, e.target.files[0]);
      }
    }
  };

  // This function will be triggered when the "Remove This Image" button is clicked
  const handleRemove = async (id) => {
    if (isMulti) {
      // If it's an existing image (has id), delete from database first
      if (id) {
        try {
          await deleteHotelImage(id);
        } catch (error) {
          console.error("Failed to delete image from database:", error);
          // Optionally, show an error message or prevent removal
          return;
        }
      }
      // Handle both File objects (which have .name) and API objects (which have .id)
      const filterData = fileData.filter((data) => data.name !== id && data.id !== id);
      setFieldValue(name, filterData);
    } else {
      // For single file, if it has an id, delete from database
      if (fileData && fileData.id) {
        try {
          await deleteHotelImage(fileData.id);
        } catch (error) {
          console.error("Failed to delete image from database:", error);
          return;
        }
      }
      setFieldValue(name, "");
    }
  };
  const isPreview = isMulti ? !!fileData?.length : !!fileData;

  return (
    <div className="form-group" key={key}>
      <div className="my-3">
        {label && (
          <label htmlFor="formFileMultiple" className="form-label">
            {label} {required && <span>*</span>}
          </label>
        )}
        <input
          {...restProps}
          className="form-control"
          type={type}
          // id="formFileMultiple"
          // multiple={isMulti}
          name={name}
          onChange={onFileChange}
        />
      </div>
      {isPreview && (
        <div className="row" style={styles.container}>
          <div className="mb-2">
            <h3>Preview</h3>
          </div>
          <>
            {isMulti ? (
              fileData?.map((img, key) => (
                <div className="col-md-6 col-lg-4" key={key}>
                  <div style={styles.preview}>
                    <img
                      src={buildImageUrl(img)}
                      style={styles.image}
                      alt="Thumb"
                    />
                    <button
                      className="bg-danger"
                      onClick={() => handleRemove(img.name || img.id)}
                      style={styles.delete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-md-6 col-lg-4" key={key}>
                <div style={styles.preview}>
                  <img
                    src={buildImageUrl(fileData)}
                    style={styles.image}
                    alt="Thumb"
                  />
                  <button
                    className="bg-danger"
                    onClick={() => handleRemove()}
                    style={styles.delete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </>
        </div>
      )}
    </div>
  );
}

// Just some styles
const styles = {
  container: {
    // display: "flex",
    // flexDirection: "column",
    // justifyContent: "center",
    // alignItems: "center",
    padding: 50,
  },
  preview: {
    margin: "10px 0",
    display: "flex",
    flexDirection: "column",
  },
  image: { maxWidth: "100%", maxHeight: 100 },
  delete: {
    cursor: "pointer",
    padding: 10,
    // background: "red",
    color: "white",
    border: "none",
    maxWidth: "100%",
  },
};
