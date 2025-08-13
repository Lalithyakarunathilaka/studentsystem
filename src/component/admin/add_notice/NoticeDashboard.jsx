import React, { useState, useEffect } from "react";
import AddNotice from "./AddNotice";
import "./NoticeDashboard.css";

const NoticeDashboard = () => {
  const [notices, setNotices] = useState([]);
  const [filterAudience, setFilterAudience] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5001/api/notices")
      .then((res) => res.json())
      .then((data) => setNotices(data))
      .catch((err) => console.error("Error fetching notices:", err));
  }, []);

  const filteredNotices = notices.filter(
    (notice) =>
      filterAudience === "All" ||
      notice.permission === filterAudience ||
      notice.permission === "Both"
  );

  const addNotice = (newNotice) => {
    setNotices([newNotice, ...notices]);
  };

  const filterOptions = ["All", "Student", "Teacher", "Lost & Found"];

  return (
    <div className="notice-dashboard-container">
      <h2 className="notice-dashboard-title">Notice & Announcements</h2>

      <div className="add-notice-wrapper">
        <AddNotice onAdd={addNotice} />
      </div>

      <div className="filter-buttons">
        {filterOptions.map((aud) => (
          <button
            key={aud}
            onClick={() => setFilterAudience(aud)}
            className={`filter-btn ${filterAudience === aud ? "active" : ""}`}
          >
            {aud === "Student"
              ? "Students"
              : aud === "Teacher"
              ? "Teachers"
              : aud}
          </button>
        ))}
      </div>

      <div className="notices-grid">
        {filteredNotices.length === 0 ? (
          <p className="no-notices-msg">
            No notices found for selected audience.
          </p>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <div>
                <h3 className="notice-title">{notice.title}</h3>
                <p className="notice-content">{notice.description}</p> {/* Fixed */}
                <p className="notice-date">
                  {notice.date
                    ? new Date(notice.date).toLocaleDateString()
                    : "No date"}
                </p>
              </div>
              <button
                className={`notice-type-btn ${
                  notice.category === "Notice"
                    ? "notice"
                    : notice.category === "Announcement"
                    ? "announcement"
                    : "other"
                }`}
                disabled
              >
                {notice.category}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeDashboard;
