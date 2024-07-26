import React from 'react';
import "./Dashboard.scss"
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import Widgets from '../../Components/Widgets/Widgets';
import Featured from '../../Components/Featured/Featured';
import Chart from '../../Components/Chart/Chart';
import Table from '../../Components/Table/Table';


const Dashboard = () => {
  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboardContainer'>
        <Navbar />
        <div className='widgets'>
          <Widgets type="user"/>
          <Widgets type="places" />
          <Widgets type="garbage-collected" />
          <Widgets type="admin" />
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
        <div className="listContainer">
          <div className="listTitle">Latest</div>
          <Table />
        </div>
      </div>
    </div>
  )
}

export default Dashboard;