import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminClassListPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/classes/get-all");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError("Error loading classes. Try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg p-4 mt-5"
        style={{ maxWidth: "800px", width: "100%", borderRadius: "12px" }}
      >
        {/* Header */}
        <h2
          className="text-center mb-3"
          style={{ color: "rgba(17, 41, 77, 1)", fontWeight: "bold" }}
        >
          All Classes
        </h2>
        <p className="text-center text-muted mb-4">
          View all classes currently available in the system.
        </p>

        {/* <div className="d-flex justify-content-end mb-3 align-items-center">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/add-class")}
          >
            Add New Class
          </button>
        </div> */}

        {/* Loading / Error */}
        {loading && <p className="text-center">Loading classes...</p>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* No Data */}
        {!loading && classes.length === 0 && (
          <p className="text-center text-muted">No classes have been created yet.</p>
        )}

        {/* Data Table */}
        {!loading && classes.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover text-center align-middle">
              <thead style={{ backgroundColor: "rgba(17, 41, 77, 1)", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Class Name</th>
                  <th>Class Teacher</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, index) => (
                  <tr key={cls.id || index}>
                    <td>{index + 1}</td>
                    <td>{cls.name}</td>
                    <td>{cls.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-3">
          <button className="btn btn-link" onClick={() => navigate(-1)}>
            ⬅ Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminClassListPage;
