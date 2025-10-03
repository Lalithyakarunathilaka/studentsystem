import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";

const AdminTeacherRetirementBoard = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("http://localhost:5001/api/retirements/teachers-retirement")
      .then((res) => res.json())
      .then((data) => {
        setTeachers(Array.isArray(data) ? data : []);
        setStatus({ type: "success", text: "Retirement data loaded" });
      })
      .catch(() =>
        setStatus({ type: "danger", text: "Failed to load retirement data" })
      )
      .finally(() => setLoading(false));
  }, []);


  if (loading) return <p className="text-center mt-5">Loading retirement details…</p>;

  return (
    <Container className="mt-4">
      {status.text && <Alert variant={status.type}>{status.text}</Alert>}

      <Card className="shadow border-0">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">Teachers Retirement Overview</h5>
        </Card.Header>
        <Card.Body>
          {teachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date of Birth</th>
                  <th>Joined On</th>
                  <th>Current Age</th>
                  <th>Years of Service</th>
                  <th>Retirement Date</th>
                  <th>Years Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.full_name}</td>
                    <td>{t.email}</td>
                    <td>{new Date(t.date_of_birth).toLocaleDateString()}</td>
                    <td>{new Date(t.hire_date).toLocaleDateString()}</td>
                    <td>{t.current_age}</td>
                    <td>{t.service_years}</td>
                    <td>{t.retirement_date}</td>
                    <td>{t.years_left}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminTeacherRetirementBoard;
