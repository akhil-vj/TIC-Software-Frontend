import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";

const Destination = () => {
  const url = URLS.DESTINATION_URL;
  return (
    <>
      <FieldComponent title="Destination" addTitle="Destination" url={url} />
    </>
  );
};

export default Destination;
