import React, { useState } from "react";
import "./AdminUserAdd.css";


const AdminAddUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "", // 'student' or 'teacher'
    grade: "", // optional, mostly for students
    gender: "",
  });

  const [errors, setErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors("");
    setSuccessMsg("");
  };

  const validate = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.role) return "Role is required";
    if (formData.role === "student" && !formData.grade) return "Grade is required for students";
    if (!formData.gender) return "Gender is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("User added successfully!");
        setFormData({
          fullName: "",
          email: "",
          password: "",
          role: "",
          grade: "",
          gender: "",
        });
      } else {
        setErrors(data.error || "Failed to add user");
      }
    } catch (err) {
      setErrors("Server error. Try again later.");
    }
  };

  return (
    <div className="admin-add-user-container">
      <form onSubmit={handleSubmit} className="admin-add-user-form">
        <h2>Add New User</h2>
        <p><center>Enter details to register user for the school.</center></p>

        {errors && <div className="error-message">{errors}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />

        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        {formData.role === "student" && (
          <>
            <label>Grade:</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Grade (e.g., 10-A)"
            />
          </>
        )}

        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <button type="submit">Add User</button>
      </form>
    </div>
  );
  };
  


export default AdminAddUser;
