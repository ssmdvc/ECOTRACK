import "./Sidebar.scss"
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ReportIcon from '@mui/icons-material/Report';
import RecyclingIcon from '@mui/icons-material/Recycling';
import FeedbackIcon from '@mui/icons-material/Feedback';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from "react-router-dom";




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

                    {/* Dashboard */}
                    <p className="title-1"></p>
                    <Link to="/dashboard" className="custom-link" style={{textDecoration:"none"}}>
                    <li>
                        <SpaceDashboardIcon className="icon" />
                        <span>Dashboard</span>
                    </li>
                    </Link>

                    {/* user */}
                    <p className="title"></p>
                    <Link to="/user" className="custom-link" style={{textDecoration:"none"}}>
                    <li>
                        <PeopleOutlineIcon className="icon" />
                        <span>User</span>
                    </li>
                    </Link>
                    

                    {/* Analytics */}
                    <p className="title"></p>
                    <Link to="/analyticsFr" className="custom-link">
                        <li>
                            <AnalyticsIcon className="icon" />
                            <span>Analytics</span>
                        </li>
                    </Link>

                    {/* truck tracking*/}
                    <p className="title"></p>
                    <Link to="/trackingpage" className="custom-link">
                    <li>
                        <LocationOnIcon className="icon" />
                        <span>Truck Tracking</span>
                    </li>
                    </Link>

                    <p className="title"></p>
                    <Link to="/request" className="custom-link">
                    <li>
                        <RecyclingIcon className="icon" />
                        <span>Disposal Request</span>
                    </li>
                    </Link>
                    <p className="title"></p>
                    <Link to="/schedule" className="custom-link">
                    <li>
                        <DateRangeIcon className="icon" />
                        <span>Schedule</span>
                    </li>
                    </Link>
                    <p className="title"></p>
                    <Link to="/report" className="custom-link">
                    <li>
                        <ReportIcon className="icon" />
                        <span>Report</span>
                    </li>
                    </Link>
                    <p className="title"></p>
                    <Link to= '/feedback' className="custom-link">
                    <li>
                        <FeedbackIcon className="icon" />
                        <span>User Feedback</span>
                    </li>
                    </Link>

                    <p className="title"></p>
                    <Link to= '/notification' className="custom-link">
                    <li>
                        <NotificationsIcon className="icon" />
                        <span>Notification</span>
                    </li>
                    </Link>

                    <p className="title"></p>
                    <Link to="/waste-data" className="custom-link">
                    <li>
                        <DeleteIcon className="icon" />
                        <span>Waste Data</span>
                    </li>
                    </Link>
                </ul>
            </div> 
                {/* Logout Section */}
                <div className="bottom">
                    <hr />
                    
                    <div className="profile-mode">
                        <div className="profile">
                            <AccountCircleIcon className="icon" />
                            <span>Settings</span>
                        </div>

                    </div>

                    <button className="logout-btn">
                        <span>Sign out</span>
                        <LogoutIcon className="logout-icon" />
                    </button>
                </div>

                        </div>
                    );
                };

export default Sidebar;