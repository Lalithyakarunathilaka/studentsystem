import React, { useState } from "react";
import "./RegisterPage.css"; 
import studentImage from "../assets/student.jpg"; 

const StudentLoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please enter both email and password.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5001/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("studentToken", data.token);
        window.location.href = "/student/dashboard";
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to connect to server. Please try again later.");
    }
  };
  

  return (
    <div className="register-container">
      <div className="student-login-left">
        <img src={studentImage} alt="Student" className="student-image" 
        width={750} height={800}/>
      </div>

      {/* Right Section */}
      <div className="register-right">
        <div className="register-form">
          <h2>Student Login</h2>
          <br></br>
          <p>Welcome! Please enter your credentials to continue.</p>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="register-btn">
              Login
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
