import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../../../utilis/useAsync";
import { URLS } from "../../../../constants";
import { Table } from "react-bootstrap";
import NoData from "../../common/NoData";
function RoleDetail() {
  const { id } = useParams();
  const detailUrl = `${URLS.USER_ROLE_URL}/${id}`;
  const { data } = useAsync(detailUrl, !!id);
  const detailData = data?.data;
  const permissionData = useAsync(URLS.PERMISSION_URL);
  const tableData = permissionData?.data?.data;
  const DetailComponent = ({ label, value, style }) => {
    return (
      <div className="mb-3">
        <h4 className="text-primary">{label}:</h4>
        <h6>{value}</h6>
      </div>
    );
  };
  const permission = ["read", "write", "update", "delete"];
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getValue = (module = "", type) => {
    const slugToFind = `${module.toLowerCase()}-${type}`;
    const permission = detailData?.permissions;
    const result = permission.find(
      (item) => item?.slug?.split("-").slice(0, 2).join("-") === slugToFind
    );
    if (result) {
      return result.name;
    } else {
      return "None";
    }
  };
  return (
    <div className="container my-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="text-white">Role Details</h4>
        </div>
        <div className="card-body">
          {permissionData?.loading || tableData?.loading
            ? <NoData isLoading={permissionData?.loading || tableData?.loading} /> :
            <>
              <DetailComponent label="Name" value={detailData?.name} />
              <div className="col-12 mt-4">
                <Table responsive className="custom-table-bordered">
                  <thead className="thead-table">
                    <tr>
                      <th className="">Module</th>
                      {permission.map((data) => (
                        <th className="" key={data}>
                          {data}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!!detailData?.permissions?.length ? (
                      <>
                        {tableData?.map((item, ind) => (
                          <tr key={ind}>
                            <td className="">
                              {capitalizeFirstLetter(item?.name)}
                            </td>
                            <td>{getValue(item?.name, "read")}</td>
                            <td>{getValue(item?.name, "write")}</td>
                            <td>{getValue(item?.name, "update")}</td>
                            <td>{getValue(item?.name, "delete")}</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr id="empty-table-data">
                        <td colSpan={8} style={{ textAlign: "center" }}>
                          Empty !
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default RoleDetail;
