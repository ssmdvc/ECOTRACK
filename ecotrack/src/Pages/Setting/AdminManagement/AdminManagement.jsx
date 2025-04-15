import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const AdminManagement = ({ admins,handleDeleteAdmin }) => {
  const columns = [
    { field: "email", headerName: "Email", width: 250 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <button
          style={{ padding: "5px 10px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => handleDeleteAdmin(params.row.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="cardBox">
      <h2>Current Admins</h2>
      <div style={{ height: 500, width: "100%", backgroundColor: "#fff" }}>
        <DataGrid
          rows={admins}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5,10]}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: "bold" },
            "& .MuiDataGrid-row": { borderBottom: "1px solid #e0e0e0" },
          }}
        />
      </div>
    </div>
  );
};

export default AdminManagement;