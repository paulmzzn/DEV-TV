import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ManagementPage from './pages/ManagementPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/tv.html" />} />
        <Route path="/manage" element={<ManagementPage />} />
      </Routes>
    </Router>
  );
};

export default App;