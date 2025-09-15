import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import MarkCard from "../MarkCard";

const Marks = () => {
  const [markObj, setMarkObj] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        // get token + student from storage
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
          return;
        }

        const res = await axios.get(
          `http://localhost:5001/api/marks/student/${student.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setMarkObj(Array.isArray(res.data) ? res.data : []);
        setStatusMsg({
          type: "success",
          text: `Marks loaded successfully for ${student?.name || "Student"} (ID: ${
            student.id
          }).`,
        });
      } catch (err) {
        console.error("Error fetching marks:", err);
        setStatusMsg({
          type: "danger",
          text:
            err?.response?.data?.message ||
            "Failed to load marks. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  const summary = useMemo(() => {
    const excellent = markObj.filter((m) => Number(m.marks) >= 75).length;
    const good = markObj.filter(
      (m) => Number(m.marks) >= 50 && Number(m.marks) < 75
    ).length;
    const needHelp = markObj.filter((m) => Number(m.marks) < 50).length;
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
                <div className="mt-3 mt-md-0">
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

      <Row>
        <Col xs={12}>
          <Card className="shadow border-0" style={{ minHeight: "600px" }}>
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="h5 mb-0">
                <i className="fas fa-list-alt me-2"></i>
                Marks Breakdown
              </h2>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="p-4" style={{ maxHeight: "500px", overflowY: "auto" }}>
                {markObj.length > 0 ? (
                  markObj.map((marks, index) => (
                    <MarkCard
                      key={index}
                      marks={{
                        subjectName: marks.subject_name,
                        markValue: marks.marks,
                        term: marks.term,
                        academicYear: marks.academic_year,
                        teacherName: marks.teacher_name,
                      }}
                    />
                  ))
                ) : (
                  <p className="text-muted m-0">No marks found.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
