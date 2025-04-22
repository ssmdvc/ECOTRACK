import React, { useState, useEffect, useMemo } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./Dashboard.scss";
import Sidebar from '../../Components/Sidebar/Sidebar';
import ReportIcon from '@mui/icons-material/Report';
import RecyclingIcon from '@mui/icons-material/Recycling';
import Map from "../../Components/Map/Map";
import { Link } from "react-router-dom";
import { getWasteDataByPeriod, getChartTitle } from "../../Components/Utils/chartHelpers";
import WasteChart from "../AnalyticsCharts/WasteChart";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [periodWaste, setPeriodWaste] = useState("weekly");
  const [rawWasteData, setRawWasteData] = useState([]);

useEffect(() => {
  const fetchWasteData = async () => {
    const snapshot = await getDocs(collection(db, "wasteCollectionData"));
    const raw = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        date: d.collection_date.toDate(),
        weight: d.collection_weight,
        zone: d.zone,
        street: d.street
      };
    });
    setRawWasteData(raw);
  };

  fetchWasteData();
}, []);

const wasteChartData = useMemo(() => getWasteDataByPeriod(rawWasteData, periodWaste), [rawWasteData, periodWaste]);
const wasteChartTitle = useMemo(() => getChartTitle(periodWaste), [periodWaste]);

useEffect(() => {
  const fetchPendingRequests = async () => {
    try {
      const q = query(collection(db, "requests"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      setPendingRequestsCount(snapshot.size);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  fetchPendingRequests();
}, []);

useEffect(() => {
  const fetchPendingReports = async () => {
    try {
      const q = query(collection(db, "reports"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      setPendingReportsCount(snapshot.size);
    } catch (err) {
      console.error("Error fetching pending reports:", err);
    }
  };

  fetchPendingReports();
}, []);




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
                <div className="reqNum">{pendingRequestsCount}</div>
                <div className="Dis-line"></div>
                <div className="disposalText">Disposal Request</div>
              </div>
            </div>

            <div className="feed-div">
              <div className="disposal-icon">
                <Link to="/report" className="custom-link">
                  <ReportIcon className="dis-icon" />
                </Link>
                <div className="reqNum">{pendingReportsCount}</div>
                <div className="Dis-line"></div>
                <div className="feedText">User Reports</div>
              </div>
            </div>
          </div>
        </div>
 
        <div className='section2'>
          <div className="right1-div"> 
            <div className="right1-divContent">
            <WasteChart
              title={wasteChartTitle}
              data={wasteChartData}
              period={periodWaste}
              setPeriod={setPeriodWaste}
              className="waste-chart"
            />


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
