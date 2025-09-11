import React, { useEffect, useState } from "react";

const AdminLeaveApprove = () => {
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({}); // Store comments for each leave
  const [loading, setLoading] = useState(true);

  // Fetch all leave requests
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/teacher-leaves/get-all");
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

  const handleCommentChange = (id, value) => {
    setComments({
      ...comments,
      [id]: value
    });
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const adminComment = comments[id] || "";
      
      const res = await fetch(`http://localhost:5001/api/teacher-leaves/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_comment: adminComment }), // Change to admin_comment
      });
  
      if (!res.ok) throw new Error("Failed to update leave status");
  
      alert(`Leave request ${status.toLowerCase()} successfully!`);
  
      // Refresh the list
      fetchLeaveRequests();
      
      // Clear the comment for this leave
      setComments({
        ...comments,
        [id]: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error updating leave request");
    }
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
      <h3>Teacher Leave Requests (Admin)</h3>
      
      {leaves.length === 0 ? (
        <div className="alert alert-info mt-3">No leave requests found.</div>
      ) : (
        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Teacher ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Document</th>
              <th>Status</th>
              <th>Admin Comment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.teacher_id}</td>
                <td>{leave.name}</td>
                <td>{leave.class_assigned}</td>
                <td>{leave.leave_type}</td>
                <td>
                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </td>
                <td>{leave.reason}</td>
                <td>
                  {leave.document ? (
                    <a
                      href={`http://localhost:5001/uploads/${leave.document}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Document
                    </a>
                  ) : (
                    "No Document"
                  )}
                </td>
                <td>
                  <span className={`badge ${
                    leave.status === 'Approved' ? 'bg-success' : 
                    leave.status === 'Rejected' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {leave.status || 'Pending'}
                  </span>
                </td>
                <td>{leave.admin_comment || "—"}</td>
                <td>
                  <textarea
                    className="form-control mb-2"
                    placeholder="Add comment..."
                    value={comments[leave.id] || ""}
                    onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                    rows="2"
                  ></textarea>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateLeaveStatus(leave.id, "Approved")}
                      disabled={leave.status === "Approved"}
                    >
                      {leave.status === "Approved" ? "Approved" : "Approve"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => updateLeaveStatus(leave.id, "Rejected")}
                      disabled={leave.status === "Rejected"}
                    >
                      {leave.status === "Rejected" ? "Rejected" : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLeaveApprove;