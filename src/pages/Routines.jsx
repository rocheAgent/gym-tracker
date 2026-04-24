import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultExercises, muscleGroups } from '../data/defaultExercises';
import { Plus, X, Trash2, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ConfirmDialog from '../components/ConfirmDialog';
import './Routines.css';

export default function Routines() {
  const [routines, setRoutines] = useLocalStorage('routines', []);
  const [exercises] = useLocalStorage('exercises', defaultExercises);
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [newRoutine, setNewRoutine] = useState({ name: '', exercises: [] });
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openNewRoutine = () => {
    setNewRoutine({ name: '', exercises: [] });
    setEditingRoutine(null);
    setShowModal(true);
  };

  const openEditRoutine = (routine) => {
    setNewRoutine({ ...routine, exercises: [...routine.exercises] });
    setEditingRoutine(routine);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowExercisePicker(false);
    setNewRoutine({ name: '', exercises: [] });
    setEditingRoutine(null);
  };

  const saveRoutine = () => {
    if (!newRoutine.name.trim()) return;

    if (editingRoutine) {
      setRoutines(routines.map(r =>
        r.id === editingRoutine.id ? { ...newRoutine, name: newRoutine.name.trim(), id: editingRoutine.id } : r
      ));
    } else {
      setRoutines([...routines, { ...newRoutine, name: newRoutine.name.trim(), id: uuidv4() }]);
    }

    closeModal();
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRoutine();
    }
  };

  const deleteRoutine = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
    setConfirmDelete(null);
  };

  const addExerciseToRoutine = (exercise) => {
    setNewRoutine({
      ...newRoutine,
      exercises: [...newRoutine.exercises, exercise],
    });
    setShowExercisePicker(false);
  };

  const removeExerciseFromRoutine = (index) => {
    setNewRoutine({
      ...newRoutine,
      exercises: newRoutine.exercises.filter((_, i) => i !== index),
    });
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
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-ghost" onClick={() => setConfirmDelete(routine.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="routine-count">{routine.exercises.length} ejercicios</p>
              <div className="routine-exercises">
                {routine.exercises.map((ex, i) => (
                  <span key={ex.id + '-' + i} className="routine-exercise-tag">{ex.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal routine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoutine ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
              <button className="btn-ghost" onClick={closeModal}>
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
                  autoFocus
                  onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                  onKeyDown={handleNameKeyDown}
                />
              </div>

              <div className="exercises-added">
                <label className="label">
                  Ejercicios
                  {newRoutine.exercises.length > 0 && (
                    <span className="exercises-count"> · {newRoutine.exercises.length}</span>
                  )}
                </label>
                {newRoutine.exercises.length === 0 ? (
                  <p className="no-exercises">No hay ejercicios agregados</p>
                ) : (
                  <div className="exercise-tags">
                    {newRoutine.exercises.map((ex, i) => (
                      <span key={ex.id + '-' + i} className="exercise-tag">
                        {ex.name}
                        <button onClick={() => removeExerciseFromRoutine(i)}>
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="btn btn-secondary add-ex-btn"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus size={16} />
                Agregar Ejercicio
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveRoutine}>
                {editingRoutine ? 'Guardar Cambios' : 'Crear Rutina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExercisePicker && (
        <div className="modal-overlay modal-overlay--nested" onClick={() => setShowExercisePicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seleccionar Ejercicio</h2>
              <button className="btn-ghost" onClick={() => setShowExercisePicker(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="exercise-list">
              {muscleGroups.map(group => {
                const groupExercises = exercises.filter(ex => ex.muscle === group);
                if (groupExercises.length === 0) return null;
                return (
                  <div key={group}>
                    <div className="exercise-group-label">{group}</div>
                    {groupExercises.map(ex => (
                      <button
                        key={ex.id}
                        className="exercise-option"
                        onClick={() => addExerciseToRoutine(ex)}
                      >
                        <span className="ex-name">{ex.name}</span>
                        <span className="ex-muscle">{ex.equipment}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="¿Eliminar rutina?"
          message="Esta acción no se puede deshacer."
          onConfirm={() => deleteRoutine(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
