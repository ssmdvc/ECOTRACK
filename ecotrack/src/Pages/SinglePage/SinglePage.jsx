import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  remove,
  child,
  onValue,
} from "firebase/database";
import "./SinglePage.scss";
import { db } from "../../firebase";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  // Fetch users from Firebase on component mount
  useEffect(() => {
    const usersRef = ref(db, "users");

    // Set up a listener for real-time updates
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map((key) => ({
          id: key,
          ...usersData[key],
          created: usersData[key].created || new Date().toISOString(),
        }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Add timestamp for created field
      const userWithTimestamp = {
        ...newUser,
        created: new Date().toISOString(),
      };

      // Create a new reference with an auto-generated key
      const newUserRef = push(ref(db, "users"));
      await set(newUserRef, userWithTimestamp);

      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const deletePromises = selectedUsers.map((userId) =>
        remove(ref(db, `users/${userId}`))
      );
      await Promise.all(deletePromises);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error deleting users: ", error);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const handleViewUser = (user) => {
    setCurrentUser(user);
    setViewModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="user-management">
      <div className="header">
        <h1>User Management</h1>
        <div className="actions">
          {selectedUsers.length > 0 && (
            <button className="delete-btn" onClick={handleDeleteSelected}>
              Delete Selected
            </button>
          )}
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>
            Add New
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={newUser.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewModalOpen && currentUser && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setViewModalOpen(false)}>
              &times;
            </span>
            <h2>User Details</h2>
            <div className="user-details">
              <p>
                <strong>First Name:</strong> {currentUser.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {currentUser.lastName}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
              <p>
                <strong>Phone Number:</strong> {currentUser.phoneNumber}
              </p>
              <p>
                <strong>Address:</strong> {currentUser.address}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(currentUser.created)}
              </p>
            </div>
            <div className="form-actions">
              <button onClick={() => setViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
