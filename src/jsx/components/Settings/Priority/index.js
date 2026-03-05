import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";

const Priority = () => {
  const url = URLS.PRIORITY_URL;
  return (
    <>
      <FieldComponent title="Priority" addTitle="Priority" url={url} />
    </>
  );
};

export default Priority;
