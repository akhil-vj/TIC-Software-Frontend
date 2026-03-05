import React from "react";
import PageTitle from "../../layouts/PageTitle";

const Notification = () => {
    const notifications = [
        {
            id: 1,
            title: "New Booking Received",
            message: "Booking #9856 has been placed.",
            time: "2 mins ago",
            icon: "fa-calendar-check",
            color: "success",
        },
        {
            id: 2,
            title: "System Update",
            message: "Server maintenance scheduled for tonight.",
            time: "1 hour ago",
            icon: "fa-server",
            color: "info",
        },
        {
            id: 3,
            title: "New User Registered",
            message: "John Doe created a new account.",
            time: "3 hours ago",
            icon: "fa-user-plus",
            color: "primary",
        },
        {
            id: 4,
            title: "Transaction Failed",
            message: "Transaction for booking #9854 failed.",
            time: "5 hours ago",
            icon: "fa-money-bill-wave",
            color: "danger",
        },
        {
            id: 5,
            title: "Password Changed",
            message: "Your password was updated successfully.",
            time: "Yesterday",
            icon: "fa-key",
            color: "warning",
        },
    ];

    return (
        <>
            <PageTitle activeMenu="Notifications" motherMenu="Dashboard" />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header border-0 pb-0">
                            <h4 className="card-title">All Notifications</h4>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                {notifications.map((notif) => (
                                    <li
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                        key={notif.id}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div
                                                className={`btn-icon-left btn-${notif.color} light me-3`}
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "50%",
                                                }}
                                            >
                                                <i className={`fa-solid ${notif.icon} text-${notif.color}`} />
                                            </div>
                                            <div>
                                                <h6 className="mb-1">{notif.title}</h6>
                                                <small className="d-block text-muted">
                                                    {notif.message}
                                                </small>
                                            </div>
                                        </div>
                                        <span className="badge light badge-light">{notif.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notification;
