import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

// This is our lightweight session system for the hackathon. No auth tokens,
// no server-side sessions. The userId persists in the browser so the user
// does not re-enter it on refresh.
function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      navigate(`/dashboard/${savedUserId}`, { replace: true });
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/dashboard/:userId" element={<Dashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
