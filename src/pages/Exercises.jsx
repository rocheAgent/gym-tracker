import { useEffect, useRef, useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { emptyTarget, normalizeRoutine } from '../data/routineStorage';
import { Plus, Search, X, Trash2, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ConfirmDialog from '../components/ConfirmDialog';
import ModalPortal from '../components/ModalPortal';
import ScrollToTopButton from '../components/ScrollToTopButton';
import './Exercises.css';

export default function Exercises() {
  const { exercises, setExercises, isLoading } = useExercises();
  const [routines, setRoutines] = useRoutineStorage('routines', []);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);
  const [routineName, setRoutineName] = useState('');
  const [newExercise, setNewExercise] = useState({ name: '', muscle: '', equipment: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const createRoutineButtonRef = useRef(null);
  const routineNameInputRef = useRef(null);

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
    setSelectedExerciseIds(selectedExerciseIds.filter(exerciseId => exerciseId !== id));
    setConfirmDelete(null);
  };

  const toggleExercise = (id) => {
    setSelectedExerciseIds(current => current.includes(id)
      ? current.filter(exerciseId => exerciseId !== id)
      : [...current, id]);
  };

  const openRoutineModal = () => {
    setRoutineName('');
    setShowRoutineModal(true);
  };

  const closeRoutineModal = () => {
    setShowRoutineModal(false);
    setRoutineName('');
  };

  useEffect(() => {
    if (!showRoutineModal) return undefined;

    routineNameInputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeRoutineModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      createRoutineButtonRef.current?.focus();
    };
  }, [showRoutineModal]);

  const createRoutine = () => {
    const name = routineName.trim();
    if (!name) return;

    const selectedExercises = selectedExerciseIds
      .map(id => exercises.find(exercise => exercise.id === id))
      .filter(Boolean)
      .map(exercise => ({ ...exercise, target: emptyTarget() }));

    setRoutines([...routines, normalizeRoutine({
      id: uuidv4(),
      name,
      exercises: selectedExercises,
    })]);
    setSelectedExerciseIds([]);
    closeRoutineModal();
  };

  // Get unique muscle groups from current exercises (may include user-added groups)
  const allGroups = [...new Set(exercises.map(e => e.muscle))].sort();

  return (
    <>
      <div className="exercises-page fade-in">
      <header className="page-header">
        <div>
          <h1>Ejercicios</h1>
          <p className="subtitle">{isLoading ? 'Cargando catálogo...' : `${exercises.length} ejercicios disponibles`}</p>
        </div>
        <div className="header-actions">
          <button
            ref={createRoutineButtonRef}
            className="btn btn-primary"
            onClick={openRoutineModal}
            disabled={selectedExerciseIds.length === 0}
          >
            <Check size={18} />
            Crear rutina{selectedExerciseIds.length > 0 && ` (${selectedExerciseIds.length})`}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Nuevo
          </button>
        </div>
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
            <div key={ex.id} className={`exercise-item card ${selectedExerciseIds.includes(ex.id) ? 'is-selected' : ''}`}>
              <label className="exercise-select" aria-label={`Seleccionar ${ex.name}`}>
                <input
                  type="checkbox"
                  checked={selectedExerciseIds.includes(ex.id)}
                  onChange={() => toggleExercise(ex.id)}
                />
                <span className="selection-indicator" aria-hidden="true">
                  {selectedExerciseIds.includes(ex.id) && <Check size={13} />}
                </span>
              </label>
              {ex.image && <img className="exercise-image" src={ex.image} alt="" loading="lazy" />}
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

      <p className="media-attribution">
        Ilustraciones de Bryl Lim — <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
      </p>
      {showAddModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-exercise-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 id="new-exercise-title">Nuevo Ejercicio</h2>
                <button className="btn-ghost" aria-label="Cerrar" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form className="modal-body" onSubmit={handleFormSubmit}>
                <div className="input-group">
                  <label className="label" htmlFor="new-exercise-name">Nombre</label>
                  <input
                    id="new-exercise-name"
                    type="text"
                    className="input"
                    placeholder="Nombre del ejercicio"
                    value={newExercise.name}
                    data-modal-initial-focus="true"
                    autoFocus
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="label" htmlFor="new-exercise-muscle">Grupo Muscular</label>
                  <select
                    id="new-exercise-muscle"
                    className="input"
                    value={newExercise.muscle}
                    onChange={(e) => setNewExercise({ ...newExercise, muscle: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {allGroups.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label" htmlFor="new-exercise-equipment">Equipamiento</label>
                  <input
                    id="new-exercise-equipment"
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
        </ModalPortal>
      )}

      {showRoutineModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={closeRoutineModal}>
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-routine-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 id="create-routine-title">Crear Rutina</h2>
                <button className="btn-ghost" onClick={closeRoutineModal} aria-label="Cerrar">
                  <X size={20} />
                </button>
              </div>
              <form className="modal-body" onSubmit={(e) => { e.preventDefault(); createRoutine(); }}>
                <div className="input-group">
                  <label className="label" htmlFor="routine-name">Nombre de la Rutina</label>
                  <input
                    id="routine-name"
                    ref={routineNameInputRef}
                    type="text"
                    className="input"
                    placeholder="Día pecho, Full body..."
                    value={routineName}
                    data-modal-initial-focus="true"
                    autoFocus
                    onChange={(e) => setRoutineName(e.target.value)}
                  />
                </div>
                <p className="selected-routine-summary">
                  {selectedExerciseIds.length} ejercicios seleccionados
                </p>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeRoutineModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!routineName.trim()}>
                    Crear Rutina
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
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
      <ScrollToTopButton />
    </>
  );
}
