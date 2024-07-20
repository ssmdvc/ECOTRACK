import "./Sidebar.scss"
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';



const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="top">
                <span className="logo">EcoTrack</span>
            </div>
            <div className="center">
                <ul>
                    <p className="title"></p>
                    <li>
                        <SpaceDashboardIcon className="icon" />
                        <span>Dashboard</span>
                    </li>
                    <p className="title"></p>
                    <li>
                        <PeopleOutlineIcon className="icon" />
                        <span>User</span>
                    </li>
                    <p className="title"></p>
                    <li>
                        <LocationOnIcon className="icon" />
                        <span>Route</span>
                    </li>
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
            <div className="bottom">
                <div className="colorOption"></div>
                <div className="colorOption"></div>
            </div>
        </div>
    )
}

export default Sidebar