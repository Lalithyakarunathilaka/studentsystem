import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const TeacherLeaveForm = () => {
  const [formData, setFormData] = useState({
    teacherId: "T001", // auto-filled (example)
    name: "John Doe", // auto-filled (example)
    class: "10-B", // auto-filled (example)
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    document: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData({ ...formData, document: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build form data for upload
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    console.log("Leave Request Submitted:", formData);
    alert("Leave request submitted successfully!");
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Teacher Leave Request Form</h3>
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded shadow-sm bg-light"
        style={{ maxWidth: "700px", margin: "0 auto", minHeight: "900px" }}
      >
        {/* Teacher Info (Auto-filled) */}
        <div className="mb-3">
          <label className="form-label">Teacher ID</label>
          <input
            type="text"
            className="form-control"
            value={formData.teacherId}
            
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.name}
            
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Class</label>
          <input
            type="text"
            className="form-control"
            value={formData.class}
            
          />
        </div>

        {/* Leave Details */}
        <div className="mb-3">
          <label className="form-label">Leave Type</label>
          <select
            className="form-select"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
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

        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea
            className="form-control"
            name="reason"
            rows="3"
            value={formData.reason}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* File Upload */}
        <div className="mb-3">
          <label className="form-label">
            Upload Supporting Document (optional)
          </label>
          <input
            type="file"
            className="form-control"
            name="document"
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: "24px" }}>
          <button type="submit" className="btn btn-primary w-100">
            Submit Leave Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherLeaveForm;
