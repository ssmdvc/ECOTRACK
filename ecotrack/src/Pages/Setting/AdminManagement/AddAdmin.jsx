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
            setNewAdmin({ ...newAdmin, email: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="First Name"
          value={newAdmin.firstName}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, firstName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newAdmin.lastName}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, lastName: e.target.value })
          }
        />
        <button onClick={handleAddAdmin}>Add Admin</button>
      </div>
    </div>
  );
};

export default AddAdmin;
