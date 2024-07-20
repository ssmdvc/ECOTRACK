import React from 'react';
import "./Dashboard.scss"
import Sidebar from '../../Components/Sidebar/Sidebar';

const Dashboard = () => {
  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboardContainer'>container</div>
    </div>
  )
}

export default Dashboard;