import React, { useEffect, useState } from 'react';
import './Report.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { db, collection, getDocs, doc, updateDoc } from '../../firebase';
import { MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Tabs, Tab } from '@mui/material';

// Helper to safely format Firestore timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  return "-";
};

export const reportColumns = (handleStatusChange) => [
  { field: 'id', headerName: 'Report #', width: 180 },
  {
    field: 'date',
    headerName: 'Date',
    width: 185,
    valueGetter: (params) => {
      if (!params?.row?.date) return "-";
      return formatDate(params.row.date);
    }
  },
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
        onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
        sx={{ width: '100%' }}
      >
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Under Review">Under Review</MenuItem>
        <MenuItem value="Resolved">Resolved</MenuItem>
        <MenuItem value="Rejected">Rejected</MenuItem>
      </Select>
    ),
  },
];

const ReportTable = () => {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState(0); // 0 = Active, 1 = Archived
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewedReport, setViewedReport] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

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

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesSearch = ['date', 'email', 'address', 'title', 'description', 'status', 'id']
        .some(key => row[key]?.toString().toLowerCase().includes(lowerSearch));
      const matchesTab = tab === 0
        ? (row.status !== 'Resolved' && row.status !== 'Rejected')
        : (row.status === 'Resolved' || row.status === 'Rejected');
      return matchesSearch && matchesTab;
    });
    setFilteredRows(filtered);
  }, [searchText, rows, tab]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { status: newStatus });
      setRows((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: newStatus } : r
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleViewClick = (report) => {
    setViewedReport(report);
    setResponseMessage(report.responseMessage || '');
    setViewOpen(true);
  };

  const handleSendResponse = async () => {
    if (!viewedReport?.id) return;
    try {
      const reportRef = doc(db, 'reports', viewedReport.id);
      await updateDoc(reportRef, { responseMessage: responseMessage });
      alert('Response sent successfully!');
      setViewOpen(false);
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setViewedReport(null);
  };

  const actionColumn = {
    field: 'action',
    headerName: 'Action',
    width: 200,
    renderCell: (params) => (
      <div className="cellAction">
        <div className="viewButton" onClick={() => handleViewClick(params.row)}>View</div>
      </div>
    ),
  };

  return (
    <>
      {/* Header with Title, Tabs, and Search */}
      <Box display="flex" flexDirection="column" gap={2} p={2}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Reports</h1>

        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Active Reports" />
          <Tab label="Archived" />
        </Tabs>

        <TextField
          variant="outlined"
          placeholder="Search Date, Email, Title..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 300, alignSelf: 'center' }}
        />
      </Box>

      {/* Report Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={reportColumns(handleStatusChange).concat(actionColumn)}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
          pageSizeOptions={[5, 10]}
        />
      </Paper>

      {/* View and Respond Dialog */}
      <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {viewedReport && (
            <>
              <p><strong>Date:</strong> {formatDate(viewedReport.date)}</p>
              <p><strong>Email:</strong> {viewedReport.email}</p>
              <p><strong>Address:</strong> {viewedReport.address}</p>
              <p><strong>Title:</strong> {viewedReport.title}</p>
              <p><strong>Description:</strong> {viewedReport.description}</p>
              <p><strong>Status:</strong> {viewedReport.status}</p>

              <TextField
                label="Response Message"
                multiline
                fullWidth
                rows={4}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                sx={{ marginTop: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
          <Button onClick={handleSendResponse} variant="contained" color="primary">
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportTable;
