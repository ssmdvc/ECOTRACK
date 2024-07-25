import './Datatable.scss'
import { DataGrid } from '@mui/x-data-grid';
import { userColumns, userRows} from "../../datatablesource"
import { Link } from 'react-router-dom';



const Datatable = () => {
    const actionColumn = [{ field: "action", headerName: "Action", width: 150, renderCell:()=>{
      return(
        <div className='cellAction'>
          <Link to="/user/test" style={{textDecoration:"none"}}>
          <div className="viewButton">View</div>
          </Link>
          <Link to="/route" style={{textDecoration:"none"}}>
          <div className="deleteButton">Delete</div>
          </Link>
        </div>
        
      )
    }}];

  return (
    <div className='datatable' div style={{ height: 600, width: '100%' }}>
      <div className="datatableTitle">
        User Management
        <Link to="/user/new" style={{textDecoration:"none"}}className='link'>Add New</Link>
      </div>
       <DataGrid className='datagrid'
        rows={userRows}
        columns={userColumns.concat(actionColumn)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
};

export default Datatable;