import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { URLS } from "../../../../constants";

const Currency = () => {
  return (
    <>
      <FieldComponent title="Currency" addTitle="Currency" url={URLS.CURRENCY_URL} />
    </>
  );
};

export default Currency;
