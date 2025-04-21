import './Dropdown.scss'
import {Link} from "react-router-dom"

const Dropdown = () => {
  return (
    <div className='dropdown'>
        <ul className='dropdown_wrapper'>
            {/* this for now. will add later */}
            <Link to="/dashboard" className="custom-link">
            <li className='first_child'>Dashboard</li>
            </Link>
            <Link to="/setting" className="custom-link">
            <li className='mid_child'>Setting</li>
            </Link>
            <Link to="/login" className="custom-link">
            <li className='last_child'>Logout</li>
            </Link> 
        </ul>
    </div>
  )
}
export default Dropdown