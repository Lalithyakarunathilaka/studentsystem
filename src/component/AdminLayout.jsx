import React from "react";
import { Link, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminLayout = () => {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
  className="text-white p-3"
  style={{
    width: "250px",
    backgroundColor: "rgba(17, 41, 77, 1)", // navy blue background
  }}
>
        <h4 className="mb-4">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/admin-dashboard" className="nav-link text-white">Dashboard</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/user-add" className="nav-link text-white">Add User</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/add-class" className="nav-link text-white">Add Class</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/addnotice" className="nav-link text-white">Add Notices</Link>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        {/* Header */}
        <nav className="navbar navbar-light bg-light px-3">
          <span className="navbar-brand"></span>
          <button className="btn btn-outline-danger btn-sm">Logout</button>
        </nav>

        {/* Page content */}
        <div className="p-4">
          <Outlet /> {/* This renders child admin pages */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
