import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import Dropdown from "react-bootstrap/Dropdown";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
  // Hardcoded exam list
  const exams = [
    { uuid: "1", examName: "Midterm Exam" },
    { uuid: "2", examName: "Final Exam" },
    { uuid: "3", examName: "Quarterly Exam" },
  ];

  // Hardcoded marks (map by exam UUID)
  const hardcodedMarks = {
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
  };

  const [selectedExam, setSelectedExam] = useState(exams[0]);
  const [markObj, setMarkObj] = useState(hardcodedMarks[exams[0].uuid]);

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    setMarkObj(hardcodedMarks[exam.uuid]);
  };

  // Calculate totals and averages
  const totalMarks = markObj.reduce((sum, m) => sum + m.markValue, 0);
  const avgMarks = (totalMarks / markObj.length).toFixed(1);

  const data = {
    labels: markObj.map((item) => item.subjectName),
    datasets: [
      {
        label: "Marks (%)",
        data: markObj.map((item) => item.markValue),
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgb(54, 162, 235)",
          "rgb(75, 192, 192)",
          "rgb(255, 206, 86)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Subject Performance",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            size: 14,
          },
        },
        title: {
          display: true,
          text: "Marks (%)",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm">
            <div>
              
              <p className="mb-0 text-muted">Track your academic performance</p>
            </div>
            <div className="d-flex align-items-center">
              <span className="me-3 fw-bold text-dark">Select Exam:</span>
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic" className="px-4">
                  {selectedExam.examName}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {exams.map((exam) => (
                    <Dropdown.Item
                      key={exam.uuid}
                      onClick={() => handleExamSelect(exam)}
                      className={selectedExam.uuid === exam.uuid ? "fw-bold" : ""}
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

      <Row>


        {/* Graph and Summary Section */}
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
                <Bar data={data} options={options} />
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
        </Col>
      </Row>

      {/* Additional Info Section */}
      
    </Container>
  );
};

export default StudentDashboard;