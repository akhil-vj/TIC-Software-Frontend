import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { URLS } from "../../../../constants";

const SubDestination = () => {
  return (
    <>
      <FieldComponent
        title="Sub Destination"
        addTitle="Sub Destination"
        url={URLS.SUB_DESTINATION_URL}
        parentName="Destination"
        parentValue="destination_name"
        parentId="destination_id"
        parentUrl={URLS.DESTINATION_URL}
      />
    </>
  );
};

export default SubDestination;
