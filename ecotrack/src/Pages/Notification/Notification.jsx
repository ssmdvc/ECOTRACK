import React, { useState, useEffect } from "react";
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Notification.scss';
import { db } from "../../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";

const Notification = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [deliveryType, setDeliveryType] = useState("Scheduled Notification");
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [archivedNotifications, setArchivedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    fetchArchives();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      moveExpiredNotifications();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [scheduledNotifications]);

  const fetchNotifications = async () => {
    const snapshot = await getDocs(collection(db, "notifications"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setScheduledNotifications(data);
  };

  const fetchArchives = async () => {
    const snapshot = await getDocs(collection(db, "archives"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setArchivedNotifications(data);
  };

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleSend = async () => {
    if (title && message) {
      if (deliveryType === "Scheduled Notification" && !targetDate) {
        alert("Please choose a target date for scheduled notification!");
        return;
      }

      const currentDate = new Date().toISOString();
      const newNotification = {
        title,
        message,
        targetDate: deliveryType === "Scheduled Notification" ? targetDate : null,
        type: deliveryType,
        createdAt: currentDate,
      };

      try {
        const docRef = await addDoc(collection(db, "notifications"), newNotification);

        const notificationWithId = { ...newNotification, id: docRef.id };
        setScheduledNotifications([...scheduledNotifications, notificationWithId]);

        setTitle("");
        setMessage("");
        setTargetDate("");
        setDeliveryType("Scheduled Notification");

        alert("Notification successfully saved!");

      } catch (error) {
        console.error("Error adding notification: ", error);
        alert("Something went wrong while saving the notification.");
      }
    } else {
      alert("Please fill in all required fields!");
    }
  };

  const moveExpiredNotifications = async () => {
    const now = new Date();
    const expired = scheduledNotifications.filter(notif => 
      notif.targetDate && new Date(notif.targetDate) <= now
    );

    for (const notif of expired) {
      try {
        await addDoc(collection(db, "archives"), {
          ...notif,
          archivedAt: now.toISOString(),
          type: "Archived Notification",
        });

        if (notif.id) {
          await deleteDoc(doc(db, "notifications", notif.id));
        }
      } catch (error) {
        console.error("Error moving to archive: ", error);
      }
    }

    if (expired.length > 0) {
      fetchNotifications();
      fetchArchives();
    }
  };

  const resendNotification = async (notification) => {
    try {
      await axios.post("https://app.nativenotify.com/api/notification", {
        appId: 29491,
        appToken: "4xMscEXQvK02ambrgvtOJD",
        title: notification.title,
        body: notification.message,
        dateSent: new Date().toLocaleString(),
      });

      alert("Notification re-sent successfully!");
    } catch (error) {
      console.error("Error re-sending notification:", error);
      alert("Failed to re-send notification.");
    }
  };

  const deleteNotification = async (notification, type) => {
    try {
      if (notification.id) {
        const coll = type === "Scheduled Notification" ? "notifications" : "archives";
        await deleteDoc(doc(db, coll, notification.id));
      }

      if (type === "Scheduled Notification") {
        setScheduledNotifications(prev => prev.filter(n => n.id !== notification.id));
      } else {
        setArchivedNotifications(prev => prev.filter(n => n.id !== notification.id));
      }

      alert("Notification deleted successfully.");
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification.");
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        {/* Tabs */}
        <div className="tabs">
          <div className={`tab ${activeTab === 1 ? "active" : ""}`} onClick={() => handleTabClick(1)}>
            Scheduled Notifications
          </div>
          <div className={`tab ${activeTab === 2 ? "active" : ""}`} onClick={() => handleTabClick(2)}>
            Archived Notifications
          </div>
          <div className={`tab ${activeTab === 3 ? "active" : ""}`} onClick={() => handleTabClick(3)}>
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
                      {notif.targetDate && `(Originally Scheduled: ${notif.targetDate})`}
                      <div className="notification-actions">
                        <button onClick={() => resendNotification(notif)}>
                          Resend
                        </button>
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

              <div className="input-group">
                <label htmlFor="deliveryType">Delivery Type:</label>
                <select
                  id="deliveryType"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="Scheduled Notification">Scheduled Notification</option>
                </select>
              </div>

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
