import { useState } from "react";
import Login from "./components/Login.jsx";
import JobList from "./components/JobList.jsx";
import ApplicantList from "./components/ApplicantList.jsx";
import axios from "axios";
import { HashRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/applicants" element={<ApplicantList />} />
    </Routes>
  );
};

export default App;
