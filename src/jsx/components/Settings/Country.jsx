import React from "react";
import FieldComponent from "../common/FieldComponent";
import { URLS } from "../../../constants";

const Country = () => {
    const url = URLS.COUNTRY_URL;
    return (
        <>
            <FieldComponent title="Country" addTitle="Country" url={url} />
        </>
    );
};

export default Country;
