import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick"; // Importing React Slick
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 
import "./Home.css"; // Importing CSS file

const Home = () => {
  const navigate = useNavigate();

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <button className="nav-btn">Home</button>
        <div className="nav-buttons">
          <button className="nav-btn">Sign In</button>
          <button className="nav-btn" onClick={() => navigate("/register/student")}>Register as Student</button>
          <button className="nav-btn" onClick={() => navigate("/register/teacher")}>Register as Teacher</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="overlay">
          <h1>EduMentor</h1>
        </div>
      </section>

      {/* Feature Slider Section */}
      <div className="slider-container">
        <h2>Our Features</h2>
        <Slider {...sliderSettings}>
          <div className="slide feature-slide">
            <h3>📊 Student Performance Analytics</h3>
            <p>Analyze student progress with visual reports and charts to identify learning gaps.</p>
          </div>
          <div className="slide feature-slide">
            <h3>📂 Student Information Management</h3>
            <p>Store and manage academic records, ensuring secure and efficient data access.</p>
          </div>
          <div className="slide feature-slide">
            <h3>📚 Pre-Exam Preparation</h3>
            <p>Access past papers, model exams, and participate in Q&A forums for better preparation.</p>
          </div>
          <div className="slide feature-slide">
            <h3>🔍 Identify Support Needs</h3>
            <p>Monitor and recommend students requiring additional academic support.</p>
          </div>
          <div className="slide feature-slide">
            <h3>👨‍🏫 Teacher Mobility Monitoring</h3>
            <p>Track upcoming retirements and automate hiring processes for seamless academic continuity.</p>
          </div>
          <div className="slide feature-slide">
            <h3>📅 Leave Approval Management</h3>
            <p>Digitized leave approval system for teachers, ensuring smooth workflow management.</p>
          </div>
          <div className="slide feature-slide">
            <h3>📢 Announcement & Event Management</h3>
            <p>Enhance school communication and event planning for parents and teachers.</p>
          </div>
          <div className="slide feature-slide">
            <h3>⚙️ Optimize Staffing & Resources</h3>
            <p>Improve administrative efficiency with optimized staffing and resource distribution.</p>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default Home;
