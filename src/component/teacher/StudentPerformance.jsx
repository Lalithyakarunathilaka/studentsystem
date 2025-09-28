import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const getTeacherToken = () => localStorage.getItem("teacherToken");

const StudentPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classMeta, setClassMeta] = useState({});
  const [students, setStudents] = useState([]);
  const [supportNeeded, setSupportNeeded] = useState([]);

  // filters
  const [term, setTerm] = useState("First Term");
  const [academicYear, setAcademicYear] = useState("2024-2025");

  // Fetch support-needed data
  const fetchPerformanceData = async (token, t, yr) => {
    const url = new URL("http://localhost:5001/api/teacher/my-class-data");
    url.searchParams.set("term", t);
    url.searchParams.set("academic_year", yr);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      throw new Error("Failed to load class data");
    }
    const data = await res.json();

    //call support-needed API
    const supportUrl = new URL(`http://localhost:5001/api/marks/support-needed/${data.class_id}`);
    supportUrl.searchParams.set("term", t);
    supportUrl.searchParams.set("academic_year", yr);

    const supportRes = await fetch(supportUrl, { headers: { Authorization: `Bearer ${token}` } });
    const supportData = await supportRes.json();

    return {
      classMeta: { id: data.class_id, name: data.class_name },
      students: supportData.students,
      supportNeeded: supportData.supportNeeded,
    };
  };

  useEffect(() => {
    const token = getTeacherToken();
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchPerformanceData(token, term, academicYear)
      .then((d) => {
        setClassMeta(d.classMeta);
        setStudents(d.students);
        setSupportNeeded(d.supportNeeded);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [term, academicYear]);

  if (loading) return <div style={{ padding: 24 }}>Loading performance data…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Student Performance — {classMeta.name || "No class"}</h2>

      {/* Filters */}
      <div
        style={{
          margin: "12px 0 20px",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <label>
          Term:&nbsp;
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </label>

        <label>
          Academic Year:&nbsp;
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2024-2025"
            style={{ width: 110 }}
          />
        </label>
      </div>

      {/* All Students */}
      <div style={{ marginTop: 16 }}>
        <h3>📘 All Students Average Marks</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: "6px" }}>#</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "6px" }}>Student</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "6px" }}>Average Marks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.student_id}>
                <td style={{ borderBottom: "1px solid #eee", padding: "6px" }}>{idx + 1}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "6px" }}>{s.student_name}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "6px" }}>
                  {s.avg_marks ? Math.round(s.avg_marks) + "%" : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weak Students Section */}
      {supportNeeded.length > 0 ? (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "2px solid #f99",
            borderRadius: 8,
            background: "#fff4f4",
          }}
        >
          <h3>Students Needing Extra Support</h3>
          <ul>
            {supportNeeded.map((s) => (
              <li key={s.student_id}>
                {s.student_name} — Avg: {Math.round(s.avg_marks)}%
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          ✅ No students flagged for additional support.
        </div>
      )}

    </div>
  );
};

export default StudentPerformance;
