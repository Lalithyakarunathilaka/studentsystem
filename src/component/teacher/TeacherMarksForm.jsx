import React, { useState, useEffect } from "react";
import axios from "axios";

const TeacherMarksForm = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [classInfo, setClassInfo] = useState({ class_name: "", class_id: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");

  // ✅ Initialize teacherId & teacherName
  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId") || "6"; // fallback for testing
    const storedTeacherName = localStorage.getItem("userName") || "Test Teacher";

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

      const { students, subjects, grade, class_name, class_id } = response.data;
      setStudents(students || []);
      setSubjects(subjects || []);
      setClassInfo({ class_name, class_id });

      // Initialize marks
      const initialMarks = {};
      (students || []).forEach(student => {
        initialMarks[student.student_id] = {};
        (subjects || []).forEach(subject => {
          initialMarks[student.student_id][subject.subject_id] =
            student.marks && student.marks[subject.subject_id] !== undefined
              ? student.marks[subject.subject_id]
              : "";
        });
      });

      setMarksData(initialMarks);
    } catch (err) {
      console.error("Failed to fetch class data:", err);
      setMessage("❌ Failed to load class data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, subjectId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const marksToSubmit = [];

      students.forEach(student => {
        subjects.forEach(subject => {
          const marksValue = marksData[student.student_id][subject.subject_id];
          if (marksValue !== "" && marksValue !== null) {
            marksToSubmit.push({
              student_id: student.student_id,
              subject_id: subject.subject_id,
              teacher_id: parseInt(teacherId),
              marks: parseInt(marksValue)
            });
          }
        });
      });

      if (marksToSubmit.length === 0) {
        setMessage("❌ Please enter marks for at least one student");
        return;
      }

      await axios.post(
        "http://localhost:5001/api/marks/bulk-add",
        { marks: marksToSubmit },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Marks saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save marks:", err);
      setMessage("❌ Failed to save marks: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-4"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Student Marks Entry</h3>
          <p className="text-muted">
  Class: {classInfo.class_name} | Teacher: {teacherName} (ID: {teacherId})
</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-danger"}`}>
          {message}
        </div>
      )}

      {students.length === 0 ? (
        <div className="alert alert-info">
          <h5>No students found</h5>
          <p>There are no students assigned to your class.</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="alert alert-info">
          <h5>No subjects found</h5>
          <p>There are no subjects assigned to your class.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Student Name</th>
                  {subjects.map(subject => (
                    <th key={subject.subject_id}>{subject.subject_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.student_id}>
                    <td><strong>{student.full_name}</strong></td>
                    {subjects.map(subject => (
                      <td key={subject.subject_id}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="form-control form-control-sm"
                          value={marksData[student.student_id]?.[subject.subject_id] || ""}
                          onChange={(e) =>
                            handleMarksChange(student.student_id, subject.subject_id, e.target.value)
                          }
                          placeholder="0-100"
                          style={{ width: "80px" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : "Save All Marks"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TeacherMarksForm;
