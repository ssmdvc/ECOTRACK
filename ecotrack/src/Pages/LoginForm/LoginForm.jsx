import React, { useContext, useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from "react-toastify";
import { AuthContext } from '../../Context/AuthContext';
import { getUserRole } from "../../firebase";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check the user's role using email
      const role = await getUserRole(user.email);
      if (role?.toLowerCase() !== "admin") {
        toast.error("Access denied. Only admins can log in.", {
          position: "top-center",
        });
        await auth.signOut();
        return;
      }

      dispatch({ type: "LOGIN", payload: user });
      toast.success("User Login Successfully!", {
        position: "top-center",
      });
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/invalid-email") {
        toast.error("Invalid credentials. Please check your email and password.", {
          position: "top-center",
        });
      } else if (error.code === "auth/user-not-found") {
        toast.error("User not found. Please register first.", {
          position: "top-center",
        });
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.", {
          position: "top-center",
        });
      } else {
        toast.error("Login failed. Please try again later.", {
          position: "top-center",
        });
      }
    }
  };

  return (
    <div className='login-page'>
      <div className='signup-container'>
        <form className='signupform' onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;