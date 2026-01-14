import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TestnetPage from './pages/TestnetPage';
import AffiliatesPage from './pages/AffiliatesPage';
import PointsPage from './pages/PointsPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-theme-secondary md:bg-theme-primary">
        <div className="md:max-w-screen-2xl md:mx-auto bg-theme-primary min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/testnet" element={<TestnetPage />} />
            <Route path="/affiliates" element={<AffiliatesPage />} />
            <Route path="/points" element={<PointsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;