import "./Tracking.scss"
import Navbar from "../../Components/Navbar/Navbar"
import Sidebar from "../../Components/Sidebar/Sidebar"

const Tracking = () => {
  return (
    <div className="tracking">
        <Sidebar />
        <div className="trackingContainer">
            <Navbar />
        <div className="trackingTitle">
            Truck Tracking Management
        </div>
        </div>
    </div>
  )
}
export default Tracking