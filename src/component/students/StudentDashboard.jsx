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
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

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
    sessionStorage.removeItem("loginFlash"); 
    return obj?.text || "";
  } catch {
    return "";
  }
};

const TERM_ORDER = {
  "First Term": 1,
  "Second Term": 2,
  "Third Term": 3,
  "Term 1": 1,
  "Term 2": 2,
  "Term 3": 3,
};

const sortTerms = (a, b) => {
  const oa = TERM_ORDER[a] ?? 999;
  const ob = TERM_ORDER[b] ?? 999;
  if (oa !== ob) return oa - ob;
  return a.localeCompare(b);
};

// Mark card 
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
  
  const student = useMemo(() => readStudent(), []);
  const [flash, setFlash] = useState("");

  
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  
  const [allMarks, setAllMarks] = useState([]);
  const [terms, setTerms] = useState([]); 
  const [years, setYears] = useState([]); 
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

 
  const [markList, setMarkList] = useState([]);

 
  useEffect(() => {
    setFlash(readFlash());

    const fetchAllMarks = async () => {
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
          `http://localhost:5001/api/marks/student/${student.id}?_=${Date.now()}`
        );
        if (!res.ok) throw new Error("marks fetch failed");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];

        
        const normalized = list.map((m) => ({
          subjectName: m.subjectName || m.subject_name || m.subject || "Subject",
          markValue: Number(m.markValue ?? m.marks ?? m.mark ?? 0),
          term: m.term || "Unknown Term",
          academic_year: m.academic_year || "N/A",
        }));

        setAllMarks(normalized);

        if (!normalized.length) {
          setNotice({
            type: "warning",
            text: "No marks found for this student yet.",
          });
          setTerms([]);
          setYears([]);
          setSelectedTerm(null);
          setSelectedYear(null);
          setMarkList([]);
          return;
        }

 
        const distinctTerms = Array.from(new Set(normalized.map((r) => r.term))).sort(sortTerms);
        const distinctYears = Array.from(new Set(normalized.map((r) => r.academic_year))).sort();

        setTerms(distinctTerms);
        setYears(distinctYears);

       
        const defaultTerm = distinctTerms[0] || null;
        const defaultYear = distinctYears[0] || null;

        setSelectedTerm(defaultTerm);
        setSelectedYear(defaultYear);

        setNotice({
          type: "success",
          text: `Loaded ${normalized.length} marks across ${
            distinctTerms.length
          } term(s).`,
        });
      } catch {
        setNotice({
          type: "danger",
          text: "Could not load marks from server.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllMarks();
    
  }, [student?.id]);

  // fetch marks 
  useEffect(() => {
    const fetchFilteredMarks = async () => {
      if (!student?.id) return;
      if (!selectedTerm && !selectedYear) {
        setMarkList([]);
        return;
      }

      try {
        setLoading(true);
        const qs = new URLSearchParams();
        if (selectedTerm) qs.append("term", selectedTerm);
        if (selectedYear) qs.append("academic_year", selectedYear);
        qs.append("_", Date.now().toString());

        const res = await fetch(
          `http://localhost:5001/api/marks/student/${student.id}?${qs.toString()}`
        );

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.data || [];
          const normalized = list.map((m) => ({
            subjectName: m.subjectName || m.subject_name || m.subject || "Subject",
            markValue: Number(m.markValue ?? m.marks ?? m.mark ?? 0),
            term: m.term || "Unknown Term",
            academic_year: m.academic_year || "N/A",
          }));
          setMarkList(normalized);
          if (!normalized.length) {
            setNotice({
              type: "warning",
              text: "No marks found for the selected term/year.",
            });
          } else {
            setNotice({
              type: "success",
              text: `Loaded ${normalized.length} marks for ${selectedTerm}${
                selectedYear ? ` • ${selectedYear}` : ""
              }.`,
            });
          }
        } else {
          
          const clientFiltered = allMarks.filter(
            (r) =>
              (!selectedTerm || r.term === selectedTerm) &&
              (!selectedYear || r.academic_year === selectedYear)
          );
          setMarkList(clientFiltered);
          setNotice({
            type: "warning",
            text:
              "Server filter failed. Showing locally filtered marks from previously loaded data.",
          });
        }
      } catch {
       
        const clientFiltered = allMarks.filter(
          (r) =>
            (!selectedTerm || r.term === selectedTerm) &&
            (!selectedYear || r.academic_year === selectedYear)
        );
        setMarkList(clientFiltered);
        setNotice({
          type: "warning",
          text:
            "Network error. Showing locally filtered marks from previously loaded data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMarks();
    
  }, [selectedTerm, selectedYear, student?.id]);

  const handleTermSelect = (term) => setSelectedTerm(term);
  const handleYearSelect = (year) => setSelectedYear(year);

 
  const totalMarks = markList.reduce((sum, m) => sum + Number(m.markValue || 0), 0);
  const avgMarks = markList.length ? (totalMarks / markList.length).toFixed(1) : "0.0";

  const chartData = {
    labels: markList.map((item) => item.subjectName),
    datasets: [
      {
        label: "Marks (%)",
        data: markList.map((item) => Number(item.markValue || 0)),
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
        text: selectedTerm
          ? `Subject Performance — ${selectedTerm}${
              selectedYear ? ` • ${selectedYear}` : ""
            }`
          : "Subject Performance",
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

      {/* Logged-in Student summary + selectors */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center p-3 bg-white rounded shadow-sm">
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

            {/* Term & Year selectors */}
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <span className="me-2 fw-bold text-dark">Select Term:</span>
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-term" className="px-4">
                    {selectedTerm || "—"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {terms.length ? (
                      terms.map((t) => (
                        <Dropdown.Item
                          key={t}
                          onClick={() => handleTermSelect(t)}
                          className={selectedTerm === t ? "fw-bold" : ""}
                        >
                          {t}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No terms</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="d-flex align-items-center">
                <span className="me-2 fw-bold text-dark">Academic Year:</span>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-year" className="px-4">
                    {selectedYear || "All"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {years.length ? (
                      years.map((y) => (
                        <Dropdown.Item
                          key={y}
                          onClick={() => handleYearSelect(y)}
                          className={selectedYear === y ? "fw-bold" : ""}
                        >
                          {y}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No years</Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleYearSelect(null)}>
                      All Years
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
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
                    Marks Breakdown — {selectedTerm || "—"}
                    {selectedYear ? ` • ${selectedYear}` : ""}
                  </h2>
                </Card.Header>
                <Card.Body className="p-3">
                  {markList.length ? (
                    markList.map((m, idx) => <MarkCard key={idx} marks={m} />)
                  ) : (
                    <div className="d-flex flex-column align-items-center py-4 text-muted">
                      <p className="mb-2">No marks to display for this selection.</p>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          setSelectedTerm(terms[0] || null);
                          setSelectedYear(years[0] || null);
                        }}
                      >
                        Reset selection
                      </Button>
                    </div>
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
