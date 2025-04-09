import React, { useState, useEffect } from "react";
import "./Request.scss";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { FaSearchPlus, FaSearch } from "react-icons/fa";
import { db, collection, getDocs } from "../../firebase";

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [popupMessage, setPopupMessage] = useState("");
  const [imagePopup, setImagePopup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;



  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "requests"));
        const requestData = querySnapshot.docs.map((doc) => ({
          id: doc.id, 
          ...doc.data(),
        }));
        setRequests(requestData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

  fetchRequests();
  }, []);

  const handleApprove = (id) => {
    setRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
    setArchivedRequests((prevArchived) => {
      if (!prevArchived.some((request) => request.id === id)) {
        const approvedRequest = requests.find((request) => request.id === id);
        return [...prevArchived, { ...approvedRequest, status: "Approved" }];
      }
      return prevArchived;
    });
    showPopupMessage("Request Approved");
  };

  const handleReject = (id) => {
    setRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
    setArchivedRequests((prevArchived) => {
      if (!prevArchived.some((request) => request.id === id)) {
        const rejectedRequest = requests.find((request) => request.id === id);
        return [...prevArchived, { ...rejectedRequest, status: "Rejected" }];
      }
      return prevArchived;
    });
    showPopupMessage("Request Rejected");
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  const openImagePopup = (imageUrl) => {
    setImagePopup(imageUrl);
  };

  const closeImagePopup = () => {
    setImagePopup(null);
  };

  const filteredRequests = (activeTab === "pending" ? requests : archivedRequests).filter(
    (request) =>
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.includes(searchTerm)
  );

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const nextPage = () => {
    if (indexOfLastRequest < filteredRequests.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="disposal">
      <Sidebar />
      <div className="disposalContainer">
    
        <div className="disposalTitle">Disposal Request Management</div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="tabs">
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => {
              setActiveTab("pending");
              setCurrentPage(1);
            }}
          >
            Pending Requests
          </button>
          <button
            className={activeTab === "archive" ? "active" : ""}
            onClick={() => {
              setActiveTab("archive");
              setCurrentPage(1);
            }}
          >
            Archive
          </button>
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
              {activeTab === "pending" ? <th>Actions</th> : <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.date}</td>
                <td>{request.name}</td>
                <td>{request.phoneNumber}</td>
                <td>{request.location}</td>
                <td>{request.description}</td>
                <td>
                  <img src={request.imageUrl} alt="Garbage" className="request-image" />
                  <FaSearchPlus className="magnify-icon" onClick={() => openImagePopup(request.imageUrl)} />
                </td>
                {activeTab === "pending" ? (
                  <td>
                    <button className="approve-button" onClick={() => handleApprove(request.id)}>
                      Approve
                    </button>
                    <button className="reject-button" onClick={() => handleReject(request.id)}>
                      Reject
                    </button>
                  </td>
                ) : (
                  <td>{request.status}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>
          ←
          </button>
          <span> Page {currentPage} </span>
          <button onClick={nextPage} disabled={indexOfLastRequest >= filteredRequests.length}>
          →
          </button>
        </div>
      </div>

      {popupMessage && <div className="popup-message">{popupMessage}</div>}

      {imagePopup && (
        <div className="image-popup-container" onClick={closeImagePopup}>
          <div className="image-popup">
            <img src={imagePopup} alt="Garbage" />
            <button className="close-button" onClick={closeImagePopup}>
            🗙
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Request;
