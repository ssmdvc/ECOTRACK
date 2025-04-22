import React, { useState } from "react";
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notification.scss';
import { db } from "../../firebase"; // adjust the path to your firebase config
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

<div className="Notification">
<Sidebar />
<div className="notificationContainer">
  <div className="notificationTitle">Notification</div>
</div>
</div>

const Notification = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [deliveryType, setDeliveryType] = useState("Scheduled Notification"); // User choice
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [archivedNotifications, setArchivedNotifications] = useState([]);

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleSend = async () => {
    if (title && message) {
      if (deliveryType === "Scheduled Notification" && !targetDate) {
        alert("Please choose a target date for scheduled notification!");
        return;
      }
  
      const newNotification = {
        title,
        message,
        targetDate: deliveryType === "Scheduled Notification" ? targetDate : null,
        type: deliveryType,
        createdAt: new Date().toISOString(),
      };
  
      try {
        const docRef = await addDoc(collection(db, "notifications"), newNotification);
  
        const notificationWithId = { ...newNotification, id: docRef.id };
  
        if (deliveryType === "Scheduled Notification") {
          setScheduledNotifications([...scheduledNotifications, notificationWithId]);
        } else {
          setArchivedNotifications([...archivedNotifications, notificationWithId]);
        }
  
        setTitle("");
        setMessage("");
        setTargetDate("");
        setDeliveryType("Scheduled Notification");
  
        alert("Notification successfully saved to Firestore!");
      } catch (error) {
        console.error("Error adding notification: ", error);
        alert("Something went wrong while saving the notification.");
      }
    } else {
      alert("Please fill in all required fields!");
    }
  };
  
  
  const moveToArchive = async (notification) => {
    try {
      // Add to "archives" collection
      await addDoc(collection(db, "archives"), {
        ...notification,
        archivedAt: new Date().toISOString(),
        type: "Archived Notification"
      });
  
      // Delete from "notifications" collection
      if (notification.id) {
        await deleteDoc(doc(db, "notifications", notification.id));
      }
  
      // Update local state
      setArchivedNotifications([...archivedNotifications, notification]);
      setScheduledNotifications(scheduledNotifications.filter((notif) => notif.id !== notification.id));
  
      alert("Notification archived successfully.");
    } catch (error) {
      console.error("Error moving notification to archive: ", error);
      alert("Failed to archive the notification.");
    }
  };
  

  const deleteNotification = async (notification, type) => {
    try {
      if (notification.id) {
        await deleteDoc(doc(db, "notifications", notification.id));
      }
  
      if (type === "Scheduled Notification") {
        setScheduledNotifications(scheduledNotifications.filter((notif) => notif.id !== notification.id));
      } else if (type === "Archived Notification") {
        setArchivedNotifications(archivedNotifications.filter((notif) => notif.id !== notification.id));
      }
  
      alert("Notification deleted successfully.");
    } catch (error) {
      console.error("Error deleting notification: ", error);
      alert("Failed to delete the notification from Firestore.");
    }
  };
  

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === 1 ? "active" : ""}`}
            onClick={() => handleTabClick(1)}
          >
            Scheduled Notifications
          </div>
          <div
            className={`tab ${activeTab === 2 ? "active" : ""}`}
            onClick={() => handleTabClick(2)}
          >
            Archived Notifications
          </div>
          <div
            className={`tab ${activeTab === 3 ? "active" : ""}`}
            onClick={() => handleTabClick(3)}
          >
            Create New Notification
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">

          {/* Scheduled Notifications */}
          {activeTab === 1 && (
            <div className="content">
              <h2>Scheduled Notifications</h2>
              {scheduledNotifications.length > 0 ? (
                <ul>
                  {scheduledNotifications.map((notif, index) => (
                    <li key={index}>
                      <strong>{notif.title}</strong>: {notif.message} (Scheduled for: {notif.targetDate})
                      <div className="notification-actions">
                        <button onClick={() => moveToArchive(notif)}>
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

          {/* Archived Notifications */}
          {activeTab === 2 && (
            <div className="content">
              <h2>Archived Notifications</h2>
              {archivedNotifications.length > 0 ? (
                <ul>
                  {archivedNotifications.map((notif, index) => (
                    <li key={index}>
                      <strong>{notif.title}</strong>: {notif.message}
                      {notif.targetDate && `(Scheduled for: ${notif.targetDate})`}
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

          {/* Create New Notification */}
          {activeTab === 3 && (
            <div className="content">
              <h2>Create New Notification</h2>

              {/* Delivery Type Dropdown */}
              <div className="input-group">
                <label htmlFor="deliveryType">Delivery Type:</label>
                <select
                  id="deliveryType"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="Scheduled Notification">Scheduled Notification</option>
                  <option value="Archived Notification">Archived Notification</option>
                </select>
              </div>

              {/* Target Date (only for Scheduled) */}
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
                Save Notification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
