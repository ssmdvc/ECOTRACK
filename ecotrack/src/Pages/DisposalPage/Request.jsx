import React from "react";
import "./Request.scss";
import Sidebar from "../../Components/Sidebar/Sidebar";
import RequestTable from "../DisposalPage/RequestTable";

const Request = () => {
  return (
    <div className="disposalContainer">
      <Sidebar />
      <div className="disposalsubContainer">
        <div className="requestTable">
      <RequestTable/>
      </div>
    </div>
    </div>
  )
}

export default Request;
