import React from 'react';
import "./Dashboard.scss";
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Map from "../../Components/Map/Map";
import { Link } from "react-router-dom";
import {
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const data = [
    { name: "2020", value: 3000 },
    { name: "2021", value: 15000 },
    { name: "2022", value: 100000 },
    { name: "2023", value: 500000 },
  ];

  const truckData = [
    { id: "CY0987", driver: "Ronaldo Cruz", phone: "09274580033", status: "Active" },
    { id: "TH1233", driver: "Juan Santolan", phone: "09274580033", status: "Inactive" },
    { id: "BL5678", driver: "Danilo Dellave", phone: "09274580033", status: "Active" },
  ];

  // Sample donut chart data
  const donutData = [
    { name: "Collected", value: 75 },
    { name: "Remaining", value: 25 },
  ];

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboardContainer'>
        <Navbar />

        <div className='section1'>
          <div className="left-div"> 
            <Map/>
          </div>

          <div className="right-div">
            <div className="dis-div">
              <div className="disposal-icon">
                <Link to="/request" className="custom-link">
                  <AccountBoxIcon className="dis-icon" />
                </Link>
                <div className="reqNum">
                  2
                </div>
                <div className="Dis-line"></div>
                <div className="disposalText">
                  Disposal Request
                </div>
              </div>
            </div>

            <div className="feed-div">
              <div className="disposal-icon">
                <Link to="/feedback" className="custom-link">
                  <AccountBoxIcon className="dis-icon" />
                </Link>
                <div className="reqNum">
                  2
                </div>
                <div className="Dis-line"></div>
                <div className="feedText">
                  User Feedback
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <div className='section2'>
          <div className="right1-div"> 
            <div className="right1-divContent">
              <h2> Amount of Garbage Collected </h2>
              <BarChart
                width={700}
                height={250}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 120,
                  bottom: 5,
                }}
                barSize={20}
              >
                <XAxis
                  dataKey="name"
                  scale="point"
                  padding={{ left: 30, right: 30 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="value" fill="#8884d8" background={{ fill: "#eee" }} />
              </BarChart>
            </div>
          </div>

             
          

          <div className="left1-div">
            <div className="Track-div">
              <div className="card">
                <h3>Weekly Garbage Tracking</h3>

                {/* Donut chart */}
             <PieChart width={300} height={150}>
                  <Pie
                    data={[
                      { name: "Collected", value: 98}, // dynamic data when connected to the backend
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={50}
                    fill="#0088FE"
                    label
                  >
                    <Cell fill="#0088FE" />
                  </Pie>
                  <Tooltip />
                </PieChart>
                
                <p className="totalCollected">Total Collected Today</p>

               

                <div className="trackingStats">
                  <div>
                    <p className="Stats">Last Week</p>
                    <span className="percentage">+12%</span>
                  </div>
                  <div>
                    <p className="Stats">Last Month</p>
                    <span className="percentage">+32%</span>
                  </div>
                  <div>
                    <p className="Stats">Last Year</p>
                    <span className="percentage">-50%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
