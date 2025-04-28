import React from "react";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth method
import { auth, db } from "../../../firebase"; // Import Firebase auth and Firestore
import { setDoc, doc, Timestamp } from "firebase/firestore"; // Import Firestore methods
import { toast } from "react-toastify"; // Import toast for notifications

const AddAdmin = ({ newAdmin, setNewAdmin, handleAddAdmin }) => {
  const handleAddAdminWithAuth = async () => {
    try {
      if (!newAdmin.email || !newAdmin.firstName || !newAdmin.lastName || !newAdmin.password) {
        toast.error("Please fill in all fields!");
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.password);
      const user = userCredential.user;

      // Add user details to Firestore
      await setDoc(doc(db, "Users", user.uid), {
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: "admin", // Set role as admin
        createdAt: Timestamp.now(),
      });

      toast.success("Admin added successfully!");
      setNewAdmin({ email: "", firstName: "", lastName: "", password: "" }); // Reset form
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin. Please try again.");
    }
  };

  return (
    <div className="cardBox">
      <h2>Add Admin</h2>
      <div className="formGroup" style={{ marginBottom: "20px" }}>
        <input
          type="email"
          placeholder="Email"
          value={newAdmin.email}
          onChange={(e) =>
            setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="First Name"
          value={newAdmin.firstName}
          onChange={(e) =>
            setNewAdmin((prev) => ({ ...prev, firstName: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newAdmin.lastName}
          onChange={(e) =>
            setNewAdmin((prev) => ({ ...prev, lastName: e.target.value }))
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={newAdmin.password}
          onChange={(e) =>
            setNewAdmin((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <button
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            backgroundColor: "#2b3674",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleAddAdminWithAuth} // Use the updated function
        >
          Add Admin
        </button>
      </div>
    </div>
  );
};

export default AddAdmin;
