import React from "react";
import { Modal, Button } from "react-bootstrap";
import { formatDate, parseTime } from "../../../utilis/date";

const ItineraryPreview = ({ showModal, handleClose, values }) => {
    const { planArr, packageName } = values;

    return (
        <Modal
            show={showModal}
            onHide={handleClose}
            markup={false}
            backdrop={true}
            keyboard={true}
            size="xl"
            centered
            className="fade bd-example-modal-lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Itinerary Preview: {packageName}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
                <div className="container-fluid">
                    {planArr?.map((dayPlan, index) => (
                        <div key={index} className="card mb-3">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">
                                    Day {index + 1} - {formatDate(dayPlan.date)}
                                </h5>
                                {dayPlan.dayDestination?.name && (
                                    <span className="badge bg-primary">
                                        {dayPlan.dayDestination.name}
                                    </span>
                                )}
                            </div>
                            <div className="card-body">
                                {dayPlan.schedule?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered text-center align-middle" style={{ tableLayout: "fixed" }}>
                                            <colgroup>
                                                <col style={{ width: "16%" }} />
                                                <col style={{ width: "10%" }} />
                                                <col style={{ width: "51%" }} />
                                                <col style={{ width: "23%" }} />
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Type</th>
                                                    <th>Details</th>
                                                    <th>Locations</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dayPlan.schedule.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            {item.startTime && parseTime(item.startTime)} -{" "}
                                                            {item.endTime && parseTime(item.endTime)}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge ${item.insertType === "hotel"
                                                                    ? "bg-success"
                                                                    : item.insertType === "transfer"
                                                                        ? "bg-info"
                                                                        : "bg-warning"
                                                                    }`}
                                                            >
                                                                {item.insertType?.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="text-start">
                                                            <strong>
                                                                {item.name ||
                                                                    item.activity_name ||
                                                                    item.vehicle_name}
                                                            </strong>
                                                            {item.description && (
                                                                <p className="mb-0 text-muted small text-break">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                            {item.insertType === "hotel" && (
                                                                <div className="mt-1 small">
                                                                    <div>Room: {item.roomType?.label}</div>
                                                                    <div>Meal Plan: {item.option?.label}</div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {item.dayDestination?.label || item.subDestination?.label}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted text-center py-3">
                                        No activities scheduled for this day.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ItineraryPreview;
