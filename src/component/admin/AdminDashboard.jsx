// AdminDashboardLayout.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import "./AdminDashboardLayout.css";

const AdminDashboardLayout = ({ children, title }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className={`admin-dashboard ${open ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">EduMentor</h2>
        <nav>
          <ul>
            <li><NavLink to="/">Dashboard</NavLink></li>
            <li><NavLink to="/admin/add-class">Classes</NavLink></li>
            <li><NavLink to="/admin/user-add">Add Users</NavLink></li>
            <li><NavLink to="/admin/add-students">Students</NavLink></li>
            <li><NavLink to="/admin/teachers">Teachers</NavLink></li>
            <li><NavLink to="/notice-dashboard">Notices</NavLink></li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="header">
          <button className="icon-btn" onClick={() => setOpen((s) => !s)} aria-label="Toggle menu">
            <FiMenu />
          </button>
          <h1>{title}</h1>
          <div className="admin-actions">
            <span className="badge">Admin</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>

        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
