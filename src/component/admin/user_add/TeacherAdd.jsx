import React, { useState, useEffect } from "react";
import "./AdminUserAdd.css";

const TeacherAdd = () => {
  const [formData, setFormData] = useState({
    id: null,
    full_name: "",
    email: "",
    password: "",
    gender: "",
    date_of_birth: "",
    join_date: "",
    role: "teacher",
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch teachers 
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/users/get");
      const data = await response.json();
      setUsers(data.filter((u) => u.role === "teacher")); 
    } catch (err) {
      console.error("Error fetching teachers:", err);
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
    if (!formData.full_name.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email";
    if (!formData.id && !formData.password) return "Password is required";
    if (formData.password && formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.gender) return "Gender is required";
    if (!formData.date_of_birth) return "Date of Birth is required";
    if (!formData.join_date) return "Join Date is required";
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

      // Only send fields the backend expects
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth, 
        join_date: formData.join_date,    
        role: "teacher",     
      };
      

      if (!formData.id) {
        payload.password = formData.password; // include password only on add
      } else if (formData.password) {
        payload.password = formData.password; // allow updating password
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          formData.id
            ? "Teacher updated successfully!"
            : "Teacher added successfully!"
        );
        setFormData({
          id: null,
          full_name: "",
          email: "",
          password: "",
          gender: "",
          date_of_birth: "",
          join_date: "",
          role: "teacher",
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
      role: "teacher",
      gender: user.gender || "",
      date_of_birth: user.date_of_birth
        ? user.date_of_birth.split("T")[0]
        : "",
      join_date: user.join_date
        ? user.join_date.split("T")[0]
        : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/delete-user/${id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setSuccessMsg("Teacher deleted successfully!");
        setUsers(users.filter((u) => u.id !== id));
      } else {
        setErrors("Failed to delete teacher");
      }
    } catch (err) {
      setErrors("Server error. Try again later.");
    }
  };

  return (
    <div className="admin-add-user-container">
      <form onSubmit={handleSubmit} className="admin-add-user-form">
        <h2>{formData.id ? "Edit Teacher" : "Add New Teacher"}</h2>

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

        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label>Date of Birth:</label>
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
        />

        <label>Join Date:</label>
        <input
          type="date"
          name="join_date"
          value={formData.join_date}
          onChange={handleChange}
        />

        <button type="submit">
          {formData.id ? "Update Teacher" : "Add Teacher"}
        </button>
      </form>
      <br />

      <h3>Registered Teachers</h3>
      <br />
      <table className="user-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>DOB</th>
            <th>Join Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.gender}</td>
                <td>{u.date_of_birth ? u.date_of_birth.split("T")[0] : ""}</td>
                <td>{u.join_date ? u.join_date.split("T")[0] : ""}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Edit</button>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No teachers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherAdd;
