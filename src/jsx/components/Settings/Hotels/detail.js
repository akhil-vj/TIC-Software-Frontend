import React from 'react';
import { useNavigate } from 'react-router-dom';
import { URLS } from '../../../../constants';
import { DetailComponent } from '../../common/DetailComponent';

function HotelDetail() {
  const navigate = useNavigate();
  
  const url = URLS.HOTEL_URL
  const array = [
    {label:'Hotel',value:'document_2',type:'image',isMulti:true},
    {label:'Name',value:'name'},
    {label:'Destination',value:'destination_name'},
    {label:'Sub Destination',value:'sub_destination_name'},
    {label:'Place',value:'place'},
    {label:'Category',value:'category_name'},
    {label:'Property Type',value:'property_type_name'},
    {label:'Sales Number',value:'sales_no'},
    {label:'Sales Email',value:'sales_email'},
    {label:'Reservation Number',value:'reservation_no'},
    {label:'Reservation Email',value:'reservation_email'},
    {label:'Address',value:'address'},
    {label:'Phone Number',value:'phone_number'},
    {label:'Amenites',value:'amenities'},
    {label:'Rooms',value:'rooms',type:'table',table:[
      {tableLabel:'#',tableValue:'index'},
      {tableLabel:'market',tableValue:'market_type_name'},
      {tableLabel:'Start date',tableValue:'to_date'},
      {tableLabel:'From date',tableValue:'from_date'},
      {tableLabel:'Type',tableValue:'room_type_name'},
      {tableLabel:'Single',tableValue:'single_bed_amount'},
      {tableLabel:'Double',tableValue:'double_bed_amount'},
      {tableLabel:'Extra',tableValue:'extra_bed_amount'},
      {tableLabel:'Child W',tableValue:'child_w_bed_amount'},
      {tableLabel:'Child N',tableValue:'child_n_bed_amount'},
      {tableLabel:'Occupancy',tableValue:'occupancy'},
      {tableLabel:'Cut Off',tableValue:'allotted_cut_off_days'},
  ]},
  ]
  
  const headerStyle = {
    backgroundColor: '#00a8ff',
    padding: '20px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: '0'
  };
  
  const backButtonStyle = {
    position: 'absolute',
    left: '30px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };
  
  const titleStyle = {
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0',
    textAlign: 'center'
  };
  
  return (
    <>
      <div style={headerStyle}>
        <button 
          onClick={() => navigate('/hotels')}
          style={backButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          title="Go back to Hotels"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        
        <h2 style={titleStyle}>Hotel Details</h2>
      </div>
      
      <style>{`
        .detail-component-wrapper > div:first-of-type:not(:only-child) {
          display: none !important;
        }
      `}</style>
      
      <div className="detail-component-wrapper">
        <DetailComponent title="" url={url} array={array}/>
      </div>
    </>
  );
}

export default HotelDetail;