import './Disposal.scss'
import Navbar from '../../Components/Navbar/Navbar'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const Disposal = () => {

  
  return (
    <div className='disposal'>
        <Sidebar />
        <div className='disposalContainer'>
            <Navbar />
        <div className='disposalTitle'>
           Disposal Request Management
         </div>
        </div>
    </div>
  )
}
export default Disposal