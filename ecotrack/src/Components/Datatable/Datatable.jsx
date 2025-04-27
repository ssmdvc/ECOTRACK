import "./Datatable.scss"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import { useTheme } from "@mui/material"
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Datatable = () => {
  const [data, setData] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState(null)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      const list = []
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        querySnapshot.forEach((doc) => {
          const docData = doc.data()
          list.push({ id: doc.id, ...docData }) // Include document ID
        })
        setData(list) // Set data to state
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  const theme = useTheme()

  // Fixed: Now this only opens the confirmation modal
  const handleDelete = (id) => {
    setUserIdToDelete(id)
    setDeleteConfirm(true)
  }

  // Fixed: Actual deletion happens here after confirmation
  const confirmDelete = async () => {
    setIsLoading(true)
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "users", userIdToDelete))
      // Update local state
      setData(data.filter((item) => item.id !== userIdToDelete))
      toast.success("User deleted successfully!")
      setIsLoading(false)
      setDeleteConfirm(false)
    } catch (err) {
      console.error("Error deleting user:", err)
      toast.error("Failed to delete user. Please try again.")
      setIsLoading(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(false)
    setUserIdToDelete(null)
  }

  const handleEdit = async (id, field, value) => {
    try {
      const userDoc = doc(db, "users", id)
      await updateDoc(userDoc, { [field]: value }) // Update Firestore document
      setData(data.map((item) => (item.id === id ? { ...item, [field]: value } : item))) // Update state
      toast.success("User updated successfully!")
    } catch (err) {
      console.log(err)
      toast.error("Failed to update user. Please try again.")
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create user object with basic fields
      const userToAdd = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        createdAt: serverTimestamp(), // Automatically set timestamp
      }

      // Add document to Firestore and get the document reference
      const docRef = await addDoc(collection(db, "users"), userToAdd)

      // Use the document ID as the UID
      const uid = docRef.id

      // Update the document to include the UID
      await updateDoc(docRef, { uid: uid })

      // Update local state with the new user
      const newUserWithId = {
        id: docRef.id,
        ...userToAdd,
        uid: uid,
        createdAt: new Date(), // For immediate display in UI
      }

      setData([...data, newUserWithId])
      toast.success("User added successfully!")

      // Reset form and close modal
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
      })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding user: ", error)
      toast.error("Failed to add user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewUser = (user) => {
    setCurrentUser(user)
    setViewModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString()
    }
    return ""
  }

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 100,
      editable: true,
    },
    { 
      field: "lastName", 
      headerName: "Last Name", 
      flex: 1,
      minWidth: 100,
      editable: true 
    },
    { 
      field: "email", 
      headerName: "Email", 
      flex: 1.5,
      minWidth: 150,
      editable: true 
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 1,
      minWidth: 120,
      editable: true,
    },
    { 
      field: "address", 
      headerName: "Address", 
      flex: 1.5,
      minWidth: 150,
      editable: true 
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1.2,
      minWidth: 130,
      renderCell: (params) => {
        if (!params.row.createdAt) return "N/A"

        // Handle Firestore timestamp objects
        if (params.row.createdAt.seconds) {
          return new Date(params.row.createdAt.seconds * 1000).toLocaleString()
        }

        // Handle JavaScript Date objects (for newly added users)
        if (params.row.createdAt instanceof Date) {
          return params.row.createdAt.toLocaleString()
        }

        return "N/A"
      },
      // Make this column non-editable
      editable: false,
    },
    { 
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleViewUser(params.row)}>
              View
            </div>

            <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>
              Delete
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="datatable">
      <div className="datatableTitle">
        User Management
        {/* <button className="link" onClick={() => setIsAddModalOpen(true)}>
          Add New
        </button> */}
      </div>
      <div className="tableContainer">
        <DataGrid
          className="datagrid"
          rows={data}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 9 },
            },
          }}
          pageSizeOptions={[5, 9, 15]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
          processRowUpdate={(newRow, oldRow) => {
            const updatedRow = { ...newRow }
            const field = Object.keys(updatedRow).find((key) => updatedRow[key] !== oldRow[key])
            if (field) {
              handleEdit(updatedRow.id, field, updatedRow[field])
            }
            return updatedRow
          }}
          onProcessRowUpdateError={(error) => {
            console.error("Error updating row:", error)
            toast.error("Failed to update row. Please try again.")
          }}
        />
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsAddModalOpen(false)}>
              &times;
            </span>
            {/* <h2>Add New User</h2> */}
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={newUser.firstName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={newUser.lastName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={newUser.email} onChange={handleInputChange} required />
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
                <input type="text" name="address" value={newUser.address} onChange={handleInputChange} required />
              </div>
              <div className="form-note">
                <small>UID and Created At will be generated automatically</small>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </button>
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
                <strong>First Name:</strong> {currentUser.firstName || "N/A"}
              </p>
              <p>
                <strong>Last Name:</strong> {currentUser.lastName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email || "N/A"}
              </p>
              <p>
                <strong>Phone Number:</strong> {currentUser.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {currentUser.address || "N/A"}
              </p>
              <p>
                <strong>Created At:</strong> {formatDate(currentUser.createdAt) || "N/A"}
              </p>
              <p>
                <strong>UID:</strong> {currentUser.uid || "N/A"}
              </p>
            </div>
            <div className="form-actions">
              <button className="close-button" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed: Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal delete-modal">
          <div className="modal-content">
            <span className="close" onClick={cancelDelete}>
              &times;
            </span>
            <div className="modal-body">
              <div className="delete-confirmation">
                <h3>Are you sure you want to delete this user?</h3>
                <p>This action cannot be undone.</p>
                <div className="delete-actions">
                  <button className="cancel-delete" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button className="confirm-delete" onClick={confirmDelete} disabled={isLoading}>
                    {isLoading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default Datatable
