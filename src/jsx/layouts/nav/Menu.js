export const MenuList = [
  //Dashboard
  {
    title: "Dashboard",
    classsChange: "mm-collapse",
    iconStyle: <i className="material-icons-outlined"></i>,
    to: "dashboard",
  },
  {
    title: "Leads",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-050-info"> </i>,
    to: "leads",
  },
  {
    title: "Enquiry",
    classsChange: "mm-collapse",
    iconStyle: <i className="material-icons"></i>,
    to: "enquiry",
  },
  {
    title: "Profile",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa fa-user" aria-hidden="true"></i>,
    to: "app-profile",
  },
  {
    title: "Follow ups",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa fa-list" aria-hidden="true"></i>,
    to: "follow-ups",
  },
  {
    title: "Tickets",
    classsChange: "mm-collapse",
    iconStyle: <i className="merial-icons"></i>,
    to: "tickets",
  },
  {
    title: "Finance",
    classsChange: "mm-collapse",
    iconStyle: <i className="mdi-bank" />,
    content: [
      {
        title: "Quotation",
        to: "quotation",
      },
      {
        title: "Invoice",
        to: "invoice",
      },
      {
        title: "Credit Invoice",
        to: "credit-Invoice",
      },
      {
        title: "Supplier Payment",
        to: "supplier-payments",
      },
    ],
  },
  {
    title: "Notifications",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa fa-bell" aria-hidden="true"></i>,
    to: "notifications",
  },
  {
    title: "Quotation Inbox",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa fa-envelope" aria-hidden="true"></i>,
    to: "quotation-inbox",
  },
  {
    title: "Settings",
    classsChange: "mm-collapse",
    iconStyle: <i className="material-icons"></i>,
    content: [
      {
        title: "Admin Settings",
        to: "settings",
      },
      {
        title: "Company Settings",
        to: "company-settings",
      },
      {
        title: "Fields",
        to: "fields",
      },
      {
        title: "Currency Settings",
        to: "currency-settings",
      },
      {
        title: "Package Terms",
        to: "package-terms",
      },
      {
        title: "User Management",
        to: "user",
      },
    ],
  },
];
