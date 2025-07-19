import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminRegisterPage.css";
import adminImage from "../../../assets/admin.png"; 

const AdminRegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);

    setTimeout(() => {
      alert("Admin registered successfully!");
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="admin-register-container">
      {/* Left - Form */}
      <div className="admin-register-left">
        <div className="register-form">
          <h1>Admin Register</h1>
          <br></br>
          <p>
            Create your own school by registering as an admin.
            You will be able to add students and manage the system.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`form-control ${errors.name && "is-invalid"}`}
                placeholder="Enter your name"
              />
              <div className="invalid-feedback">{errors.name}</div>
            </div>
            <div className="form-group">
              <label>School Name</label>
              <input
                type="text"
                name="school-name"
                value={form.name}
                onChange={handleChange}
                className={`form-control ${errors.name && "is-invalid"}`}
                placeholder="Enter your school name"
              />
              <div className="invalid-feedback">{errors.name}</div>
            </div>
            <div className="form-group">
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

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`form-control ${errors.password && "is-invalid"}`}
                placeholder="Create a password"
              />
              <div className="invalid-feedback">{errors.password}</div>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {submitted ? "Registering..." : "Register"}
            </button>

            <div className="text-end mt-3"><br></br>
              <small>
                Already have an account?{" "}
                <a href="/admin-login" className="text-decoration-none">
                  Login here
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

export default AdminRegisterPage;
