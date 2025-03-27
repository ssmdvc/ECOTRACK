import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import "./Dashboard.scss";
import Sidebar from '../../Components/Sidebar/Sidebar';
import ReportIcon from '@mui/icons-material/Report';
import RecyclingIcon from '@mui/icons-material/Recycling';
import Map from "../../Components/Map/Map";
import { Link } from "react-router-dom";
import {
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
} from "recharts";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weeklyGarbageData = [
    { day: "Monday", garbage: 1200 },
    { day: "Tuesday", garbage: 1500 },
    { day: "Wednesday", garbage: 800 },
    { day: "Thursday", garbage: 2000 },
    { day: "Friday", garbage: 2200 },
    { day: "Saturday", garbage: 2500 },
    { day: "Sunday", garbage: 3000 },
  ];

  const totalGarbageCollected = weeklyGarbageData.reduce((total, day) => total + day.garbage, 0);

  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboardContainer'>
       

        <div className='section1'>
          <div className="left-div"> 
            <Map/>
          </div>

          <div className="right-div">
            <div className="dis-div">
              <div className="disposal-icon">
                <Link to="/request" className="custom-link">
                  <RecyclingIcon className="dis-icon" />
                </Link>
                <div className="reqNum">2</div>
                <div className="Dis-line"></div>
                <div className="disposalText">Disposal Request</div>
              </div>
            </div>

            <div className="feed-div">
              <div className="disposal-icon">
                <Link to="/report" className="custom-link">
                  <ReportIcon className="dis-icon" />
                </Link>
                <div className="reqNum">2</div>
                <div className="Dis-line"></div>
                <div className="feedText">User Reports</div>
              </div>
            </div>
          </div>
        </div>
 
        <div className='section2'>
          <div className="right1-div"> 
            <div className="right1-divContent">
              <h2>Garbage Collected this Week</h2>
              <BarChart width={800} height={200} data={weeklyGarbageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `${value} kg`} />
                <Tooltip />
                <Bar dataKey="garbage" fill="#8884d8" />
              </BarChart>
              <div className="totalGarbage">
                <p>Total Garbage Collected This Week: {totalGarbageCollected} kg</p>
              </div>
            </div>
          </div>

          {/* Updated Calendar Section */}
          <div className="left1-div">
            <div className="calendar-card">
              <Calendar 
                onChange={setSelectedDate} 
                value={selectedDate} 
                showNeighboringMonth={false} // Hides numbers from other months
                className="custom-calendar" // Add custom styling
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
