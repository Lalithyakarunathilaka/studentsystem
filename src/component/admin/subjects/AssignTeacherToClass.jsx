import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AssignTeacherToClass = () => {
  const navigate = useNavigate();

  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loader, setLoader] = useState(false);

  const grades = Array.from({ length: 13 }, (_, i) => i + 1); // 1-13
  const classes = ["A", "B", "C"];

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/users/get?role=teacher");
        if (!res.ok) throw new Error("Failed to fetch teachers");
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch subjects based on selected grade
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!grade) return;
      try {
        const res = await fetch(`http://localhost:5001/api/subjects/get-subjects?grade=${grade}`);
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, [grade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!grade || !className || !subject || !teacher) {
      alert("All fields are required");
      return;
    }
    setLoader(true);

    try {
      const res = await fetch("http://localhost:5001/api/subjects/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          class_name: className,
          subject_id: subject,
          teacher_id: teacher,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Teacher assigned successfully!");
        navigate("/admin/manage-assignments");
      } else {
        alert(data.error || "Failed to assign teacher");
      }
    } catch (err) {
      alert("Server error. Try again later.");
      console.error(err);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="admin-register-page d-flex flex-row min-vh-100">
      {/* Left - Form */}
      <div className="admin-register-left">
        <div className="admin-login-form">
          <h2 className="mb-3">Assign Teacher to Class</h2>
          <form onSubmit={handleSubmit}>
            {/* Grade */}
            <div className="form-group mb-3">
              <label>Grade</label>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setSubject(""); // Reset subject when grade changes
                }}
                className="form-control"
                required
              >
                <option value="">Select Grade</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="form-group mb-3">
              <label>Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="form-group mb-3">
              <label>Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-control"
                required
                disabled={!grade}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Teacher */}
            <div className="form-group mb-3">
              <label>Assign Teacher</label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loader}>
              {loader ? "Assigning..." : "Assign Teacher"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignTeacherToClass;
