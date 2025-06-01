import React, { useState, useEffect } from 'react';
import './Notices.css';  

const ViewNotice = () => {
  const [notices, setNotices] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Fetch notices 
  useEffect(() => {
    fetch('http://localhost:5001/api/notices')
      .then(response => response.json())
      .then(data => setNotices(data))
      .catch(error => console.error("Error fetching notices:", error));
  }, []);

  // Filter the notices based on selected category
  const filteredNotices =
    selectedFilter === "All"
      ? notices
      : notices.filter(notice => notice.type === selectedFilter);

  return (
    <div className="notice-container">
      <h2 className="dashboard-title">Notice & Announcements</h2>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {["All", "Notice", "Announcement", "Lost & Found"].map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${selectedFilter === filter ? "active" : ""}`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="notices-grid">
        {filteredNotices.length === 0 ? (
          <div>No notices available at the moment.</div>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <h3>{notice.title}</h3>
              <p>{notice.content}</p>
              {/* Safely check if notice.type exists before calling toLowerCase */}
              <span className={`notice-type ${notice.type ? notice.type.toLowerCase() : ''}`}>
                {notice.type}
              </span>
              <p className="notice-date">{notice.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewNotice;
