import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SignUpForm from "./Components/SignUpForm/SignUpForm";
import LoginForm from "./Components/LoginForm/LoginForm";
import Dashboard from "./Components/Dashboard";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<SignUpForm />}></Route>
      <Route path="/login" element={<LoginForm />}></Route>
      <Route path="/dashboard" element={<Dashboard />}></Route>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
   

  );
}

export default App;
