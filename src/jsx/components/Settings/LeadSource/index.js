import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";

const LeadSource = () => {
  const url = URLS.LEAD_SOURCE_URL;
  return (
    <>
      <FieldComponent title="Lead Source" addTitle="Source" url={url} />
    </>
  );
};

export default LeadSource;
