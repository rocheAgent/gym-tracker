import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, ClipboardList, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import './MyRoutine.css';

function Target({ target }) {
  const details = [
    target?.sets && `${target.sets} series`,
    target?.reps && `${target.reps} reps`,
    target?.weight && `${target.weight} kg`,
  ].filter(Boolean);

  return details.length > 0 ? (
    <span className="my-routine-target">{details.join(' · ')}</span>
  ) : null;
}

function formatDate(dateStr) {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function latestExerciseSession(sessions, routineId, exerciseId) {
  return [...sessions]
    .filter(session => session.routineId === routineId)
    .filter(session => session.exercises?.some(exercise => exercise.id === exerciseId))
    .sort((a, b) => {
      const dateDifference = new Date(b.date) - new Date(a.date);
      return dateDifference || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })[0] || null;
}

function ExerciseHistoryModal({ routine, exercise, session, onClose }) {
  const sessionExercise = session?.exercises.find(item => item.id === exercise.id);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal exercise-history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-history-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="exercise-history-title">{exercise.name}</h2>
            <p className="exercise-history-context">Última sesión en {routine.name}</p>
          </div>
          <button className="btn-ghost" aria-label="Cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!session ? (
            <div className="empty-state exercise-history-empty">
              <p>No hay historial para este ejercicio</p>
              <p className="hint">Registra una sesión con esta rutina para ver tu rendimiento.</p>
            </div>
          ) : (
            <div className="exercise-history-details">
              <div className="exercise-history-date">
                <span className="label">Fecha</span>
                <strong>{formatDate(session.date)}</strong>
              </div>
              <div className="exercise-history-summary">
                <span><strong>{sessionExercise.sets.length}</strong> series</span>
                <span><strong>{sessionExercise.sets.map(set => set.reps ?? '-').join(', ')}</strong> reps</span>
              </div>
              <div className="exercise-history-sets">
                <span className="label">Series registradas</span>
                {sessionExercise.sets.map((set, index) => (
                  <div className="exercise-history-set" key={set.id || index}>
                    <span>Serie {index + 1}</span>
                    <strong>{set.weight ?? '-'} kg × {set.reps ?? '-'} reps</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyRoutine() {
  const { routineId } = useParams();
  const [routines] = useRoutineStorage('routines', []);
  const [sessions] = useRoutineStorage('sessions', []);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const selectedRoutine = routineId ? routines.find(routine => routine.id === routineId) : null;

  if (routineId) {
    if (!selectedRoutine) {
      return (
        <div className="my-routine-page fade-in">
          <Link className="back-link" to="/my-routine">
            <ArrowLeft size={17} />
            Volver a Mi rutina
          </Link>
          <div className="empty-state">
            <p>Esta rutina ya no está disponible</p>
            <p className="hint">Selecciona otra rutina para continuar.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="my-routine-page fade-in">
        <Link className="back-link" to="/my-routine">
          <ArrowLeft size={17} />
          Volver a Mi rutina
        </Link>
        <header className="page-header my-routine-detail-header">
          <div>
            <h1>{selectedRoutine.name}</h1>
            <p className="subtitle">{selectedRoutine.exercises.length} ejercicios</p>
          </div>
        </header>

        {selectedRoutine.exercises.length === 0 ? (
          <div className="empty-state">
            <p>Esta rutina todavía no tiene ejercicios</p>
            <p className="hint">Puedes agregar ejercicios desde Rutinas.</p>
            <Link className="btn btn-secondary" to="/routines">Configurar en Rutinas</Link>
          </div>
        ) : (
          <div className="my-routine-exercises">
            {selectedRoutine.exercises.map((exercise, index) => (
                <button
                  className="my-routine-exercise card"
                  key={`${exercise.id}-${index}`}
                  onClick={() => setSelectedExercise(exercise)}
                >
                <div>
                  <h2>{exercise.name}</h2>
                  <div className="my-routine-meta">
                    {exercise.muscle && <span>{exercise.muscle}</span>}
                    {exercise.equipment && <span>{exercise.equipment}</span>}
                  </div>
                </div>
                <Target target={exercise.target} />
                </button>
              ))}
          </div>
        )}

        {selectedExercise && (
          <ExerciseHistoryModal
            routine={selectedRoutine}
            exercise={selectedExercise}
            session={latestExerciseSession(sessions, selectedRoutine.id, selectedExercise.id)}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="my-routine-page fade-in">
      <header className="page-header">
        <div>
          <h1>Mi rutina</h1>
          <p className="subtitle">Selecciona una rutina para ver sus ejercicios</p>
        </div>
      </header>

      {routines.length === 0 ? (
        <div className="empty-state">
          <ClipboardList className="empty-state-icon" size={32} />
          <p>No tienes rutinas disponibles</p>
          <p className="hint">Crea y configura una rutina desde Rutinas para verla aquí.</p>
          <Link className="btn btn-secondary" to="/routines">Ir a Rutinas</Link>
        </div>
      ) : (
        <div className="my-routine-list">
          {routines.map(routine => (
            <Link className="my-routine-option card" to={`/my-routine/${routine.id}`} key={routine.id}>
              <div>
                <h2>{routine.name}</h2>
                <p>{routine.exercises.length} ejercicios</p>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
