import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddSubjects = () => {
  const navigate = useNavigate();

  const [subjectName, setSubjectName] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loader, setLoader] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const grades = Array.from({ length: 13 }, (_, i) => i + 1); // 1-13

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/subjects/get-subjects");
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setSubjectName("");
    setGrade("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    const url = editingId
      ? `http://localhost:5001/api/subjects/update-subject/${editingId}`
      : "http://localhost:5001/api/subjects/add-subject";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subjectName, grade }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(editingId ? "Subject updated!" : "Subject added!");
        resetForm();
        fetchSubjects();
      } else {
        alert(data.error || "Failed to process subject");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoader(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setSubjectName(subject.name);
    setGrade(subject.grade);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(
        `http://localhost:5001/api/subjects/delete-subject/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        alert("Deleted successfully!");
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-start align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "30px" }}
    >
      {/* Add / Edit Form */}
      <div className="p-4 bg-white shadow rounded mb-4" style={{ width: "500px" }}>
        <h2 className="text-center mb-4">
          {editingId ? "Edit Subject" : "Add Subject"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Subject Name</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label>Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select grade</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loader}
          >
            {loader
              ? editingId
                ? "Updating..."
                : "Adding..."
              : editingId
              ? "Update"
              : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary w-100 mt-2"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Subjects List BELOW the form */}
      <div className="p-4 bg-white shadow rounded" style={{ width: "700px" }}>
        <h3 className="mb-3">Subjects List</h3>
        {subjects.length === 0 ? (
          <p>No subjects yet</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj) => (
                <tr key={subj.id}>
                  <td>{subj.name}</td>
                  <td>{subj.grade}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => handleEdit(subj)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(subj.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddSubjects;
