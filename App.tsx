import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TestnetPage from './pages/TestnetPage';
import AffiliatesPage from './pages/AffiliatesPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/testnet" element={<TestnetPage />} />
        <Route path="/affiliates" element={<AffiliatesPage />} />
      </Routes>
    </Router>
  );
};

export default App;