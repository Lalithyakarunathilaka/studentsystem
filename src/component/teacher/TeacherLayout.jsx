import React from "react";
import { Link, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const TeacherLayout = () => {
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
            <Link to="/admin/user-add" className="nav-link text-white">Classes</Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/admin/add-class" className="nav-link text-white">Students</Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/teacher/teacher-notices" className="nav-link text-white"> Notices & Announcements</Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/leave-request" className="nav-link text-white">Leave Requests</Link>
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
