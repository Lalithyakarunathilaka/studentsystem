import React, { useState, useEffect, useMemo } from "react";
import "./AdminUserAdd.css";

const StudentAdd = () => {
  const [formData, setFormData] = useState({
    id: null,
    full_name: "",
    email: "",
    password: "",
    class_id: "",
    gender: "",
    role: "student",
  });

  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]); // all classes
  const [errors, setErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // NEW: table filter state
  const [filterClassId, setFilterClassId] = useState(""); // "" = All

  // Fetch students
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/users/get");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data.filter((u) => u.role === "student") : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/classes/get-all");
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  // Derived: filtered users for the table
  const filteredUsers = useMemo(() => {
    if (!filterClassId) return users; // All
    const cidNum = Number(filterClassId);
    return users.filter((u) => Number(u.class_id) === cidNum);
  }, [users, filterClassId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors("");
    setSuccessMsg("");
  };

  const validate = () => {
    if (!formData.full_name.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email";
    if (!formData.id && !formData.password) return "Password is required";
    if (formData.password && formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.class_id) return "Class is required";
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
          formData.id ? "Student updated successfully!" : "Student added successfully!"
        );
        setFormData({
          id: null,
          full_name: "",
          email: "",
          password: "",
          class_id: "",
          gender: "",
          role: "student",
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
      class_id: user.class_id || "",
      gender: user.gender || "",
      role: "student",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/delete-user/${id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setSuccessMsg("Student deleted successfully!");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        setErrors("Failed to delete student");
      }
    } catch (err) {
      setErrors("Server error. Try again later.");
    }
  };

  return (
    <div className="admin-add-user-container">
      <form onSubmit={handleSubmit} className="admin-add-user-form">
        <h2>{formData.id ? "Edit Student" : "Add New Student"}</h2>

        {errors && <div className="error-message">{errors}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <label>Full Name:</label>
        <input
          type="text"
          name="full_name"
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

        <label>Class:</label>
        <select name="class_id" value={formData.class_id} onChange={handleChange}>
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <button type="submit">
          {formData.id ? "Update Student" : "Add Student"}
        </button>
      </form>

      {/* NEW: Table filter by class */}
      <div style={{ marginTop: 40, marginBottom: 20, display: "flex", gap: 20, alignItems: "center" }}>
        <label htmlFor="classFilter"><strong>Filter by Class:</strong></label>
        <select
          id="classFilter"
          value={filterClassId}
          onChange={(e) => setFilterClassId(e.target.value)}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span style={{ opacity: 0.8 }}>
          Showing {filteredUsers.length} of {users.length} students
        </span>
      </div>

      <h3>Registered Students</h3>
      <br></br>
      <table className="user-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Class</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{classes.find((c) => c.id === u.class_id)?.name || "-"}</td>
                <td>{u.gender}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Edit</button>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No students found{filterClassId ? " for this class" : ""}.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAdd;
