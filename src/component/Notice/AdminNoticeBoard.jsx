import React, { useState, useEffect } from "react";
import "./Notices.css";  // Assuming you have some CSS styles for this component

const AdminNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [newNotice, setNewNotice] = useState({ title: "", description: "", category: "" });

  useEffect(() => {
    fetch("http://localhost:5001/api/notices")
      .then((response) => response.json())
      .then((data) => setNotices(data))
      .catch((error) => console.error("Error fetching notices:", error));
  }, []);

  const handleInputChange = (e) => {
    setNewNotice({ ...newNotice, [e.target.name]: e.target.value });
  };

  const addNotice = async () => {
    if (newNotice.title && newNotice.description && newNotice.category) {
      try {
        const response = await fetch("http://localhost:5001/api/addNotice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNotice),
        });
        const data = await response.json();
        setNotices([...notices, { ...newNotice, id: data.notice.id, date: new Date().toISOString() }]);
        setNewNotice({ title: "", description: "", category: "" });
      } catch (error) {
        console.error("Error adding notice:", error);
      }
    }
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Post New Notice</h2>
        <div className="flex flex-col gap-4">
          <label className="font-semibold">Notice Title:</label>
          <input type="text" name="title" value={newNotice.title} onChange={handleInputChange} placeholder="Type Title Here" className="w-full p-2 border rounded" />
          <label className="font-semibold">Notice Description:</label>
          <textarea name="description" value={newNotice.description} onChange={handleInputChange} placeholder="Type Description Here" className="w-full p-2 border rounded"></textarea>
          <label className="font-semibold">Select Category:</label>
          <select name="category" value={newNotice.category} onChange={handleInputChange} className="w-full p-2 border rounded">
            <option value="">Select Category</option>
            <option value="Notice">Notice</option>
            <option value="Announcement">Announcement</option>
            <option value="Lost & Found">Lost & Found</option>
          </select>
          <button onClick={addNotice} className="bg-blue-500 text-white px-4 py-2 rounded">Post</button>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticeBoard;
