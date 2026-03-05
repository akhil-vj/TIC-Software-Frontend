import React from "react";
import { Route } from "react-router-dom";
import FieldComponent from "../../../common/FieldComponent";
import { URLS } from "../../../../../constants";

export const PropertyCategory = () => {
  return (
    <>
      <FieldComponent
        title="Property Category"
        addTitle="Category"
        url={URLS.PROPERTY_CATEGORY_URL}
      />
    </>
  );
};
export const PropertyTypes = () => {
  return (
    <>
      <FieldComponent
        title="Property Types"
        addTitle="Type"
        url={URLS.PROPERTY_TYPE_URL}
      />
    </>
  );
};
export const RoomTypes = () => {
  return (
    <>
      <FieldComponent
        title="Room Types"
        addTitle="Type"
        url={URLS.ROOM_TYPE_URL}
      />
    </>
  );
};
export const MarketTypes = () => {
  return (
    <>
      <FieldComponent
        title="Market Types"
        addTitle="Type"
        url={URLS.MARKET_TYPE_URL}
      />
    </>
  );
};
export const RoomAmenities = () => {
  return (
    <>
      <FieldComponent
        title="Room Amenities"
        addTitle="Amenity"
        url={URLS.ROOM_AMENITIES_URL}
      />
    </>
  );
};
export const HotelAmenities = () => {
  return (
    <>
      <FieldComponent
        title="Hotel Amenities"
        addTitle="Amenity"
        url={URLS.HOTEL_AMENITIES_URL}
      />
    </>
  );
};
export const MealPlan = () => {
  return (
    <>
      <FieldComponent
        title="Meal Plan"
        addTitle="Plan"
        url={URLS.MEAL_PLAN_URL}
      />
    </>
  );
};
