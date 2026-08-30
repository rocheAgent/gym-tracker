import { ArrowLeft, ChevronRight, ClipboardList } from 'lucide-react';
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

export default function MyRoutine() {
  const { routineId } = useParams();
  const [routines] = useRoutineStorage('routines', []);
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
              <div className="my-routine-exercise card" key={`${exercise.id}-${index}`}>
                <div>
                  <h2>{exercise.name}</h2>
                  <div className="my-routine-meta">
                    {exercise.muscle && <span>{exercise.muscle}</span>}
                    {exercise.equipment && <span>{exercise.equipment}</span>}
                  </div>
                </div>
                <Target target={exercise.target} />
              </div>
            ))}
          </div>
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
