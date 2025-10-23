import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./StudentAnalysis.css";

const CLASS_COLORS = {
  A: "rgba(255, 99, 132, 1)",
  B: "rgba(54, 162, 235, 1)",
  C: "rgba(75, 192, 192, 1)",
};

const StudentAnalysis = () => {
  // sensible defaults so first render works
  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(10); // initialize to a valid grade (change if needed)
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedTerm, setSelectedTerm] = useState("First Term"); // must match DB enum
  const [selectedClass, setSelectedClass] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams({
      grade: selectedGrade ? String(selectedGrade) : "",
      class: selectedClass === "All" ? "" : selectedClass,
      subject: selectedSubject || "",
      term: selectedTerm || "",
      academic_year: "2024-2025",
    });

    setLoading(true);
    fetch(`http://localhost:5001/api/overall/students?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // normalize to array
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (data && Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          setStudents([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [selectedGrade, selectedSubject, selectedTerm, selectedClass]);

  // --- derived data with guards ---
  const { filteredStudents, studentNames, classData } = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];

    // if grade is unset, skip grade filtering
    const gradeStudents =
      selectedGrade != null
        ? safeStudents.filter((s) => Number(s.grade) === Number(selectedGrade))
        : safeStudents;

    const filtered =
      selectedClass === "All"
        ? gradeStudents
        : gradeStudents.filter(
            (s) =>
              s?.className &&
              `${selectedGrade}-${selectedClass}`.toUpperCase() ===
                String(s.className).toUpperCase()
          );

    const names = filtered.map((s) => s?.name ?? "");

    // Build dataset per class
    const cd = { A: [], B: [], C: [] };

    filtered.forEach((student) => {
      const marksArr = Array.isArray(student.marks) ? student.marks : [];
      const subjectMarks = marksArr.find(
        (m) =>
          m?.subject === selectedSubject &&
          // DB has enums like "First Term" / "Second Term" / "Third Term"
          m?.term === selectedTerm
      );

      const cls = String(student?.className || "")
        .split("-")[1]
        ?.toUpperCase();
      if (cls && cd[cls]) {
        cd[cls].push({
          name: student?.name ?? "",
          mark: subjectMarks ? Number(subjectMarks.mark) : 0,
        });
      }
    });

    return { filteredStudents: filtered, studentNames: names, classData: cd };
  }, [students, selectedGrade, selectedClass, selectedSubject, selectedTerm]);

  // chart data/options
  const chartData = useMemo(() => {
    const datasets = Object.keys(CLASS_COLORS)
      .filter(
        (classLetter) =>
          selectedClass === "All" || classLetter === selectedClass
      )
      .map((classLetter) => {
        // map students to marks for this class letter
        const data = filteredStudents.map((s) => {
          const found = classData[classLetter].find((st) => st.name === s.name);
          return found ? found.mark : 0;
        });
        return {
          label: `Grade ${selectedGrade}-${classLetter} • ${selectedSubject} (${selectedTerm})`,
          data,
          borderColor: CLASS_COLORS[classLetter],
          backgroundColor: CLASS_COLORS[classLetter].replace("1)", "0.5)"),
        };
      });

    return {
      labels: studentNames,
      datasets,
    };
  }, [
    filteredStudents,
    classData,
    studentNames,
    selectedClass,
    selectedGrade,
    selectedSubject,
    selectedTerm,
  ]);

  const chartOptions = useMemo(
    () => ({
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
          suggestedMax: 100,
        },
      },
      plugins: {
        tooltip: { mode: "index", intersect: false },
        legend: { position: "top" },
      },
    }),
    []
  );

  return (
    <div className="analysis-container">
      <h2>Grade {selectedGrade} Class Performance Analysis</h2>

      <div className="filters">
        {/* Subject Filter */}
        {/* Subject Filter */}
        <label>Filter by Subject:</label>
        <select
          onChange={(e) => setSelectedSubject(e.target.value)}
          value={selectedSubject}
        >
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
        </select>

        {/* Term Filter (must match DB enum) */}
        <label>Filter by Term:</label>
        <select
          onChange={(e) => setSelectedTerm(e.target.value)}
          value={selectedTerm}
        >
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>

        {/* Grade Filter */}
        <label>Filter by Grade:</label>
        <select
          onChange={(e) => setSelectedGrade(Number(e.target.value))}
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
          {selectedSubject} — {selectedTerm} Performance (
          {selectedClass === "All"
            ? `Grade ${selectedGrade} • All Classes`
            : `Grade ${selectedGrade}-${selectedClass}`}
          )
        </h3>

        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : studentNames.length === 0 ? (
          <div style={{ padding: 16 }}>
            No students found for the selected filters.
          </div>
        ) : (
          <div style={{ height: 420 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalysis;
