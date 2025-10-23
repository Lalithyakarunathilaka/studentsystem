import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./PerformanceAnalysis.css";

const CLASS_COLORS = {
  A: "rgba(255, 99, 132, 1)",
  B: "rgba(54, 162, 235, 1)",
  C: "rgba(75, 192, 192, 1)",
};

const CORE_SUBJECTS = ["Mathematics", "Science", "English"];

const PerformanceAnalysis = () => {
  const [students, setStudents] = useState([]);
  const [studentsAllSubjects, setStudentsAllSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(10);
  const [selectedSubjectName, setSelectedSubjectName] = useState("Mathematics");
  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const [selectedClass, setSelectedClass] = useState("All");
  const [loading, setLoading] = useState(false);
  const [loadingAvg, setLoadingAvg] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // chart refs for exporting images
  const studentChartRef = useRef(null);
  const avgChartRef = useRef(null);

  // 1) Load all subjects once
  useEffect(() => {
    setLoadingSubjects(true);
    fetch("http://localhost:5001/api/subjects/get-subjects")
      .then((r) => r.json())
      .then((rows) => setSubjects(Array.isArray(rows) ? rows : []))
      .catch((e) => {
        console.error("Error fetching subjects:", e);
        setSubjects([]);
      })
      .finally(() => setLoadingSubjects(false));
  }, []);

  // Resolve subject_id for the selected name/grade
  const resolvedSubjectId = useMemo(() => {
    if (!selectedSubjectName) return null;
    const exact = subjects.find(
      (s) =>
        String(s.name).toLowerCase() === selectedSubjectName.toLowerCase() &&
        Number(s.grade) === Number(selectedGrade)
    );
    if (exact) return exact.id;

    const any = subjects.find(
      (s) => String(s.name).toLowerCase() === selectedSubjectName.toLowerCase()
    );
    return any ? any.id : null;
  }, [subjects, selectedSubjectName, selectedGrade]);

  const buildQS = (opts) => {
    const params = {
      grade: opts.grade ? String(opts.grade) : "",
      class: opts.classLetter === "All" ? "" : opts.classLetter,
      term: opts.term || "",
      academic_year: "2024-2025",
    };
    if (opts.subjectId) params.subject_id = String(opts.subjectId);
    if (opts.subjectName) params.subject = opts.subjectName;
    return new URLSearchParams(params).toString();
  };

  // 2) Fetch data for the per-student chart (subject-focused)
  useEffect(() => {
    if (loadingSubjects) return;
    const qs = buildQS({
      grade: selectedGrade,
      classLetter: selectedClass,
      term: selectedTerm,
      subjectId: resolvedSubjectId || undefined,
      subjectName: !resolvedSubjectId ? selectedSubjectName : undefined,
    });

    setLoading(true);
    fetch(`http://localhost:5001/api/overall/students?${qs}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data);
        else if (data && Array.isArray(data.students)) setStudents(data.students);
        else setStudents([]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [
    selectedGrade,
    selectedSubjectName,
    selectedTerm,
    selectedClass,
    resolvedSubjectId,
    loadingSubjects,
  ]);

  // 3) Fetch data for the averages chart (no subject filter)
  useEffect(() => {
    if (loadingSubjects) return;
    const qs = buildQS({
      grade: selectedGrade,
      classLetter: selectedClass,
      term: selectedTerm,
    });

    setLoadingAvg(true);
    fetch(`http://localhost:5001/api/overall/students?${qs}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudentsAllSubjects(data);
        else if (data && Array.isArray(data.students)) setStudentsAllSubjects(data.students);
        else setStudentsAllSubjects([]);
      })
      .catch((error) => {
        console.error("Error fetching averages dataset:", error);
        setStudentsAllSubjects([]);
      })
      .finally(() => setLoadingAvg(false));
  }, [selectedGrade, selectedTerm, selectedClass, loadingSubjects]);

  // 4) Derived data for subject-focused chart
  const {
    filteredStudents,
    studentNames,
    classData,
    hasAnyValue,
  } = useMemo(() => {
    const safe = Array.isArray(students) ? students : [];
    const gradeStudents =
      selectedGrade != null
        ? safe.filter((s) => Number(s.grade) === Number(selectedGrade))
        : safe;

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
    const cd = { A: [], B: [], C: [] };

    filtered.forEach((student) => {
      const marksArr = Array.isArray(student.marks) ? student.marks : [];
      const subjectMarks = resolvedSubjectId
        ? marksArr.find(
            (m) =>
              Number(m?.subject_id) === Number(resolvedSubjectId) &&
              m?.term === selectedTerm
          )
        : marksArr.find(
            (m) =>
              String(m?.subject).toLowerCase() ===
                selectedSubjectName.toLowerCase() &&
              m?.term === selectedTerm
          );

      const cls = String(student?.className || "").split("-")[1]?.toUpperCase();
      if (cls && cd[cls]) {
        cd[cls].push({
          name: student?.name ?? "",
          mark: subjectMarks ? Number(subjectMarks.mark) : 0,
        });
      }
    });

    const any =
      cd.A.some((x) => x.mark > 0) ||
      cd.B.some((x) => x.mark > 0) ||
      cd.C.some((x) => x.mark > 0);

    return { filteredStudents: filtered, studentNames: names, classData: cd, hasAnyValue: any };
  }, [
    students,
    selectedGrade,
    selectedClass,
    selectedTerm,
    selectedSubjectName,
    resolvedSubjectId,
  ]);

  // 5) Subject-focused chart config
  const chartData = useMemo(() => {
    const datasets = Object.keys(CLASS_COLORS)
      .filter((classLetter) => selectedClass === "All" || classLetter === selectedClass)
      .map((classLetter) => {
        const data = filteredStudents.map((s) => {
          const found = classData[classLetter].find((st) => st.name === s.name);
          return found ? found.mark : 0;
        });
        return {
          label: `Grade ${selectedGrade}-${classLetter} • ${selectedSubjectName} (${selectedTerm})`,
          data,
          borderColor: CLASS_COLORS[classLetter],
          backgroundColor: CLASS_COLORS[classLetter].replace("1)", "0.5)"),
        };
      });

    return { labels: studentNames, datasets };
  }, [
    filteredStudents,
    classData,
    studentNames,
    selectedClass,
    selectedGrade,
    selectedSubjectName,
    selectedTerm,
  ]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "x",
      scales: {
        x: { stacked: true, ticks: { autoSkip: false, maxRotation: 45, minRotation: 20 } },
        y: { beginAtZero: true, stacked: true, title: { display: true, text: "Marks" }, suggestedMax: 100 },
      },
      plugins: { tooltip: { mode: "index", intersect: false }, legend: { position: "top" } },
    }),
    []
  );

  // 6) Averages chart config
  const classAveragesChart = useMemo(() => {
    const safe = Array.isArray(studentsAllSubjects) ? studentsAllSubjects : [];
    const gradeStudents =
      selectedGrade != null
        ? safe.filter((s) => Number(s.grade) === Number(selectedGrade))
        : safe;

    const pool =
      selectedClass === "All"
        ? gradeStudents
        : gradeStudents.filter(
            (s) => String(s.className).toUpperCase() === `${selectedGrade}-${selectedClass}`.toUpperCase()
          );

    const bucket = {
      A: { Mathematics: [], Science: [], English: [] },
      B: { Mathematics: [], Science: [], English: [] },
      C: { Mathematics: [], Science: [], English: [] },
    };

    pool.forEach((student) => {
      const cls = String(student.className || "").split("-")[1]?.toUpperCase();
      if (!bucket[cls]) return;
      const marksArr = Array.isArray(student.marks) ? student.marks : [];
      const termMarks = marksArr.filter((m) => m?.term === selectedTerm);

      CORE_SUBJECTS.forEach((subName) => {
        const m = termMarks.find(
          (x) => String(x.subject).toLowerCase() === subName.toLowerCase()
        );
        if (m && m.mark != null) bucket[cls][subName].push(Number(m.mark));
      });
    });

    const avg = (arr) =>
      arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

    const labels = CORE_SUBJECTS;
    const classesToShow = selectedClass === "All" ? ["A", "B", "C"] : [selectedClass];

    const datasets = classesToShow.map((cls) => ({
      label: `Grade ${selectedGrade}-${cls} • Avg (${selectedTerm})`,
      data: labels.map((sub) => avg(bucket[cls]?.[sub] || [])),
      borderColor: CLASS_COLORS[cls],
      backgroundColor: CLASS_COLORS[cls].replace("1)", "0.5)"),
    }));

    return {
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "x",
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Average Marks" }, suggestedMax: 100 },
        },
        plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
      },
    };
  }, [studentsAllSubjects, selectedGrade, selectedClass, selectedTerm]);

  // 7) Report actions
  const handlePrint = () => {
    window.print();
  };

  const downloadCanvas = (chartRef, filename) => {
    const chart = chartRef.current;
    if (!chart) return;
    // react-chartjs-2 exposes the Chart instance at .canvas via ref in v5
    const canvas = chart.canvas || chart.ctx?.canvas;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleDownloadCharts = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCanvas(
      studentChartRef,
      `Students_${selectedGrade}-${selectedClass}_${selectedSubjectName}_${selectedTerm}_${stamp}.png`
    );
    downloadCanvas(
      avgChartRef,
      `ClassAverages_${selectedGrade}-${selectedClass}_${selectedTerm}_${stamp}.png`
    );
  };

  return (
    <div className="analysis-container">
      {/* Report header + actions */}
      <div className="report-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>
          Grade {selectedGrade} — Performance Analysis
        </h2>
        <div className="no-print" style={{ display: "flex", gap: 8 }}>
          <button onClick={handlePrint} className="btn btn-outline-secondary">Print report</button>
          <button onClick={handleDownloadCharts} className="btn btn-primary">Download charts (PNG)</button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#666", marginTop: 6, marginBottom: 12 }}>
        Term: <b>{selectedTerm}</b> • Class: <b>{selectedClass === "All" ? "All (A/B/C)" : `${selectedGrade}-${selectedClass}`}</b> • Subject: <b>{selectedSubjectName}</b> • AY: <b>2024-2025</b>
      </div>

      {/* Filters */}
      <div className="filters no-print">
        <label>Filter by Subject:</label>
        <select
          onChange={(e) => setSelectedSubjectName(e.target.value)}
          value={selectedSubjectName}
          disabled={loadingSubjects}
        >
          {CORE_SUBJECTS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <label>Filter by Term:</label>
        <select onChange={(e) => setSelectedTerm(e.target.value)} value={selectedTerm}>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>

        <label>Filter by Grade:</label>
        <select onChange={(e) => setSelectedGrade(Number(e.target.value))} value={selectedGrade}>
          {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
        </select>

        <label>Filter by Class:</label>
        <select onChange={(e) => setSelectedClass(e.target.value)} value={selectedClass}>
          <option value="All">All</option>
          <option value="A">{selectedGrade}-A</option>
          <option value="B">{selectedGrade}-B</option>
          <option value="C">{selectedGrade}-C</option>
        </select>
      </div>

      {/* Chart 1: Per-student */}
      <div className="chart-card">
        <h3>
          {selectedSubjectName} — {selectedTerm} (
          {selectedClass === "All"
            ? `Grade ${selectedGrade} • All Classes`
            : `Grade ${selectedGrade}-${selectedClass}`}
          )
        </h3>

        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : studentNames.length === 0 ? (
          <div style={{ padding: 16 }}>No students found for the selected filters.</div>
        ) : !hasAnyValue ? (
          <div style={{ padding: 16 }}>
            No marks recorded for <b>{selectedSubjectName}</b> in <b>{selectedTerm}</b> (AY <b>2024-2025</b>).
          </div>
        ) : (
          <div style={{ height: 420 }}>
            <Bar ref={studentChartRef} data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Chart 2: Class averages */}
      <div className="chart-card" style={{ marginTop: 24 }}>
        <h3>
          Class Averages — {selectedTerm} (
          {selectedClass === "All"
            ? `Grade ${selectedGrade} • A / B / C`
            : `Grade ${selectedGrade}-${selectedClass}`}
          )
        </h3>

        {loadingAvg ? (
          <div style={{ padding: 16 }}>Loading averages…</div>
        ) : (
          <div style={{ height: 360 }}>
            <Bar ref={avgChartRef} data={classAveragesChart.data} options={classAveragesChart.options} />
          </div>
        )}
      </div>

      {/* Print styles: hide buttons/filters when printing */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .analysis-container {
              padding: 0 !important;
            }
            .chart-card {
              page-break-inside: avoid;
              border: none !important;
              box-shadow: none !important;
            }
            h2, h3 {
              color: #000 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PerformanceAnalysis;
