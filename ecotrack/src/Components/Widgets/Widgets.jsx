import './Widgets.scss'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';



const Widgets =  ({ type }) => {
    let data;

    //temporary
    const amount = 100
    const diff = 20

    switch(type){
        case "user":
            data={
                title:"USERS",
                isMoney: false,
                link: "See all users",
                icon: <PeopleOutlineIcon className='wid-icon'/>,
            }; 
            break;
        case "places":
            data={
                title:"PLACES VISITED",
                isMoney: false,
                link: "View all places",
                icon: <RoomOutlinedIcon className='wid-icon' />,
            }; 
            break;
        case "garbage-collected":
            data={
                title:"GARBAGE COLLECTED",
                isMoney: false,
                link: "View Garbage %",
                icon: <DeleteOutlinedIcon className='wid-icon' />,
            }; 
            break;
        case "admin":
            data={
                title:"ADMIN",
                isMoney: false,
                link: "See all admin",
                icon: <SupervisorAccountOutlinedIcon className='wid-icon' />,
            }; 
            break;
        default:
            break;
    }


    return (
        <div className='widget'>
            <div className="left">
                <span className="title">{data.title}</span>
                <span className="counter">{data.isMoney && "$"}{amount}
                </span>
                <span className="link">{data.link}</span>
            </div>
        </div>
    )
}

export default Widgets