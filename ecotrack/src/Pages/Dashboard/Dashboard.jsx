import React from 'react';
import "./Dashboard.scss";
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Map from "../../Components/Map/Map";
import {Link} from "react-router-dom"
import {
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Bar,
} from "recharts";

//import { Bar } from "react-chartjs-2";



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
                 <Link to="/disposal" className="custom-link">
                    <AccountBoxIcon  className="dis-icon" 
                  />
                    </Link>
                  <div className="reqNum">
                    5
                  </div>
                  <div className="Dis-line">
                  </div>
                  <div className="disposalText">
                    Disposal Request
                  </div>
                  </div>


                 


            </div>



            <div className="feed-div">
                <div className="disposal-icon">
                <Link to="/disposal" className="custom-link">
                    <AccountBoxIcon  className="dis-icon" 
                  />
                    </Link>
                      <div className="reqNum">
                        5
                      </div>
                      <div className="Dis-line">
                      </div>
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
  )
}

export default Dashboard;