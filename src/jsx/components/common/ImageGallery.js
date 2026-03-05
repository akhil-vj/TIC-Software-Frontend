import React, { useState } from 'react';
import { getApiBaseUrl } from '../../../services/apiConfig';

const baseUrl = getApiBaseUrl();

export const ImageGallery = ({ data = [], imageUrl = 'file_url' }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const normalizeSrc = (image) => {
    if (!image) return '';
    const rawSrc =
      typeof image === 'string'
        ? image
        : image?.[imageUrl] ||
          image?.file_url ||
          image?.file ||
          image?.url ||
          image?.original_url ||
          image?.path ||
          '';
    if (!rawSrc) return '';
    if (typeof rawSrc === 'string' && rawSrc.startsWith('http')) return rawSrc;
    const sep = rawSrc.startsWith('/') ? '' : '/';
    return `${baseUrl}${sep}${rawSrc}`;
  };

  const handleImageClick = (image) => {
    const src = normalizeSrc(image);
    if (src) {
      setSelectedImage(src);
    }
  };

  const renderThumbnail = (image, index) => {
    const src = normalizeSrc(image);
    if (!src) return null;
    return (
      <div key={index} className="col-4 mb-4">
        <img
          src={src}
          alt={`Image ${index}`}
          className="img-thumbnail"
          onClick={() => handleImageClick(image)}
        />
      </div>
    );
  };

  return (
    <div className="container mt-4">
      {selectedImage && (
        <div className="modal" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-body text-center">
                <img src={selectedImage} alt="Selected Image" className="img-fluid" />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => setSelectedImage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="row">
        {data?.map(renderThumbnail)}
      </div>
    </div>
  );
};
