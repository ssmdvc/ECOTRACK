import React from 'react';
import "./Dashboard.scss"
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import Map from '../../Components/Map/Map';
import Widgets from '../../Components/Widgets/Widgets';
import Featured from '../../Components/Featured/Featured';
import Chart from '../../Components/Chart/Chart';



const Dashboard = () => {
  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboardContainer'>
        <Navbar />

        <div className='first-layer'>
          <Map />
          <Widgets/>
        </div>

        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>

        </div>
      </div>
  )
}

export default Dashboard;