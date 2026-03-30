import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { URLS } from "../../../../constants";

const ActivityType = () => {
  const url = URLS.ACTIVITY_TYPE_URL;
  return (
    <>
      <FieldComponent title="Activity Type" addTitle="Activity Type" url={url} />
    </>
  );
};

export default ActivityType;
