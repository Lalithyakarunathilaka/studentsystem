import React from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

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

export default MarkCard;
