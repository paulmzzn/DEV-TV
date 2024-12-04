import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TVPage from './pages/TVPage';
import ManagementPage from './pages/ManagementPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TVPage />} />
        <Route path="/manage" element={<ManagementPage />} />
      </Routes>
    </Router>
  );
};

export default App;