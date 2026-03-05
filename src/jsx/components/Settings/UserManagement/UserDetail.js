import React from 'react';
import { URLS } from "../../../../constants";
import { DetailComponent } from "../../common/DetailComponent";

function UserDetail() {

  const url = URLS.USER_GET_BY_ID_URL
  const array = [
    { label: 'Username', value: 'username' },
    { label: 'Name', value: 'first_name' },
    { label: 'Role', value: ['roles', '0', 'name'] },
    { label: 'Email', value: 'email' },
    { label: 'Phone Number', value: 'phone' },
    { label: 'Language', value: 'language_name' },
    { label: 'Address', value: 'address' },
    { label: 'Country', value: ['country', 'name'] },
    { label: 'Expire Date', value: 'end_date' },
  ]
  return (
    <>
      <DetailComponent title="User" url={url} array={array} />
    </>
  );
}

export default UserDetail;
