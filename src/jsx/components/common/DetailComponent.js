import React, { Fragment } from "react";
import { useParams } from "react-router-dom";
import { Table } from "react-bootstrap";
import { useAsync } from "../../utilis/useAsync";
import NoData from "./NoData";
import { ImageGallery } from "./ImageGallery";
import { getApiBaseUrl } from "../../../services/apiConfig";

const baseUrl = getApiBaseUrl();

export const DetailComponent = ({ title = "", url, array = [], id: propId }) => {
  const params = useParams();
  const id = propId || params?.id;
  const detailUrl = `${url}/${id}`;
  const { data, loading } = useAsync(detailUrl, !!id);
  const detailData = data?.data;
  const LabelValueComponent = ({ label, value, style }) => {
    const isArray = Array.isArray(value)
    let listValue
    if(isArray){
      listValue = value?.map(item => item.name).join(', ')
    }
    let dataValue = value || typeof value === 'number' ? value : 'Nil'
    return (
      <div className="mb-3 d-flex align-items-center">
        <h4 className="text-primary me-1">{label} :</h4>
        <h6>{isArray ? listValue : dataValue }</h6>
      </div>
    );
  };
  
  const buildImageUrl = (rawUrl) => {
    if (!rawUrl) return '';
    
    // If already a full URL, return as is
    if (typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
      return rawUrl;
    }
    
    // Construct full URL with baseUrl
    const separator = rawUrl?.startsWith('/') ? '' : '/';
    return `${baseUrl}${separator}${rawUrl}`;
  };
  
  const getValue = (val,data = detailData) => {
    const keys = val;
    // const data = detailData;
    if (Array.isArray(keys)) {
      let value = data;
      keys.forEach((key) => {
        value = value?.[key];
      });
      return value;
    } else {
      return data[keys];
    }
  };
  return (
    <div className="container my-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="text-white">{title} Details</h4>
        </div>
        <div className="card-body">
          {!!detailData ? (
            array?.map((item, key) => (
              <Fragment key={key}>
                {item?.type === "table" ? (
                  <div className="col-12 mt-4">
                    <h5 className="text-primary">{item.label} :</h5>
                    <Table responsive className="custom-table-bordered">
                      <thead className="thead-table">
                        <tr>
                          {item?.table?.map((row, idx)=>(
                            <th key={idx} className={row.className}>{row.tableLabel}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!!detailData?.[item.value]?.length ? (
                          detailData?.[item.value]?.map((data, index) => {
                            return (
                              // <tr key={key}>
                              //   <td>{key + 1}</td>
                              //   <td>{data.from_date}</td>
                              //   <td>{data.to_date}</td>
                              //   <td>{data.type}</td>
                              //   <td>{data.cost}</td>
                              //   <td>{data.adult_cost}</td>
                              //   <td>{data.child_cost}</td>
                              // </tr>
                              <tr key={index}>
                              {/* {tBody} */}
                              {item?.table?.map((column, key) => {
                                // console.log('arrvalue',item?.[column?.value])
                                return (
                                  <React.Fragment key={key}>
                                 { column?.tableLabel === 'Status' ? 
                                  <td className="">
                                  <span
                                    className={`btn light fs-14  btn-sm ${data[column?.tableValue] === 1 ?'btn-success':'btn-pink'}`}
                                  >
                                    {/* {data.icon2} */}
                                                                {" "} 
                                    {data[column?.tableValue] === 1 ?'Active':'Inactive'}
          
                                  </span>
                                </td>
                                :
          
                                  <td
                                    className={column?.className ? column.className : ""}
                                  >
                                    {column?.tableValue === 'index'? index+1 :getValue(column?.tableValue,data)}
                                  </td>
                              }
                              </React.Fragment>
                              )
                              })}
                            </tr>
                            );
                          })
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
                ) : (
                  <>
                    {item?.type === "image" ? (
                      item?.isMulti ? (
                        <ImageGallery data={getValue(item?.value)}/>
                      ):
                      <div className="mb-3">
                        {console.log('is',item)}
                        <img
                          src={detailData?.image}
                          style={{ height: "8rem", width: "8rem" }}
                        ></img>
                      </div>
                    ) : (
                      <LabelValueComponent
                        label={item.label}
                        value={getValue(item.value)}
                      />
                    )}
                  </>
                )}
              </Fragment>
            ))
          ) : (
            <NoData isLoading={loading} isCard />
          )}
          {/* <div className='mb-3'>
          <img src={detailData?.image} style={{height:'8rem',width:'8rem'}}></img>
          </div> */}

          {/* <div className="col-12 mt-4">
                    <Table responsive className="custom-table-bordered">
                      <thead className="thead-table">
                        <tr>
                          <th>#</th>
                          <th>From Date</th>
                          <th>To Date</th>
                          <th>Type</th>
                          <th>Cost</th>
                          <th>Adult Cost</th>
                          <th>Child Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!detailData?.estimations?.length ? (
                          detailData?.estimations?.map((data, key) => {
                            return (
                              <tr key={key}>
                                <td>{key + 1}</td>
                                <td>{data.from_date}</td>
                                <td>{data.to_date}</td>
                                <td>{data.type}</td>
                                <td>{data.cost}</td>
                                <td>{data.adult_cost}</td>
                                <td>{data.child_cost}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr id="empty-table-data">
                            <td colSpan={8} style={{ textAlign: "center" }}>
                              Empty !
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div> */}
        </div>
      </div>
    </div>
  );
};
