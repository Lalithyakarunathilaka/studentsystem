import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import Dropdown from "react-bootstrap/Dropdown";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// ---------- helpers ----------
const readStudent = () => {
  try {
    const raw = localStorage.getItem("student");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const readFlash = () => {
  try {
    const raw = sessionStorage.getItem("loginFlash");
    if (!raw) return "";
    const obj = JSON.parse(raw);
    sessionStorage.removeItem("loginFlash"); // one-time
    return obj?.text || "";
  } catch {
    return "";
  }
};

// ---------- small Mark card ----------
const MarkCard = ({ marks }) => {
  return (
    <Card className="mb-3 shadow-sm border-0">
      <Card.Body className="d-flex justify-content-between align-items-center p-3">
        <span className="fw-bold fs-5">{marks.subjectName}</span>
        <Badge
          className="fs-6 px-3 py-2"
          bg={
            marks.markValue >= 75
              ? "success"
              : marks.markValue >= 50
              ? "warning"
              : "danger"
          }
        >
          {marks.markValue}%
        </Badge>
      </Card.Body>
    </Card>
  );
};

const StudentDashboard = () => {
  // --- logged-in student + flash welcome ---
  const student = useMemo(() => readStudent(), []);
  const [flash, setFlash] = useState("");

  // --- fallback data (used if API missing/unreachable) ---
  const fallbackExams = useMemo(
    () => [
      { uuid: "1", examName: "Midterm Exam" },
      { uuid: "2", examName: "Final Exam" },
      { uuid: "3", examName: "Quarterly Exam" },
    ],
    []
  );
  const fallbackMarks = useMemo(
    () => ({
      "1": [
        { subjectName: "Mathematics", markValue: 83 },
        { subjectName: "Science", markValue: 77 },
        { subjectName: "English", markValue: 50 },
        { subjectName: "History", markValue: 72 },
      ],
      "2": [
        { subjectName: "Mathematics", markValue: 92 },
        { subjectName: "Science", markValue: 88 },
        { subjectName: "English", markValue: 65 },
        { subjectName: "History", markValue: 80 },
      ],
      "3": [
        { subjectName: "Mathematics", markValue: 78 },
        { subjectName: "Science", markValue: 82 },
        { subjectName: "English", markValue: 58 },
        { subjectName: "History", markValue: 75 },
      ],
    }),
    []
  );

  // --- state: exams + marks (will try API first, then fallback) ---
  const [exams, setExams] = useState(fallbackExams);
  const [selectedExam, setSelectedExam] = useState(fallbackExams[0]);
  const [markObj, setMarkObj] = useState(fallbackMarks[fallbackExams[0].uuid]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" }); // success|warning|danger

  // one-time flash + initial fetch
  useEffect(() => {
    setFlash(readFlash());
    // Try to fetch exams for this student (optional API)
    const fetchExams = async () => {
      if (!student?.id) {
        setNotice({
          type: "warning",
          text: "No logged-in student found. Please log in again.",
        });
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5001/api/exams/student/${student.id}?_=${Date.now()}`
        );
        if (!res.ok) throw new Error("exams fetch failed");
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setExams(data); // expect [{uuid, examName}, ...]
          setSelectedExam(data[0]);
        } else {
          // keep fallback if empty
          setNotice({
            type: "warning",
            text: "No exams found for this student yet. Showing sample data.",
          });
        }
      } catch {
        // stick to fallback
        setNotice({
          type: "warning",
          text: "Could not load exams from server. Showing sample data.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  // fetch marks whenever selectedExam changes (try API, fallback to sample)
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedExam) return;
      if (!student?.id) return;

      setLoading(true);
      setNotice({ type: "", text: "" });

      try {
        const res = await fetch(
          `http://localhost:5001/api/marks/student/${student.id}?examUuid=${encodeURIComponent(
            selectedExam.uuid
          )}&_=${Date.now()}`
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.data || [];
          if (list.length) {
            // normalize keys: subject_name/marks -> subjectName/markValue
            const normalized = list.map((m) => ({
              subjectName: m.subjectName || m.subject_name || m.subject || "Subject",
              markValue: Number(m.markValue ?? m.marks ?? 0),
            }));
            setMarkObj(normalized);
            setNotice({
              type: "success",
              text: `Marks loaded for ${student?.name || "Student"} (ID: ${student?.id}).`,
            });
          } else {
            // no marks for this exam -> empty list
            setMarkObj([]);
            setNotice({
              type: "warning",
              text: "No marks found for the selected exam.",
            });
          }
        } else {
          // server error -> fallback
          const fb = fallbackMarks[selectedExam.uuid] || [];
          setMarkObj(fb);
          if (!fb.length) {
            setNotice({
              type: "danger",
              text:
                "Failed to load marks from server and no fallback data available.",
            });
          } else {
            setNotice({
              type: "warning",
              text:
                "Could not load marks from server. Showing sample data for this exam.",
            });
          }
        }
      } catch {
        const fb = fallbackMarks[selectedExam.uuid] || [];
        setMarkObj(fb);
        if (!fb.length) {
          setNotice({
            type: "danger",
            text:
              "Network error loading marks and no fallback data available.",
          });
        } else {
          setNotice({
            type: "warning",
            text:
              "Network error. Showing sample data for this exam.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam?.uuid, student?.id]);

  const handleExamSelect = (exam) => setSelectedExam(exam);

  // summary
  const totalMarks = markObj.reduce((sum, m) => sum + Number(m.markValue || 0), 0);
  const avgMarks = markObj.length ? (totalMarks / markObj.length).toFixed(1) : "0.0";

  const chartData = {
    labels: markObj.map((item) => item.subjectName),
    datasets: [
      {
        label: "Marks (%)",
        data: markObj.map((item) => Number(item.markValue || 0)),
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(201, 203, 207, 0.7)",
        ],
        borderColor: [
          "rgb(54, 162, 235)",
          "rgb(75, 192, 192)",
          "rgb(255, 206, 86)",
          "rgb(153, 102, 255)",
          "rgb(255, 99, 132)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, weight: "bold" } },
      },
      title: {
        display: true,
        text: "Subject Performance",
        font: { size: 18 },
      },
      tooltip: { intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { font: { size: 14 } },
        title: { display: true, text: "Marks (%)", font: { size: 16, weight: "bold" } },
      },
      x: { ticks: { font: { size: 14, weight: "bold" } } },
    },
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      {/* Flash welcome (from login) */}
      {flash && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" className="mb-0">
              <i className="fas fa-check-circle me-2" />
              {flash}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Logged-in Student summary */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm">
            <div>
              <h5 className="mb-1">
                {student ? (
                  <>
                    Welcome, <strong>{student.name || "Student"}</strong>{" "}
                    <Badge bg="secondary" className="ms-2">ID: {student.id}</Badge>
                  </>
                ) : (
                  "Welcome"
                )}
              </h5>
              <p className="mb-0 text-muted">
                {student?.email ? <span>{student.email} • </span> : null}
                Track your academic performance
              </p>
            </div>

            {/* Exam selector */}
            <div className="d-flex align-items-center">
              <span className="me-3 fw-bold text-dark">Select Exam:</span>
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic" className="px-4">
                  {selectedExam?.examName || "—"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {exams.map((exam) => (
                    <Dropdown.Item
                      key={exam.uuid}
                      onClick={() => handleExamSelect(exam)}
                      className={selectedExam?.uuid === exam.uuid ? "fw-bold" : ""}
                    >
                      {exam.examName}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Col>
      </Row>

      {/* Inline notices (API/fallback info) */}
      {notice.text && (
        <Row className="mb-3">
          <Col>
            <Alert variant={notice.type || "info"} className="mb-0">
              {notice.text}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={12}>
          <Card className="mb-4 shadow border-0">
            <Card.Header className="bg-success text-white py-3">
              <h2 className="h5 mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Performance Graph
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <div style={{ height: "500px" }}>
                {loading ? (
                  <div className="text-center text-muted mt-5">Loading chart…</div>
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Card className="text-center shadow border-0 bg-light">
                <Card.Body className="py-4">
                  <div className="text-primary mb-2">
                    <i className="fas fa-star fa-2x"></i>
                  </div>
                  <h3 className="fw-bold display-5">{avgMarks}%</h3>
                  <p className="text-muted mb-0">Average Marks</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="text-center shadow border-0 bg-light">
                <Card.Body className="py-4">
                  <div className="text-success mb-2">
                    <i className="fas fa-trophy fa-2x"></i>
                  </div>
                  <h3 className="fw-bold display-5">{totalMarks}</h3>
                  <p className="text-muted mb-0">Total Marks</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* List of subject cards */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="shadow border-0">
                <Card.Header className="bg-primary text-white py-3">
                  <h2 className="h6 mb-0">
                    <i className="fas fa-list-alt me-2"></i>
                    Marks Breakdown — {selectedExam?.examName}
                  </h2>
                </Card.Header>
                <Card.Body className="p-3">
                  {markObj.length ? (
                    markObj.map((m, idx) => <MarkCard key={idx} marks={m} />)
                  ) : (
                    <p className="text-muted mb-0">No marks to display.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
