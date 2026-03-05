import React from "react";
import FieldComponent from "../../common/FieldComponent";
import { URLS } from "../../../../constants";

const MailSettings = () => {
  return (
    <>
      <FieldComponent
        title="Mail Settings"
        addTitle="Mail Setting"
        url={URLS.MAIL_SETTINGS_URL}
      />
    </>
  );
};

export default MailSettings;
