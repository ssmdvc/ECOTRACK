import React, { useState } from 'react';
import './SignUpForm.css';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from "../firebase";
import { setDoc, doc } from 'firebase/firestore';
import { toast } from "react-toastify"


function SignUpForm() {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [fname, setFname] = useState('')
     const [lname, setLname] = useState('')

     const handleSubmit = async (e) => {
        e.preventDefault()
        try {
             await createUserWithEmailAndPassword(auth, email, password);
             const user = auth.currentUser;
             console.log(user);
             if(user) {
                await setDoc(doc(db, "Users", user.uid), {
                    email:user.email,
                    firstName:fname,
                    lastName:lname,
                });
            }
            console.log("User Registered Successfully!");
            toast.success("User Registered Successfully!", {
                position: "top-center",
            });
        } catch (error) {
            console.log(error.message);
            toast.error(error.message, {
                position: "top-center",
            });
        }
    };


  return (
    <div className='signup-container'>
      <form className='signupform' onSubmit={handleSubmit}>
        <h1>Welcome to EcoTrack</h1>
        <p>Please Sign Up</p>
        <div className='input-box'>
        <label htmlFor='firstname'>
            <input type='text' onChange={(e) => setFname(e.target.value)} placeholder='First Name' required />
        </label>
        </div>

        <div className='input-box'>
        <label htmlFor='lastname'>
            <input type='text' onChange={(e) => setLname(e.target.value)} placeholder='Last Name' required />
        </label>
        </div>

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

        <button type="submit">Sign up</button> <br />
        <div className='register-link'>
        <p1>Already registered? <Link to="/login">Login Here</Link></p1>
        </div>
      </form>
    </div>
  );
}

export default SignUpForm;