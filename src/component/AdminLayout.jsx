import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminLayout = () => {
  const [openClassMenu, setOpenClassMenu] = useState(false);
  const [openNotices, setOpenNotices] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openSbjects, setOpenSubjects] = useState(false);
  

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
        <br />
        <br />
        <h4 className="mb-4">Admin Panel</h4>
        <br />

        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <Link to="/admin/dashboard" className="nav-link text-white">
              Dashboard
            </Link>
          </li>

          <li className="nav-item mb-3">
            <button
              className="btn btn-toggle align-items-center rounded text-white w-200 text-start"
              style={{ background: "transparent", border: "none" }}
              onClick={() => setOpenAddUser(!openAddUser)}
            >
              Add Users ▾
            </button>
            {openAddUser && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-2">
                  <Link to="/admin/add-students" className="nav-link text-white">
                    Add Students
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link to="/admin/add-teachers" className="nav-link text-white">
                    Add Teachers
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Class Menu */}
          <li className="nav-item mb-3">
            <button
              className="btn btn-toggle align-items-center rounded text-white w-200 text-start"
              style={{ background: "transparent", border: "none" }}
              onClick={() => setOpenClassMenu(!openClassMenu)}
            >
              Classes ▾
            </button>
            {openClassMenu && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-2">
                  <Link to="/admin/add-class" className="nav-link text-white">
                    Add Classes
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link to="/admin/get-class" className="nav-link text-white">
                    List Classes
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Subjects Menu */}
          <li className="nav-item mb-3">
            <button
              className="btn btn-toggle align-items-center rounded text-white w-200 text-start"
              style={{ background: "transparent", border: "none" }}
              onClick={() => setOpenSubjects(!openSbjects)}
            >
              Subjects ▾
            </button>
            {openSbjects && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-2">
                  <Link to="/admin/add-subjects" className="nav-link text-white">
                    Add Subjects
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link to="/admin/assign-teacher" className="nav-link text-white">
                    Assign Teachers
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item mb-3">
            <button
              className="btn btn-toggle align-items-center rounded text-white w-200 text-start"
              style={{ background: "transparent", border: "none" }}
              onClick={() => setOpenNotices(!openNotices)}
            >
              Notices ▾
            </button>
            {openNotices && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-2">
                  <Link to="/admin/add-notice" className="nav-link text-white">
                    Add Notices
                  </Link>
                </li>
                <li className="nav-item mb-2">
                  <Link to="/admin/list-notice" className="nav-link text-white">
                    List Notices
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item mb-3">
            <Link to="/analysis" className="nav-link text-white">
              Performance Analysis
            </Link>
          </li>
          <li className="nav-item mb-4">
            <Link to="/admin/retirement" className="nav-link text-white"> Retirement Board</Link>
          </li>

          <li className="nav-item mb-3">
            <Link to="/admin/leave-approval" className="nav-link text-white">
              Leave Approval
            </Link>
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
          <Outlet />
          {/* This renders child admin pages */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
