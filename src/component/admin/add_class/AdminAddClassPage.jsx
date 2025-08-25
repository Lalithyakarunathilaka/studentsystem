import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./AdminAddClassPage.css";
import classroomImage from "../../../assets/admin-login.png"; 

const AdminAddClassPage = () => {
  const navigate = useNavigate();

  const [className, setClassName] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await fetch("http://localhost:5001/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Class created successfully!");
        navigate("/admin/classes");
      } else {
        alert(data.error || "Failed to create class");
      }
    } catch (error) {
      alert("Error connecting to server. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="admin-register-page d-flex flex-row min-vh-100">
      {/* Left - Form */}
      <div className="admin-register-left">
        <div className="admin-login-form">
          <h2 className="mb-3">Create Class</h2>
          <p>Enter details to add a new class.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group mb-3">
              <label>Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="form-control"
                placeholder="Enter class name"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loader}>
              {loader ? "Creating..." : "Create Class"}
            </button>
            <br /><br />

            <div className="text-end mt-3">
              <small>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </button>
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Right - Image */}
      <div className="admin-register-right">
        <img src={classroomImage} alt="Classroom" className="admin-image" />
      </div>
    </div>
  );
};

export default AdminAddClassPage;
