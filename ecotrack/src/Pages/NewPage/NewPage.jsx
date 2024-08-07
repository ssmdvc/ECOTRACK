import React, { useState } from 'react';
import "./NewPage.scss"
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import { doc, setDoc } from "firebase/firestore"; 
import { db } from '../../firebase';

const NewPage = ({inputs, title}) => {
  const [file, setFile] = useState("")

  
  const handleAdd = async (e) => {
    e.preventDefault()
    await setDoc(doc(db, "cities", "LA"), {
      name: "Los Angeles",
      state: "CA",
      country: "USA"
    });
  }

  return (
    <div className='new'>
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1></div>
        <div className="bottom">
          <div className="left">
          <form onSubmit={handleAdd}> 
            {inputs.map((input) => (
              <div className="formInput" key={input.id}>
              <label>{input.label}</label>
              <input type={input.type} placeholder={input.placeholder} />
            </div>
            ))}
              <button type="submit">Add User</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPage;