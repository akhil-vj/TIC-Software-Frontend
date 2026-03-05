import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../layouts/PageTitle";

const messageBlog = [
    { sender: "Travel Master", subject: "Quotation for Bali Trip", content: "Dear User, Please find attached the quotation for your Bali trip...", time: "11:00 AM", status: "New" },
    { sender: "Global Tours", subject: "Europe Package Quote", content: "Hi, As requested, here is the detailed itinerary and cost...", time: "10:30 AM", status: "Read" },
    { sender: "Holiday Inn", subject: "Hotel Booking Confirmation", content: "Your booking for 3 nights has been confirmed...", time: "Yesterday", status: "Pending" },
    { sender: "Flights Direct", subject: "Flight Quotation", content: "Best prices for flights to London...", time: "Yesterday", status: "Approved" },
];

const QuotationInbox = () => {
    return (
        <Fragment>
            <PageTitle activeMenu="Inbox" motherMenu="Quotations" pageContent="Inbox" />

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header border-0 pb-0 d-flex justify-content-between">
                            <h4 className="card-title">Received Quotations</h4>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover table-responsive-sm">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Sender</th>
                                            <th>Subject</th>
                                            <th>Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messageBlog.map((item, ind) => (
                                            <tr key={ind} className="btn-reveal-trigger">
                                                <td className="py-2">
                                                    <span className={`badge badge-rounded badge-${item.status === "New" ? "success" :
                                                        item.status === "Pending" ? "warning" :
                                                            item.status === "Approved" ? "info" : "light"
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <strong className="text-black">{item.sender}</strong>
                                                </td>
                                                <td className="py-2">
                                                    <span className="mb-0">{item.subject}</span>
                                                    <small className="d-block text-muted text-truncate" style={{ maxWidth: "300px" }}>{item.content}</small>
                                                </td>
                                                <td className="py-2">{item.time}</td>
                                                <td className="py-2">
                                                    <div className="d-flex">
                                                        <Link to="#" className="btn btn-primary shadow btn-xs sharp me-1">
                                                            <i className="fa fa-envelope-open"></i>
                                                        </Link>
                                                        <Link to="#" className="btn btn-success shadow btn-xs sharp">
                                                            <i className="fa fa-check"></i>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default QuotationInbox;
