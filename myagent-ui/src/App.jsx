import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SharedReport from './pages/SharedReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/start"              element={<Onboarding />} />
        <Route path="/dashboard/:userId"  element={<Dashboard />} />
        <Route path="/r/:id"              element={<SharedReport />} />
      </Routes>
    </BrowserRouter>
  );
}
