import "./Datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Datatable = () => {
  const [data, setData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driverIdToDelete, setDriverIdToDelete] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          list.push({ id: doc.id, ...docData }); // Include document ID
        });
        setData(list); // Set data to state
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const theme = useTheme();

  const handleDelete = async (id) => {
    try {
      setDriverIdToDelete(id);
      setDeleteConfirm(true);
      // Delete from Firestore
      await deleteDoc(doc(db, "users", id));
      // Update local state
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);

    try {
      // Simulate deleting the driver (replace with actual delete logic)
      setTimeout(() => {
        setIsLoading(false);
        // Close the confirmation modal after deletion
        setDeleteConfirm(false);
        alert("Driver deleted successfully!");
        // You can also add a toast notification here if needed
      }, 2000); // Simulate API call delay
    } catch (error) {
      setIsLoading(false);
      alert("Error deleting driver. Please try again.");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false); // Close modal if canceled
  };

  const handleEdit = async (id, field, value) => {
    try {
      const userDoc = doc(db, "users", id);
      await updateDoc(userDoc, { [field]: value }); // Update Firestore document
      setData(
        data.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      ); // Update state
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate an async action (e.g., form submission, API call)
      setTimeout(() => {
        setIsLoading(false); // Stop loading

        // Simulate success (can replace with actual API call)
        toast.success("Data saved successfully!");

        // If something went wrong, you could use toast.error() instead
      }, 3000); // Simulating API delay of 2 seconds
    } catch (error) {
      setIsLoading(false); // Stop loading if error
      toast.error("Failed to save. Please try again.");
    }

    try {
      // Create user object with basic fields
      const userToAdd = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        createdAt: serverTimestamp(), // Automatically set timestamp
      };

      // Add document to Firestore and get the document reference
      const docRef = await addDoc(collection(db, "users"), userToAdd);

      // Use the document ID as the UID
      const uid = docRef.id;

      // Update the document to include the UID
      await updateDoc(docRef, { uid: uid });

      // Update local state with the new user
      const newUserWithId = {
        id: docRef.id,
        ...userToAdd,
        uid: uid,
        createdAt: new Date(), // For immediate display in UI
      };

      setData([...data, newUserWithId]);

      // Reset form and close modal
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding user: ", error);
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return "";
  };

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      width: 150,
      editable: true,
    },
    { field: "lastName", headerName: "Last Name", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 200, editable: true },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      width: 180,
      editable: true,
    },
    { field: "address", headerName: "Address", width: 250, editable: true },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueGetter: (params) => {
        // Ensure that row is defined before accessing it
        if (!params.row) return "";
        const createdAt = params.row.createdAt;
        if (createdAt && createdAt.seconds) {
          return new Date(createdAt.seconds * 1000).toLocaleString();
        }
        return "";
      },
    },
    { field: "uid", headerName: "UID", width: 250 },
  ];

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div
              className="viewButton"
              onClick={() => handleViewUser(params.row)}
            >
              View
            </div>

            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        User Management
        <button className="link" onClick={() => setIsAddModalOpen(true)}>
          Add New
        </button>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={columns.concat(actionColumn)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 9 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        processRowUpdate={(newRow) => {
          const updatedRow = { ...newRow };
          const originalRow = data.find((item) => item.id === updatedRow.id);
          const field = Object.keys(updatedRow).find(
            (key) => updatedRow[key] !== originalRow?.[key]
          );
          if (field) {
            handleEdit(updatedRow.id, field, updatedRow[field]);
          }
          return updatedRow;
        }}
      />

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsAddModalOpen(false)}>
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
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleInputChange}
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
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-note">
                <small>
                  UID and Created At will be generated automatically
                </small>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
              <ToastContainer
                position="top-right" // Position of the toast
                autoClose={5000} // Auto-close after 5 seconds
                hideProgressBar={false} // Show progress bar
                newestOnTop={false} // Stack new toasts below
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
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
                <strong>First Name:</strong> {currentUser.firstName || "N/A"}
              </p>
              <p>
                <strong>Last Name:</strong> {currentUser.lastName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email || "N/A"}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {currentUser.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {currentUser.address || "N/A"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {formatDate(currentUser.createdAt) || "N/A"}
              </p>
              <p>
                <strong>UID:</strong> {currentUser.uid || "N/A"}
              </p>
            </div>
            <div className="form-actions">
              <button onClick={() => setViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={cancelDelete}>
              &times;
            </span>
            <div className="modal-body">
              <div className="delete-confirmation">
                <h3>Are you sure you want to delete this driver?</h3>
                <p>This action cannot be undone.</p>
                <div className="delete-actions">
                  <button
                    className="confirm-delete"
                    onClick={confirmDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button className="cancel-delete" onClick={cancelDelete}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Datatable;
