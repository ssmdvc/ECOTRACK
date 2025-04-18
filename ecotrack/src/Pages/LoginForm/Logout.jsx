import React, { useContext } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LogoutIcon from '@mui/icons-material/Logout';

const Logout = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      navigate("/login");
      toast.success("Logged out successfully!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Logout failed!", {
        position: "top-center",
      });
    }
  };

  return (
    <li onClick={handleLogout} className="custom-link" style={{ cursor: "pointer" }}>
      <LogoutIcon className="icon" />
      <span>Sign out</span>
    </li>
  );
};

export default Logout;
