import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddSubjects = () => {
  const navigate = useNavigate();

  const [subjectName, setSubjectName] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState([]); // All subjects from DB
  const [loader, setLoader] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const grades = Array.from({ length: 13 }, (_, i) => i + 1); // Grades 1-13

  // Fetch all subjects once
  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/subjects/get-subjects");
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      setSubjects(data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
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

  // Submit logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    const cleanName = subjectName.trim().replace(/\s+/g, " ");

    // Check for duplicates (same name + grade)
    const exists = subjects.some(
      (s) =>
        s.name.toLowerCase() === cleanName.toLowerCase() &&
        String(s.grade) === String(grade)
    );

    if (exists && !editingId) {
      alert("This subject already exists for the selected grade!");
      setLoader(false);
      return;
    }

    const url = editingId
      ? `http://localhost:5001/api/subjects/update-subject/${editingId}`
      : "http://localhost:5001/api/subjects/add-subject";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, grade }),
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
      console.error("Error adding/updating subject:", err);
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
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // Unique subject names for datalist
  const uniqueNames = Array.from(new Set(subjects.map((s) => s.name.trim()))).sort();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto",padding: "20px 16px 40px",}}>
      {/* Top: Form card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 50,
          boxShadow: "0 1px 2px rgba(16,24,40,.06)",
          marginBottom: 28,
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>
          {editingId ? "Edit Subject" : "Create Subjects"}
        </h2>
        <p style={{ margin: "0 0 16px", color: "#6b7280" }}>
          Enter details to add a new subject or assign it to another grade.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Subject Field */}
          <div className="form-group mb-3" style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Subject Name
            </label>
            <input
              list="subject-options"
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value.replace(/\s+/g, " "))}
              className="form-control"
              placeholder="Type or select a subject"
              required
            />
            <datalist id="subject-options">
              {uniqueNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          {/* Grade Selector */}
          <div className="form-group mb-3" style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select grade</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <button type="submit" className="btn btn-primary w-100" disabled={loader}>
            {loader ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
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

      {/* Bottom: Subjects List card */}
      
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 1px 2px rgba(16,24,40,.06)",
        }}
      >
        <h3 className="mb-3" style={{ marginTop: 0 }}>
          Subjects List
        </h3>

        {subjects.length === 0 ? (
          <p style={{ margin: 0 }}>No subjects yet</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th style={{ width: 150 }}>Actions</th>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSubjects;
