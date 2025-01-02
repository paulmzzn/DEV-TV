import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ManagementPage from './pages/ManagementPage';
import ArchivedPage from './pages/ArchivedPage';
import StatisticsPage from './pages/StatisticsPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tv" element={<Navigate to="/tv.html" />} />
        <Route path="/" element={<ManagementPage />} />
        <Route path="/manage" element={<ManagementPage />} />
        <Route path="/archive" element={<ArchivedPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
};

export default App;