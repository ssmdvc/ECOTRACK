import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./Request.scss";

const RequestTable = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [imageModal, setImageModal] = useState({ open: false, src: null });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllRequests(data);
    });

    return () => unsubscribe();
  }, []);

  const applyStatusChange = async () => {
    if (!selectedRequestId || !selectedStatus) return;

    try {
      const ref = doc(db, "requests", selectedRequestId);
      await updateDoc(ref, { status: selectedStatus });
      setConfirmOpen(false);
      setSelectedRequestId(null);
      setSelectedStatus(null);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const openConfirmDialog = (id, newStatus) => {
    setSelectedRequestId(id);
    setSelectedStatus(newStatus);
    setConfirmOpen(true);
  };

  const cancelConfirm = () => {
    setSelectedRequestId(null);
    setSelectedStatus(null);
    setConfirmOpen(false);
  };

  const getFilteredRows = () => {
    const filteredByTab =
      activeTab === "pending"
        ? allRequests.filter((r) => r.status === "pending")
        : allRequests.filter(
            (r) => r.status === "Approved" || r.status === "Rejected"
          );

    const term = searchTerm.toLowerCase();
    return filteredByTab.filter((row) => {
      return (
        row.id.toLowerCase().includes(term) ||
        row.email?.toLowerCase().includes(term) ||
        row.address?.toLowerCase().includes(term) ||
        row.description?.toLowerCase().includes(term)
      );
    });
  };

  const rows = getFilteredRows();

  const columns = [
    { field: "id", headerName: "ID", minWidth: 150 },
    { field: "email", headerName: "Email", minWidth: 200 },
    { field: "address", headerName: "Location", minWidth: 180 },
    {
      field: "description",
      headerName: "Garbage Desc.",
      minWidth: 220,
    },
    {
      field: "date",
      headerName: "Date",
      minWidth: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: "imageUri",
      headerName: "Image",
      minWidth: 160,
      renderCell: (params) =>
        params.value ? (
          <button
            style={{
              padding: "4px 8px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setImageModal({ open: true, src: params.value })}
          >
            View
          </button>
        ) : (
          <span style={{ color: "#888" }}>N/A</span>
        ),
    },
    { field: "category", headerName: "Category", minWidth: 150 },
    { field: "weight", headerName: "Weight (kg)", minWidth: 120 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      renderCell: (params) => (
        <select
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#fff",
            fontWeight: 500,
            color: "#334155",
          }}
          value={params.row.status}
          onChange={(e) => openConfirmDialog(params.row.id, e.target.value)}
        >
          <option value="Under Review">Under Review</option>
          <option value="pending">Pending</option>
          <option value="Approved">Approve</option>
          <option value="Rejected">Reject</option>
        </select>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      renderCell: (params) => (
        <span
          style={{
            fontWeight: "bold",
            color:
              params.value === "Approved"
                ? "green"
                : params.value === "Rejected"
                ? "red"
                : "orange",
          }}
        >
          {params.value}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "30px", backgroundColor: "#f0f4fb", minHeight: "100vh" }}>
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
        Disposal Request Management
      </div>

      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <button
          className={`tab-button ${activeTab === "pending" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
        </button>
        <button
          className={`tab-button ${activeTab === "archived" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("archived")}
        >
          Archived
        </button>

        <input
          type="text"
          placeholder="Search by ID, email, location, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginLeft: "auto",
          }}
        />
      </div>

      <Box
        sx={{
          height: 520,
          width: "100%",
          backgroundColor: "#f9fbfd",
          borderRadius: "8px",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          sx={{
            ".MuiDataGrid-columnHeaders": {
              backgroundColor: "#ffffff",
              fontWeight: "bold",
              fontSize: "15px",
            },
            ".MuiDataGrid-row": {
              backgroundColor: "#f9fbfd",
            },
            ".MuiDataGrid-cell": {
              whiteSpace: "normal",
              wordWrap: "break-word",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#ffffff",
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
                page: 0,
              },
            },
          }}
        />
      </Box>

      {/* Image Modal */}
      {imageModal.open && (
        <Dialog
          open={imageModal.open}
          onClose={() => setImageModal({ open: false, src: null })}
        >
          <DialogTitle>Reference Image</DialogTitle>
          <DialogContent>
            <img
              src={imageModal.src}
              alt="Full View"
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageModal({ open: false, src: null })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirm Status Change */}
      <Dialog open={confirmOpen} onClose={cancelConfirm}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          Are you sure you want to change this request’s status to
          <strong> {selectedStatus}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelConfirm}>Cancel</Button>
          <Button onClick={applyStatusChange} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
          .tab-button {
            padding: 8px 16px;
            border: none;
            background-color: #e0e7ff;
            color: #3730a3;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
          }
          .active-tab {
            background-color: #4338ca;
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default RequestTable;