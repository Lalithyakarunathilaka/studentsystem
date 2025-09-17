import React, { useEffect, useMemo, useState } from "react";

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

  // filters
  const [term, setTerm] = useState("First Term");
  const [academicYear, setAcademicYear] = useState("2024-2025");

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
        setMarks(data.marks || []);
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Request failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [term, academicYear]);

  // map[student_id][subject_id] = marks
  const marksMap = useMemo(() => {
    const m = new Map();
    for (const r of marks) {
      if (!m.has(r.student_id)) m.set(r.student_id, new Map());
      m.get(r.student_id).set(r.subject_id, r.marks);
    }
    return m;
  }, [marks]);

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
      <div style={{ margin: "12px 0 20px", display: "flex", gap: 12, alignItems: "center" }}>
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
                  <td style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>{stu.student_name}</td>
                  {subjects.map((sub) => {
                    const val = marksMap.get(stu.student_id)?.get(sub.subject_id);
                    return (
                      <td key={sub.subject_id} style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>
                        {Number.isFinite(val) ? val : "–"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherMarksForm;
