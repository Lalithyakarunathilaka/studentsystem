import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

const TERM_ORDER = {
  "First Term": 1,
  "Second Term": 2,
  "Third Term": 3,
  "Term 1": 1,
  "Term 2": 2,
  "Term 3": 3,
};

const IndividualPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const student = useMemo(() => {
    try {
      const raw = localStorage.getItem("student") || sessionStorage.getItem("student");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);

        if (!student?.id) {
          setStatusMsg({
            type: "warning",
            text: "No student found in storage. Please sign in again.",
          });
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        const marksResponse = await axios.get(
          `http://localhost:5001/api/marks/student/${student.id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        let marksData = [];
        if (Array.isArray(marksResponse.data)) {
          marksData = marksResponse.data;
        } else if (marksResponse.data && typeof marksResponse.data === "object") {
          if (Array.isArray(marksResponse.data.data)) {
            marksData = marksResponse.data.data;
          } else if (Array.isArray(marksResponse.data.marks)) {
            marksData = marksResponse.data.marks;
          } else {
            marksData = [marksResponse.data];
          }
        }

        if (!marksData || marksData.length === 0) {
          setStatusMsg({ type: "warning", text: "No marks data found for this student." });
          setPerformanceData(null);
          setLoading(false);
          return;
        }

        const processedData = processPerformanceData(marksData, student);
        setPerformanceData(processedData);

        setStatusMsg({
          type: "success",
          text: `Performance analytics loaded for ${student.name || "Student"}`,
        });
      } catch (err) {
        setStatusMsg({
          type: "danger",
          text: err?.response?.data?.message || "Failed to load performance data.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (student) fetchPerformanceData();
    else setLoading(false);
  }, [student]);

  const renderSafeString = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const subjectLabelFrom = (mark) => {
    const label =
      mark.subject_name ||
      mark.subject ||
      mark.subjectLabel ||
      (mark.subject_id != null ? `Subject ${mark.subject_id}` : "Unknown Subject");
    return renderSafeString(label);
  };

  const calculateGrade = (marks) => {
    if (marks >= 90) return "A";
    if (marks >= 80) return "B+";
    if (marks >= 70) return "B";
    if (marks >= 60) return "C";
    if (marks >= 50) return "D";
    return "F";
  };

  const sortTerms = (a, b) => {
    const oa = TERM_ORDER[a] ?? 999;
    const ob = TERM_ORDER[b] ?? 999;
    if (oa !== ob) return oa - ob;
    return a.localeCompare(b);
  };

  const processPerformanceData = (marksData, student) => {
    if (!Array.isArray(marksData)) marksData = [];

    const validMarksData = marksData.filter((mark) => {
      if (!mark || typeof mark !== "object") return false;
      const hasSubject = mark.subject_name || mark.subject || mark.subject_id != null;
      const hasMarks = mark.marks != null || mark.markValue != null || mark.mark != null;
      const hasTerm = mark.term || mark.exam_name || mark.exam;
      return hasSubject && hasMarks && hasTerm;
    });

    if (validMarksData.length === 0) return null;

    const termsMap = {}; // term → { totalMarks, count, subjects: [...] }
    const subjectsMap = {}; // subject → { marksByTerm: [{term, marks}], ... }
    const allMarksArr = [];

    validMarksData.forEach((mark) => {
      const termKey = renderSafeString(mark.term || mark.exam_name || mark.exam || "Unknown Term");
      const subjectKey = subjectLabelFrom(mark);
      const markValue = Number(mark.marks ?? mark.markValue ?? mark.mark ?? 0);
      if (isNaN(markValue)) return;

      // Aggregate per term
      if (!termsMap[termKey]) {
        termsMap[termKey] = { term: termKey, totalMarks: 0, count: 0, subjects: [] };
      }
      termsMap[termKey].totalMarks += markValue;
      termsMap[termKey].count += 1;
      termsMap[termKey].subjects.push({ subject: subjectKey, marks: markValue, grade: calculateGrade(markValue) });

      // Aggregate per subject (and keep term-wise marks)
      if (!subjectsMap[subjectKey]) {
        subjectsMap[subjectKey] = { subject: subjectKey, marks: [], marksByTerm: [] };
      }
      subjectsMap[subjectKey].marks.push(markValue);
      subjectsMap[subjectKey].marksByTerm.push({ term: termKey, marks: markValue });

      allMarksArr.push(markValue);
    });

    // Compute averages
    const termList = Object.values(termsMap)
      .map((t) => ({
        term: t.term,
        totalMarks: t.totalMarks,
        count: t.count,
        average: t.count > 0 ? t.totalMarks / t.count : 0,
        subjects: t.subjects,
      }))
      .sort((a, b) => sortTerms(a.term, b.term));

    const subjectList = Object.values(subjectsMap).map((s) => {
      const marks = s.marks.filter((m) => !isNaN(m));
      const avg = marks.length ? marks.reduce((sum, m) => sum + m, 0) / marks.length : 0;
      const improvement = marks.length > 1 ? marks[marks.length - 1] - marks[0] : 0;
      return {
        subject: renderSafeString(s.subject),
        marks: marks.length ? marks[marks.length - 1] : 0,
        average: Math.round(avg),
        improvement: Math.round(improvement),
        grade: calculateGrade(avg),
        // keep all term-wise marks for subject trend
        marksByTerm: s.marksByTerm,
      };
    });

    const overallAverage = allMarksArr.length
      ? allMarksArr.reduce((sum, m) => sum + m, 0) / allMarksArr.length
      : 0;

    return {
      studentInfo: {
        name: renderSafeString(student?.name),
        id: renderSafeString(student?.id),
        class: renderSafeString(student?.className || student?.class),
        overallPercentage: Math.round(overallAverage),
        totalSubjects: subjectList.length,
        totalTerms: termList.length,
        totalMarks: allMarksArr.length,
      },
      subjectPerformance: subjectList,
      termTrends: termList, // renamed from examTrends → termTrends
      summary: {
        excellent: allMarksArr.filter((m) => m >= 75).length,
        good: allMarksArr.filter((m) => m >= 50 && m < 75).length,
        needImprovement: allMarksArr.filter((m) => m < 50).length,
        total: allMarksArr.length,
      },
    };
  };

  if (loading) {
    return (
      <Container fluid className="py-4 bg-light min-vh-100">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading performance analytics...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!performanceData) {
    return (
      <Container fluid className="py-4 bg-light min-vh-100">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              No performance data available. This student may not have any marks recorded yet.
            </Alert>
            <Button variant="primary" href="/student/dashboard" className="mt-3">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  const progressChartData = {
    labels: performanceData.termTrends.map((t) => t.term),
    datasets: [
      {
        label: "Average Performance",
        data: performanceData.termTrends.map((t) => Math.round(t.average)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Subject × Term trend (X = subjects, each line = a term)
  const orderedTerms = performanceData.termTrends.map((t) => t.term); // already sorted
  const subjectsAxis = performanceData.subjectPerformance.map((s) => s.subject);

  const subjectTrendChartData = {
    labels: subjectsAxis,
    datasets: orderedTerms.map((term, idx) => ({
      label: term,
      data: performanceData.subjectPerformance.map((subject) => {
        const entry = subject.marksByTerm?.find((m) => m.term === term);
        return entry ? entry.marks : null; // null = gap in line for missing data
      }),
      fill: false,
      borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
      tension: 0,
      spanGaps: false,
    })),
  };

  const gradeDistributionData = {
    labels: ["Excellent (≥75)", "Good (50-74)", "Needs Improvement (<50)"],
    datasets: [
      {
        data: [
          performanceData.summary.excellent || 0,
          performanceData.summary.good || 0,
          performanceData.summary.needImprovement || 0,
        ],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  const progressChartOptions = {
    ...chartOptions,
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      {statusMsg.text && (
        <Row className="mb-3">
          <Col>
            <Alert variant={statusMsg.type}>
              <i className="fas fa-info-circle me-2" />
              {statusMsg.text}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Student Info */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow border-0">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h2 className="h3 mb-2">
                    {performanceData.studentInfo.name}'s Performance Analytics
                  </h2>
                  <div className="d-flex flex-wrap gap-3">
                    <Badge bg="primary" className="fs-6 px-3 py-2">
                      Overall: {performanceData.studentInfo.overallPercentage}%
                    </Badge>
                    <Badge bg="success" className="fs-6 px-3 py-2">
                      Subjects: {performanceData.studentInfo.totalSubjects}
                    </Badge>
                    <Badge bg="info" className="fs-6 px-3 py-2">
                      Terms: {performanceData.studentInfo.totalTerms}
                    </Badge>
                    <Badge bg="warning" className="fs-6 px-3 py-2">
                      ID: {performanceData.studentInfo.id}
                    </Badge>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button variant="outline-primary" href="/student/dashboard">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Dashboard
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Subject × Term Trend */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow border-0">
            <Card.Header className="bg-secondary text-white py-3">
              <h5 className="mb-0">
                <i className="fas fa-stream me-2"></i>Subject Performance Across Terms
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "400px" }}>
                <Line data={subjectTrendChartData} options={progressChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overall Trend & Grade Distribution */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow border-0 h-100">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>Average Performance Across Terms
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
                <Line data={progressChartData} options={progressChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow border-0 h-100">
            <Card.Header className="bg-success text-white py-3">
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>Grade Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
                <Doughnut data={gradeDistributionData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>


    </Container>
  );
};

export default IndividualPerformance;
