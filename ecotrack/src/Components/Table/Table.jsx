import './Table.scss'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const List = () => {
    const rows = [
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City", 
            status: "Approved",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City",
            status: "Approved",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City", 
            status: "Approved",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City", 
            status: "Pending",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City", 
            status: "Pending",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City", 
            status: "Approved",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City",
            status: "Approved",  
        },
        {
            id:5512542,
            user: "John Smith",
            email: "ottomark@gmail.com",
            date: "1 March",
            location: "Blk 36 L123 Sedeno St Mkt City", 
            status: "Pending",  
        },
    ];
    return (
    <TableContainer component={Paper} className='table'>
    <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell className="tableCell">Tracking ID </TableCell>
          <TableCell className="tableCell">User</TableCell>
          <TableCell className="tableCell">Email Address</TableCell>
          <TableCell className="tableCell">Date</TableCell>
          <TableCell className="tableCell">Location</TableCell>
          <TableCell className="tableCell">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}>
            <TableCell>
              {row.id}
            </TableCell>
            <TableCell className="tableCell">{row.user}</TableCell>
            <TableCell className="tableCell">{row.email}</TableCell>
            <TableCell className="tableCell">{row.date}</TableCell>
            <TableCell className="tableCell">{row.location}</TableCell>
            <TableCell className="tableCell">
              <span className={'status ' + row.status}>{row.status}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
    )

};

export default List;