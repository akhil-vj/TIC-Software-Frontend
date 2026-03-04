import React, { useState } from "react";
import FieldComponent from "../../common/FieldComponent";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";

const DestinationManagement = () => {
  const [activeTab, setActiveTab] = useState("destination");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${activeTab === "destination" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleTabChange("destination")}
            >
              Destinations
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "sub-destination" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleTabChange("sub-destination")}
            >
              Sub Destinations
            </button>
          </div>
        </div>
      </div>

      {activeTab === "destination" && (
        <FieldComponent 
          title="Destination" 
          addTitle="Destination" 
          url={URLS.DESTINATION_URL} 
        />
      )}

      {activeTab === "sub-destination" && (
        <FieldComponent
          title="Sub Destination"
          addTitle="Sub Destination"
          url={URLS.SUB_DESTINATION_URL}
          parentName="Destination"
          parentValue="destination_name"
          parentId="destination_id"
          parentUrl={URLS.DESTINATION_URL}
        />
      )}
    </>
  );
};

export default DestinationManagement;
