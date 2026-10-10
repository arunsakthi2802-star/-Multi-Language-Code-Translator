import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

import { Dashboard } from './pages/Dashboard';
import { Translator } from './pages/Translator';
import { Explainer } from './pages/Explainer';
import { Validator } from './pages/Validator';
import { Comparison } from './pages/Comparison';
import { History } from './pages/History';
import { Projects } from './pages/Projects';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="translator" element={<Translator />} />
              <Route path="explainer" element={<Explainer />} />
              <Route path="validator" element={<Validator />} />
              <Route path="compare" element={<Comparison />} />
              <Route path="history" element={<History />} />
              <Route path="projects" element={<Projects />} />
              <Route path="templates" element={<Templates />} />
              <Route path="settings" element={<Settings />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
