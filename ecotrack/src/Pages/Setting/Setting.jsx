import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import AdminManagement from "../Setting/AdminManagement/AdminManagement";
import AddAdmin from "../Setting/AdminManagement/AddAdmin";
import "./setting.scss";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABS = {
  ADMIN: "adminMan",
  ACCOUNT: "AddAdmin",
};

const Setting = () => {
  const [activeTab, setActiveTab] = useState(TABS.ADMIN);
  const [setUserData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", firstName: "", lastName: "", password: "" });
  const [setEditedUser] = useState({ firstName: "", lastName: "" });

  // --- Fetch Admins ---
  const fetchAdmins = async () => {
    const usersRef = collection(db, "Users"); // 🔥 Now fetching from Users collection
    const snapshot = await getDocs(usersRef);
    const adminList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAdmins(adminList);
  };

  // --- Fetch Current Logged User (optional) ---
  const fetchUser = async () => {
    const email = localStorage.getItem("email");
    if (!email) return;

    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const user = doc.data();
      setUserData(user);
      setEditedUser({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAdmins();
  }, []);

  // --- Add New Admin ---
  const handleAddAdmin = async () => {
    try {
      if (!newAdmin.email || !newAdmin.firstName || !newAdmin.lastName || !newAdmin.password) {
        toast.error("Please fill in all fields!");
        return;
      }

      await addDoc(collection(db, "Users"), {
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        password: newAdmin.password, // 🔥 Just remember, ideally passwords should be hashed
        role: "admin", // ✅ You can set a "role" field to identify this user as Admin
        createdAt: Timestamp.now(),
      });

      toast.success("Admin added successfully!");
      setNewAdmin({ email: "", firstName: "", lastName: "", password: "" });

      await fetchAdmins(); // ✅ Refresh admin list immediately
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin. Please try again.");
    }
  };

  // --- Delete Admin ---
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      await deleteDoc(doc(db, "Users", adminId)); // 🔥 Deleting from Users collection
      setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
      toast.success("Admin deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting admin.");
    }
  };

  // --- Tab Rendering ---
  const renderTabs = () => (
    <div className="topTabs">
      {Object.entries(TABS).map(([key, tab]) => (
        <button
          key={tab}
          className={activeTab === tab ? "tabButton active" : "tabButton"}
          onClick={() => setActiveTab(tab)}
        >
          {key.replace(/([A-Z])/g, " $1").trim()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="settingContainer">
      <Sidebar />
      <div className="settingsubContainer">
        <div
          style={{
            fontFamily: "Raleway, sans-serif",
            fontOpticalSizing: "auto",
            fontWeight: 500,
            fontStyle: "normal",
            width: "100%",
            fontSize: "24px",
            color: "rgba(43, 54, 116, 1)",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Settings
        </div>

        {renderTabs()}

        <div className="tabContent">
          {activeTab === TABS.ADMIN && (
            <AdminManagement
              admins={admins}
              newAdmin={newAdmin}
              setNewAdmin={setNewAdmin}
              handleAddAdmin={handleAddAdmin}
              handleDeleteAdmin={handleDeleteAdmin}
            />
          )}
          {activeTab === TABS.ACCOUNT && (
            <AddAdmin
              newAdmin={newAdmin}
              setNewAdmin={setNewAdmin}
              handleAddAdmin={handleAddAdmin}
            />
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Setting;
