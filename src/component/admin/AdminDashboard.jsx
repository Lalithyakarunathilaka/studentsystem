import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, classes: 0 });
  const notices = [
    {
      id: 1,
      title: "School Annual Sports Day",
      content:
        "We are excited to announce that the Annual Sports Day will be held on Friday, January 20, 2024, at the school playground. All students are encouraged to participate and showcase their talents. Kindly register your names with your respective class teachers by Monday, January 15, 2024. Let's make this event a grand success!",
      type: "Notice",
    },
    {
      id: 2,
      title: "Lost & Found Items",
      content:
        "A pair of black shoes and a red water bottle have been found in the playground. If these items belong to you, kindly collect them from the school office during the lunch break. Please ensure your belongings are labeled to avoid loss in the future.",
      type: "Lost & Found",
    },
    {
      id: 3,
      title: "PTA Meeting Notification",
      content:
        "You are cordially invited to attend the Parent-Teacher Association Meeting scheduled for Saturday, January 27, 2024, at 10:00 AM in the school auditorium. This meeting aims to discuss the progress of your child and upcoming school initiatives. Your active participation is highly appreciated.",
      type: "Announcement",
    },
    {
      id: 4,
      title: "Mid-Term Examination Feedback Session",
      content:
        "The Mid-Term Examination Feedback Session for Classes 6 to 12 will be conducted on Saturday, February 3, 2024, from 9:00 AM to 1:00 PM. Class teachers will discuss the academic performance and provide guidance for improvement. Parents are requested to adhere to the time slots shared via email.",
      type: "Announcement",
    },
  ];
  useEffect(() => {
    axios.get("http://localhost:5001/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredNotices =
    selectedFilter === "All"
      ? notices
      : notices.filter((notice) => notice.type === selectedFilter);


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

      <div className="notice-container">
      <div className="filter-buttons">
        {["All", "Notice", "Announcement", "Lost & Found"].map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${
              selectedFilter === filter ? "active" : ""
            }`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="notices-grid">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="notice-card">
            <h3>{notice.title}</h3>
            <p>{notice.content}</p>
            <span className={`notice-type ${notice.type.toLowerCase()}`}>
              {notice.type}
            </span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default AdminDashboard;
