import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const getTeacherFromLS = () => {
  try {
    const raw = localStorage.getItem("teacher");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const TeacherMarksForm = () => {
  const teacher = useMemo(getTeacherFromLS, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classMeta, setClassMeta] = useState({ class_id: null, class_name: "" });
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);

  const [term, setTerm] = useState("First Term");
  const [academicYear, setAcademicYear] = useState("2024-2025");

  const navigate = useNavigate();

  // Fetch class and marks data
  const fetchData = async (token, t, yr) => {
    const url = new URL("http://localhost:5001/api/teacher/my-class-data");
    url.searchParams.set("term", t);
    url.searchParams.set("academic_year", yr);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      let msg = "Failed to load class data";
      try { const j = await res.json(); msg = j.error || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  };

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchData(token, term, academicYear);
        if (!alive) return;
        setClassMeta({ class_id: data.class_id, class_name: data.class_name });
        setStudents(data.students || []);
        setSubjects(data.subjects || []);
        setMarks(data.marks.map(m => ({ ...m, teacher_id: teacher.id })) || []);
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Request failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [term, academicYear, teacher]);

  // Map of student_id -> subject_id -> marks
  const marksMap = useMemo(() => {
    const map = new Map();
    for (const m of marks) {
      if (!map.has(m.student_id)) map.set(m.student_id, new Map());
      map.get(m.student_id).set(m.subject_id, m.marks);
    }
    return map;
  }, [marks]);

  const handleInputChange = (student_id, subject_id, value) => {
    const newMarks = [...marks];
    const index = newMarks.findIndex(m => m.student_id === student_id && m.subject_id === subject_id);
    const numericValue = value === "" ? "" : Math.max(0, Math.min(100, Number(value)));

    if (index >= 0) {
      newMarks[index].marks = numericValue;
    } else {
      newMarks.push({
        student_id,
        subject_id,
        marks: numericValue,
        teacher_id: teacher.id,
      });
    }
    setMarks(newMarks);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      alert("Not logged in!");
      return;
    }

    try {
      await fetch("http://localhost:5001/api/marks/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ marks, term, academic_year: academicYear }),
      });
      alert("Marks saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save marks.");
    }
  };

  const handleCancel = async () => {
    const token = localStorage.getItem("teacherToken");
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchData(token, term, academicYear);
      setMarks(data.marks.map(m => ({ ...m, teacher_id: teacher.id })) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error)
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        {error}{" "}
        {!localStorage.getItem("teacherToken") && (
          <button onClick={() => (window.location.href = "/teacher/login")} style={{ marginLeft: 8 }}>
            Go to login
          </button>
        )}
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2>
          Marks — {classMeta.class_name || "No class"}
          {teacher?.name ? ` (Teacher: ${teacher.name})` : ""}
        </h2>
        <a href="/teacher/class">← Back to Class</a>
      </div>

      {/* Filters */}
      <div style={{ margin: "2px 0 20px", display: "flex", gap: 12, alignItems: "center" }}>
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

      {students.length === 0 ? (
        <div style={{ background: "#f6f7fb", border: "1px solid #e6e8f0", padding: 16, borderRadius: 8 }}>
          No students found for this class.
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto", border: "1px solid #e6e8f0", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px", textAlign: "left" }}>#</th>
                  <th style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px", textAlign: "left" }}>Student</th>
                  {subjects.map((sub) => (
                    <th key={sub.subject_id} style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px", textAlign: "left" }}>
                      {sub.subject_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((stu, idx) => (
                  <tr key={stu.student_id}>
                    <td style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>{idx + 1}</td>
                    <td
                      style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px", cursor: "pointer", color: "blue", textDecoration: "underline" }}
                      onClick={() => navigate(`/teacher/student-marks/${stu.student_id}`)}
                    >
                      {stu.student_name}
                    </td>
                    {subjects.map((sub) => {
                      const val = marksMap.get(stu.student_id)?.get(sub.subject_id) ?? "";
                      return (
                        <td key={sub.subject_id} style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={val}
                            onChange={(e) => handleInputChange(stu.student_id, sub.subject_id, e.target.value)}
                            style={{ width: 60, padding: "4px" }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-success me-2" onClick={handleSave}>
              Save All
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherMarksForm;
