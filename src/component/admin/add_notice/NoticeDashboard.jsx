import React, { useState, useEffect } from "react";
import "./NoticeDashboard.css";

const NoticeDashboard = () => {
  const [notices, setNotices] = useState([]);
  const [filterAudience, setFilterAudience] = useState("All");
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Notice",
    permission: "Both",
  });

  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/notices/get");
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/notices/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== id));
        alert("Notice deleted successfully!");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice.id);
    setFormData({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      permission: notice.permission,
    });
  };

  const handleCancel = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      description: "",
      category: "Notice",
      permission: "Both",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5001/api/notices/update/${editingNotice}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Notice updated successfully!");
        setEditingNotice(null);
        fetchNotices();
      } else {
        alert(data.message || "Failed to update notice");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const filteredNotices = notices.filter(
    (notice) =>
      filterAudience === "All" ||
      notice.permission === filterAudience ||
      notice.permission === "Both"
  );

  const filterOptions = ["All", "Student", "Teacher", "Lost & Found"];

  return (
    <div className="notice-dashboard-container">
      <h2 className="notice-dashboard-title">Notice & Announcements</h2>

      {/* Filters */}
      <div className="filter-buttons">
        {filterOptions.map((aud) => (
          <button
            key={aud}
            onClick={() => setFilterAudience(aud)}
            className={`filter-btn ${filterAudience === aud ? "active" : ""}`}
          >
            {aud === "Student"
              ? "Students"
              : aud === "Teacher"
              ? "Teachers"
              : aud}
          </button>
        ))}
      </div>

      {/* Edit Form */}
      {editingNotice && (
        <form onSubmit={handleUpdate} className="form-card">
          <h3>Edit Notice</h3>
          <div className="form-group">
          <label>Title</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          </div>
          <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          </div>
          <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="Notice">Notice</option>
            <option value="Announcement">Announcement</option>
            <option value="Lost & Found">Lost & Found</option>
          </select>
          </div>
          <div className="form-group">
          <label>Permission</label>
          <select
            value={formData.permission}
            onChange={(e) =>
              setFormData({ ...formData, permission: e.target.value })
            }
          >
            <option value="Both">Both</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn-save">Update</button>
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notices Display */}
      <div className="notices-grid">
        {filteredNotices.length === 0 ? (
          <p className="no-notices-msg">
            No notices found for selected audience.
          </p>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <div>
                <h3 className="notice-title">{notice.title}</h3>
                <p className="notice-content">{notice.description}</p>
                <p className="notice-date">
                  {notice.created_at
                    ? new Date(notice.created_at).toLocaleDateString()
                    : "No date"}
                </p>
              </div>
              <button
                className={`notice-type-btn ${
                  notice.category === "Notice"
                    ? "notice"
                    : notice.category === "Announcement"
                    ? "announcement"
                    : "other"
                }`}
                disabled
              >
                {notice.category}
              </button>
              <div className="notice-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(notice)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(notice.id)}
                >
                  🗑 Delete
                </button>
              </div>
            
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeDashboard;
