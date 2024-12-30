import Navbar from '../../Components/Navbar/Navbar'
import Sidebar from '../../Components/Sidebar/Sidebar'
import './UserFeedback.scss'

const UserFeedback = () => {
  return (
    <div className='feedback'>
        <Sidebar />
        <div className='feedbackContainer'>
            <Navbar />
        <div className='feedbackTitle'>
            User Feedback Management
        </div>
        </div>
    </div>
  )
}
export default UserFeedback