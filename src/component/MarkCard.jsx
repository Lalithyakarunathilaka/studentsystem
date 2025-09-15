import React from "react";
import Card from "react-bootstrap/Card";

const MarkCard = ({ marks }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{marks.subjectName}</h5>
          <span className="fw-bold">{marks.markValue}</span>
        </div>
        <small className="text-muted">
          {marks.term} ({marks.academic_year})
        </small>
      </Card.Body>
    </Card>
  );
};

export default MarkCard;
