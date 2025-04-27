import React from "react";

const AddAdmin = ({ newAdmin, setNewAdmin, handleAddAdmin }) => {
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
          onClick={handleAddAdmin}
        >
          Add Admin
        </button>
      </div>
    </div>
  );
};

export default AddAdmin;
