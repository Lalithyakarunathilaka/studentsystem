import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TERMS = ["First Term", "Second Term", "Third Term"];
const DEFAULT_YEAR = "2024-2025";

const StudentMarks = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [term, setTerm] = useState(TERMS[0]);
  const [academicYear, setAcademicYear] = useState(DEFAULT_YEAR);

  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = useMemo(() => localStorage.getItem("teacherToken"), []);

  const fetchMarks = async () => {
    if (!token) {
      setErr("Not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErr("");

      const url = new URL(`http://localhost:5001/api/marks/student/${studentId}`);
      url.searchParams.set("term", term);
      url.searchParams.set("academic_year", academicYear);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load marks");

      setMarks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching student marks:", e);
      setErr(e.message || "Error loading marks");
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, term, academicYear]); // <-- refetch when term/year change

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2>
          Marks for Student #{studentId}
        </h2>
        <button onClick={() => navigate("/teacher/marks")} style={{ cursor: "pointer" }}>
          ← Back to Marks
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0 20px" }}>
        <label>
          Term:&nbsp;
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            {TERMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Academic Year:&nbsp;
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2024-2025"
            style={{ width: 120 }}
          />
        </label>

        <button onClick={fetchMarks} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading student marks…</div>
      ) : err ? (
        <div style={{ color: "crimson" }}>{err}</div>
      ) : marks.length === 0 ? (
        <div style={{ background: "#f8f9fc", border: "1px solid #eceff7", padding: 12, borderRadius: 8 }}>
          No marks recorded for <b>{term}</b> ({academicYear}).
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}>Subject</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}>Marks</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m) => (
              <tr key={`${m.subject_id}-${m.term}-${m.academic_year}`}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{m.subject_name}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{m.marks}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{m.teacher_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentMarks;
