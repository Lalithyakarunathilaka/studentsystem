import React, { useState, useEffect } from "react";
import axios from "axios";

const pickTeacherName = (t) =>
  (t?.full_name ||
    t?.fullName ||
    t?.name ||
    (t?.first_name && t?.last_name && `${t.first_name} ${t.last_name}`) ||
    "");

const TeacherLeaveForm = () => {
  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    classId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    document: null,
  });

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  
  useEffect(() => {
    (async () => {
      try {
        const [teachersRes, classesRes] = await Promise.all([
          axios.get("http://localhost:5001/api/users/get?role=teacher"),
          axios.get("http://localhost:5001/api/classes/get-all"),
        ]);
        const tList = Array.isArray(teachersRes.data) ? teachersRes.data : [];
        setTeachers(tList);
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);

        // Try to preselect the logged-in teacher from localStorage
        try {
          const raw = localStorage.getItem("teacher");
          const logged = raw ? JSON.parse(raw) : null;
          const loggedId = logged?.id ?? logged?.teacher?.id ?? logged?.teacher_id ?? logged?.teacherId;
          if (loggedId) {
            const sel = tList.find((t) => String(t.id) === String(loggedId));
            setFormData((p) => ({
              ...p,
              teacherId: String(loggedId),
              name: pickTeacherName(sel) || pickTeacherName(logged) || p.name,
            }));
          }
        } catch {}
      } catch (err) {
        console.error("Failed to fetch teachers or classes:", err);
        setMessage("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) If teachers load AFTER a teacherId is already set, ensure name syncs
  useEffect(() => {
    if (!formData.teacherId || teachers.length === 0) return;
    const sel = teachers.find((t) => String(t.id) === String(formData.teacherId));
    const newName = pickTeacherName(sel);
    if (newName && newName !== formData.name) {
      setFormData((p) => ({ ...p, name: newName }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers, formData.teacherId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "document") {
      setFormData((p) => ({ ...p, document: files?.[0] || null }));
      return;
    }

    if (name === "teacherId") {
      const sel = teachers.find((t) => String(t.id) === String(value));
      setFormData((p) => ({
        ...p,
        teacherId: String(value),
        name: pickTeacherName(sel),
      }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const token =
        localStorage.getItem("teacherToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("teacherToken") ||
        sessionStorage.getItem("token");

      if (!token) {
        setMessage("You are not logged in.");
        setLoading(false);
        return;
      }

      const payload = {
        teacher_id: formData.teacherId,       
        name: formData.name,                  
        class_assigned: formData.classId,     
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
      };

      await axios.post(
        "http://localhost:5001/api/teacher-leaves/submit",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      setMessage("✅ Leave request submitted successfully!");
      setFormData((p) => ({
        ...p,
        // keep teacher preselection & name for convenience
        classId: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        document: null,
      }));
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.error || "Failed to submit leave request.";
      setMessage(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Teacher Leave Request Form</h3>

      {message && (
        <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-danger"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light" style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Teacher Selector */}
        <div className="mb-3">
          <label className="form-label">Select Teacher</label>
          <select
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {pickTeacherName(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-filled Name */}
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" value={formData.name} readOnly />
        </div>

        {/* Class Selection */}
        <div className="mb-3">
          <label className="form-label">Class</label>
          {classes.length > 1 ? (
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          ) : (
            <input type="text" className="form-control" value={classes[0]?.name || ""} readOnly />
          )}
        </div>

        {/* Leave Type */}
        <div className="mb-3">
          <label className="form-label">Leave Type</label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Personal Leave">Personal Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
            <option value="Paternity Leave">Paternity Leave</option>
            <option value="Half Day">Half Day</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Dates */}
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col">
            <label className="form-label">End Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="form-control" required />
          </div>
        </div>

        {/* Reason */}
        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea name="reason" rows="3" value={formData.reason} onChange={handleChange} className="form-control" required />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
};

export default TeacherLeaveForm;
