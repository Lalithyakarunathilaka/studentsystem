import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./StudentAnalysis.css";

const CLASS_COLORS = {
  "A": "rgba(255, 99, 132, 1)", 
  "B": "rgba(54, 162, 235, 1)", 
  "C": "rgba(75, 192, 192, 1)", 
};

const StudentAnalysis = () => {
  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(6);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClass, setSelectedClass] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5001/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data); // keep all grades, not just grade 6
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter students by grade first
  const gradeStudents = students.filter((s) => s.grade === selectedGrade);

  // Then filter by class if not "All"
  const filteredStudents =
    selectedClass === "All"
      ? gradeStudents
      : gradeStudents.filter((s) => s.className === `${selectedGrade}-${selectedClass}`);

  const studentNames = filteredStudents.map((s) => s.name);

  // Build dataset per class
  const classData = { A: [], B: [], C: [] };

  filteredStudents.forEach((student) => {
    const subjectMarks = student.marks.find(
      (m) => m.subject === selectedSubject && m.term === selectedTerm
    );

    // Extract class letter (A, B, C)
    const classLetter = student.className.split("-")[1];

    classData[classLetter].push({
      name: student.name,
      mark: subjectMarks ? subjectMarks.mark : 0,
    });
  });

  const chartData = {
    labels: studentNames,
    datasets: Object.keys(CLASS_COLORS)
      .filter(
        (classLetter) => selectedClass === "All" || classLetter === selectedClass
      )
      .map((classLetter) => ({
        label: `Grade ${selectedGrade}-${classLetter} - ${selectedSubject} (${selectedTerm})`,
        data: filteredStudents.map((s) => {
          const markData = classData[classLetter].find(
            (student) => student.name === s.name
          );
          return markData ? markData.mark : 0;
        }),
        borderColor: CLASS_COLORS[classLetter],
        backgroundColor: CLASS_COLORS[classLetter].replace("1)", "0.5)"),
      })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    scales: {
      x: {
        stacked: true,
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 20 },
      },
      y: {
        beginAtZero: true,
        stacked: true,
        title: { display: true, text: "Marks" },
      },
    },
  };

  return (
    <div className="analysis-container">
      <h2>Grade {selectedGrade} Class Performance Analysis</h2>

      <div className="filters">
        {/* Subject Filter */}
        <label>Filter by Subject:</label>
        <select
          onChange={(e) => setSelectedSubject(e.target.value)}
          value={selectedSubject}
        >
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
        </select>

        {/* Term Filter */}
        <label>Filter by Term:</label>
        <select
          onChange={(e) => setSelectedTerm(e.target.value)}
          value={selectedTerm}
        >
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
        </select>

        {/* Grade Filter */}
        <label>Filter by Grade:</label>
        <select
          onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
          value={selectedGrade}
        >
          {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
        </select>

        {/* Class Filter */}
        <label>Filter by Class:</label>
        <select
          onChange={(e) => setSelectedClass(e.target.value)}
          value={selectedClass}
        >
          <option value="All">All</option>
          <option value="A">{selectedGrade}-A</option>
          <option value="B">{selectedGrade}-B</option>
          <option value="C">{selectedGrade}-C</option>
        </select>
      </div>

      <div className="chart-card">
        <h3>
          {selectedSubject} - {selectedTerm} Performance (
          {selectedClass === "All"
            ? `Grade ${selectedGrade} All Classes`
            : `Grade ${selectedGrade}-${selectedClass}`}
          )
        </h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StudentAnalysis;
