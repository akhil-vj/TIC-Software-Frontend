import React, { useContext } from "react";

/// React router dom
import { Routes, Route, Outlet } from "react-router-dom";

/// Css
import "./index.css";
import "./chart.css";
import "./step.css";

/// Layout
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import ScrollToTop from "./layouts/ScrollToTop";

/// Dashboard
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import DashboardDark from "./components/Dashboard/DashboardDark";
import Tickets from "./components/Tickets/Tickets";
import QuotationInbox from "./components/Dashboard/QuotationInbox";
import Notification from "./components/Dashboard/Notification";

/// Pages
import LockScreen from "./pages/LockScreen.jsx";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";
import { ThemeContext } from "../context/ThemeContext";
import AppProfile from "./components/AppsMenu/AppProfile/AppProfile";

// Enquiry
import Enquiry from "./components/Enquiry/Enquiry";
import AddEnquiry from "./components/Enquiry/add";
import Tabs from "./components/common/Tabs";
import Quotation from "./components/Enquiry/Quotation";
import FollowUp from "./components/Enquiry/FollowUp";

// Leads
import Leads from "./components/Leads/Leads";

// Settings
import Settings from "./components/Settings/Settings";
import HotelsPage from "./components/Settings/Hotels/HotelsPage";
import DayItinerary from "./components/Settings/DayItinerary";
import MailSettings from "./components/Settings/MailSettings";
import Currency from "./components/Settings/Currency";
import Tax from "./components/Settings/Tax";
import User from "./components/Settings/UserManagement/User.jsx";
import { ToastContainer } from "react-toastify";
import SetupModal from "./components/Enquiry/Quotation/SetupModal";
import Payment from "./components/Enquiry/Payment";
import MailToSupplier from "./components/Enquiry/Mail";
import Agent from "./components/Settings/Agent";
import SupplierPayment from "./components/Enquiry/SupplierPayment";
import CompanySettings from "./components/Settings/CompanyManagement/CompanySettings.jsx";
import CurrencySettings from "./components/Settings/CompanyManagement/CurrencySettings.jsx";
import Fields from "./components/Settings/CompanyManagement/Fields.jsx";
import Permission from "./components/Settings/UserManagement/RolePermission";
import HotelSettingsPage from "./components/Settings/Hotels/HotelSettingsPage";
import DestinationManagement from "./components/Settings/DestinationManagement/DestinationManagement.jsx";
import Transfer from "./components/Settings/Transfer";
import AddTransfer from "./components/Settings/Transfer/addTransfer";
import LeadSource from "./components/Settings/LeadSource";
import Priority from "./components/Settings/Priority";
import Requirement from "./components/Settings/Requirement";
import Country from "./components/Settings/Country.jsx";
import Language from "./components/Settings/Language.jsx";
import Activity from "./components/Settings/Activity";
import AddActivity from "./components/Settings/Activity/addActivity";
import DetailActivity from "./components/Settings/Activity/detail";
import DetailTransfer from "./components/Settings/Transfer/detail";
import UserDetail from "./components/Settings/UserManagement/UserDetail";
import RoleDetail from "./components/Settings/UserManagement/RoleDetail";
import Supplier from "./components/Settings/Supplier";
import EnquiryDetail from "./components/Enquiry/detail";
import PackageTerms from "./components/Settings/PackageTerms.jsx";
import PrivateRoute from "./components/privateRoute";

const enquiryMenu = [
  { name: "profile", path: "", component: "" },
  { name: "quotation", path: "/quotation", component: "" },
  { name: "follow ups", path: "", component: "" },
  { name: "mail to supplier", path: "", component: "" },
  { name: "supplier payments", path: "", component: "" },
  { name: "tickets", path: "", component: "" },
  { name: "payments", path: "", component: "" },
  { name: "documents", path: "", component: "" },
];

const Markup = () => {
  const LeadsProtected = () => (
    <PrivateRoute permission={'leads'}>
      <Leads />
    </PrivateRoute>
  )

  const allRoutes = [
    { url: "tickets", component: <Tickets /> },
    { url: "quotation-inbox", component: <QuotationInbox /> },
    { url: "notifications", component: <Notification /> },

    // Leads
    { url: "leads", component: <LeadsProtected /> },

    // Settings
    { url: "settings", component: <Settings /> },
    { url: "user", component: <User /> },
    { url: "user/:id", component: <UserDetail /> },
    { url: "user-role/add", component: <Permission /> },
    { url: "user-role/add/:id", component: <Permission /> },
    { url: "user-role/:id", component: <RoleDetail /> },
    { url: "agent", component: <Agent /> },
    { url: "company-settings", component: <CompanySettings /> },
    { url: "currency-settings", component: <CurrencySettings /> },
    { url: "fields", component: <Fields /> },
    { url: "destination", component: <DestinationManagement /> },
    { url: "sub-destination", component: <DestinationManagement /> },
    { url: "day-itinerary", component: <DayItinerary /> },
    { url: "mail-settings", component: <MailSettings /> },
    { url: "tax", component: <Tax /> },
    { url: "currency", component: <Currency /> },
    { url: "transfer", component: <Transfer /> },
    { url: "transfer/:id", component: <DetailTransfer /> },
    { url: "transfer/add", component: <AddTransfer /> },
    { url: "transfer/add/:id", component: <AddTransfer /> },
    { url: "activity", component: <Activity /> },
    { url: "activity/add", component: <AddActivity /> },
    { url: "activity/add/:id", component: <AddActivity /> },
    { url: "activity/:id", component: <DetailActivity /> },
    { url: "lead-source", component: <LeadSource /> },
    { url: "priority", component: <Priority /> },
    { url: "requirement", component: <Requirement /> },
    { url: "supplier", component: <Supplier /> },
    { url: "package-terms", component: <PackageTerms /> },
    { url: "country", component: <Country /> },
    { url: "language", component: <Language /> },

    // finance
    { url: "follow-ups", component: <FollowUp /> },
    { url: "quotation", component: <Quotation /> },
    { url: "supplier-payments", component: <SupplierPayment /> },

    // enquiry
    { url: 'enquiry-detail/:id', component: <EnquiryDetail /> }
  ];

  const HomeProtected = () => (
    <PrivateRoute permission="dashboard">
      <Dashboard />
    </PrivateRoute>
  )

  const EnquiryProtected = () => (
    <PrivateRoute permission="enquiry">
      <Enquiry />
    </PrivateRoute>
  )

  return (
    <>
      <Routes>
        <Route path="*" element={<Layout7 />} />
        <Route path="/page-error-400" element={<Error400 />} />
        <Route path="/page-error-403" element={<Error403 />} />
        <Route path="/page-error-404" element={<Error404 />} />
        <Route path="/page-error-500" element={<Error500 />} />
        <Route path="/page-error-503" element={<Error503 />} />
        <Route path="/page-lock-screen" element={<LockScreen />} />

        <Route element={<Layout7 />}>
          <Route path="/" exact element={<Dashboard />} />
          <Route path="/dashboard" exact element={<HomeProtected />} />
          <Route path="/dashboard-dark" exact element={<DashboardDark />} />

          <Route exact path="/enquiry" element={<EnquiryProtected />} />
          <Route path="/enquiry/:id" element={<Tabs menu={enquiryMenu} />}>
            <Route path="*" element={null} />
            <Route path="profile" element={<AddEnquiry />} />
            <Route path="quotation" element={<Quotation />} />
            <Route path="follow-ups" element={<FollowUp />} />
            <Route path="quotation/itinerary" element={<SetupModal />} />
            <Route path="quotation/itinerary/:itineraryId" element={<SetupModal />} />
            <Route path="payments" element={<Payment />} />
            <Route path="mail-to-supplier" element={<MailToSupplier />} />
            <Route path="supplier-payments" element={<SupplierPayment />} />
          </Route>
          <Route path="/app-profile" element={<AppProfile />} />
          <Route path="hotels" element={<HotelsPage />} />
          <Route path="hotel-settings" element={<HotelSettingsPage />} />
          <Route path="property-category" element={<HotelSettingsPage />} />
          <Route path="property-types" element={<HotelSettingsPage />} />
          <Route path="room-types" element={<HotelSettingsPage />} />
          <Route path="market-types" element={<HotelSettingsPage />} />
          <Route path="room-amenities" element={<HotelSettingsPage />} />
          <Route path="hotel-amenities" element={<HotelSettingsPage />} />
          <Route path="meal-plan" element={<HotelSettingsPage />} />

          {allRoutes.map((data, i) => (
            <Route
              key={i}
              exact
              path={`/${data.url}`}
              element={data.component}
            />
          ))}
        </Route>
      </Routes>
      <ScrollToTop />
    </>
  );
};

function Layout7() {
  const { menuToggle, sidebariconHover } = useContext(ThemeContext);
  return (
    <div
      id="main-wrapper"
      className={`show ${sidebariconHover ? "iconhover-toggle" : ""} ${menuToggle ? "menu-toggle" : ""
        }`}
    >
      <Nav />
      <ToastContainer />
      <div className="content-body" style={{ minHeight: "100vh" }}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Markup;
