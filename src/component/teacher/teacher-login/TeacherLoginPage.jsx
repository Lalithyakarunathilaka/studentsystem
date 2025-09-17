import React, { useState } from "react";
import teacherImage from "../../../assets/teacher.jpg";
import "./TeacherLoginPage.css"; // <- fixed

const TeacherLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMsg({ type: "error", text: "Please enter both email and password." });
      return;
    }

    setSubmitting(true);
    setMsg({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5001/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg({ type: "error", text: data.error || "Login failed." });
        setSubmitting(false);
        return;
      }

      if (data?.teacher) {
        localStorage.setItem("teacher", JSON.stringify(data.teacher));
      }
      if (data?.token) {
        localStorage.setItem("teacherToken", data.token);
      }

      setMsg({
        type: "success",
        text: `Login successful! Welcome ${data?.teacher?.name || "Teacher"}.`,
      });

      sessionStorage.setItem(
        "loginFlash",
        JSON.stringify({
          text: `Welcome ${data?.teacher?.name || "Teacher"}!`,
          ts: Date.now(),
        })
      );

      window.location.href = "/teacher/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setMsg({ type: "error", text: "Failed to connect to server." });
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="student-login-left">
        <img
          src={teacherImage}
          alt="Teacher"
          className="student-image"
          width={750}
          height={800}
        />
      </div>

      <div className="register-right">
        <div className="register-form">
          <h2>Teacher Login</h2>
          <br />
          <p>Welcome! Please enter your credentials to continue.</p>

          {msg.text && (
            <div
              className={`notice ${
                msg.type === "success" ? "notice-success" : "notice-error"
              }`}
              style={{ marginBottom: 12 }}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                disabled={submitting}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                disabled={submitting}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
