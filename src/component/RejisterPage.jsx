import React, { useState } from "react";
import "./RegisterPage.css";
import studentImage from "../assets/student.jpg";

const StudentLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" }); // success | error

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
      const response = await fetch("http://localhost:5001/api/student/login", {
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

      // ✅ Persist the logged-in student
      if (data?.student) {
        localStorage.setItem("student", JSON.stringify(data.student));
      }

      // (optional) Persist token if you plan to use it later
      if (data?.token) {
        localStorage.setItem("studentToken", data.token);
      }

      // UI success message on the login screen
      setMsg({
        type: "success",
        text: `Login successful! Welcome ${data?.student?.name || "Student"} (ID: ${
          data?.student?.id
        }).`,
      });

      // Also pass a flash message to the next page (dashboard)
      sessionStorage.setItem(
        "loginFlash",
        JSON.stringify({
          text: `Welcome ${data?.student?.name || "Student"} (ID: ${
            data?.student?.id
          })!`,
          ts: Date.now(),
        })
      );

      // Redirect to dashboard (immediately)
      window.location.href = "/student/dashboard";
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
          src={studentImage}
          alt="Student"
          className="student-image"
          width={750}
          height={800}
        />
      </div>

      <div className="register-right">
        <div className="register-form">
          <h2>Student Login</h2>
          <br />
          <p>Welcome! Please enter your credentials to continue.</p>

          {/* Inline notice */}
          {msg.text ? (
            <div
              className={`notice ${msg.type === "success" ? "notice-success" : "notice-error"}`}
              role="alert"
              style={{ marginBottom: 12 }}
            >
              {msg.text}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                disabled={submitting}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                disabled={submitting}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
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

export default StudentLoginPage;
