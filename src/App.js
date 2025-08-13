import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Home from "./component/Home/Home";
import Notices from "./component/Notice/Notices";
import StudentAnalysis from "./component/StudentAnalysis/StudentAnalysis";
import RegisterPage from "./component/RejisterPage";
import TeacherRegisterPage from "./component/TeacherRegisterPage/TeacherRegisterPage";
import AddNotice from "./component/Notice/AddNotice/AddNotice.jsx.jsx";
import ViewNotice from "./component/Notice/ViewNotice.jsx";
import ChooseUser from "./component/chooseUser/ChooseUser.jsx";
import AdminRegisterPage from "./component/admin/admin_register/AdminRegisterPage.jsx";
import AdminLoginPage from "./component/admin/admin_login/AdminLoginPage.jsx";
import AdminAddUser from "./component/admin/user_add/AdminUserAdd.jsx";
import NoticeDashboard from "./component/admin/add_notice/NoticeDashboard.jsx";
import AdminAddClassPage from "./component/admin/add_class/AdminAddClassPage.jsx";
import AdminDashboard from "./component/admin/AdminDashboard.jsx";
import AdminHome from "./component/admin/AdminHome.jsx";

// import AdminNoticeBoard from "./component/Notice/AdminNoticeBoard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/choose-user" element={<ChooseUser />} />

          <Route path="/admin-register" element={<AdminRegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/user-add" element={<AdminAddUser />} />
          <Route path="/admin/add-class" element={<AdminAddClassPage />} />
          <Route path="/notice-dashboard" element={<NoticeDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminHome />} />
          <Route
            path="/admin-dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route path="/register-student" element={<RegisterPage />} />
          <Route path="/register-teacher" element={<TeacherRegisterPage />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/addnotice" element={<AddNotice />} />
          <Route path="/viewnotice" element={<ViewNotice />} />
          <Route path="/analysis" element={<StudentAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
