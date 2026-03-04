import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const school = "/images/svg/school.svg";
const wallet = "/images/svg/dash.svg";
// import crypto from "./../../../images/svg/cryptocurrency.svg";
const transfer = "/images/svg/wire-transfer.svg";
const smallCard = [
  { image: school, title: "Destination Management", path: "/destination" },
  { image: wallet, title: "Suppliers", path: "/supplier" },
  { image: wallet, title: "Hotels", path: "/hotels" },
  // { image: transfer, title: "Room Type", path: "/room-type" },
  // { image: school, title: "Meal Plan", path: "/meal-plan" },
  { image: wallet, title: "Activity", path: "/activity" },
  { image: transfer, title: "Transfer", path: "/transfer" },
  { image: school, title: "Lead Source", path: "/lead-source" },
  { image: school, title: "Priority", path: "/priority" },
  { image: school, title: "Requirement", path: "/requirement" },
  { image: wallet, title: "Day Itinerary", path: "/day-itinerary" },
  { image: wallet, title: "Mail Settings", path: "/mail-settings" },
  { image: wallet, title: "Currency", path: "/currency" },
  { image: wallet, title: "Tax", path: "/tax" },
  { image: transfer, title: "Agents", path: "/agent" },
];

function Settings() {
  const [isOpen, setOpen] = useState();
  const navigate = useNavigate();

  const onClick = (item) => {
    console.log("item", item);
    if (item == "Hotels") {
      navigate("/hotels");
    }
  };
  return (
    <>
      {/* <div className="widget-heading d-flex justify-content-between align-items-center">
            <h3 className="m-0 heading">Popular This Week</h3>
            <Link to={"#"} className="btn btn-primary btn-sm">View all</Link>
        </div>
        <div className="row">            
           <CourseSlider />
        </div>	 */}
      <div className="widget-heading d-flex justify-content-between align-items-center">
        <h3 className="heading mb-4">Admin Settings</h3>
        <Link to={"#"} className="btn btn-primary btn-sm">
          View all
        </Link>
      </div>
      <div className="row">
        {smallCard.map((item, index) => (
          <div
            className="col-xl-3 col-xxl-3 col-md-4 col-sm-6  mb-4"
            key={index}
          >
            <Link to={item.path}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="widget-courses align-items-center d-flex justify-content-between flex-wrap">
                    <div className="d-flex align-items-center flex-wrap">
                      {/* <img src={item.image} alt="" /> */}
                      <div className="flex-1 ms-3">
                        <h4>{item.title}</h4>
                        {/* <span>Lorem ipsum dolor</span> */}
                      </div>
                    </div>
                    <Link to={"#"}>
                      <i className="las la-angle-right text-primary"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {/* <div className="table-pagenation mb-3">
            <p className="ms-0">Showing <span>1-8</span>from <span>20</span>data</p>
            <nav>
                <ul className="pagination pagination-gutter pagination-primary no-bg">
                    <li className="page-item page-indicator">
                        <Link to={"#"} className="page-link">
                            <i className="fa-solid fa-angle-left"></i>
                        </Link>
                    </li>
                    <li className="page-item active"><Link to={"#"} className="page-link">1</Link>
                    </li>
                    <li className="page-item "><Link className="page-link" >2</Link></li>
                    <li className="page-item"><Link className="page-link" >3</Link></li>
                    <li className="page-item page-indicator me-0">
                        <Link to={"#"} className="page-link">
                            <i className="fa-solid fa-angle-right"></i>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div> */}

    </>
  );
}

export default Settings;
