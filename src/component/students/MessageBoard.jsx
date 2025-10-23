// import React, { useEffect, useState } from "react";
// import { Form, Button, Card, ListGroup } from "react-bootstrap";

// const getUser = () => {
//   try {
//     const raw =
//       localStorage.getItem("teacher") ||
//       sessionStorage.getItem("teacher") ||
//       localStorage.getItem("student") ||
//       sessionStorage.getItem("student");
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// };

// const getToken = () =>
//   localStorage.getItem("teacherToken") ||
//   sessionStorage.getItem("teacherToken") ||
//   localStorage.getItem("studentToken") ||
//   sessionStorage.getItem("studentToken");

// const MessageBoard = ({ classId: propClassId, receiverId: propReceiverId }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const user = getUser();
//   const token = getToken();

//   // ✅ fallback to logged-in user details if props missing
//   const classId =
//     propClassId ||
//     user?.classId ||
//     user?.class_id ||
//     (user?.role === "teacher" ? user?.assignedClassId : null);

//   const receiverId =
//     propReceiverId ||
//     (user?.role === "student" ? user?.teacherId : null) ||
//     (user?.role === "teacher" ? user?.studentId : null);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!classId) {
//         setError("classId is missing (check user data).");
//         setLoading(false);
//         return;
//       }
//       if (!token) {
//         setError("Token not found. Please log in.");
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `http://localhost:5001/api/messages/class/${classId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (!res.ok) throw new Error(`Server returned ${res.status}`);
//         const data = await res.json();
//         setMessages(data);
//       } catch (e) {
//         console.error("fetchMessages error:", e);
//         setError("Failed to load messages. Check console.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [classId, token]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!newMsg.trim()) return;
//     if (!receiverId || !classId) {
//       alert("Receiver and class must be defined.");
//       return;
//     }
//     try {
//       const res = await fetch("http://localhost:5001/api/messages/send", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           receiver_id: receiverId,
//           class_id: classId,
//           content: newMsg,
//         }),
//       });
//       if (!res.ok) throw new Error(`Send failed: ${res.status}`);
//       setNewMsg("");
//       // refresh messages after sending
//       const refreshed = await fetch(
//         `http://localhost:5001/api/messages/class/${classId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMessages(await refreshed.json());
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   if (loading) return <div>Loading messages...</div>;
//   if (error) return <div style={{ color: "red" }}>{error}</div>;

//   return (
//     <Card style={{ maxWidth: 600, margin: "20px auto" }}>
//       <Card.Header>💬 Messages for Class {classId}</Card.Header>
//       <ListGroup
//         variant="flush"
//         style={{ maxHeight: "300px", overflowY: "auto" }}
//       >
//         {messages.length === 0 ? (
//           <ListGroup.Item>No messages yet</ListGroup.Item>
//         ) : (
//           messages.map((m) => {
//             const isOwn = m.sender_name === user?.name;
//             return (
//               <ListGroup.Item
//                 key={m.id}
//                 style={{
//                   textAlign: isOwn ? "right" : "left",
//                   background: isOwn ? "#e6f7ff" : "white",
//                 }}
//               >
//                 <strong>
//                   {m.sender_name} ({m.sender_role})
//                 </strong>
//                 <div>{m.content}</div>
//                 <small className="text-muted">
//                   {new Date(m.created_at).toLocaleString()}
//                 </small>
//               </ListGroup.Item>
//             );
//           })
//         )}
//       </ListGroup>
//       <Card.Footer>
//         <Form onSubmit={handleSend} style={{ display: "flex", gap: "8px" }}>
//           <Form.Control
//             value={newMsg}
//             onChange={(e) => setNewMsg(e.target.value)}
//             placeholder="Type a message..."
//           />
//           <Button type="submit" variant="primary">
//             Send
//           </Button>
//         </Form>
//       </Card.Footer>
//     </Card>
//   );
// };

// export default MessageBoard;
