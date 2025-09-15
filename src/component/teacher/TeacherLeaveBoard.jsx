import React, { useEffect, useState } from "react";

const TeacherLeaveBoard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(""); 
  
  useEffect(() => {
    
    const storedTeacherId = localStorage.getItem("teacherId") || "6"; 
    setTeacherId(storedTeacherId);
    fetchTeacherLeaves(storedTeacherId);
  }, []);

  const fetchTeacherLeaves = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/teacher-leaves/${id}`);
      if (!res.ok) throw new Error("Failed to fetch leave requests");
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      alert("Error fetching leave requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success";
      case "Rejected":
        return "bg-danger";
      case "Pending":
      default:
        return "bg-warning";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Leave Requests</h3>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/teacher/leave")} // Adjust route as needed
        >
          + New Leave Request
        </button>
      </div>


      {/* Statistics Card */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Requests</h5>
              <p className="card-text display-6">{leaves.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Approved</h5>
              <p className="card-text display-6">
                {leaves.filter((l) => l.status === "Approved").length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="card-text display-6">
                {
                  leaves.filter((l) => l.status === "Pending" || !l.status)
                    .length
                }
              </p>
            </div>
          </div>
        </div>

      {leaves.length === 0 ? (
        <div className="alert alert-info">
          <h5>No leave requests found</h5>
          <p>You haven't submitted any leave requests yet.</p>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/teacher/leave")}
          >
            Submit Your First Request
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Request Date</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Admin Comment</th>
                <th>Status</th>
                {/* <th>Document</th> */}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{formatDate(leave.created_at)}</td>
                  <td>{leave.leave_type}</td>
                  <td>{formatDate(leave.start_date)}</td>
                  <td>{formatDate(leave.end_date)}</td>
                  <td>
                    {Math.ceil(
                      (new Date(leave.end_date) - new Date(leave.start_date)) /
                        (1000 * 60 * 60 * 24) +
                        1
                    )}{" "}
                    days
                  </td>
                  <td>
                    <div
                      className="text-truncate"
                      style={{ maxWidth: "400px" }}
                      title={leave.reason}
                    >
                      {leave.reason}
                    </div>
                  </td>
                  <td>
                    {leave.admin_comment ? (
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "200px" }}
                        title={leave.admin_comment}
                      >
                        {leave.admin_comment}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(leave.status)}`}
                    >
                      {leave.status || "Pending"}
                    </span>
                  </td>
                  {/* <td>
                    {leave.document ? (
                      <a
                        href={`http://localhost:5001/uploads/${leave.document}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </a>
                    ) : (
                      "No Document"
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default TeacherLeaveBoard;
