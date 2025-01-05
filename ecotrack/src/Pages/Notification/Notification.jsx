import React, { useState } from "react";
import Navbar from '../../Components/Navbar/Navbar';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notification.scss';

const Notification = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [title, setTitle] = useState(""); // State for Title Box
  const [message, setMessage] = useState(""); // State for Message Box
  const [deliveryType, setDeliveryType] = useState("Quick Notification"); // State for Delivery Type
  const [targetDate, setTargetDate] = useState(""); // State for Target Date
  const [quickNotifications, setQuickNotifications] = useState([]); // Quick Notifications List
  const [scheduledNotifications, setScheduledNotifications] = useState([]); // Scheduled Notifications List
  const [archivedNotifications, setArchivedNotifications] = useState([]); // Archived Notifications List

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleSend = () => {
    if (title && message && (deliveryType === "Quick Notification" || targetDate)) {
      const newNotification = {
        title,
        message,
        deliveryType,
        targetDate: deliveryType === "Scheduled Notification" ? targetDate : null,
      };

      if (deliveryType === "Quick Notification") {
        setQuickNotifications([...quickNotifications, newNotification]);
      } else {
        setScheduledNotifications([...scheduledNotifications, newNotification]);
      }

      setTitle("");
      setMessage("");
      setTargetDate("");
    } else {
      alert("Please fill in all required fields!");
    }
  };

  const moveToArchive = (notification, type) => {
    setArchivedNotifications([...archivedNotifications, notification]);

    if (type === "Quick Notification") {
      setQuickNotifications(quickNotifications.filter((notif) => notif !== notification));
    } else if (type === "Scheduled Notification") {
      setScheduledNotifications(scheduledNotifications.filter((notif) => notif !== notification));
    }
  };

  const deleteNotification = (notification, type) => {
    if (type === "Quick Notification") {
      setQuickNotifications(quickNotifications.filter((notif) => notif !== notification));
    } else if (type === "Scheduled Notification") {
      setScheduledNotifications(scheduledNotifications.filter((notif) => notif !== notification));
    } else if (type === "Archived Notification") {
      setArchivedNotifications(archivedNotifications.filter((notif) => notif !== notification));
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
          {/* Quick Notifications Tab */}
          {activeTab === 1 && (
            <div className="content">
              <h2>Quick Notifications</h2>
              {quickNotifications.length > 0 ? (
                <ul>
                  {quickNotifications.map((notif, index) => (
                    <li key={index}>
                      <strong>{notif.title}</strong>: {notif.message}
                      <div className="notification-actions">
                        <button onClick={() => moveToArchive(notif, "Quick Notification")}>
                          Archive
                        </button>
                        <button onClick={() => deleteNotification(notif, "Quick Notification")}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No Quick Notifications yet.</p>
              )}
            </div>
          )}

          {/* Scheduled Notifications Tab */}
          {activeTab === 2 && (
            <div className="content">
              <h2>Scheduled Notifications</h2>
              {scheduledNotifications.length > 0 ? (
                <ul>
                  {scheduledNotifications.map((notif, index) => (
                    <li key={index}>
                      <strong>{notif.title}</strong>: {notif.message} (Scheduled for: {notif.targetDate})
                      <div className="notification-actions">
                        <button onClick={() => moveToArchive(notif, "Scheduled Notification")}>
                          Archive
                        </button>
                        <button onClick={() => deleteNotification(notif, "Scheduled Notification")}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No Scheduled Notifications yet.</p>
              )}
            </div>
          )}

          {/* Archived Notifications Tab */}
          {activeTab === 3 && (
            <div className="content">
              <h2>Archived Notifications</h2>
              {archivedNotifications.length > 0 ? (
                <ul>
                  {archivedNotifications.map((notif, index) => (
                    <li key={index}>
                      <strong>{notif.title}</strong>: {notif.message} {notif.targetDate && `(Scheduled for: ${notif.targetDate})`}
                      <div className="notification-actions">
                        <button onClick={() => deleteNotification(notif, "Archived Notification")}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No Archived Notifications yet.</p>
              )}
            </div>
          )}

          {/* Create New Push Notification Tab */}
          {activeTab === 4 && (
            <div className="content">
              <h2>Create New Push Notification</h2>

              {/* Delivery Type */}
              <div className="input-group">
                <label htmlFor="deliveryType">Delivery Type:</label>
                <select
                  id="deliveryType"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="Quick Notification">Quick Notification</option>
                  <option value="Scheduled Notification">Scheduled Notification</option>
                </select>
              </div>

              {/* Target Date for Scheduled Notifications */}
              {deliveryType === "Scheduled Notification" && (
                <div className="input-group">
                  <label htmlFor="targetDate">Target Date:</label>
                  <input
                    type="date"
                    id="targetDate"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              )}

              {/* Title Input */}
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

              {/* Message Input */}
              <div className="input-group">
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                ></textarea>
              </div>

              {/* Send Button */}
              <button onClick={handleSend} className="send-button">
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
