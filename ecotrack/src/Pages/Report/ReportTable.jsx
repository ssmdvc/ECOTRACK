import React, { useEffect, useState } from 'react';
import './Report.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { db, collection, getDocs, doc, updateDoc } from '../../firebase';
import { MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

// Fields for the Table
export const reportColumns = [
  { field: 'id', headerName: 'Report #', width: 180 },
  { field: 'date', headerName: 'Date', width: 185 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'address', headerName: 'Address', width: 200 },
  { field: 'title', headerName: 'Title', width: 180 },
  { field: 'description', headerName: 'Description', width: 300 },
  {
    field: 'status',
    headerName: 'Status',
    width: 180,
    editable: true,
    renderCell: (params) => (
      <Select
        value={params.row.status}
        onChange={(e) => params.api.setEditCellValue({ id: params.id, field: 'status', value: e.target.value })}
        sx={{ width: '100%' }}
      >
        <MenuItem value="Under Review">Under Review</MenuItem>
        <MenuItem value="Resolved">Resolved</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
      </Select>
    ),
  },
];

// View and Delete Button
const actionColumn = {
  field: 'action',
  headerName: 'Action',
  width: 200,
  renderCell: () => {
    return (
      <div className="cellAction">
        <div className="viewButton">View</div>
        <div className="deleteButton">Delete</div>
      </div>
    );
  },
};

const ReportTable = () => {
  const [rows, setRows] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      const querySnapshot = await getDocs(collection(db, 'reports'));
      const reports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRows(reports);
    };
    fetchReports();
  }, []);

  // Handle status update
  const handleProcessRowUpdate = (newRow) => {
    const { id, status } = newRow;
    setSelectedReportId(id);
    setSelectedStatus(status);
    setConfirmOpen(true);
    return { ...newRow, status: rows.find((row) => row.id === id)?.status }; // Revert UI change until confirmed
  };

  const applyStatusChange = async () => {
    if (!selectedReportId || !selectedStatus) return;

    try {
      const reportRef = doc(db, 'reports', selectedReportId);
      await updateDoc(reportRef, { status: selectedStatus });
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === selectedReportId ? { ...row, status: selectedStatus } : row
        )
      );
      setConfirmOpen(false);
      setSelectedReportId(null);
      setSelectedStatus(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const cancelConfirm = () => {
    setSelectedReportId(null);
    setSelectedStatus(null);
    setConfirmOpen(false);
  };

  return (
    <>
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={reportColumns.concat(actionColumn)}
          processRowUpdate={handleProcessRowUpdate}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
          pageSizeOptions={[5, 10]}
        />
      </Paper>

      {/* Confirm Status Change Dialog */}
      <Dialog open={confirmOpen} onClose={cancelConfirm}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          Are you sure you want to change this report’s status to <strong>{selectedStatus}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelConfirm}>Cancel</Button>
          <Button onClick={applyStatusChange} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportTable;
