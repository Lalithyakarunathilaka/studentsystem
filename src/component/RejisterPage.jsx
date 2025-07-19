import React, { useState } from "react";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "", // 👈 was missing before
    role: "",
    gender: "",
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!formData.role) {
      alert("Please select whether you are a Teacher or a Student.");
      return;
    }
    console.log("Registration successful:", formData);
  };

  return (
    <div className="register-container">
      {/* Left Section */}
      <div className="register-left">
        <img
          src="/images/register.jpg"
          alt="Classroom"
          className="background-image"
        />
      </div>

      {/* Right Section */}
      <div className="register-right">
        <div className="register-form">
          <h2>Registration</h2>
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name:</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>

            {/* Grade Selector */}
            <div className="form-group">
              <label htmlFor="grade">Grade:</label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <option value="">Select Grade</option>
                {[...Array(13)].flatMap((_, i) =>
                  ["A", "B", "C"].map((section) => {
                    const gradeLabel = `${i + 1}-${section}`;
                    return (
                      <option key={gradeLabel} value={gradeLabel}>
                        {gradeLabel}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Gender Selection */}
            <div className="form-group">
              <label>Gender:</label>
              <div className="gender-selection">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleChange}
                  />{" "}
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleChange}
                  />
                  Female
                </label>
              </div>
            </div>

            {/* Register Button */}
            <button type="submit" className="register-btn">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
