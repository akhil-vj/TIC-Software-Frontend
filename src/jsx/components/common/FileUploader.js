import React, { useState } from "react";
import { checkIsFile } from "../../utilis/check";
import { getApiBaseUrl } from "../../../services/apiConfig";
import { axiosDelete } from "../../../services/AxiosInstance";
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
    
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      const separator = image.startsWith('/') ? '' : '/';
      return `${baseUrl}${separator}${image}`;
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

  // Helper function to resize images using Canvas
  const resizeImage = (file, targetWidth = 1280, targetHeight = 720) => {
    return new Promise((resolve) => {
      // If not an image, skip resizing
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Fill with white background (useful for transparent PNGs if converted to JPEG)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate scale to "cover" the target dimensions (maintain aspect ratio)
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const x = (targetWidth - img.width * scale) / 2;
          const y = (targetHeight - img.height * scale) / 2;
          const width = img.width * scale;
          const height = img.height * scale;

          ctx.drawImage(img, x, y, width, height);

          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }, file.type, 0.85); // 85% quality for good balance
        };
        img.onerror = () => resolve(file); // Fallback to original if image load fails
      };
      reader.onerror = () => resolve(file); // Fallback to original if file read fails
    });
  };

  // This function will be triggered when the file field change
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Resize images if needed
      const processedFiles = await Promise.all(
        selectedFiles.map(file => resizeImage(file))
      );

      if (isMulti) {
        // Append new files to existing fileData
        setFieldValue(name, [...(fileData || []), ...processedFiles]);
      } else {
        // Replace with single file
        setFieldValue(name, processedFiles[0]);
      }
    }
  };

  // This function will be triggered when the "Remove This Image" button is clicked
const handleRemove = async (img, index) => {
  try {
    // 🔴 If image exists in backend
    if (img && img.id) {
      await axiosDelete(`api/hotel-image/${img.id}`);
    }

    // 🔴 Update UI after success
    if (isMulti) {
      const updated = [...(fileData || [])];
      updated.splice(index, 1);
      setFieldValue(name, updated);
    } else {
      setFieldValue(name, null);
    }

  } catch (error) {
    console.error("Delete failed", error);
    alert("Failed to delete image");
  }
};
  const isPreview = isMulti ? !!fileData?.length : !!fileData;

  return (
    <div className="form-group" key={key}>
      <div className="my-3">
        {label && (
          <label htmlFor={name} className="form-label">
            {label} {required && <span>*</span>}
          </label>
        )}
        <input
          {...restProps}
          className="form-control"
          type={type}
          multiple={isMulti}
          name={name}
          onChange={onFileChange}
        />
      </div>
      {isPreview && (
        <div className="row mt-3">
          <div className="col-12 mb-3">
            <h4 className="text-primary font-w600">Image Preview</h4>
          </div>
          {isMulti ? (
            fileData?.map((img, key) => (
              <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-4" key={key}>
                <div style={styles.previewCard}>
                  <div style={styles.imageWrapper}>
                    <img
                      src={buildImageUrl(img)}
                      style={styles.image}
                      alt={`hotel-${key}`}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-block shadow-none"
                    style={styles.deleteBtn}
                    onClick={() => handleRemove(img, key)}
                  >
                    <i className="fa fa-trash me-2"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-4">
              <div style={styles.previewCard}>
                <div style={styles.imageWrapper}>
                  <img
                    src={buildImageUrl(fileData)}
                    style={styles.image}
                    alt="hotel-preview"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-block shadow-none"
                  style={styles.deleteBtn}
                  onClick={() => handleRemove()}
                >
                  <i className="fa fa-trash me-2"></i>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Just some styles
const styles = {
  previewCard: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    border: "1px solid #eee",
    backgroundColor: "#fff",
    transition: "transform 0.3s ease",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%", // 16:9 Aspect Ratio
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  deleteBtn: {
    width: "100%",
    borderRadius: "0",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "500",
  },
};
