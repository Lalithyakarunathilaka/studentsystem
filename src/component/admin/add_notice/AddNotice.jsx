import React, { useState } from "react";
import "./AddNotice.css";

const AddNotice = ({ onAdd }) => {
  const [notice, setNotice] = useState({
    title: "",
    description: "",
    category: "Notice",
    permission: "Both",
  });

  const [message, setMessage] = useState(null); 
  const [messageType, setMessageType] = useState(""); 

  const handleChange = (e) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!notice.title.trim() || !notice.description.trim()) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/notices/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notice),
      });

      const data = await res.json();

      if (res.ok) {
        const newNotice = {
          ...data.notice,
          date: new Date().toISOString(),
        };

        if (onAdd) onAdd(newNotice);

        setMessage("Notice added successfully ✅");
        setMessageType("success");

        // Reset form
        setNotice({
          title: "",
          description: "",
          category: "Notice",
          permission: "Both",
        });
      } else {
        setMessage(data.message || "Failed to add notice ❌");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error adding notice:", err);
      setMessage("Error adding notice ❌");
      setMessageType("error");
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
      setMessageType("");
    }, 3000);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2 className="notice-dashboard-title">Add Notice & Announcements</h2>

      {/* Feedback message */}
      {message && (
        <div
          className={`alert ${
            messageType === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

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
      <br>
      </br>

      <button type="submit" className="btn-primary">
        Add Notice
      </button>
    </form>
  );
};

export default AddNotice;
