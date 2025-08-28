import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, classes: 0 });

  useEffect(() => {
    axios.get("http://localhost:5001/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: "25px 20px",
          boxShadow: "0px 5px 5px rgba(0,0,0,0.2)",
        }}
      >
        <h2 className="text-dark">Admin</h2>
      </header>

      {/* Dashboard content */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text display-6">{stats.users}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Classes</h5>
              <p className="card-text display-6">{stats.classes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
