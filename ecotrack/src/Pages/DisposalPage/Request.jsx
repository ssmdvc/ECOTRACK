import React, { useState, useEffect } from "react";
import './Request.scss';
import Navbar from '../../Components/Navbar/Navbar';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { db, collection, getDocs } from "../../firebase"; // Import Firebase config

const Request = () => {
  // State to hold requests data fetched from Firebase
  const [requests, setRequests] = useState([]);
  // State to manage the active tab (Awaiting Requests or Rejected Requests)
  const [activeTab, setActiveTab] = useState("awaiting");
  // State to manage the selected request for the pop-up
  const [selectedRequest, setSelectedRequest] = useState(null);
  // State to toggle the visibility of the pop-up
  const [isPopupVisible, setPopupVisible] = useState(false);

  // Hardcoded data for testing
  const sampleData = [
    {
      id: "001",
      date: "2024-11-09",
      name: "Raoul Juan",
      phoneNumber: "09458905782",
      location: "8709 Valderama St.",
      description: "Waste Woods",
      imageUrl: "https://via.placeholder.com/150",
      status: "Approved",
    }
  ];

  // Initially setting the requests state with sample data
  useEffect(() => {
    setRequests(sampleData);
  }, []);

  // Fetches data from the Firebase Firestore when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      const requestsCollection = collection(db, "requests"); // Reference to the "requests" collection in Firestore
      const data = await getDocs(requestsCollection); // Fetch all documents from the collection
      // Add Firebase data to the existing requests data (which includes sampleData)
      setRequests((prevRequests) => [
        ...prevRequests,
        ...data.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ]);
    };
    fetchData();
  }, []);

  // Function to handle opening the request details pop-up
  const openRequestDetails = (request) => {
    setSelectedRequest(request); // Set the selected request
    setPopupVisible(true); // Show the pop-up
  };

  // Function to handle closing the pop-up
  const closePopup = () => {
    setPopupVisible(false); // Hide the pop-up
    setSelectedRequest(null); // Clear the selected request
  };

  // Function to render the list of requests based on the provided status
  const renderRequests = (status) => {
    return requests
      .filter((request) => request.status === status) // Filter requests by status (Approved/Rejected)
      .map((request) => (
        <tr key={request.id} onClick={() => openRequestDetails(request)}> {/* Clickable row */}
          <td>{request.id}</td> {/* Request ID */}
          <td>{request.date}</td> {/* Date of the request */}
          <td>{request.name}</td> {/* Name of the requester */}
          <td>{request.phoneNumber}</td> {/* Phone number */}
          <td>{request.location}</td> {/* Location of the request */}
          <td>{request.description}</td> {/* Description of the garbage */}
          <td>
            <img src={request.imageUrl} alt="Garbage" className="request-image" /> {/* Reference image */}
          </td>
          <td className={`status ${request.status.toLowerCase()}`}>
            {request.status} {/* Status (Approved/Rejected) */}
          </td>
        </tr>
      ));
  };

  return (
    <div className='disposal'>
      <Sidebar />
      <div className='disposalContainer'>
        <Navbar />
        <div className='disposalTitle'>
          Disposal Request Management
        </div>
        <div className="disposalContent">
          <div className="requests-container">
            {/* Tabs for switching between Awaiting Requests and Rejected Requests */}
            <div className="tabs">
              <button
                className={activeTab === "awaiting" ? "active" : ""} // Highlight the active tab
                onClick={() => setActiveTab("awaiting")} // Set the active tab to "awaiting"
              >
                Awaiting Requests
              </button>
              <button
                className={activeTab === "rejected" ? "active" : ""} // Highlight the active tab
                onClick={() => setActiveTab("rejected")} // Set the active tab to "rejected"
              >
                Rejected Requests
              </button>
            </div>
            {/* Table displaying the list of requests */}
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Location</th>
                  <th>Garbage Description</th>
                  <th>Reference Image</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Render requests based on the active tab */}
                {activeTab === "awaiting"
                  ? renderRequests("Approved") // Show approved requests in Awaiting Requests tab
                  : renderRequests("Rejected")}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pop-up for Request Details */}
        {isPopupVisible && selectedRequest && (
          <div className="popup-container">
            <div className="popup-banner">
              <button className="close-button" onClick={closePopup}>
                &larr; 
              </button>
              <h2>Disposal Request Information</h2>
              <div className="popup-details">
                <p><strong>Request ID: </strong><span>{selectedRequest.id}</span></p>
                <p><strong>Date: </strong><span>{selectedRequest.date}</span></p>
                <div className="request-info">
                  <p><strong>Name: </strong><span>{selectedRequest.name}</span></p>
                  <p><strong>Phone Number: </strong><span>{selectedRequest.phoneNumber}</span></p>
                  <p><strong>Location: </strong><span>{selectedRequest.location}</span></p>
                  <p><strong>Garbage Description: </strong><span>{selectedRequest.description}</span></p>
                  <p><strong>Reference Image: </strong></p>
                  <img src={selectedRequest.imageUrl} alt="Garbage" className="popup-image" />
                </div>
                </div>
              <div className="popup-actions">
                <button className="approve-button">Approve</button>
                <button className="reject-button">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;
