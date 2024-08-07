import './Dropdown.scss'

const Dropdown = () => {
  return (
    <div className='dropdown'>
        <ul className='dropdown_wrapper'>
            {/* this for now. will add later */}
            <li className='first_child'>Dashboard</li>
            <li className='mid_child'>Setting</li>
            <li className='last_child'>Logout</li>
        </ul>
    </div>
  )
}
export default Dropdown