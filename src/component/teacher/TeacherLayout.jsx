import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const TeacherLayout = () => {
  const [openApprovals,setOpenApprovals] = useState(false);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="text-white p-3"
        style={{
          width: "250px",
          backgroundColor: "rgba(17, 41, 77, 1)", // dark sidebar
        }}
      >
        <br></br> <br></br>
        <h4 className="mb-4">Teacher Dashboard</h4> <br></br>
        <ul className="nav flex-column">
          <li className="nav-item mb-4">
            <Link to="/teacher/dashboard" className="nav-link text-white">Dashboard</Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/teacher/marks" className="nav-link text-white">Marks</Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/teacher/student-performance" className="nav-link text-white">Student Performance</Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/teacher/class" className="nav-link text-white">Class </Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/teacher/teacher-notices" className="nav-link text-white"> Notices & Announcements</Link>
          </li>

          {/* Leaves Menu */}
          <li className="nav-item mb-3">
            <button
              className="btn btn-toggle align-items-center rounded text-white w-200 text-start"
              style={{ background: "transparent", border: "none" }}
              onClick={() => setOpenApprovals(!openApprovals)}
            >
              Leave Requests ▾
            </button>
            {openApprovals && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-2">
                  <Link to="/teacher/leave" className="nav-link text-white">
                    Add Leave Request
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link to="/teacher/leave-status" className="nav-link text-white">
                    Leave Request Status
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherLayout;
