// src/component/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [flash, setFlash] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore teacher info from storage
    try {
      const raw = localStorage.getItem("teacher");
      if (raw) {
        setTeacher(JSON.parse(raw)); // has .id and .name now
      }
    } catch (e) {
      console.error("Parse error teacher:", e);
    }

    // Read flash from sessionStorage
    const rawFlash = sessionStorage.getItem("loginFlash");
    if (rawFlash) {
      try {
        const f = JSON.parse(rawFlash);
        setFlash(f.text || "");
      } catch {}
      sessionStorage.removeItem("loginFlash"); // one time
    }

    setLoading(false);
  }, []);

  if (loading) return <p className="text-center mt-5">Loading…</p>;

  if (!teacher) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          No teacher logged in. <a href="/teacher/login">Go to login</a>.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {flash && (
        <Alert variant="success" className="mb-3">
          {flash}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Profile</h5>
              <p><strong>Name:</strong> {teacher.fullName}</p>
              <p><strong>Email:</strong> {teacher.email}</p>
              <p><strong>Gender:</strong> {teacher.gender}</p>
              <p><strong>Role:</strong> {teacher.role}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Homeroom Classes</h5>
              {teacher.classes?.length ? (
                <ul>
                  {teacher.classes.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No assigned classes.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Subjects Taught</h5>
              {teacher.subjectsTaught?.length ? (
                <ul>
                  {teacher.subjectsTaught.map((s) => (
                    <li key={s.id}>
                      Grade {s.grade} – {s.class_name} : {s.subject_name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No subjects assigned.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherDashboard;
