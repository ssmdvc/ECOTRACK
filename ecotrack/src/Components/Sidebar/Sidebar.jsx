import "./Sidebar.scss"
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import {Link} from "react-router-dom"




const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="top">
                <Link to="/dashboard" className="custom-link" style={{textDecoration:"none", color:"black"}}>
                <span className="logo">EcoTrack</span>
                </Link>
            </div>
            <div className="center">
                <ul>
                    <p className="title-1"></p>
                    <Link to="/dashboard" className="custom-link" style={{textDecoration:"none"}}>
                    <li>
                        <SpaceDashboardIcon className="icon" />
                        <span>Dashboard</span>
                    </li>
                    </Link>
                    <p className="title"></p>
                    <Link to="/user" className="custom-link" style={{textDecoration:"none"}}>
                    <li>
                        <PeopleOutlineIcon className="icon" />
                        <span>User</span>
                    </li>
                    </Link>
                    <p className="title"></p>
                    <Link to="/route" className="custom-link">
                    <li>
                        <LocationOnIcon className="icon" />
                        <span>Route</span>
                    </li>
                    </Link>
                    <p className="title"></p>
                    <li>
                        <DateRangeIcon className="icon" />
                        <span>Scheduling</span>
                    </li>
                    <p className="title"></p>
                    <li>
                        <AnalyticsIcon className="icon" />
                        <span>Report and Analytics</span>
                    </li>
                    <p className="title"></p>
                    <li>
                        <NotificationsIcon className="icon" />
                        <span>Notification and Alert</span>
                    </li>
                    <p className="title"></p>
                    <li>
                        <AdminPanelSettingsIcon className="icon" />
                        <span>Setting</span>
                    </li>
                    <p className="title"></p>
                    <li>
                        <LogoutIcon className="icon" />
                        <span>Logout</span>
                    </li>
                </ul>
            </div> 
        </div>
    )
}

export default Sidebar