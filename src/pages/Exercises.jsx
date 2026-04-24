import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultExercises, muscleGroups } from '../data/defaultExercises';
import { Plus, Search, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ConfirmDialog from '../components/ConfirmDialog';
import './Exercises.css';

export default function Exercises() {
  const [exercises, setExercises] = useLocalStorage('exercises', defaultExercises);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', muscle: '', equipment: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !filterMuscle || ex.muscle === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const addExercise = () => {
    if (!newExercise.name.trim() || !newExercise.muscle) return;

    setExercises([...exercises, {
      ...newExercise,
      name: newExercise.name.trim(),
      id: uuidv4(),
      isCustom: true,
    }]);
    setNewExercise({ name: '', muscle: '', equipment: '' });
    setShowAddModal(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addExercise();
  };

  const deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    setConfirmDelete(null);
  };

  // Get unique muscle groups from current exercises (may include user-added groups)
  const allGroups = [...new Set([...muscleGroups, ...exercises.map(e => e.muscle)])];

  return (
    <div className="exercises-page fade-in">
      <header className="page-header">
        <div>
          <h1>Ejercicios</h1>
          <p className="subtitle">{exercises.length} ejercicios disponibles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Nuevo
        </button>
      </header>

      <div className="filters">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input search-input"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input filter-select"
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
        >
          <option value="">Todos los grupos</option>
          {allGroups.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron ejercicios</p>
          {search && <p className="hint">Intenta con otro término de búsqueda</p>}
        </div>
      ) : (
        <div className="exercises-grid">
          {filteredExercises.map(ex => (
            <div key={ex.id} className="exercise-item card">
              <div className="exercise-info">
                <h3>{ex.name}</h3>
                <div className="tags">
                  <span className="tag muscle">{ex.muscle}</span>
                  {ex.equipment && <span className="tag equipment">{ex.equipment}</span>}
                  {ex.isCustom && <span className="tag custom">Custom</span>}
                </div>
              </div>
              {ex.isCustom && (
                <button
                  className="btn-ghost delete-btn"
                  onClick={() => setConfirmDelete(ex.id)}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Ejercicio</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-body" onSubmit={handleFormSubmit}>
              <div className="input-group">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nombre del ejercicio"
                  value={newExercise.name}
                  autoFocus
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Grupo Muscular</label>
                <select
                  className="input"
                  value={newExercise.muscle}
                  onChange={(e) => setNewExercise({ ...newExercise, muscle: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {muscleGroups.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="label">Equipamiento</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Barra, Mancuernas, Máquina..."
                  value={newExercise.equipment}
                  onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                />
              </div>
            </form>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={addExercise}>
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="¿Eliminar ejercicio?"
          message="Esta acción no se puede deshacer."
          onConfirm={() => deleteExercise(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
