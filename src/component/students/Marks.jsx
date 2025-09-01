import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import MarkCard from "../MarkCard";


const Marks = () => {
  // Hardcoded marks for now
  const hardcodedMarks = [
    { subjectName: "Mathematics", markValue: 83 },
    { subjectName: "Science", markValue: 77 },
    { subjectName: "English", markValue: 50 },
    { subjectName: "History", markValue: 72 },
  ];

  const [markObj] = useState(hardcodedMarks);

  return (
    <Container fluid className="py-4">
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
          <div
            className="p-4"
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            {markObj.map((marks, index) => (
              <MarkCard key={index} marks={marks} />
            ))}
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
                      {markObj.filter(m => m.markValue >= 75).length}
                    </span>
                    <span>Excellent Grades</span>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3 mb-md-0">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-warning fs-4">
                      {markObj.filter(m => m.markValue >= 50 && m.markValue < 75).length}
                    </span>
                    <span>Good Grades</span>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3 mb-md-0">
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-danger fs-4">
                      {markObj.filter(m => m.markValue < 50).length}
                    </span>
                    <span>Need Improvement</span>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <span className="d-block fw-bold text-info fs-4">
                      {markObj.length}
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
