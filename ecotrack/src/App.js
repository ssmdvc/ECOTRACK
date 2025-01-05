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
import { AuthContext } from './Context/AuthContext';
import SchedulePage from './Pages/SchedulePage/SchedulePage';
import Tracking from './Pages/TruckTracking/Tracking';
import Request from './Pages/DisposalPage/Request';
import Report from './Pages/Report/Report';
import UserFeedback from './Pages/UserFeedback/UserFeedback';
import Notification from './Pages/Notification/Notification';

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
      <Route path="user">
        <Route index element={<List />         
          }/>
        <Route path=":userId" element={          
            <SinglePage />        
        }/>
        <Route path="new" element={          
            <NewPage inputs = {userInputs} title="Add New User" />}/>
      </Route>
      <Route path="trackingpage">
        <Route index element={<Tracking />}/>
      </Route>
      <Route path="request">
        <Route index element={<Request />}/>
      </Route>
      <Route path="schedule">
        <Route index element={<SchedulePage />}/>
      </Route>
      <Route path="report">
        <Route index element={<Report />}/>
      </Route>
      <Route path="feedback">
        <Route index element={<UserFeedback />}/>
      </Route>
      <Route path="notification">
        <Route index element={<Notification />}/>
      </Route>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
    </div>

  );
}

export default App;
