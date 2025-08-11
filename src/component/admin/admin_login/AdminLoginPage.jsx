import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLoginPage.css";
import adminImage from "../../../assets/admin-login.png";

const AdminLoginPage = () => {
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
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
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
      const response = await fetch("http://localhost:5001/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Admin logged in successfully!");
        // Save JWT token for later use (optional)
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("Error connecting to server. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setSubmitted(false);
    }
  };
  
  return (
    <div className="admin-register-page d-flex flex-row min-vh-100">
      {/* Left Side - Form */}
      <div className="admin-register-left">
        <div className="admin-login-form">
          <h2 className="mb-3">Admin Login</h2>
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
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block">
                  {errors.password}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {submitted ? "Logging in..." : "Login"}
            </button>
            <br></br>
            <br></br>

            <div className="text-end mt-3">
              <small>
                Don't have an account?{" "}
                <a href="/admin-register" className="text-decoration-none">
                  Register here
                </a>
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Right - Image */}
      <div className="admin-register-right">
        <img src={adminImage} alt="Admin" className="admin-image" />
      </div>
    </div>
  );
};

export default AdminLoginPage;
