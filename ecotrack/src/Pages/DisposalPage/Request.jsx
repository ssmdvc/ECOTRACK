import React, { useState, useEffect } from "react"; // Importing React and its hooks
import './Request.scss'; // Importing custom styles for the component
import Navbar from '../../Components/Navbar/Navbar'; // Importing Navbar component
import Sidebar from '../../Components/Sidebar/Sidebar'; // Importing Sidebar component
import { db, collection, getDocs } from "../../firebase"; // Importing Firebase database functions

const Request = () => {
  const [requests, setRequests] = useState([]); // State to hold the list of requests
  const [activeTab, setActiveTab] = useState("approved"); // State to track the currently active tab
  const [selectedRequest, setSelectedRequest] = useState(null); // State to track the selected request for the popup
  const [isPopupVisible, setPopupVisible] = useState(false); // State to manage popup visibility

  // Sample data to simulate requests for testing purposes
  const sampleData = [
    // Approved Requests
    {
      id: "001",
      date: "2024-11-09",
      name: "Raoul Juan",
      phoneNumber: "09458905782",
      location: "8709 Valderama St.",
      description: "Waste Woods",
      imageUrl: "https://via.placeholder.com/150",
      status: "Approved",
    },
    {
      id: "002",
      date: "2024-11-10",
      name: "Maria Santos",
      phoneNumber: "09345678901",
      location: "456 Maple St.",
      description: "Broken Furniture",
      imageUrl: "https://via.placeholder.com/150",
      status: "Approved",
    },
    // Rejected Requests
    {
      id: "003",
      date: "2024-11-11",
      name: "John Doe",
      phoneNumber: "0987654321",
      location: "123 Elm St.",
      description: "Plastic Bottles",
      imageUrl: "https://via.placeholder.com/150",
      status: "Rejected",
    },
    {
      id: "004",
      date: "2024-11-12",
      name: "Jane Smith",
      phoneNumber: "09123456789",
      location: "789 Oak St.",
      description: "Old Tires",
      imageUrl: "https://via.placeholder.com/150",
      status: "Rejected",
    },
    // Pending Requests
    {
      id: "005",
      date: "2024-11-13",
      name: "Carlos Lopez",
      phoneNumber: "09234567890",
      location: "321 Pine St.",
      description: "Electronics",
      imageUrl: "https://via.placeholder.com/150",
      status: "Pending",
    },
    {
      id: "006",
      date: "2024-11-14",
      name: "Anna Cruz",
      phoneNumber: "09456789012",
      location: "654 Cedar St.",
      description: "Household Waste",
      imageUrl: "https://via.placeholder.com/150",
      status: "Pending",
    },
  ];

  // UseEffect to initialize requests with sample data on component mount
  useEffect(() => {
    setRequests(sampleData); // Setting the initial requests state with sample data
  }, []);

  // Fetch data from Firebase and update requests state
  useEffect(() => {
    const fetchData = async () => {
      const requestsCollection = collection(db, "requests"); // Reference to the "requests" collection in Firestore
      const data = await getDocs(requestsCollection); // Fetch all documents in the collection
      setRequests((prevRequests) => [
        ...prevRequests,
        ...data.docs.map((doc) => ({ id: doc.id, ...doc.data() })), // Adding fetched data to current requests
      ]);
    };
    fetchData(); // Call the async function to fetch data
  }, []);

  // Function to handle opening the request details in a popup
  const openRequestDetails = (request) => {
    setSelectedRequest(request); // Set the selected request
    setPopupVisible(true); // Show the popup
  };

  // Function to close the popup
  const closePopup = () => {
    setPopupVisible(false); // Hide the popup
    setSelectedRequest(null); // Reset the selected request
  };

  // Function to approve a request by updating its status
  const handleApprove = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "Approved" } : request // Update status to "Approved" for the matching request
      )
    );
    alert(`Request ${id} has been approved.`); // Show an alert for confirmation
  };

  // Function to reject a request by updating its status
  const handleReject = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "Rejected" } : request // Update status to "Rejected" for the matching request
      )
    );
    alert(`Request ${id} has been rejected.`); // Show an alert for confirmation
  };

  // Function to render the requests based on their status and whether to include action buttons
  const renderRequests = (status, includeViewAction = false, includeStatus = false) => {
    return requests
      .filter(
        (request) =>
          status === "All" || // If "All", include all requests
          (status === "Archive" && (request.status === "Approved" || request.status === "Rejected")) || // Include "Approved" and "Rejected" for the Archive tab
          request.status === status // Otherwise, filter by the specified status
      )
      .map((request) => (
        <tr key={request.id}>
          <td>{request.id}</td> {/* Request ID */}
          <td>{request.date}</td> {/* Request Date */}
          <td>{request.name}</td> {/* Requester's Name */}
          <td>{request.phoneNumber}</td> {/* Requester's Phone Number */}
          <td>{request.location}</td> {/* Request Location */}
          <td>{request.description}</td> {/* Description of the garbage */}
          <td>
            <img src={request.imageUrl} alt="Garbage" className="request-image" /> {/* Reference Image */}
          </td>
          {includeStatus && <td>{request.status}</td>} {/* Display status if required */}
          {includeViewAction && (
            <td>
              <button className="view-button" onClick={() => openRequestDetails(request)}>
                View
              </button>
            </td>
          )}
        </tr>
      ));
  };

  return (
    <div className='disposal'>
      <Sidebar /> {/* Sidebar component */}
      <div className='disposalContainer'>
        <Navbar /> {/* Navbar component */}
        <div className='disposalTitle'>Disposal Request Management</div> {/* Page Title */}
        <div className="disposalContent">
          <div className="requests-container">
            <div className="tabs">
              {/* Tab Buttons */}
              <button
                className={activeTab === "approved" ? "active" : ""}
                onClick={() => setActiveTab("approved")} // Switch to "Approved Requests" tab
              >
                Approved Requests
              </button>
              <button
                className={activeTab === "rejected" ? "active" : ""}
                onClick={() => setActiveTab("rejected")} // Switch to "Rejected Requests" tab
              >
                Rejected Requests
              </button>
              <button
                className={activeTab === "pending" ? "active" : ""}
                onClick={() => setActiveTab("pending")} // Switch to "Pending Requests" tab
              >
                Pending Requests
              </button>
              <button
                className={activeTab === "archive" ? "active" : ""}
                onClick={() => setActiveTab("archive")} // Switch to "Archive" tab
              >
                Archive
              </button>
            </div>
            {activeTab === "approved" && (
              <div className="approved-requests-section">
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
                    </tr>
                  </thead>
                  <tbody>{renderRequests("Approved")}</tbody> {/* Render approved requests */}
                </table>
              </div>
            )}
            {activeTab === "rejected" && (
              <div className="rejected-requests-section">
                <div className="rejected-header">
                  <div className="top-buttons">
                    <button
                      className="edit-button"
                      onClick={() =>
                        selectedRequest
                          ? openRequestDetails(selectedRequest) // Open popup for editing selected request
                          : alert("Select a request to edit")
                      }
                    >
                      Edit
                    </button>
                  </div>
                </div>
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
                    </tr>
                  </thead>
                  <tbody>{renderRequests("Rejected")}</tbody> {/* Render rejected requests */}
                </table>
              </div>
            )}
            {activeTab === "pending" && (
              <div className="pending-requests-section">
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderRequests("Pending", true)}</tbody> {/* Render pending requests with action buttons */}
                </table>
              </div>
            )}
            {activeTab === "archive" && (
              <div className="archive-section">
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
                      <th>Status</th> {/* Status column for Archive */}
                    </tr>
                  </thead>
                  <tbody>{renderRequests("Archive", false, true)}</tbody> {/* Render archived requests */}
                </table>
              </div>
            )}
          </div>
        </div>
        {isPopupVisible && selectedRequest && (
          <div className="popup-container">
            <div className="popup-banner">
              <button className="close-button" onClick={closePopup}>
                &larr;
              </button>
              <h2>Disposal Request Information</h2>
              <div className="popup-details">
                <p>
                  <strong>Request ID: </strong>
                  <span>{selectedRequest.id}</span>
                </p>
                <p>
                  <strong>Date: </strong>
                  <span>{selectedRequest.date}</span>
                </p>
                <div className="request-info">
                  <p>
                    <strong>Name: </strong>
                    <span>{selectedRequest.name}</span>
                  </p>
                  <p>
                    <strong>Phone Number: </strong>
                    <span>{selectedRequest.phoneNumber}</span>
                  </p>
                  <p>
                    <strong>Location: </strong>
                    <span>{selectedRequest.location}</span>
                  </p>
                  <p>
                    <strong>Garbage Description: </strong>
                    <span>{selectedRequest.description}</span>
                  </p>
                  <p>
                    <strong>Reference Image: </strong>
                  </p>
                  <img
                    src={selectedRequest.imageUrl}
                    alt="Garbage"
                    className="popup-image"
                  />
                </div>
              </div>
              <div className="popup-actions">
                <button
                  className="approve-button"
                  onClick={() => {
                    handleApprove(selectedRequest.id); // Approve the request
                    closePopup(); // Close the popup
                  }}
                >
                  Approve
                </button>
                <button
                  className="reject-button"
                  onClick={() => {
                    handleReject(selectedRequest.id); // Reject the request
                    closePopup(); // Close the popup
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Request; // Export the component for use in other parts of the app
