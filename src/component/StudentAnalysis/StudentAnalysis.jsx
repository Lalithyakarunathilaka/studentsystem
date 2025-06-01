import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./StudentAnalysis.css";

const CLASS_COLORS = {
  "6-A": "rgba(255, 99, 132, 1)", // Red
  "6-B": "rgba(54, 162, 235, 1)", // Blue
  "6-C": "rgba(75, 192, 192, 1)", // Green
};

const StudentAnalysis = () => {
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  useEffect(() => {
    fetch("http://localhost:5001/api/students")
      .then((res) => res.json())
      .then((data) => {
        const grade6Students = data
          .filter((s) => s.grade === 6)
          .map((student, index) => ({
            ...student,
            className: ["6-A", "6-B", "6-C"][index % 3], 
          }));

        setStudents(grade6Students);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const studentNames = students.map((s) => s.name);
  const classData = { "6-A": [], "6-B": [], "6-C": [] };

  students.forEach((student) => {
    const subjectMarks = student.marks.find(
      (m) => m.subject === selectedSubject && m.term === selectedTerm
    );

    classData[student.className].push({
      name: student.name,
      mark: subjectMarks ? subjectMarks.mark : 0, 
    });
  });

  const chartData = {
    labels: studentNames,
    datasets: Object.keys(classData).map((className) => ({
      label: `${className} - ${selectedSubject} (${selectedTerm})`,
      data: students.map((s) => {
        const markData = classData[className].find((student) => student.name === s.name);
        return markData ? markData.mark : 0; 
      }),
      borderColor: CLASS_COLORS[className],
      backgroundColor: CLASS_COLORS[className].replace("1)", "0.5)"), 
      fill: false,
      tension: 0.3,
    })),
  };
  

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x", 
    scales: {
      x: {
        stacked: true,
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 20,
        },
      },
      y: {
        beginAtZero: true,
        stacked: true, 
        title: {
          display: true,
          text: "Marks",
        },
      },
    },
  }

  return (
    <div className="analysis-container">
      <h1>Grade 6 Class Performance Analysis</h1>

      <div className="filters">
        <label>Filter by Subject:</label>
        <select onChange={(e) => setSelectedSubject(e.target.value)} value={selectedSubject}>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
        </select>

        <label>Filter by Term:</label>
        <select onChange={(e) => setSelectedTerm(e.target.value)} value={selectedTerm}>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
        </select>
      </div>

      <div className="chart-card">
        <h3>{selectedSubject} - {selectedTerm} Performance (Class-wise)</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StudentAnalysis;
