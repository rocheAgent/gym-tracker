import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultExercises } from '../data/defaultExercises';
import { Plus, X, Trash2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './Routines.css';

export default function Routines() {
  const [routines, setRoutines] = useLocalStorage('routines', []);
  const [exercises] = useLocalStorage('exercises', defaultExercises);
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [newRoutine, setNewRoutine] = useState({ name: '', exercises: [] });
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  
  const openNewRoutine = () => {
    setNewRoutine({ name: '', exercises: [] });
    setEditingRoutine(null);
    setShowModal(true);
  };
  
  const openEditRoutine = (routine) => {
    setNewRoutine({ ...routine });
    setEditingRoutine(routine);
    setShowModal(true);
  };
  
  const saveRoutine = () => {
    if (!newRoutine.name) return;
    
    if (editingRoutine) {
      setRoutines(routines.map(r => r.id === editingRoutine.id ? { ...newRoutine, id: editingRoutine.id } : r));
    } else {
      setRoutines([...routines, { ...newRoutine, id: uuidv4() }]);
    }
    
    setShowModal(false);
    setNewRoutine({ name: '', exercises: [] });
  };
  
  const deleteRoutine = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };
  
  const addExerciseToRoutine = (exercise) => {
    setNewRoutine({
      ...newRoutine,
      exercises: [...newRoutine.exercises, exercise]
    });
    setShowExercisePicker(false);
  };
  
  const removeExerciseFromRoutine = (index) => {
    const newExercises = [...newRoutine.exercises];
    newExercises.splice(index, 1);
    setNewRoutine({ ...newRoutine, exercises: newExercises });
  };
  
  return (
    <div className="routines-page fade-in">
      <header className="page-header">
        <div>
          <h1>Rutinas</h1>
          <p className="subtitle">{routines.length} rutinas creadas</p>
        </div>
        <button className="btn btn-primary" onClick={openNewRoutine}>
          <Plus size={18} />
          Nueva Rutina
        </button>
      </header>
      
      {routines.length === 0 ? (
        <div className="empty-state">
          <p>No tienes rutinas creadas</p>
          <button className="btn btn-secondary" onClick={openNewRoutine}>
            Crear tu primera rutina
          </button>
        </div>
      ) : (
        <div className="routines-grid">
          {routines.map(routine => (
            <div key={routine.id} className="routine-card card">
              <div className="routine-header">
                <h3>{routine.name}</h3>
                <div className="routine-actions">
                  <button className="btn-ghost" onClick={() => openEditRoutine(routine)}>
                    Editar
                  </button>
                  <button className="btn-ghost" onClick={() => deleteRoutine(routine.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="routine-exercises">
                {routine.exercises.map((ex, i) => (
                  <span key={i} className="routine-exercise-tag">{ex.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal routine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoutine ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="label">Nombre de la Rutina</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Día pecho, Full body..."
                  value={newRoutine.name}
                  onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                />
              </div>
              
              <div className="exercises-added">
                <label className="label">Ejercicios</label>
                {newRoutine.exercises.length === 0 ? (
                  <p className="no-exercises">No hay ejercicios agregados</p>
                ) : (
                  <div className="exercise-tags">
                    {newRoutine.exercises.map((ex, i) => (
                      <span key={i} className="exercise-tag">
                        {ex.name}
                        <button onClick={() => removeExerciseFromRoutine(i)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus size={18} />
                Agregar Ejercicio
              </button>
              
              </div><div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={saveRoutine}>
                  Guardar Rutina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showExercisePicker && (
        <div className="modal-overlay" onClick={() => setShowExercisePicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seleccionar Ejercicio</h2>
              <button className="btn-ghost" onClick={() => setShowExercisePicker(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="exercise-list">
              {exercises.map(ex => (
                <button 
                  key={ex.id}
                  className="exercise-option"
                  onClick={() => addExerciseToRoutine(ex)}
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