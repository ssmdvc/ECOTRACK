import { Box, Tab, Tabs } from '@mui/material';
import Navbar from '../../Components/Navbar/Navbar'
import Sidebar from '../../Components/Sidebar/Sidebar'
import './Report.scss'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

//Fields for the Table
export const reportColumns = [
  { 
    field: 'id', 
    headerName: 'Report #', 
    width: 180 
},
{ 
    field: 'date', 
    headerName: 'Date', 
    width: 185 
},
{
    field:"user", 
    headerName:"User", 
    width:200,
},

{
    field:"location", 
    headerName:"Location", 
    width: 180,
},

{
    field:"report", 
    headerName:"Report", 
    width: 300,
},
]

// View and Delete Button
const actionColumn = {
  field: 'action',
  headerName: 'Action',
  width: 200,
  renderCell: () =>{
    return (
      <div className='cellAction'>
        <div className='viewButton'>View</div>
        <div className='deleteButton'>Delete</div>
      </div>
    )
  }
}

// Temporary Data
const rows = [
{ id: 1, date: '03/12/23', user: 'Harry Potter', location: 'Hogwarts', report: 'You-Know-How killed my fam',},
];


const paginationModel = { page: 0, pageSize: 5 };


const Report = () => {

  return (
    <div className='report'>
        <Sidebar />
        <div className='reportContainer'>
            <Navbar />
        <div className='reportTitle'>
            Report Management
        </div>
        <Paper sx={{ height: 900, width: '100%' }}>
       <DataGrid
        rows={rows}
        columns={reportColumns.concat(actionColumn)}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
      />
       </Paper>
        </div>
    </div>
  )
}
export default Report