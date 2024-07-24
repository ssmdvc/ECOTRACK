import React from 'react';
import "./NewPage.scss"
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';

const NewPage = ({inputs, title}) => {
  return (
    <div className='new'>
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1></div>
        <div className="bottom">
          <div className="left">
          <form>
            {inputs.map((input) => (
              <div className="formInput" key={input.id}>
              <label>{input.label}</label>
              <input type={input.type} placeholder={input.placeholder} />
            </div>
            ))}
              <button>Add User</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPage;