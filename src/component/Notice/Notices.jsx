import React, { useState } from "react";
import "./Notices.css";

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

const Notice = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredNotices =
    selectedFilter === "All"
      ? notices
      : notices.filter((notice) => notice.type === selectedFilter);

  return (
    <div className="notice-container">
      <h2 className="dashboard-title">Notice & Announcements</h2>

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
  );
};

export default Notice;
