import React, { useState, useEffect } from "react";
import axios from "axios";

const TeacherMarksForm = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marksData, setMarksData] = useState({});
  const [classInfo, setClassInfo] = useState({ class_name: "", class_id: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId") || "6";
    const storedTeacherName = localStorage.getItem("userName") || "Senarath Pathiranage Karunathilaka";

    setTeacherId(storedTeacherId);
    setTeacherName(storedTeacherName);

    if (!storedTeacherId) {
      setMessage("❌ Please log in as a teacher");
      return;
    }

    fetchClassData(storedTeacherId);
  }, []);

  const fetchClassData = async (tid) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/marks/class/${tid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { students, subjects, class_name, class_id } = response.data;
      setStudents(students || []);
      setSubjects(subjects || []);
      setClassInfo({ class_name, class_id });

      // Initialize marksData with empty values
      const initialMarks = {};
      (students || []).forEach((student) => {
        initialMarks[student.student_id] = "";
      });
      setMarksData(initialMarks);

    } catch (err) {
      console.error("Failed to fetch class data:", err);
      setMessage("❌ Failed to load class data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    if (!selectedSubject) {
      setMessage("❌ Please select a subject");
      setSaving(false);
      return;
    }

    const marksToSubmit = [];
    students.forEach((student) => {
      const value = marksData[student.student_id];
      if (value !== "" && value !== null) {
        marksToSubmit.push({
          student_id: student.student_id,
          subject_id: parseInt(selectedSubject),
          teacher_id: parseInt(teacherId),
          marks: parseInt(value),
        });
      }
    });

    if (marksToSubmit.length === 0) {
      setMessage("❌ Enter marks for at least one student");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/marks/bulk-add",
        { marks: marksToSubmit },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Marks saved successfully!");
      setTimeout(() => setMessage(""), 3000);

      // Reset marks for next subject
      const resetMarks = {};
      students.forEach((s) => (resetMarks[s.student_id] = ""));
      setMarksData(resetMarks);

    } catch (err) {
      console.error("Failed to save marks:", err);
      setMessage("❌ Failed to save marks: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Marks Entry (Class: {classInfo.class_name}, Teacher: {teacherName})</h3>

      {message && (
        <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-danger"}`}>
          {message}
        </div>
      )}

      <div className="mb-3">
        <label>Select Subject:</label>
        <select
          className="form-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((sub) => (
            <option key={sub.subject_id} value={sub.subject_id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubject && (
        <form onSubmit={handleSubmit}>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.full_name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={marksData[student.student_id]}
                      onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                      placeholder="0-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Marks"}
          </button>
        </form>
      )}
    </div>
  );
};

export default TeacherMarksForm;
