import React, { useState, useEffect } from "react";
import "./AdminUserAdd.css";

const AdminAddUser = () => {
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    email: "",
    password: "",
    role: "",
    grade: "",
    gender: "",
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/users/get");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors("");
    setSuccessMsg("");
  };

  const validate = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email";
    if (!formData.password && !formData.id) return "Password is required";
    if (formData.password && formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.role) return "Role is required";
    if (formData.role === "student" && !formData.grade)
      return "Grade is required for students";
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
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `http://localhost:5001/api/users/update-user/${formData.id}`
        : "http://localhost:5001/api/users/add";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          formData.id
            ? "User updated successfully!"
            : "User added successfully!"
        );
        setFormData({
          id: null,
          full_name: "",
          email: "",
          password: "",
          role: "",
          grade: "",
          gender: "",
        });
        fetchUsers();
      } else {
        setErrors(data.error || "Failed");
      }
    } catch (err) {
      setErrors("Server error. Try again later.");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
      grade: user.grade || "",
      gender: user.gender || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/delete-user/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setSuccessMsg("User deleted successfully!");
        setUsers(users.filter((u) => u.id !== id));
      } else {
        setErrors("Failed to delete user");
      }
    } catch (err) {
      setErrors("Server error. Try again later.");
    }
  };

  return (
    <div className="admin-add-user-container">
      {/* Add/Edit user form below */}
      <form onSubmit={handleSubmit} className="admin-add-user-form">
        <h2>{formData.id ? "Edit User" : "Add New User"}</h2>

        {errors && <div className="error-message">{errors}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={formData.full_name}
          onChange={handleChange}
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={formData.id ? "Leave blank to keep password" : ""}
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
            />
          </>
        )}

        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <button type="submit">
          {formData.id ? "Update User" : "Add User"}
        </button>
      </form>
      <br></br>

      {/* Users list at the top */}
      <h3>Registered Users</h3> <br></br>
      <table className="user-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Edit</button>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
};

export default AdminAddUser;
