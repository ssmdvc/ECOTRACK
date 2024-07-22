import './Datatable.scss'
import { DataGrid } from '@mui/x-data-grid';
import { userColumns, userRows} from "../../datatablesource"


const Datatable = () => {
    const actionColumn = [{ field: "action", headerName: "Action", width: 200, renderCell:()=>{
      return(
        <div className='cellAction'>
          <div className="viewButton">View</div>
          <div className="deleteButton">Delete</div>
        </div>
      )
    }}];

  return (
    <div className='datatable' div style={{ height: 600, width: '100%' }}>
       <DataGrid
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