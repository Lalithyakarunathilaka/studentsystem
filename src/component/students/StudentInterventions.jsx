// src/pages/student/StudentInterventions.jsx
import React, { useEffect, useState } from "react";

const StudentInterventions = () => {
  const [items, setItems] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // who am I (optional display)
    try {
      const raw = localStorage.getItem("student");
      setMe(raw ? JSON.parse(raw) : null);
    } catch {}

    const token =
      localStorage.getItem("studentToken") ||
      sessionStorage.getItem("studentToken");

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:5001/api/interventions/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container mt-4">Loading…</div>;

  if (!me)
    return <div className="container mt-4 text-danger">You are not logged in.</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">My Notifications</h3>

      {items.length === 0 ? (
        <div className="alert alert-info">No interventions assigned.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Details</th>
                <th>Term</th>
                <th>Academic Year</th>
                <th>Teacher</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.created_at ? new Date(i.created_at).toLocaleDateString() : "—"}</td>
                  <td>{i.type || "—"}</td>
                  <td>{i.details}</td>
                  <td>{i.term || "—"}</td>
                  <td>{i.academic_year || "—"}</td>
                  <td>{i.teacher_name || "—"}</td>
                  <td>{i.class_name || "—"}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentInterventions;
