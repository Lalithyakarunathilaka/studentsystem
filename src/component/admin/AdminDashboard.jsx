import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    teachers: 0,
    classes: 0,
  });

  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Chart data
  const userDistribution = [
    { name: "Students", value: stats.students },
    { name: "Teachers", value: stats.teachers },
  ];

  const overviewStats = [
    { name: "Users", value: stats.users },
    { name: "Students", value: stats.students },
    { name: "Teachers", value: stats.teachers },
    { name: "Classes", value: stats.classes },
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  // Notices
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
        <h2 className="text-dark">Admin Dashboard</h2>
      </header>

      {/* Stats Section */}
      <div className="row mt-4">
        {[
          { title: "Total Users", value: stats.users },
          { title: "Total Students", value: stats.students },
          { title: "Total Teachers", value: stats.teachers },
          { title: "Total Classes", value: stats.classes },
        ].map((item, idx) => (
          <div className="col-md-3 mb-3" key={idx}>
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text display-6">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row mt-4">
        {/* Pie Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="text-center">Users Analysis</h5>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="text-center">Overview</h5>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={overviewStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Notices Section */}
      <div className="notice-container">
        <div className="filter-buttons mb-3 text-center">
          {["All", "Notice", "Announcement", "Lost & Found"].map((filter) => (
            <button
              key={filter}
              className={`btn mx-2 ${
                selectedFilter === filter ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="row">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{notice.title}</h5>
                  <p className="card-text">{notice.content}</p>
                  <span className="badge bg-secondary">{notice.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
