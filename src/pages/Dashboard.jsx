import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultExercises } from '../data/defaultExercises';
import { Plus, X, Save, Trash2, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './Dashboard.css';

export default function Dashboard() {
  const [exercises] = useLocalStorage('exercises', defaultExercises);
  const [routines] = useLocalStorage('routines', []);
  const [sessions, setSessions] = useLocalStorage('sessions', []);
  
  const [activeRoutine, setActiveRoutine] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionExercises, setSessionExercises] = useState([]);
  const [showExerciseSelect, setShowExerciseSelect] = useState(false);
  const [sessionDate] = useState(new Date().toISOString().split('T')[0]);
  
  const addExercise = (exercise) => {
    setSessionExercises([
      ...sessionExercises,
      {
        ...exercise,
        sets: [{ weight: '', reps: '', completed: false }]
      }
    ]);
    setShowExerciseSelect(false);
  };
  
  const addSet = (exerciseIndex) => {
    const newExercises = [...sessionExercises];
    newExercises[exerciseIndex].sets.push({ weight: '', reps: '', completed: false });
    setSessionExercises(newExercises);
  };
  
  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...sessionExercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setSessionExercises(newExercises);
  };
  
  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const newExercises = [...sessionExercises];
    newExercises[exerciseIndex].sets[setIndex].completed = !newExercises[exerciseIndex].sets[setIndex].completed;
    setSessionExercises(newExercises);
  };
  
  const removeSet = (exerciseIndex, setIndex) => {
    const newExercises = [...sessionExercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setSessionExercises(newExercises);
  };
  
  const removeExercise = (exerciseIndex) => {
    const newExercises = [...sessionExercises];
    newExercises.splice(exerciseIndex, 1);
    setSessionExercises(newExercises);
  };
  
  const saveSession = () => {
    if (sessionExercises.length === 0) return;
    
    const newSession = {
      id: uuidv4(),
      date: sessionDate,
      routine: activeRoutine || 'Libre',
      notes: sessionNotes,
      exercises: sessionExercises,
      createdAt: new Date().toISOString()
    };
    
    setSessions([newSession, ...sessions]);
    setSessionExercises([]);
    setSessionNotes('');
    setActiveRoutine('');
  };
  
  const completedSets = sessionExercises.reduce((acc, ex) => 
    acc + ex.sets.filter(s => s.completed).length, 0
  );
  
  const totalSets = sessionExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  
  return (
    <div className="dashboard fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Nueva Sesión</h1>
          <p className="date">{new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        {sessions.length > 0 && (
          <div className="last-session">
            <span className="label">Última sesión:</span>
            <span className="value">{sessions[0].date}</span>
          </div>
        )}
      </header>
      
      <div className="session-config">
        <div className="input-group">
          <label className="label">Rutina (opcional)</label>
          <select 
            className="input"
            value={activeRoutine}
            onChange={(e) => setActiveRoutine(e.target.value)}
          >
            <option value="">Sesión libre</option>
            {routines.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        
        <div className="input-group">
          <label className="label">Notas</label>
          <input 
            type="text"
            className="input"
            placeholder="Añadir notas..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
          />
        </div>
      </div>
      
      <div className="exercises-section">
        {sessionExercises.length === 0 ? (
          <div className="empty-state">
            <p>Agrega ejercicios para comenzar tu sesión</p>
          </div>
        ) : (
          sessionExercises.map((exercise, exIndex) => (
            <div key={exIndex} className="exercise-card card">
              <div className="exercise-header">
                <div className="exercise-info">
                  <h3>{exercise.name}</h3>
                  <span className="muscle-tag">{exercise.muscle}</span>
                </div>
                <button 
                  className="btn-ghost remove-btn"
                  onClick={() => removeExercise(exIndex)}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="sets-header">
                <span>Serie</span>
                <span>Peso (kg)</span>
                <span>Reps</span>
                <span></span>
              </div>
              
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className={`set-row ${set.completed ? 'completed' : ''}`}>
                  <span className="set-number">{setIndex + 1}</span>
                  <input
                    type="number"
                    className="input set-input"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                  />
                  <input
                    type="number"
                    className="input set-input"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                  />
                  <div className="set-actions">
                    <button 
                      className={`check-btn ${set.completed ? 'checked' : ''}`}
                      onClick={() => toggleSetComplete(exIndex, setIndex)}
                    >
                      ✓
                    </button>
                    <button 
                      className="btn-ghost"
                      onClick={() => removeSet(exIndex, setIndex)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="add-set-btn" onClick={() => addSet(exIndex)}>
                <Plus size={16} /> Añadir serie
              </button>
            </div>
          ))
        )}
        
        <button 
          className="add-exercise-btn"
          onClick={() => setShowExerciseSelect(true)}
        >
          <Plus size={20} />
          Agregar Ejercicio
        </button>
      </div>
      
      {sessionExercises.length > 0 && (
        <div className="session-footer">
          <div className="progress">
            <span>{completedSets}/{totalSets} series completadas</span>
          </div>
          <button className="btn btn-primary" onClick={saveSession}>
            <Save size={18} />
            Guardar Sesión
          </button>
        </div>
      )}
      
      {showExerciseSelect && (
        <div className="modal-overlay" onClick={() => setShowExerciseSelect(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seleccionar Ejercicio</h2>
              <button 
                className="btn-ghost"
                onClick={() => setShowExerciseSelect(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="exercise-list">
              {exercises.map(ex => (
                <button 
                  key={ex.id}
                  className="exercise-option"
                  onClick={() => addExercise(ex)}
                >
                  <span className="ex-name">{ex.name}</span>
                  <span className="ex-muscle">{ex.muscle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}