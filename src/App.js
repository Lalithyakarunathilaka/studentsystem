
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./component/Home/Home";
import Notices from "./component/Notice/Notices";
import StudentAnalysis from "./component/StudentAnalysis/StudentAnalysis";
import RegisterPage from "./component/RejisterPage";
import TeacherRegisterPage from "./component/TeacherRegisterPage/TeacherRegisterPage";
import AddNotice from "./component/Notice/AddNotice/AddNotice.jsx.jsx";
import ViewNotice from "./component/Notice/ViewNotice.jsx";
import ChooseUser from './component/chooseUser/ChooseUser.jsx';
import AdminRegisterPage from './component/admin/admin_register/AdminRegisterPage.jsx'
import AdminLoginPage from "./component/admin/admin_login/AdminLoginPage.jsx";
// import AdminNoticeBoard from "./component/Notice/AdminNoticeBoard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/choose-user" element={<ChooseUser />} />

          // admin 
          <Route path="/admin-register" element={<AdminRegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage/>}/>
          
          <Route path="/register/student" element={<RegisterPage />} />
          {/* <Route path="/register/teacher" element={<TeacherRegisterPage/>}/> */}
          <Route path="/notices" element={<Notices />} />
          <Route path="/addnotice" element={<AddNotice/>}/>
          <Route path="/viewnotice" element={<ViewNotice/>}/>
          <Route path="/analysis" element={<StudentAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


