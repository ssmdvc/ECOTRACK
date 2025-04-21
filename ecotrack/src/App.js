import React, { useContext } from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import SignUpForm from "./Pages/SignUpForm/SignUpForm";
import LoginForm from "./Pages/LoginForm/LoginForm";
import Dashboard from "./Pages/Dashboard/Dashboard";
import List from './Pages/List/List';
import SinglePage from './Pages/SinglePage/SinglePage';
import NewPage from './Pages/NewPage/NewPage';
import { userInputs } from './formSource';
import "./style/dark.scss"
import { DarkModeContext } from './Context/darkModeContext';
import SchedulePage from './Pages/SchedulePage/SchedulePage';
import Tracking from './Pages/TruckTracking/Tracking';
import Request from './Pages/DisposalPage/Request';
import Report from './Pages/Report/Report';
import UserFeedback from './Pages/UserFeedback/UserFeedback';
import Notification from './Pages/Notification/Notification';
import AnalyticsFr from './Pages/AnalyticsCharts/AnalyticsFr';
import Setting from './Pages/Setting/Setting';          
import { AuthContext } from './Context/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useContext(AuthContext);

  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const {darkMode} = useContext(DarkModeContext); 

  return (
    <div className={ darkMode ? "app dark" : "app"}>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginForm />}/>
      <Route path="/signup" element={<SignUpForm />}/>
      <Route path="/login" element={<LoginForm />}/>
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="/analyticsFr" element={<AnalyticsFr />} />
      <Route path="/setting" element={<Setting />} />
      

      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }/>
      <Route path="/analyticsFr" element={
        <PrivateRoute>
          <AnalyticsFr />
        </PrivateRoute>
      }/>
      <Route path="user">
        <Route index element={
          <PrivateRoute>
            <List />
          </PrivateRoute>
        }/>
        <Route path=":userId" element={
          <PrivateRoute>
            <SinglePage />
          </PrivateRoute>
        }/>
        <Route path="new" element={
          <PrivateRoute>
            <NewPage inputs = {userInputs} title="Add New User" />
          </PrivateRoute>
        }/>
      </Route>
      <Route path="trackingpage">
        <Route index element={
          <PrivateRoute>
            <Tracking />
          </PrivateRoute>
        }/>
      </Route>
      <Route path="request">
        <Route index element={
          <PrivateRoute>
            <Request />
          </PrivateRoute>
        }/>
      </Route>
      <Route path="schedule">
        <Route index element={
          <PrivateRoute>
            <SchedulePage />
          </PrivateRoute>
        }/>
      </Route>
      <Route path="report">
        <Route index element={
          <PrivateRoute>
            <Report />
          </PrivateRoute>
        }/>
      </Route>
      <Route path="feedback">
        <Route index element={
          <PrivateRoute>
            <UserFeedback />
          </PrivateRoute>
        }/>
      </Route>
      <Route path="notification">
        <Route index element={
          <PrivateRoute>
            <Notification />
          </PrivateRoute>
        }/>
      </Route>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
    </div>

  );
}

export default App;
