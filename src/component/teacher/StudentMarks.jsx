import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentMarks = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      const token = localStorage.getItem("teacherToken");
      if (!token) return;

      try {
        const term = "First Term"; // Or get from state/props
        const academicYear = "2024-2025"; // Or from state
        const res = await fetch(
          `http://localhost:5001/api/marks/student/${studentId}?term=${term}&academic_year=${academicYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setMarks(data);
      } catch (err) {
        console.error("Error fetching student marks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [studentId]);

  if (loading) return <div>Loading student marks…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Marks for Student #{studentId}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Subject</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Marks</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Teacher</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((m) => (
            <tr key={m.subject_id}>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{m.subject_name}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{m.marks}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{m.teacher_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={{ marginTop: 16 }} onClick={() => navigate("/teacher/marks")}>
        ← Back to Marks
      </button>
    </div>
  );
};

export default StudentMarks;
