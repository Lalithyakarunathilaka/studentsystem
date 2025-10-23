// src/pages/teacher/TeacherLeaveBoard.jsx
import React, { useEffect, useState } from "react";

const getToken = () =>
  localStorage.getItem("teacherToken") ||
  sessionStorage.getItem("teacherToken") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const TeacherLeaveBoard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [status, setStatus] = useState({ type: "", text: "" });

  // --- Fetch the *current* teacher from the backend (source of truth) ---
  useEffect(() => {
    const token = getToken();

    // if no token, stop early
    if (!token) {
      setStatus({ type: "warning", text: "You are not logged in." });
      setLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) fetch the current teacher profile
        const meRes = await fetch("http://localhost:5001/api/teacher/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) throw new Error("Failed to load profile");
        const me = await meRes.json();
        if (!alive) return;

        // Normalize the shape we use in UI
        const normalized = {
          id: me.id,
          full_name: me.full_name || me.name, // handle both shapes
          email: me.email,
          role: me.role,
          gender: me.gender,
        };
        setTeacher(normalized);

        // keep localStorage in sync so other pages read the correct one
        try {
          localStorage.setItem("teacher", JSON.stringify(normalized));
        } catch {}

        // 2) fetch the teacher's leave requests
        const res = await fetch("http://localhost:5001/api/teacher-leaves/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch leave requests");
        const data = await res.json();
        if (!alive) return;

        setLeaves(Array.isArray(data) ? data : []);
        setStatus({ type: "success", text: "Loaded your leave requests" });
      } catch (err) {
        console.error("TeacherLeaveBoard load error:", err);
        if (!alive) return;
        setStatus({ type: "danger", text: "Error loading data." });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []); // run once on mount

  const getStatusBadgeClass = (v) =>
    (v || "Pending") === "Approved"
      ? "bg-success"
      : (v || "Pending") === "Rejected"
      ? "bg-danger"
      : "bg-warning";

  const formatDate = (s) => (s ? new Date(s).toLocaleDateString() : "—");

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

  const tokenPresent = !!getToken();
  const displayName = teacher?.full_name || teacher?.name || "Teacher";

  return (
    <div className="container mt-4">
      {!!status.text && (
        <div
          className={`alert alert-${
            status.type === "danger"
              ? "danger"
              : status.type === "warning"
              ? "warning"
              : "success"
          }`}
        >
          {status.text}
        </div>
      )}

      {/* Header */}
      <div className="alert alert-secondary d-flex justify-content-between align-items-center">
        <div>
          <strong>Logged in as:</strong> {displayName}
          {teacher?.email && <span className="ms-2">• {teacher.email}</span>}
        </div>
        {!tokenPresent && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => (window.location.href = "/teacher/login")}
          >
            Go to Login
          </button>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Leave Requests</h3>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/teacher/leave")}
        >
          + New Leave Request
        </button>
      </div>

      {/* Stats */}
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
                {leaves.filter((l) => !l.status || l.status === "Pending").length}
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
                      {leave.start_date && leave.end_date
                        ? Math.ceil(
                            (new Date(leave.end_date) - new Date(leave.start_date)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        : "—"}{" "}
                      {leave.start_date && leave.end_date ? "days" : ""}
                    </td>
                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: 400 }}
                        title={leave.reason}
                      >
                        {leave.reason || "—"}
                      </div>
                    </td>
                    <td>
                      {leave.admin_comment ? (
                        <div
                          className="text-truncate"
                          style={{ maxWidth: 200 }}
                          title={leave.admin_comment}
                        >
                          {leave.admin_comment}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                        {leave.status || "Pending"}
                      </span>
                    </td>
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
