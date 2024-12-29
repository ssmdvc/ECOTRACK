import React from 'react';
import "./List.scss"
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar'; 
import Datatable from '../../Components/Datatable/Datatable';

///User Management 

const List = () => {
  return (
    <div className='list'>
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className='datatable'>
        <Datatable />
        </div>
      </div>
    </div>
  )
}

export default List;