import React, { useState } from "react";
import Navbar from '../../Components/Navbar/Navbar';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notification.scss';

const Notification = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [title, setTitle] = useState(""); // State for Title Box
  const [message, setMessage] = useState(""); // State for Message Box
  const [output, setOutput] = useState(null); // State to display the output

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleSend = () => {
    if (title && message) {
      setOutput({ title, message });
      setTitle("");
      setMessage("");
    } else {
      alert("Please fill in both the title and message!");
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />

        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === 1 ? "active" : ""}`}
            onClick={() => handleTabClick(1)}
          >
            Quick Notification
          </div>
          <div
            className={`tab ${activeTab === 2 ? "active" : ""}`}
            onClick={() => handleTabClick(2)}
          >
            Schedule Notification
          </div>
          <div
            className={`tab ${activeTab === 3 ? "active" : ""}`}
            onClick={() => handleTabClick(3)}
          >
            Archived Notification
          </div>
          <div
            className={`tab ${activeTab === 4 ? "active" : ""}`}
            onClick={() => handleTabClick(4)}
          >
            Create New Push Notification
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 1 && (
            <div className="content">
              <h2>Quick Notification</h2>
              <p>This is the content of Quick Notification.</p>
            </div>
          )}
          {activeTab === 2 && (
            <div className="content">
              <h2>Schedule Notification</h2>
              <p>This is the content of Schedule Notification.</p>
            </div>
          )}
          {activeTab === 3 && (
            <div className="content">
              <h2>Archived Notification</h2>
              <p>This is the content of Archived Notification.</p>
            </div>
          )}
          {activeTab === 4 && (
            <div className="content">
              <h2>Create New Push Notification</h2>
              <div className="input-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the title"
                />
              </div>
              <div className="input-group">
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                ></textarea>
              </div>
              <button onClick={handleSend} className="send-button">
                Send
              </button>

              {/* Output Section */}
              {output && (
                <div className="output">
                  <h2>Preview</h2>
                  <p><strong>Title:</strong> {output.title}</p>
                  <p><strong>Message:</strong> {output.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
