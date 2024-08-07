import Navbar from '../../Components/Navbar/Navbar';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './RoutesPage.scss';

const RoutesPage = () => {
  return (
    <div className="routespage">
      <Sidebar />
    <div className='routesContainer'>
      <Navbar />
    <div className='map'>
      
      </div>
    </div>
  </div>
  )
}
export default RoutesPage