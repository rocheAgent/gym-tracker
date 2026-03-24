import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import './History.css';

export default function History() {
  const [sessions, setSessions] = useLocalStorage('sessions', []);
  const [expandedSession, setExpandedSession] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const toggleSession = (id) => {
    setExpandedSession(expandedSession === id ? null : id);
  };
  
  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };
  
  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.routine === filter);
    
  const uniqueRoutines = [...new Set(sessions.map(s => s.routine))];
  
  const getTotalVolume = (session) => {
    return session.exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((setTotal, set) => {
        return setTotal + (parseFloat(set.weight || 0) * parseFloat(set.reps || 0));
      }, 0);
    }, 0);
  };
  
  return (
    <div className="history-page fade-in">
      <header className="page-header">
        <div>
          <h1>Historial</h1>
          <p className="subtitle">{sessions.length} sesiones registradas</p>
        </div>
      </header>
      
      {sessions.length > 0 && (
        <div className="filters">
          <select 
            className="input filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas las rutinas</option>
            {uniqueRoutines.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}
      
      {sessions.length === 0 ? (
        <div className="empty-state">
          <p>No hay sesiones registradas</p>
          <p className="hint">Comienza una sesión desde el Dashboard</p>
        </div>
      ) : (
        <div className="sessions-list">
          {filteredSessions.map(session => (
            <div key={session.id} className="session-card card">
              <div 
                className="session-header"
                onClick={() => toggleSession(session.id)}
              >
                <div className="session-info">
                  <h3>{session.date}</h3>
                  <span className="routine-badge">{session.routine}</span>
                </div>
                <div className="session-stats">
                  <span className="stat">
                    {session.exercises.length} ejercicios
                  </span>
                  <span className="stat">
                    {getTotalVolume(session).toFixed(0)} kg vol
                  </span>
                  {expandedSession === session.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>
              
              {expandedSession === session.id && (
                <div className="session-details">
                  {session.notes && (
                    <div className="session-notes">
                      <span className="label">Notas:</span>
                      <p>{session.notes}</p>
                    </div>
                  )}
                  
                  <div className="session-exercises">
                    {session.exercises.map((ex, i) => (
                      <div key={i} className="history-exercise">
                        <h4>{ex.name}</h4>
                        <div className="sets-summary">
                          {ex.sets.map((set, j) => (
                            <span key={j} className={`set-pill ${set.completed ? 'completed' : ''}`}>
                              {set.weight}kg × {set.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="session-actions">
                    <button 
                      className="btn-ghost delete-session"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}