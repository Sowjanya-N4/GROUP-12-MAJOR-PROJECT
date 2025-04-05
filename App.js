import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import CoordinatorLogin from './CoordinatorLogin';
import StudentLogin from './StudentLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coordinator-login" element={<CoordinatorLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
      </Routes>
    </Router>
  );
}

export default App;