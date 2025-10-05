import React, { useEffect, useMemo, useState } from "react";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// safely parse teacher from localStorage
const getTeacher = () => {
  try { return JSON.parse(localStorage.getItem("teacher") || "null"); } catch { return null; }
};

const TeacherInterventionBoard = ({ classId: classIdProp, term: termProp, year: yearProp }) => {
  const teacher = useMemo(getTeacher, []);
  const [classId, setClassId] = useState(classIdProp ?? null);
  const [className, setClassName] = useState("");

  const [term, setTerm] = useState(termProp || "First Term");
  const [year, setYear] = useState(yearProp || "2024-2025");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [selectedAction, setSelectedAction] = useState({}); // studentId -> action

  // Resolve classId if not provided
  useEffect(() => {
    let alive = true;
    (async () => {
      if (classIdProp) return; // already given

      try {
        const token = localStorage.getItem("teacherToken");
        if (!token) throw new Error("Not logged in");

        const url = new URL("http://localhost:5001/api/teacher/my-class-data");
        url.searchParams.set("term", term);
        url.searchParams.set("academic_year", year);

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to resolve class");

        if (!alive) return;
        setClassId(data.class_id);
        setClassName(data.class_name);
      } catch (e) {
        if (!alive) return;
        setStatus({ type: "danger", text: e.message || "Failed to resolve class" });
      }
    })();
    return () => { alive = false; };
    // we only need to resolve when props not provided or filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classIdProp, term, year]);

  // load flagged students
  useEffect(() => {
    if (!classId) { setLoading(false); return; }

    setLoading(true);
    fetch(
      `http://localhost:5001/api/interventions/class/${classId}?term=${encodeURIComponent(term)}&academic_year=${encodeURIComponent(year)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data.filter(s => s.needs_support) : [];
        setStudents(arr);
        setStatus({ type: "success", text: "Intervention data loaded" });
      })
      .catch((e) =>
        setStatus({ type: "danger", text: e?.message || "Failed to load intervention data" })
      )
      .finally(() => setLoading(false));
  }, [classId, term, year]);

  const actionOptions = [
    { value: "", label: "Select an action…" },
    { value: "notify-parents", label: "Notify parents" },
    { value: "extra-class", label: "Assign extra class" },
    { value: "counseling", label: "Refer to counseling" },
    { value: "monitor", label: "Mark as under monitoring" },
  ];

  const detailsMap = {
    "notify-parents": "Notify parents about low performance",
    "extra-class": "Assign extra class",
    counseling: "Refer to counseling",
    monitor: "Mark as under monitoring",
  };

  const saveAction = async (student) => {
    const teacherObj = getTeacher();
    if (!teacherObj?.id) return alert("No logged-in teacher.");

    const action = selectedAction[student.id];
    if (!action) return alert("Please select an action first.");

    const payload = {
      student_id: student.id,
      teacher_id: teacherObj.id,
      class_id: classId ?? null,
      term,
      academic_year: year,
      type:
        action === "extra-class"
          ? "assignment"
          : action === "notify-parents"
          ? "call"
          : action === "counseling"
          ? "meeting"
          : "note",
      details: detailsMap[action],
      target_date: null,
    };

    try {
      const res = await fetch("http://localhost:5001/api/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      alert(`Saved intervention for ${student.name}`);
    } catch (e) {
      alert(e.message || "Failed to save intervention");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading intervention details…</p>;

  return (
    <Container className="mt-4">
      {status.text && <Alert variant={status.type}>{status.text}</Alert>}

      <div className="d-flex align-items-center gap-3 mb-3">
        <h5 className="mb-0">
          Class: <b>{className || classId || "—"}</b>
        </h5>
        <Form.Select
          size="sm"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          style={{ width: 180 }}
        >
          <option>First Term</option>
          <option>Second Term</option>
          <option>Third Term</option>
        </Form.Select>
        <Form.Control
          size="sm"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: 120 }}
        />
      </div>

      <Card className="shadow border-0">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">Students Needing Extra Support</h5>
        </Card.Header>
        <Card.Body>
          {students.length === 0 ? (
            <p className="mb-0">No students flagged for extra support.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>#</th>
                  <th>Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Average Marks</th>
                  <th>Status</th>
                  <th style={{ width: 280 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.avg_mark}%</td>
                    <td>
                      <span className="badge bg-warning text-dark">Needs Support</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Select
                          size="sm"
                          value={selectedAction[s.id] || ""}
                          onChange={(e) =>
                            setSelectedAction((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          style={{ maxWidth: 200 }}
                        >
                          {actionOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => saveAction(s)}
                          disabled={!selectedAction[s.id]}
                        >
                          Save
                        </Button>
                      </div>
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

export default TeacherInterventionBoard;
