import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Routines from './pages/Routines';
import History from './pages/History';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="routines" element={<Routines />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
}