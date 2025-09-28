import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import MarkCard from "../MarkCard";

const Marks = () => {
  const [allMarks, setAllMarks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });


  const [terms, setTerms] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null); 
  const [selectedYear, setSelectedYear] = useState(null); 

 
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

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const studentRaw =
          localStorage.getItem("student") || sessionStorage.getItem("student");
        const student = studentRaw ? JSON.parse(studentRaw) : null;
        setUser(student || null);

        if (!student?.id) {
          setStatusMsg({
            type: "warning",
            text: "No student found in storage. Please sign in again.",
          });
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5001/api/marks/student/${student.id}?_=${Date.now()}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        const rawList = Array.isArray(res.data) ? res.data : res?.data?.data || [];
        const normalized = rawList.map((m) => ({
          subjectName: m.subjectName || m.subject_name || m.subject || "Subject",
          markValue: Number(m.markValue ?? m.marks ?? m.mark ?? 0),
          term: m.term || "Unknown Term",
          academicYear: m.academic_year || "N/A",
          teacherName: m.teacher_name || m.teacherName || "",
        }));

        setAllMarks(normalized);

        
        const distinctTerms = Array.from(new Set(normalized.map((r) => r.term))).sort(sortTerms);
        const distinctYears = Array.from(new Set(normalized.map((r) => r.academicYear))).sort();

        setTerms(distinctTerms);
        setYears(distinctYears);

       
        setSelectedTerm(distinctTerms[0] ?? null);
        setSelectedYear(distinctYears[0] ?? null);

        setStatusMsg({
          type: "success",
          text: `Marks loaded successfully for ${student?.name || "Student"} (ID: ${student.id}).`,
        });
      } catch (err) {
        console.error("Error fetching marks:", err);
        setStatusMsg({
          type: "danger",
          text: err?.response?.data?.message || "Failed to load marks. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

 
  const markObj = useMemo(() => {
    return allMarks.filter(
      (r) =>
        (!selectedTerm || r.term === selectedTerm) &&
        (!selectedYear || r.academicYear === selectedYear)
    );
  }, [allMarks, selectedTerm, selectedYear]);

  
  const summary = useMemo(() => {
    const excellent = markObj.filter((m) => Number(m.markValue) >= 75).length;
    const good = markObj.filter((m) => Number(m.markValue) >= 50 && Number(m.markValue) < 75).length;
    const needHelp = markObj.filter((m) => Number(m.markValue) < 50).length;
    return { excellent, good, needHelp, total: markObj.length };
  }, [markObj]);

  if (loading) {
    return <p className="text-center mt-5">Loading marks...</p>;
  }

  return (
    <Container fluid className="py-4">
      {!!statusMsg.text && (
        <Alert variant={statusMsg.type} className="mb-3">
          <i className="fas fa-info-circle me-2" />
          {statusMsg.text}
        </Alert>
      )}

      {/* Logged-in student details */}
      {user && (
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-md-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h6 mb-1">Logged-in Student</h2>
                  <div className="text-muted small">
                    <span className="me-3">
                      <i className="fas fa-user me-1"></i>
                      {user.name || "—"}
                    </span>
                    <span className="me-3">
                      <i className="fas fa-id-card me-1"></i>ID: {user.id}
                    </span>
                    {user.className && (
                      <span className="me-3">
                        <i className="fas fa-school me-1"></i>
                        {user.className}
                      </span>
                    )}
                    {user.email && (
                      <span>
                        <i className="fas fa-envelope me-1"></i>
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 mt-md-0 d-flex gap-2 align-items-center">
                  <span className="badge bg-primary-subtle text-primary p-2">
                    <i className="fas fa-list-ol me-1" />
                    {summary.total} subjects
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex flex-wrap gap-3 align-items-center">
              <div className="d-flex align-items-center">
                <span className="me-2 fw-semibold">Term:</span>
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-term" className="px-4">
                    {selectedTerm || "All Terms"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {terms.length ? (
                      terms.map((t) => (
                        <Dropdown.Item
                          key={t}
                          onClick={() => setSelectedTerm(t)}
                          className={selectedTerm === t ? "fw-bold" : ""}
                        >
                          {t}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No terms</Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => setSelectedTerm(null)}>All Terms</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="d-flex align-items-center">
                <span className="me-2 fw-semibold">Academic Year:</span>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-year" className="px-4">
                    {selectedYear || "All Years"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {years.length ? (
                      years.map((y) => (
                        <Dropdown.Item
                          key={y}
                          onClick={() => setSelectedYear(y)}
                          className={selectedYear === y ? "fw-bold" : ""}
                        >
                          {y}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No years</Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => setSelectedYear(null)}>All Years</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSelectedTerm(terms[0] ?? null);
                  setSelectedYear(years[0] ?? null);
                }}
              >
                Reset
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Marks list */}
      <Row>
        <Col xs={12}>
          <Card className="shadow border-0" style={{ minHeight: "600px" }}>
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="h5 mb-0">
                <i className="fas fa-list-alt me-2"></i>
                Marks Breakdown
                {selectedTerm ? ` — ${selectedTerm}` : " — All Terms"}
                {selectedYear ? ` • ${selectedYear}` : ""}
              </h2>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="p-4" style={{ maxHeight: "500px", overflowY: "auto" }}>
                {markObj.length > 0 ? (
                  markObj.map((m, index) => (
                    <MarkCard
                      key={index}
                      marks={{
                        subjectName: m.subjectName,
                        markValue: m.markValue,
                        term: m.term,
                        academicYear: m.academicYear,
                        teacherName: m.teacherName,
                      }}
                    />
                  ))
                ) : (
                  <p className="text-muted m-0">No marks found for this selection.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow border-0">
            <Card.Header className="py-3">
              <h2 className="h5 mb-0">
                <i className="fas fa-info-circle me-2 text-info"></i>
                Performance Insights
              </h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3 mb-md-0">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-success fs-4">
                      {summary.excellent}
                    </span>
                    <span>Excellent Grades (≥ 75)</span>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3 mb-md-0">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-warning fs-4">
                      {summary.good}
                    </span>
                    <span>Good Grades (50–74)</span>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3 mb-md-0">
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-danger fs-4">
                      {summary.needHelp}
                    </span>
                    <span>Need Improvement (&lt; 50)</span>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-info fs-4">
                      {summary.total}
                    </span>
                    <span>Total Subjects</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Marks;
