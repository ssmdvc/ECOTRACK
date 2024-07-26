import React, { useContext, useState } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
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

function App() {

  const {darkMode} = useContext(DarkModeContext)
  return (
    <div className={ darkMode ? "app dark" : "app"}>
    <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<LoginForm />}/>
      <Route exact path="/signup" element={<SignUpForm />}/>
      <Route path="/login" element={<LoginForm />}/>
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="user">
        <Route index element={<List />}/>
        <Route path=":userId" element={<SinglePage />}/>
        <Route path="new" element={<NewPage inputs = {userInputs} title="Add New User" />}/>
      </Route>
      <Route path="routes">
        <Route index element={<List/>}/>
        <Route path="route" element={<SinglePage/>}/>
        <Route path="new" element={<NewPage/>}/>
      </Route>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
    </div>

  );
}

export default App;
