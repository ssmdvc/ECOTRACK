import './Datatable.scss'
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          list.push({ id: doc.id, ...docData }); // Include document ID
        });
        setData(list); // Set data to state
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDelete = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleEdit = async (id, field, value) => {
    try {
      const userDoc = doc(db, "users", id);
      await updateDoc(userDoc, { [field]: value }); // Update Firestore document
      setData(data.map(item => (item.id === id ? { ...item, [field]: value } : item))); // Update state
    } catch (err) {
      console.log(err);
    }
  };

  const columns = [
    { field: "firstName", headerName: "First Name", width: 150, editable: true },
    { field: "lastName", headerName: "Last Name", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 200, editable: true },
    { field: "phoneNumber", headerName: "Phone Number", width: 180, editable: true },
    { field: "address", headerName: "Address", width: 250, editable: true },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueGetter: (params) => {
        // Ensure that row is defined before accessing it
        if (!params.row) return "";
        const createdAt = params.row.createdAt;
        if (createdAt && createdAt.seconds) {
          return new Date(createdAt.seconds * 1000).toLocaleString();
        }
        return "";
      }
    },
    { field: "uid", headerName: "UID", width: 250 },
  ];

  const actionColumn = [{
    field: "action",
    headerName: "Action",
    width: 200,
    renderCell: (params) => {
      return (
        <div className='cellAction'>
          <Link to={`/user/${params.row.id}`} style={{ textDecoration: "none" }}>
            <div className="viewButton">View</div>
          </Link>
          <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>Delete</div>
        </div>
      );
    }
  }];

  return (
    <div className='datatable'>
      <div className="datatableTitle">
        User Management
        <Link to="/user/new" style={{ textDecoration: "none" }} className='link'>Add New</Link>
      </div>
      <DataGrid
        className='datagrid'
        rows={data}
        columns={columns.concat(actionColumn)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        processRowUpdate={(newRow) => {
          const updatedRow = { ...newRow };
          const originalRow = data.find(item => item.id === updatedRow.id);
          const field = Object.keys(updatedRow).find(
            key => updatedRow[key] !== originalRow?.[key]
          );
          if (field) {
            handleEdit(updatedRow.id, field, updatedRow[field]);
          }
          return updatedRow;
        }}
      />
    </div>
  );
};

export default Datatable;
