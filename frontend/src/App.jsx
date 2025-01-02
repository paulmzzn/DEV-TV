import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader';
import ManagementPage from './pages/ManagementPage';
import ArchivedPage from './pages/ArchivedPage';
import StatisticsPage from './pages/StatisticsPage';

const App = () => {
  const [loading, setLoading] = useState(true);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    if (isPWA) {
      // Simulate loading time for PWA
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Adjust the loading time as needed
    } else {
      setLoading(false);
    }
  }, [isPWA]);

  return (
    <>
      {loading && isPWA ? <Loader loading={loading} /> : (
        <Router>
          <Routes>
            <Route path="/tv" element={<Navigate to="/tv.html" />} />
            <Route path="/" element={<ManagementPage />} />
            <Route path="/manage" element={<ManagementPage />} />
            <Route path="/archive" element={<ArchivedPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Router>
      )}
    </>
  );
};

export default App;