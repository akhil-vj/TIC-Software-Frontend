import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";

const Requirement = () => {
  const url = URLS.REQUIREMENT_URL;
  return (
    <>
      <FieldComponent title="Requirement" addTitle="Requirement" url={url} />
    </>
  );
};

export default Requirement;
