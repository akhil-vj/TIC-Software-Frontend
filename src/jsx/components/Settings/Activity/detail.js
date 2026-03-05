import React from 'react';
import {useParams} from 'react-router-dom'
import { useAsync } from '../../../utilis/useAsync';
import { URLS } from '../../../../constants';
import { Table } from 'react-bootstrap';
import { parseTime } from '../../../utilis/date';

function DetailActivity() {
  const {id} = useParams()
  const detailUrl = `${URLS.ACTIVITY_URL}/${id}`
  const {data} = useAsync(detailUrl,!!id)
  const detailData = data?.data
  console.log('dett',data)
  return (
    <div className="container my-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className='text-white'>Activity Details</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <h4 className="text-primary">Name:</h4>
            <h6>{
            detailData?.activity_name}</h6>
          </div>
          <div className="mb-3">
            <h4 className="text-primary">Email:</h4>
            <h6>{
            detailData?.contact_email}</h6>
          </div>
          <div className="mb-3">
            <h4 className="text-primary">Phone Number:</h4>
            <h6>{
            detailData?.contact_number}</h6>
          </div>
          <div className="mb-3">
            <h4 className="text-primary">Destination:</h4>
            <h6>{
            detailData?.destination?.name}</h6>
          </div>
          <div className="mb-3">
            <h4 className="text-primary">Sub Destination:</h4>
            <h6>{
            detailData?.sub_destination?.name}</h6>
          </div>
          <div className="mb-3">
            <h4 className="text-primary">Description:</h4>
            <h6>{
            detailData?.description}</h6>
          </div>
          <div className="col-12 mt-4">
                    <Table responsive className="custom-table-bordered">
                      <thead className="thead-table">
                        <tr>
                          <th>#</th>
                          <th>From Date</th>
                          <th>To Date</th>
                          <th>Opening Time</th>
                          <th>Closing Time</th>
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
                                <td>{parseTime(data.opening_time)}</td>
                                <td>{parseTime(data.closing_time)}</td>
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
                  </div>
        </div>
      </div>
    </div>
  );
}

export default DetailActivity;
