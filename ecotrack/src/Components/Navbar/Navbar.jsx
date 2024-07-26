import "./Navbar.scss"
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { DarkModeContext } from "../../Context/darkModeContext";
import { useContext } from "react";


const Navbar = () => {
const {dispatch} = useContext(DarkModeContext);
    return (
        <div className="navbar">
            <div className="nav-wrapper">
                <div className="search">
                    <input type="text" placeholder="Search..." />
                    <SearchIcon />
                </div>
                <div className="items">
                    <div className="item">
                     <LanguageIcon className="nav-icon" />
                     English
                    </div>
                    <div className="item">
                     <DarkModeIcon className="nav-icon" 
                     onClick={()=>dispatch({type:"TOGGLE"})} />
                    </div>
                    <div className="item">
                     <FullscreenExitIcon className="nav-icon" />
                    </div>
                    <div className="item">
                     <NotificationsNoneIcon className="nav-icon" />
                    </div>
                    <div className="item">
                     <ChatBubbleOutlineIcon className="nav-icon" />
                    </div>
                    <div className="item">
                     <ListOutlinedIcon className="nav-icon" />
                    </div>
                    <div className="item">
                     <img 
                     src="https://img.icons8.com/?size=100&id=23239&format=png&color=000000"
                     alt=""
                     className="avatar"
                     /> 
                    <div className="item-admin"></div>
                    <h5>Administration</h5>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar