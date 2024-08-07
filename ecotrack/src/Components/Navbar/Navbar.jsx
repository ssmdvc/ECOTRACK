import "./Navbar.scss"
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { DarkModeContext } from "../../Context/darkModeContext";
import { useContext, useState } from "react";
import Dropdown from "../Dropdown/Dropdown";


const Navbar = () => {
const {dispatch} = useContext(DarkModeContext);

const [openProfile, setOpenProfile] = useState(false);
    return (
        <div className="navbar">
            <div className="nav-wrapper">
                <div className="search">
                    <input type="text" placeholder="Search..." />
                    <SearchIcon />
                </div>
                <div className="items">
                    <div className="item">
                     <DarkModeIcon className="nav-icon" 
                     onClick={()=>dispatch({type:"TOGGLE"})} />
                    </div>
                    <div className="item">
                     <img 
                     src="https://img.icons8.com/?size=100&id=23239&format=png&color=000000"
                     alt=""
                     className="avatar"
                     onClick={() => setOpenProfile ((prev) => !prev)}
                     /> 
                    </div>
                    {
                        openProfile && <Dropdown /> 
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar