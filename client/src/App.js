import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExploreTalent from './pages/ExploreTalent';
import BookTalent from './pages/BookTalent';
import TalentRegistration from './pages/TalentRegistration';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Add smooth scroll behavior for anchor links
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/explore-talent"
              element={
                <PrivateRoute>
                  <ExploreTalent />
                </PrivateRoute>
              }
            />
            <Route
              path="/book-talent/:id"
              element={
                <PrivateRoute>
                  <BookTalent />
                </PrivateRoute>
              }
            />
            <Route
              path="/join-talent"
              element={
                <PrivateRoute>
                  <TalentRegistration />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;