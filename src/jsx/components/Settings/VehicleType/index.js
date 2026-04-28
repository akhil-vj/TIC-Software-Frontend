import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { URLS } from "../../../../constants";

const VehicleType = () => {
  const url = URLS.VEHICLE_TYPE_URL;
  return (
    <>
      <FieldComponent title="Vehicle Type" addTitle="Vehicle Type" url={url} />
    </>
  );
};

export default VehicleType;
