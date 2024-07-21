import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


import SignUpForm from "./Pages/SignUpForm/SignUpForm";
import LoginForm from "./Pages/LoginForm/LoginForm";
import Dashboard from "./Pages/Dashboard/Dashboard";
import List from './Pages/List/List';
import SinglePage from './Pages/SinglePage/SinglePage';
import NewPage from './Pages/NewPage/NewPage';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<LoginForm />}/>
      <Route exact path="/signup" element={<SignUpForm />}/>
      <Route path="/login" element={<LoginForm />}/>
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="users">
        <Route index element={<List/>}/>
        <Route path=":userId" element={<SinglePage/>}/>
        <Route path="new" element={<NewPage/>}/>
      </Route>
      <Route path="products">
        <Route index element={<List/>}/>
        <Route path=":productId" element={<SinglePage/>}/>
        <Route path="new" element={<NewPage/>}/>
      </Route>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
   

  );
}

export default App;
