// TeacherDashboard.jsx
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

const getTeacher = () => {
  try {
    const raw = localStorage.getItem("teacher");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getTeacherToken = () => localStorage.getItem("teacherToken");

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classMeta, setClassMeta] = useState({});
  const [students, setStudents] = useState([]);
  const [supportNeeded, setSupportNeeded] = useState([]);

  const [term, setTerm] = useState("First Term");
  const [academicYear, setAcademicYear] = useState("2024-2025");

  const token = getTeacherToken();

  const fetchTeacherProfile = async (token) => {
    const res = await fetch("http://localhost:5001/api/teacher/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load teacher profile");
    return res.json();
  };

  const fetchMyClasses = async (token) => {
    const res = await fetch("http://localhost:5001/api/teacher/my-classes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load classes");
    return res.json(); // { teacher_id, classes: [...] }
  };

  const fetchSupportNeeded = async (token, classId, t, yr) => {
    const url = new URL(`http://localhost:5001/api/marks/support-needed/${classId}`);
    url.searchParams.set("term", t);
    url.searchParams.set("academic_year", yr);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to load support-needed");
    return res.json();
  };

  useEffect(() => {
    (async () => {
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // profile
        const profile = await fetchTeacherProfile(token);
        console.log("DEBUG profile:", profile);
        setTeacher(profile);

        // classes (get the assigned class)
        const classesResp = await fetchMyClasses(token);
        console.log("DEBUG classesResp:", classesResp);
        const classes = classesResp.classes || [];
        
        const chosen = classes.length > 0 ? classes[0] : null;
        if (!chosen) {
          setClassMeta({});
          setStudents([]);
          setSupportNeeded([]);
          setError("");
          return;
        }
        setClassMeta({ id: chosen.id, name: chosen.name });

        // support-needed uses class id
        const support = await fetchSupportNeeded(token, chosen.id, term, academicYear);
        setStudents(support.students || []);
        setSupportNeeded(support.supportNeeded || []);
        setError("");
      } catch (e) {
        console.error("Dashboard load error:", e);
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, term, academicYear]);

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>📊 Teacher Dashboard — {classMeta.name || "No class"}</h2>

      {/* Profile */}
      <div style={{ marginBottom: 20, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>👩‍🏫 Profile</h3>
        <p><strong>Name:</strong> {teacher?.name || teacher?.fullName}</p>
        <p><strong>Email:</strong> {teacher?.email}</p>
        <p><strong>Role:</strong> {teacher?.role}</p>
      </div>
      
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

      <div style={{ marginTop: 32 }}>
 
  {/* Charts side by side */}
  <div
    style={{
      display: "flex",
      gap: 24,
      flexWrap: "wrap", // allows responsiveness on small screens
    }}
  >
    {/* Bar Chart */}
    <div style={{ flex: 1, minWidth: 300, height: 400 }}>
      <Bar
        data={{
          labels: students.map((s) => s.student_name),
          datasets: [
            {
              label: "Average Marks (%)",
              data: students.map((s) =>
                s.avg_marks ? Math.round(s.avg_marks) : 0
              ),
              backgroundColor: students.map((s) =>
                supportNeeded.some((w) => w.student_id === s.student_id)
                  ? "rgba(255, 99, 132, 0.7)"
                  : "rgba(75, 192, 192, 0.7)"
              ),
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false, // important to respect height
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Average Marks per Student" },
          },
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } },
          },
        }}
      />
    </div>

    {/* Pie Chart */}
    <div style={{ flex: 1, minWidth: 300, height: 400 }}>
      <Pie
        data={{
          labels: ["Needs Support", "Performing Well"],
          datasets: [
            {
              data: [supportNeeded.length, students.length - supportNeeded.length],
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(75, 192, 192, 0.7)",
              ],
              borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Weak vs. Performing Students" },
          },
        }}
      />
    </div>
  </div>
</div>

    </div>
  );
};

export default TeacherDashboard;
