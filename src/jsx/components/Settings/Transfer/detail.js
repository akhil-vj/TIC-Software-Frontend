import React from 'react';
import {useParams} from 'react-router-dom'
import { useAsync } from '../../../utilis/useAsync';
import { URLS } from '../../../../constants';
import { Table } from 'react-bootstrap';
function DetailTransfer() {
  const {id} = useParams()
  const detailUrl = `${URLS.TRANSFER_URL}/${id}`
  const {data} = useAsync(detailUrl,!!id)
  const detailData = data?.data
  
  const InfoCard = ({icon, label, value}) => {
    return (
      <div className="col-md-6 mb-3">
        <div className="p-3 border rounded bg-light h-100">
          <div className="d-flex align-items-center">
            <div className="me-3 text-primary fs-4">{icon}</div>
            <div className="flex-grow-1">
              <small className="text-muted d-block">{label}</small>
              <strong className="d-block">{value || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container my-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-3">
          <h4 className='text-white mb-0'><i className="bi bi-bus-front me-2"></i>Transfer Details</h4>
        </div>
        <div className="card-body p-4">
          {/* Vehicle Image and Name Section */}
          <div className="row mb-4 align-items-center">
            <div className="col-md-3 text-center mb-3 mb-md-0">
              <img 
                src={detailData?.image} 
                alt="Vehicle" 
                className="img-fluid rounded shadow-sm" 
                style={{maxHeight:'200px', objectFit:'cover', width:'100%'}}
              />
            </div>
            <div className="col-md-9">
              <h2 className="text-primary mb-2">{detailData?.vehicle_name}</h2>
              <p className="text-muted mb-0">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Destination: <strong>{detailData?.destination?.name}</strong>
              </p>
            </div>
          </div>

          {/* Vehicle Information Grid */}
          <h5 className="text-primary mb-3 border-bottom pb-2">Vehicle Information</h5>
          <div className="row mb-4">
            <InfoCard 
              icon="🚗" 
              label="Vehicle Number" 
              value={detailData?.vehicle_number} 
            />
            <InfoCard 
              icon="📞" 
              label="Contact Number" 
              value={detailData?.phone_number} 
            />
          </div>

          {/* Description Section */}
          {detailData?.description && (
            <div className="mb-4">
              <h5 className="text-primary mb-3 border-bottom pb-2">Description</h5>
              <p className="text-muted p-3 bg-light rounded">{detailData?.description}</p>
            </div>
          )}

          {/* Pricing Table */}
          <div className="mt-4">
            <h5 className="text-primary mb-3 border-bottom pb-2">Pricing & Availability</h5>
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th className="text-center">#</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Type</th>
                    <th className="text-end">Cost</th>
                    <th className="text-end">Adult Cost</th>
                    <th className="text-end">Child Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {!!detailData?.estimations?.length ? (
                    detailData?.estimations?.map((data, key) => {
                      return (
                        <tr key={key}>
                          <td className="text-center">{key + 1}</td>
                          <td>{data.from_date}</td>
                          <td>{data.to_date}</td>
                          <td><span className="badge bg-info">{data.type}</span></td>
                          <td className="text-end"><strong>{data.cost}</strong></td>
                          <td className="text-end">{data.adult_cost}</td>
                          <td className="text-end">{data.child_cost}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        No pricing information available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DetailTransfer;