// import React, { useState } from "react";
// import "./TeacherRegisterPage.css";

// const TeacherRegisterPage = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     dob: "",
//     dateOfJoining: "",
//     position: "",
//     currentLocation: "",
//     preferredLocation: "",
//     gender: "", // Added gender selection
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Teacher Registration Successful:", formData);
//   };

//   return (
//     <div className="register-container">
//       {/* Left Section */}
//       <div className="register-left">
//         <img
//           src="/images/teacher.jpg"
//           alt="Teacher Registration"
//           className="background-image"
//         />
//       </div>

//       {/* Right Section */}
//       <div className="register-right">
//         <div className="register-form minimized-form">
//           <h2>Teacher Registration</h2>
//           <form onSubmit={handleSubmit}>
//             {/* Name */}
//             <div className="form-group">
//               <label>Name:</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Full name"
//                 required
//               />
//             </div>

//             {/* Date of Birth */}
//             <div className="form-group">
//               <label>Date of Birth:</label>
//               <input
//                 type="date"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             {/* Date of Joining */}
//             <div className="form-group">
//               <label>Date of Joining:</label>
//               <input
//                 type="date"
//                 name="dateOfJoining"
//                 value={formData.dateOfJoining}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             {/* Assigned Class */}
//             <div className="form-group">
//               <label>Assigned Class:</label>
//               <input
//                 type="text"
//                 name="position"
//                 value={formData.position}
//                 onChange={handleChange}
//                 placeholder="Assigned class"
//                 required
//               />
//             </div>

//             {/* Current Location */}
//             <div className="form-group">
//               <label>Current Location:</label>
//               <input
//                 type="text"
//                 name="currentLocation"
//                 value={formData.currentLocation}
//                 onChange={handleChange}
//                 placeholder="Current location"
//                 required
//               />
//             </div>

//             {/* Other working institutes */}
//             <div className="form-group">
//               <label>Other working institutes:</label>
//               <input
//                 type="text"
//                 name="preferredLocation"
//                 value={formData.preferredLocation}
//                 onChange={handleChange}
//                 placeholder="Other institutes"
//               />
//             </div>

//             {/* Gender Selection */}
//             <div className="form-group gender-container">
//               <label>Gender:</label>
//               <div className="gender-selection">
//                 <label>
//                   <input
//                     type="radio"
//                     name="gender"
//                     value="Male"
//                     checked={formData.gender === "Male"}
//                     onChange={handleChange}
//                   />
//                   Male
//                 </label>
//                 <label>
//                   <input
//                     type="radio"
//                     name="gender"
//                     value="Female"
//                     checked={formData.gender === "Female"}
//                     onChange={handleChange}
//                   />
//                   Female
//                 </label>
//               </div>
//             </div>

//             {/* Register Button */}
//             <button type="submit" className="register-btn">
//               Register
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherRegisterPage;


import React, { useState } from "react";
import "./TeacherRegisterPage.css";
import teacherImage from "../../assets/teacher.jpg";

const TeacherRegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please enter both email and password.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5001/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("teacherToken", data.token);
        window.location.href = "/teacher/dashboard";
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to connect to server. Please try again later.");
    }
  };
  

  return (
    <div className="register-container">
      <div className="teacher-login-left">
        <img src={teacherImage} alt="Teacher" className="teacher-image" 
        width={800}/>
      </div>

      {/* Right Section */}
      <div className="register-right">
        <div className="register-form">
          <h2>Teacher Login</h2>
          <br></br>
          <p>Welcome back! Please enter your credentials to continue.</p>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="register-btn">
              Login
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default TeacherRegisterPage;
