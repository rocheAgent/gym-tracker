import { NavLink, Outlet } from 'react-router-dom';
import { Dumbbell, History, ListTodo, CalendarDays, Plus } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <Dumbbell className="logo-icon" />
          <span>GymTracker</span>
        </div>
        
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <Plus size={20} />
            <span>Nueva Sesión</span>
          </NavLink>
          <NavLink to="/exercises" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ListTodo size={20} />
            <span>Ejercicios</span>
          </NavLink>
          <NavLink to="/routines" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <span>Rutinas</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <History size={20} />
            <span>Historial</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <span className="version">v1.0.0</span>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}