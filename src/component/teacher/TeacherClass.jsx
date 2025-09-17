// src/pages/teacher/TeacherClass.jsx
import React, { useEffect, useMemo, useState } from "react";

const getTeacherFromLS = () => {
  try {
    const raw = localStorage.getItem("teacher");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const TeacherClass = () => {
  const teacher = useMemo(getTeacherFromLS, []);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

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
        const res = await fetch("http://localhost:5001/api/teacher/my-classes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          let msg = "Failed to load classes";
          try {
            const j = await res.json();
            msg = j.error || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json(); // { teacher_id, classes: [...] }
        if (!alive) return;
        setClasses(data.classes || []);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Request failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  if (error)
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        {error}{" "}
        {!localStorage.getItem("teacherToken") && (
          <button
            onClick={() => (window.location.href = "/teacher/login")}
            style={{ marginLeft: 8 }}
          >
            Go to login
          </button>
        )}
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <h2>Welcome{teacher?.name ? `, ${teacher.name}` : ""}</h2>
      <p style={{ color: "#666" }}>Your assigned class(es) and students:</p>

      {(!classes || classes.length === 0) && (
        <div
          style={{
            background: "#f6f7fb",
            border: "1px solid #e6e8f0",
            padding: 16,
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          No class assigned yet.
        </div>
      )}

      {classes?.map((cls) => (
        <div
          key={cls.id}
          style={{
            marginTop: 16,
            border: "1px solid #e6e8f0",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 14,
              background: "#fafbff",
              borderBottom: "1px solid #e6e8f0",
            }}
          >
            <strong>Class:</strong> {cls.name}
          </div>

          <div style={{ padding: 14 }}>
            {cls.students?.length ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px" }}>
                      #
                    </th>
                    <th style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px" }}>
                      Student
                    </th>
                    <th style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px" }}>
                      Email
                    </th>
                    <th style={{ borderBottom: "1px solid #eceef5", padding: "8px 6px" }}>
                      Gender
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {cls.students.map((s, idx) => (
                    <tr key={s.id}>
                      <td style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>
                        {idx + 1}
                      </td>
                      <td style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>
                        {s.name}
                      </td>
                      <td style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>
                        {s.email || "-"}
                      </td>
                      <td style={{ borderBottom: "1px solid #f3f4f9", padding: "8px 6px" }}>
                        {s.gender || "-"}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <em style={{ color: "#777" }}>No students enrolled.</em>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherClass;
