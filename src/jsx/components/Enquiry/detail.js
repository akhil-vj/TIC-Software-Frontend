import React from 'react';
import { URLS } from '../../../constants';
import { DetailComponent } from '../common/DetailComponent';

function EnquiryDetail() {

  const url = URLS.ENQUIRY_URL
  const array = [
    { label: "Type", value: "type" },
    // { label: "Name", value: "name" },
    { label: "Agent", value: ["agent", "name"] },
    { label: "Customer", value: ["customer", "name"] },
    { label: "Lead Source", value: ["lead_source", "name"] },
    { label: "Destination", value: ["destination", "name"] },
    { label: "Sub Destination", value: ["sub_destination", "name"] },
    { label: "Adult", value: "adult_count" },
    { label: "Child", value: "child_count" },
    { label: "Infant", value: "infant_count" },
    // { label: "Requirement", value: ["requirements", "name"] },
    // { label: "Package Details", value: "is_active" },
    { label: "Assigned To", value: ["assigned_to_user","first_name"] },
    { label: "Date", value: "start_date" }
  ];
  return (
    <>
    <DetailComponent title="Enquiry" url={url} array={array}/>
    </>
  );
}

export default EnquiryDetail;
