import React from "react";
import "./Report.scss";
import Sidebar from "../../Components/Sidebar/Sidebar";
import ReportTable from "./ReportTable";

const Report = () => {
  return (
    <div className="reportContainer">
      <Sidebar />
      <div className="reportSubContainer">
        <div className="reportTable">
          <ReportTable />
        </div>
      </div>
    </div>
  );
};
export default Report;