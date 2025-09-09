import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import teacherImage from "../../../assets/admin-login.png"; 
import "./TeacherLoginPage.css"

const TeacherLoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/teacher/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      // Save teacher info to localStorage
      const teacher = response.data.teacher;
      localStorage.setItem("teacherId", teacher.id);
      localStorage.setItem("teacherName", teacher.fullName);

      alert("Teacher logged in successfully!");
      navigate("/teacher/dashboard"); // Redirect to dashboard
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
      setSubmitted(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left Side - Form */}
      <div className="register-left">
        <div className="register-form minimized-form">
          <h2>Teacher Login</h2>
          <p>Welcome back! Please enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group mb-3">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`form-control ${errors.email && "is-invalid"}`}
                placeholder="Enter your email"
              />
              <div className="invalid-feedback">{errors.email}</div>
            </div>

            <div className="form-group mb-3">
              <label>Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password && "is-invalid"}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block">{errors.password}</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {submitted ? "Logging in..." : "Login"}
            </button>

            <div className="text-end mt-3">
              <small>
                Don’t have an account?{" "}
                <a href="/teacher-register" className="text-decoration-none">
                  Register here
                </a>
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="register-right">
        <img src={teacherImage} alt="Teacher" className="admin-image" />
      </div>
    </div>
  );
};

export default TeacherLoginPage;
