import React, { useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TeacherDashboard = () => {
  // Example hardcoded data
  const teacherInfo = {
    name: "Mr. Karunathilaka",
    subjects: ["Mathematics", "Physics"],
    classes: ["Class 10A", "Class 11B"],
  };

  const studentPerformance = [
    { className: "10A", avgMarks: 75 },
    { className: "11B", avgMarks: 82 },
  ];

  const pieData = {
    labels: ["Excellent (80%+)", "Average (50–79%)", "Needs Improvement (<50%)"],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: studentPerformance.map((c) => c.className),
    datasets: [
      {
        label: "Average Marks (%)",
        data: studentPerformance.map((c) => c.avgMarks),
        backgroundColor: ["#007bff", "#17a2b8"],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm">
            <div>
              <h3 className="fw-bold">Welcome, {teacherInfo.name}</h3>
              <p className="mb-0 text-muted">Track your class performance and activities</p>
            </div>
            <div>
              {teacherInfo.subjects.map((subj, idx) => (
                <Badge key={idx} bg="primary" className="me-2 p-2">
                  {subj}
                </Badge>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow border-0 text-center">
            <Card.Body className="py-4">
              <i className="fas fa-users fa-2x text-primary mb-3"></i>
              <h3 className="fw-bold">{teacherInfo.classes.length}</h3>
              <p className="text-muted mb-0">Classes Assigned</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow border-0 text-center">
            <Card.Body className="py-4">
              <i className="fas fa-book fa-2x text-success mb-3"></i>
              <h3 className="fw-bold">{teacherInfo.subjects.length}</h3>
              <p className="text-muted mb-0">Subjects Teaching</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white">Class Averages</Card.Header>
            <Card.Body>
              <Bar data={barData} options={barOptions} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow border-0">
            <Card.Header className="bg-success text-white">Student Performance Spread</Card.Header>
            <Card.Body className="d-flex justify-content-center">
              <div style={{ width: "70%" }}>
                <Pie data={pieData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notices/Tasks */}
      <Row>
        <Col>
          <Card className="shadow border-0">
            <Card.Header className="bg-warning text-dark">Upcoming Tasks</Card.Header>
            <Card.Body>
              <ul>
                <li>Grade Midterm Papers (Class 10A)</li>
                <li>Prepare Assignment for Physics (Class 11B)</li>
                <li>Schedule Parent-Teacher Meeting</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherDashboard;
