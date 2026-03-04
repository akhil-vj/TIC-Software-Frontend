# TIC TOURS — Frontend–Backend Integration Report

> **Generated**: 24 Feb 2026 | **Last Updated**: 24 Feb 2026  
> **Backend**: Laravel 9.52.15 (Modular — `Modules/User`, `Modules/Settings`, `Modules/Quotations`)  
> **Frontend**: React + Redux + Vite (admin panel)

---

## Table of Contents

1. [Summary Dashboard](#1-summary-dashboard)
2. [Properly Wired Features](#2-properly-wired-features)
3. [Backend Exists but Not Wired Properly](#3-backend-exists-but-not-wired-properly)
4. [Frontend Exists but No Backend Wiring](#4-frontend-exists-but-no-backend-wiring)
5. [Backend Exists but No Frontend](#5-backend-exists-but-no-frontend)
6. [API Method Mismatches](#6-api-method-mismatches)
7. [Recommendations](#7-recommendations)

---

## 1. Summary Dashboard

| Category | Count | Status |
|---|---|---|
| ✅ Properly wired features | 25 | Working end-to-end |
| ⚠️ Backend exists, wired improperly | 1 | Fixed (user delete) |
| 🔴 Frontend exists, no backend wiring | 7 | Static/mock only |
| 🟡 Backend exists, no frontend | 2 | Backend-only endpoints |

---

## 2. Properly Wired Features ✅

These features have both backend API endpoints and correctly wired frontend components.

### Authentication & User Management

| Feature | Frontend Component | Backend Route | HTTP Method | Status |
|---|---|---|---|---|
| Login | `AuthService.js` | `POST /api/user/login` | POST | ✅ Working |
| Logout | `AuthActions.js` | `POST /api/user/logout` | POST | ✅ Working |
| User Registration | `User.jsx` → `AddUserModal` | `POST /api/user/register` | POST | ✅ Working |
| User List | `User.jsx` | `GET /api/user/list` | GET | ✅ Working |
| User Show | `UserDetail.js` | `GET /api/user/show/{id}` | GET | ✅ Working |
| User Update | `User.jsx` → `AddUserModal` | `PUT /api/user/update/{id}` | PUT | ✅ Working |
| User Info | `AppProfile.js` | `GET /api/user/info` | GET | ✅ Working |
| Change Password | `ResetPassword.js` | `POST /api/user/change-password` | POST | ✅ Working |
| Role List | `UserRole.jsx` | `GET /api/roles` | GET (resource) | ✅ Working |
| Role CRUD | `RolePermission.js` | `resource /api/roles` | CRUD | ✅ Working |
| Role Detail | `RoleDetail.js` | `GET /api/roles/{id}` | GET | ✅ Working |
| Permissions List | `RolePermission.js` | `GET /api/permissions` | GET | ✅ Working |

### Enquiry Management

| Feature | Frontend Component | Backend Endpoint | Status |
|---|---|---|---|
| Enquiry List | `Enquiry.jsx` | `GET /api/enquiries` | ✅ Working |
| Add/Edit Enquiry | `Enquiry/add.js` | `POST/PUT /api/enquiries` | ✅ Working |
| Delete Enquiry | `Enquiry.jsx` → `DeleteModal` | `DELETE /api/enquiries/{id}` | ✅ Working |
| Enquiry Detail | `Enquiry/detail.js` | `GET /api/enquiries/{id}` | ✅ Working |

### Itinerary / Quotation

| Feature | Frontend Component | Backend Endpoint | Status |
|---|---|---|---|
| Itinerary List | `Quotation/index.js` | `GET /api/itineraries` | ✅ Working |
| Create Itinerary | `SetupModal.js` / `PackageForm.js` | `POST /api/itineraries` | ✅ Working |
| Update Itinerary | `SetupModal.js` | `POST /api/itinerary-update/{id}` | ✅ Working |
| Delete Itinerary | `Quotation/index.js` | `DELETE /api/itineraries/{id}` | ✅ Working |
| Set Pricing | `PackageForm.js` | `POST /api/itineraries/{id}/set-pricing` | ✅ Working |
| Print/PDF | `Quotation/index.js` | `POST /api/itinerary/print/{id}` | ✅ Working |

### Settings — Master Data (All use `FieldComponent.js` pattern)

| Feature | Frontend Component | Backend Resource | Status |
|---|---|---|---|
| Hotels List | `Hotels/index.js` | `GET /api/hotels` | ✅ Working |
| Add/Edit Hotel | `Hotels/AddHotel/` | `POST /api/hotels` + `POST /api/hotel-update/{id}` | ✅ Working |
| Hotel Detail | `Hotels/detail.js` | `GET /api/hotels/{id}` | ✅ Working |
| Delete Hotel | `Hotels/index.js` | `DELETE /api/hotels/{id}` | ✅ Working |
| Destinations | `Destination/index.js` | `resource /api/destinations` | ✅ Working |
| Sub-Destinations | `SubDestination/index.js` | `resource /api/sub-destinations` | ✅ Working |
| Property Categories | `HotelFields.js` → `PropertyCategory` | `resource /api/categories` | ✅ Working |
| Property Types | `HotelFields.js` → `PropertyTypes` | `resource /api/property-types` | ✅ Working |
| Room Types | `HotelFields.js` → `RoomTypes` | `resource /api/room-types` | ✅ Working |
| Market Types | `HotelFields.js` → `MarketTypes` | `resource /api/market-types` | ✅ Working |
| Room Amenities | `HotelFields.js` → `RoomAmenities` | `resource /api/room-amenities` | ✅ Working |
| Hotel Amenities | `HotelFields.js` → `HotelAmenities` | `resource /api/hotel-amenities` | ✅ Working |
| Meal Plans | `HotelFields.js` → `MealPlan` | `resource /api/meal-plans` | ✅ Working |
| Lead Sources | `LeadSource/index.js` | `resource /api/lead-sources` | ✅ Working |
| Priority | `Priority/index.js` | `resource /api/priorities` | ✅ Working |
| Requirements | `Requirement/index.js` | `resource /api/requirements` | ✅ Working |
| Currency | `CurrencySettings.jsx` | `resource /api/currencies` | ✅ Working |
| Activities | `Activity/index.js` + `addActivity.js` + `detail.js` | `resource /api/activities` | ✅ Working |
| Transfers | `Transfer/index.js` + `addTransfer.js` + `detail.js` | `resource /api/transfers` + `POST /api/transfer-update/{id}` | ✅ Working |
| Agents | `Agent/index.js` + `addAgent.js` | `resource /api/agents` | ✅ Working |
| Countries | `Country.jsx` | `resource /api/settings/countries` | ✅ Working (NEW) |
| Languages | `Language.jsx` | `resource /api/settings/languages` | ✅ Working (NEW) |

### Leads (Enquiry-based)

| Feature | Frontend Component | Backend Endpoint | Status |
|---|---|---|---|
| Leads List | `Leads.jsx` | Uses `ENQUIRY_URL` (same data as enquiries) | ✅ Working |
| Add/Edit Lead | `Leads.jsx` / `AddLead.js` | `POST/PUT /api/enquiries` | ✅ Working |
| Lead Dropdowns | `Leads.jsx` | Uses agents, customers, destinations, lead-sources, priorities, requirements, users APIs | ✅ Working |

---

## 3. Backend Exists but Not Wired Properly ⚠️

These features have a backend API but the frontend is calling them incorrectly or incompletely.

### 3.1 User Deletion — `method mismatch` (JUST FIXED)

| Item | Detail |
|---|---|
| **Backend** | `GET /api/user/delete/{id}` → `UserController@destroy` |
| **Frontend was calling** | `POST /api/user/delete` (with ID in body) |
| **Error** | `405 Method Not Allowed` |
| **Fix applied** | Changed `DeleteModal` to use `method="GET"` with URL `/api/user/delete/{id}` |
| **Current status** | ✅ Fixed in this session |

> **Note**: The backend uses `Route::get()` for deletion, which is unconventional. Most resources use `DELETE`. This is a backend design choice.

### 3.2 Transfer Status Update — ✅ Already Working

| Item | Detail |
|---|---|
| **Backend** | `PATCH /api/transfer-status-update/{id}` |
| **Frontend** | `Transfer/index.js` passes `TRANSFER_PATCH_URL` as `url2` to `CustomTable` |
| **How it works** | `CustomTable.onConfirmation()` constructs `${url2}/${id}?is_active=${value}` and uses `axiosPatch` via `DeleteModal` with `type='status'` |
| **Status** | ✅ **Fully working** — `TRANSFER_PATCH_URL: "/api/transfer-status-update"` exists in `Urls.js` |

### 3.3 Activity Status Update — Not Used in Frontend

| Item | Detail |
|---|---|
| **Backend** | `PATCH /api/activity-status-update/{id}` |
| **Frontend** | `Activity/index.js` does NOT have a status toggle — no `url2`, no status column, no status action |
| **Status** | 🟡 Backend endpoint exists but frontend doesn't need it currently. Can be wired if active/inactive toggling is needed in the future |

---

## 4. Frontend Exists but No Backend Wiring 🔴

These pages/features exist in the frontend but do **NOT** call any backend API — they use hardcoded/mock data or are purely static UI.

### 4.1 Dashboard

| Item | Detail |
|---|---|
| **Frontend** | `Dashboard/Dashboard.jsx` |
| **Route** | `/` and `/dashboard` |
| **API calls** | **NONE** — no `useAsync`, `axios`, `fetch`, or `URLS` references |
| **Current state** | Completely static/mock data |
| **Backend needed** | Yes — should aggregate data from enquiries, itineraries, users for KPI cards |

### 4.2 Dashboard Dark Mode

| Item | Detail |
|---|---|
| **Frontend** | `Dashboard/DashboardDark.jsx` |
| **Route** | `/dashboard-dark` |
| **API calls** | **NONE** |
| **Current state** | Static dark-themed dashboard with mock data |

### 4.3 Tickets

| Item | Detail |
|---|---|
| **Frontend** | `Tickets/Tickets.jsx` (53 KB) |
| **Route** | `/tickets` |
| **API calls** | **NONE** — no `useAsync`, `axios`, `fetch`, or `URLS` references |
| **Current state** | Fully built UI with mock/sample data |
| **Backend needed** | Yes — no `tickets` resource exists in backend. **Requires new backend module/controller** |

### 4.4 Company Settings

| Item | Detail |
|---|---|
| **Frontend** | `CompanyManagement/CompanySettings.jsx` |
| **Route** | `/company-settings` |
| **API calls** | **NONE** |
| **Current state** | Static UI |
| **Backend** | `SystemSettingsController` exists (`resource /api/system-settings`) but is NOT wired to this page |

### 4.5 Package Terms

| Item | Detail |
|---|---|
| **Frontend** | `Settings/PackageTerms.jsx` |
| **Route** | `/package-terms` |
| **API calls** | **NONE** — no `useAsync`, `axios`, or `URLS` references |
| **Current state** | Static UI or local-only data |
| **Backend needed** | No existing backend endpoint for package terms |

### 4.6 Supplier Management

| Item | Detail |
|---|---|
| **Frontend** | `Settings/Supplier/` (2 files) |
| **Route** | `/supplier` |
| **API calls** | **NONE** — no `useAsync`, `axios`, or `URLS` references found |
| **Current state** | UI exists but not wired |
| **Backend** | `SupplierController` exists with `searchByMobile` endpoint, but no full CRUD resource routes |

### 4.7 Fields Management

| Item | Detail |
|---|---|
| **Frontend** | `CompanyManagement/Fields.jsx` |
| **Route** | `/fields` |
| **API calls** | **NONE** |
| **Current state** | Static UI |

---

## 5. Backend Exists but No Frontend 🟡

These backend endpoints exist but have no corresponding frontend page or component.

### 5.1 Customer Search by Mobile

| Item | Detail |
|---|---|
| **Backend** | `GET /api/customers-search-by-mobile/{mobile}` → `CustomerController@searchByMobile` |
| **Frontend usage** | Partially used inline in `Leads.jsx` and `add.js` via `URLS.CUSTOMER_URL + "?mobile="` but **no dedicated Customer management page** |
| **Gap** | No Customer CRUD page exists (only search is used in lead forms) |

### 5.2 Supplier Search by Mobile

| Item | Detail |
|---|---|
| **Backend** | `GET /api/suppliers-search-by-mobile` → `SupplierController@searchByMobile` |
| **Frontend** | Supplier page exists but has **NO** API wiring |
| **Gap** | Backend search endpoint is not used anywhere in frontend |

~~### 5.3 Country Settings — ✅ RESOLVED~~

> Country management page created (`Country.jsx`) using `FieldComponent` pattern. Route: `/country`

~~### 5.4 Language Settings — ✅ RESOLVED~~

> Language management page created (`Language.jsx`) with custom 2-field modal (`language` + `slug`). Route: `/language`

---

## 6. API Method Mismatches

These are cases where the backend HTTP method doesn't follow REST conventions, which can cause confusion.

| Resource | Action | Backend Method | Expected (REST) | Frontend Adjustment |
|---|---|---|---|---|
| **User Delete** | Delete | `GET /api/user/delete/{id}` | `DELETE /api/user/{id}` | Must use `GET` (fixed) |
| **Hotel Update** | Update | `POST /api/hotel-update/{id}` | `PUT /api/hotels/{id}` | Uses `filePost` (correct) |
| **Transfer Update** | Update | `POST /api/transfer-update/{id}` | `PUT /api/transfers/{id}` | Uses `POST` (correct) |
| **Itinerary Update** | Update | `POST /api/itinerary-update/{id}` | `PUT /api/itineraries/{id}` | Uses `POST` (correct) |

> **Pattern**: The backend uses `POST` instead of `PUT` for updates that include file uploads (multipart/form-data). This is a common Laravel pattern since PHP doesn't natively support file uploads via PUT.

---

## 7. Recommendations

### High Priority 🔴

1. **Wire Dashboard to Backend** — Create a backend dashboard endpoint that aggregates KPI data (total enquiries, active itineraries, recent leads, revenue stats) and connect it to `Dashboard.jsx`

2. **Build Tickets Backend** — The Tickets page UI is fully built (53 KB component) but there's NO backend support. Need a new `TicketsController` with CRUD operations and appropriate database migrations

3. **Wire Supplier Page** — The frontend page exists and the backend has `SupplierController`, but they are not connected. Add `SUPPLIER_URL` to `Urls.js` and wire up the API calls

4. **Wire Company Settings** — The frontend page exists and `SystemSettingsController` exists in backend. Connect them.

### Medium Priority ⚠️

5. **Add Customer Management Page** — Backend `CustomerController` exists (search only) but no dedicated frontend page for managing customers separately from leads

6. **Wire Package Terms** — Create a backend endpoint for managing package terms and conditions, then wire to frontend `PackageTerms.jsx`

7. **Wire Fields Page** — Connect `CompanyManagement/Fields.jsx` to appropriate backend endpoints

8. **Consider Activity Status Toggle** — Backend has `PATCH /api/activity-status-update/{id}` but Activity page doesn't use it. Add if needed

### Low Priority 🟡

9. ~~**Add Country/Language Management Pages**~~ — ✅ **DONE** — `Country.jsx` and `Language.jsx` created and wired

---

## Appendix: Frontend URL Constants vs Backend Routes

| Frontend Constant (`Urls.js`) | Value | Backend Route | Match |
|---|---|---|---|
| `ENQUIRY_URL` | `/api/enquiries` | `resource /api/enquiries` | ✅ |
| `HOTEL_URL` | `/api/hotels` | `resource /api/hotels` | ✅ |
| `DESTINATION_URL` | `/api/destinations` | `resource /api/destinations` | ✅ |
| `SUB_DESTINATION_URL` | `/api/sub-destinations` | `resource /api/sub-destinations` | ✅ |
| `PROPERTY_CATEGORY_URL` | `/api/categories` | `resource /api/categories` | ✅ |
| `PROPERTY_TYPE_URL` | `/api/property-types` | `resource /api/property-types` | ✅ |
| `ROOM_TYPE_URL` | `/api/room-types` | `resource /api/room-types` | ✅ |
| `MARKET_TYPE_URL` | `/api/market-types` | `resource /api/market-types` | ✅ |
| `ROOM_AMENITIES_URL` | `/api/room-amenities` | `resource /api/room-amenities` | ✅ |
| `HOTEL_AMENITIES_URL` | `/api/hotel-amenities` | `resource /api/hotel-amenities` | ✅ |
| `MEAL_PLAN_URL` | `/api/meal-plans` | `resource /api/meal-plans` | ✅ |
| `TRANSFER_URL` | `/api/transfers` | `resource /api/transfers` | ✅ |
| `ACTIVITY_URL` | `/api/activities` | `resource /api/activities` | ✅ |
| `AGENT_URL` | `/api/agents` | `resource /api/agents` | ✅ |
| `LEAD_SOURCE_URL` | `/api/lead-sources` | `resource /api/lead-sources` | ✅ |
| `PRIORITY_URL` | `/api/priorities` | `resource /api/priorities` | ✅ |
| `REQUIREMENT_URL` | `/api/requirements` | `resource /api/requirements` | ✅ |
| `CURRENCY_URL` | `/api/currencies` | `resource /api/currencies` | ✅ |
| `ITINERARY_URL` | `/api/itineraries` | `resource /api/itineraries` | ✅ |
| `USER_GET_URL` | `/api/user/list` | `GET /api/user/list` | ✅ |
| `USER_GET_BY_ID_URL` | `/api/user/show` | `GET /api/user/show/{id}` | ✅ |
| `USER_UPDATE_URL` | `/api/user/update` | `PUT /api/user/update/{id}` | ✅ |
| `USER_DELETE_URL` | `/api/user/delete` | `GET /api/user/delete/{id}` | ✅ (fixed) |
| `USER_ROLE_URL` | `/api/user/roles-list` | `GET /api/user/roles-list` | ✅ |
| `COUNTRY_URL` | `/api/settings/countries` | `resource /api/settings/countries` | ✅ |
| `LANGUAGE_URL` | `/api/settings/languages` | `resource /api/settings/languages` | ✅ |
| `PERMISSION_URL` | `/api/permissions` | `GET /api/permissions` | ✅ |
| `DAY_ITINERARY_URL` | `/api/system-settings` | `resource /api/system-settings` | ✅ |
| `CUSTOMER_URL` | (check) | `GET /api/customers-search-by-mobile` | ⚠️ Partial |
| `TRANSFER_PATCH_URL` | `/api/transfer-status-update` | `PATCH /api/transfer-status-update/{id}` | ✅ |
| *(no constant)* | — | `PATCH /api/activity-status-update/{id}` | 🟡 Not used in frontend |
