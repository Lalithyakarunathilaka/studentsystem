import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminHome = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats] = useState({
    students: 256,
    classes: 12,
    teachers: 24,
    
  });

  // Mock notices data for fallback
  const mockNotices = [
    { content: "Student registration opens next week", category: "Students" },
    { content: "Teacher meeting scheduled for Friday", category: "Teachers" },
    { content: "Classroom assignments being updated", category: "Classes" },
    
  ];

  // Fetch notices from API with proper error handling
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch("http://localhost:3001/notices", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // Check if response is successful (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Verify content type is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error("Response is not JSON");
        }

        const data = await response.json();
        setNotices(data);
      } catch (err) {
        console.error("API fetch error:", err);
        setError("Could not connect to the server. Using demo data.");
        // Fallback to mock data
        setNotices(mockNotices);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);



  // Get notice by category
  const getNoticeByCategory = (category) => {
    const notice = notices.find(n => n.category?.toLowerCase().includes(category.toLowerCase()));
    return notice?.content || "No notices available";
  };

  return (
    <div>
      {/* Navbar - Keep your existing navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        {/* ... your existing navbar code ... */}
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        <h2 className="mb-4">Welcome, Admin!</h2>

        {error && (
          <div className="alert alert-warning">
            {error}
          </div>
        )}

        {/* Cards Row */}
        <div className="row">
          {/* Total Students Card */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-2 h-100">
              <div className="card-body">
                <h5 className="card-title">Total Students</h5>
                <p className="display-6 fw-bold text-primary">{stats.students}</p>
                
              </div>
            </div>
          </div>

          {/* Total Classes Card */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-2 h-100">
              <div className="card-body">
                <h5 className="card-title">Total Classes</h5>
                <p className="display-6 fw-bold text-success">{stats.classes}</p>
                
              </div>
            </div>
          </div>

          {/* Total Teachers Card */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-2 h-100">
              <div className="card-body">
                <h5 className="card-title">Total Teachers</h5>
                <p className="display-6 fw-bold text-warning">{stats.teachers}</p>
                
              </div>
            </div>
          </div>

          
        </div>


        {/* All Notices Section */}
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-header bg-primary text-white fw-bold">
            All Notices
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">Loading notices...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Notice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((notice, index) => (
                      <tr key={index}>
                        <td>{notice.category || "General"}</td>
                        <td>{notice.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;