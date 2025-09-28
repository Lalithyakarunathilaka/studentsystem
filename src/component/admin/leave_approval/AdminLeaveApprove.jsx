// src/pages/admin/AdminLeaveApprove.jsx
import React, { useEffect, useState } from "react";

function getToken() {
  
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("teacherToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("adminToken") ||
    sessionStorage.getItem("teacherToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

const AdminLeaveApprove = () => {
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  async function fetchLeaveRequests() {
    try {
      setLoading(true);
      setStatus({ type: "", text: "" });

      const token = getToken();
      if (!token) {
        setStatus({ type: "danger", text: "You are not logged in (missing token)." });
        setLeaves([]);
        return;
      }

      const res = await fetch("http://localhost:5001/api/teacher-leaves/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // try to surface API error
        let msg = `Failed to fetch leave requests (${res.status})`;
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setStatus({ type: "danger", text: err.message || "Error fetching leave requests" });
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }

  const handleCommentChange = (id, value) => {
    setComments((p) => ({ ...p, [id]: value }));
  };

  async function updateLeaveStatus(id, nextStatus) {
    try {
      const token = getToken();
      if (!token) {
        setStatus({ type: "danger", text: "You are not logged in (missing token)." });
        return;
      }

      const adminComment = comments[id] || "";

      const res = await fetch(`http://localhost:5001/api/teacher-leaves/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({ status: nextStatus, admin_comment: adminComment }),
      });

      if (!res.ok) {
        let msg = `Failed to update leave status (${res.status})`;
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {}
        throw new Error(msg);
      }

      setStatus({ type: "success", text: `Leave request ${nextStatus.toLowerCase()} successfully!` });
      // refresh list
      await fetchLeaveRequests();
      // clear comment for this row
      setComments((p) => ({ ...p, [id]: "" }));
    } catch (err) {
      console.error(err);
      setStatus({ type: "danger", text: err.message || "Error updating leave request" });
    }
  }

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
      <h3>Teacher Leaves Approval</h3>

      {!!status.text && (
        <div
          className={`alert alert-${
            status.type === "danger" ? "danger" : status.type === "success" ? "success" : "info"
          } mt-3`}
        >
          {status.text}
        </div>
      )}

      {leaves.length === 0 ? (
        <div className="alert alert-info mt-3">No leave requests found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                {/* <th>Document</th> */}
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
                    {new Date(leave.start_date).toLocaleDateString()} -{" "}
                    {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td>{leave.reason}</td>
                  {/* <td>
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
                  </td> */}
                  <td>
                    <span
                      className={`badge ${
                        leave.status === "Approved"
                          ? "bg-success"
                          : leave.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {leave.status || "Pending"}
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
                    />
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
        </div>
      )}
    </div>
  );
};

export default AdminLeaveApprove;
