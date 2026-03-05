import React from "react";

const test = () => {
  return (
    <div className="row">
      <div className="col-12">
        <h4>Room Details</h4>
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Market Type</label>
          <select
            defaultValue={"option"}
            id="inputState"
            className="form-control"
          >
            <option value="option" disabled>
              Choose...
            </option>
            <option>Market 1</option>
            <option>Market 2</option>
            <option>Market 3</option>
          </select>
        </div>
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2 m-b30">
        <label>From Date</label>
        <DatePicker
          className="form-control"
          selected={roomStartDate}
          onChange={(date) => setRoomStartDate(date)}
        />
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2 m-b30">
        <label>To Date</label>
        <DatePicker
          className="form-control"
          selected={roomEndDate}
          onChange={(date) => setRoomEndDate(date)}
        />
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Room Type</label>
          <select
            defaultValue={"option"}
            id="inputState"
            className="form-control"
          >
            <option value="option" disabled>
              Choose...
            </option>
            <option>Type 1</option>
            <option>Type 2</option>
            <option>Type 3</option>
          </select>
        </div>
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2  mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Single Bed</label>
          <input
            type="text"
            name="singleBed"
            className="form-control"
            placeholder=""
            required
          />
        </div>
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2  mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Double Bed</label>
          <input
            type="text"
            name="singleBed"
            className="form-control"
            placeholder=""
            required
          />
        </div>
      </div>
      <div className="col-6 col-sm-4 col-md-3 col-lg-2  mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Occupancy</label>
          <input
            type="text"
            name="singleBed"
            className="form-control"
            placeholder=""
            required
          />
        </div>
      </div>
      <div className="col-12">
        <h4>Meals Plan</h4>
      </div>
      <div className="col-6"></div>
      <div className="col-6"></div>
      <div className="col-lg-6 mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Company Email Address*</label>
          <input
            type="email"
            className="form-control"
            id="emial1"
            placeholder="example@example.com.com"
            required
          />
        </div>
      </div>
      <div className="col-lg-6 mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Company Phone Number*</label>
          <input
            type="text"
            name="phoneNumber"
            className="form-control"
            placeholder="(+1)408-657-9007"
            required
          />
        </div>
      </div>
      <div className="col-lg-6 mb-2">
        <div className="form-group mb-3">
          <label className="text-label">Your position in Company*</label>
          <input type="text" name="place" className="form-control" required />
        </div>
      </div>
    </div>
  );
};

export default test;
