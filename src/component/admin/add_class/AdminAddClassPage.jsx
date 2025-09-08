import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classroomImage from "../../../assets/class.jpg"; 

const AdminAddClassPage = () => {
  const navigate = useNavigate();

  const [className, setClassName] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loader, setLoader] = useState(false);

  // Generate class list 1-A ... 13-C
  const generateClassList = () => {
    const classes = [];
    for (let grade = 1; grade <= 13; grade++) {
      ["A", "B", "C"].forEach(section => {
        classes.push(`${grade}-${section}`);
      });
    }
    return classes;
  };

  const classOptions = generateClassList();

  // Fetch teachers from backend
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/users/get?role=teacher");
        if (!response.ok) throw new Error("Failed to fetch teachers");
        const data = await response.json();
        setTeachers(data); 
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await fetch("http://localhost:5001/api/classes/add-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: className,
          teacherId: classTeacher
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Class created successfully!");
        navigate("/admin/get-class");
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
            
            {/* Class Name Selector */}
            <div className="form-group mb-3">
              <label>Class Name</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Select class</option>
                {classOptions.map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Teacher Selector */}
            <div className="form-group mb-3">
              <label>Class Teacher</label>
              <select
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
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
