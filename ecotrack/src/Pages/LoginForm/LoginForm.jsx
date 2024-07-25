import React, { useState } from 'react';
import './LoginForm.css';
import { Link } from 'react-router-dom';
import {auth} from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from "react-toastify"



function LoginForm() {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')

     const handleSubmit = async (e) => {
        e.preventDefault()
        try {
             await signInWithEmailAndPassword(auth, email, password)
            console.log("Login Succesfully");
            window.location.href="/dashboard";
            toast.success("User Login Successfully!", {
                position: "top-center",
            });
            
        } catch (error) {
            console.log(error);
            toast.error(error.message, {
                position: "top-center",
            });
        }
     }


  return (
    <div className='login-page'>
      <div className='signup-container'>
      <form className='signupform' onSubmit={handleSubmit}>
        <h1>Welcome to EcoTrack</h1>
        <p>Please login with your Username and Password</p>
        <div className='input-box'>
        <label htmlFor="email">
            <input type='text' onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
        </label>
        </div>
        <div className='input-box'>
        <label htmlFor="password">
            <input type='password' onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
        </label>
        </div>
        <button type="submit">Login</button> <br />
        <div className='register-link'>
        <p1>Don't have account? <Link to="/signup" className='here-link'>Register Here</Link></p1>
        </div>
      </form>
    </div>
    </div>
  );
}

export default LoginForm;