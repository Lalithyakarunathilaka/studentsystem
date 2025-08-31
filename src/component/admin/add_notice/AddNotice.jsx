import React, { useState } from "react";
import "./AddNotice.css";

const AddNotice = ({ onAdd }) => {
  const [notice, setNotice] = useState({
    title: "",
    description: "",
    category: "",
    permission: "",
  });

  const handleChange = (e) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!notice.title.trim() || !notice.description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/add-notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notice.title,
          description: notice.description,
          category: notice.category,
          permission: notice.permission,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Expect backend to send the new notice object in data.notice
        onAdd(data.notice);
        setNotice({
          title: "",
          description: "",
          category: "Notice",
          permission: "Both",
        });
      } else {
        alert(data.error || data.message || "Failed to add notice");
      }
    } catch (err) {
      console.error("Error adding notice:", err);
      alert("Error adding notice");
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      {/* <h3 className="form-title">Add New Notice</h3> */}

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={notice.title}
          onChange={handleChange}
          placeholder="Enter title"
          required
        />
      </div>

      <div className="form-group">
        <label>Content</label>
        <textarea
          name="description"
          value={notice.description}
          onChange={handleChange}
          placeholder="Enter notice content"
          required
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>Type</label>
        <select
          name="category"
          value={notice.category}
          onChange={handleChange}
        >
          <option value="Notice">Notice</option>
          <option value="Announcement">Announcement</option>
          <option value="Lost & Found">Lost & Found</option>
        </select>
      </div>

      <div className="form-group">
        <label>Audience</label>
        <select
          name="permission"
          value={notice.permission}
          onChange={handleChange}
        >
          <option value="Both">Both</option>
          <option value="Student">Students</option>
          <option value="Teacher">Teachers</option>
        </select>
      </div>

      <button type="submit" className="btn-primary">
        Add Notice
      </button>
    </form>
  );
};

export default AddNotice;
