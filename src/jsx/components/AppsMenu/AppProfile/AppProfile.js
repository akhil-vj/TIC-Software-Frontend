import React, { Fragment, useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tab, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  loginConfirmedAction,
  profileUpdatedAction,
} from "../../../../store/actions/AuthActions";
import { updateProfile } from "../../../../services/UserService";
import profileImg from "../../../../images/profile/profile.png";
import PageTitle from "../../../layouts/PageTitle";
import LockPINSetup from "../LockPINSetup";

const AppProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.auth.data);
  const userRole = user.roles && user.roles[0] ? user.roles[0].name : "User";

  const [profileImage, setProfileImage] = useState(profileImg);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone_number: user.phone_number || "",
    address: user.address || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
      // Optionally reset profile image if user changes, or if user has a photo url from backend
      // if (user.photo) setProfileImage(user.photo); 
      setSelectedFile(null);
    }
  }, [user]);

  const handleEditClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let data;
    if (selectedFile) {
      const formDataObj = new FormData();
      formDataObj.append("first_name", formData.first_name);
      formDataObj.append("last_name", formData.last_name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone_number", formData.phone_number);
      formDataObj.append("address", formData.address);
      formDataObj.append("photo", selectedFile);
      data = formDataObj;
    } else {
      data = formData;
    }

    updateProfile(data)
      .then((response) => {
        dispatch(profileUpdatedAction(response));
        Swal.fire("Success", "Profile updated successfully!", "success");
        setSelectedFile(null); // Reset selection after success
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to update profile", "error");
        console.error("Profile update error:", error);
      });
  };

  return (
    <Fragment>
      <PageTitle activeMenu="Profile" motherMenu="App" />
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <div className="profile-statistics mb-5">
                <div className="text-center">
                  <div
                    className="profile-photo"
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <img
                      src={profileImage}
                      className="img-fluid rounded-circle"
                      alt="profile"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      accept="image/*"
                    />
                    <Link
                      to={"#"}
                      onClick={handleEditClick}
                      className="btn btn-primary btn-xs sharp rounded-circle"
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        padding: "5px",
                        width: "30px",
                        height: "30px",
                        display: isHovered ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      <i className="fa fa-pencil" />
                    </Link>
                  </div>
                  <div className="profile-details mt-4">
                    <h4 className="text-primary mb-0">
                      {user.first_name} {user.last_name}
                    </h4>
                    <p>{userRole}</p>
                    <p className="text-muted">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="profile-personal-info">
                <h4 className="text-primary mb-4">Personal Information</h4>
                <div className="row mb-2">
                  <div className="col-4" style={{ flex: "0 0 37%", maxWidth: "37%" }}>
                    <h5 className="f-w-500">
                      Name <span className="pull-right">:</span>
                    </h5>
                  </div>
                  <div className="col-8" style={{ flex: "0 0 63%", maxWidth: "63%" }}>
                    <span>
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4" style={{ flex: "0 0 37%", maxWidth: "37%" }}>
                    <h5 className="f-w-500">
                      Email <span className="pull-right">:</span>
                    </h5>
                  </div>
                  <div className="col-8" style={{ flex: "0 0 63%", maxWidth: "63%" }}>
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4" style={{ flex: "0 0 37%", maxWidth: "37%" }}>
                    <h5 className="f-w-500">
                      Availability <span className="pull-right">:</span>
                    </h5>
                  </div>
                  <div className="col-8" style={{ flex: "0 0 63%", maxWidth: "63%" }}>
                    <span>{user.status || "Active"}</span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4" style={{ flex: "0 0 37%", maxWidth: "37%" }}>
                    <h5 className="f-w-500">
                      Location <span className="pull-right">:</span>
                    </h5>
                  </div>
                  <div className="col-8" style={{ flex: "0 0 63%", maxWidth: "63%" }}>
                    <span>{user.address || "N/A"}</span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4" style={{ flex: "0 0 37%", maxWidth: "37%" }}>
                    <h5 className="f-w-500">
                      Language <span className="pull-right">:</span>
                    </h5>
                  </div>
                  <div className="col-8" style={{ flex: "0 0 63%", maxWidth: "63%" }}>
                    <span>{user.language_name || "English"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <div className="profile-tab">
                <div className="custom-tab-1">
                  <Tab.Container defaultActiveKey="Setting">
                    <Nav as="ul" className="nav nav-tabs">
                      <Nav.Item as="li" className="nav-item">
                        <Nav.Link to="#profile-settings" eventKey="Setting">
                          Edit Profile
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content>
                      <Tab.Pane id="profile-settings" eventKey="Setting">
                        <div className="pt-3">
                          <div className="settings-form">
                            <h4 className="text-primary">Account Setting</h4>
                            <form onSubmit={handleSubmit}>
                              <div className="row">
                                <div className="form-group mb-3 col-md-6">
                                  <label className="form-label">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    className="form-control"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                  <label className="form-label">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    className="form-control"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              <div className="row">
                                <div className="form-group mb-3 col-md-6">
                                  <label className="form-label">Email</label>
                                  <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                  <label className="form-label">Phone Number</label>
                                  <input
                                    type="text"
                                    name="phone_number"
                                    placeholder="Phone Number"
                                    className="form-control"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              <div className="form-group mb-3">
                                <label className="form-label">Full Address</label>
                                <textarea
                                  className="form-control"
                                  name="address"
                                  rows="4"
                                  placeholder="1234 Main St, Apartment, City, State, Zip"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                ></textarea>
                              </div>
                              <button className="btn btn-primary" type="submit">
                                Save Changes
                              </button>
                            </form>
                          </div>
                        </div>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-xl-8 offset-xl-4">
          <LockPINSetup />
        </div>
      </div>
    </Fragment>
  );
};

export default AppProfile;
