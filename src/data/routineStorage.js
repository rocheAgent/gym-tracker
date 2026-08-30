import { v4 as uuidv4 } from 'uuid';

export const emptyTarget = () => ({ weight: '', sets: '', reps: '' });

export function normalizeRoutineExercise(exercise) {
  return {
    ...exercise,
    target: {
      ...emptyTarget(),
      ...(exercise.target || exercise.goal || {}),
    },
  };
}

export function normalizeRoutine(routine) {
  return {
    ...routine,
    id: routine.id || uuidv4(),
    exercises: (routine.exercises || []).map(normalizeRoutineExercise),
  };
}

export function normalizeRoutines(routines) {
  return (Array.isArray(routines) ? routines : []).map(normalizeRoutine);
}

export function normalizeSessions(sessions, routines) {
  const routineIdsByName = new Map();
  routines.forEach(routine => {
    const ids = routineIdsByName.get(routine.name) || [];
    routineIdsByName.set(routine.name, [...ids, routine.id]);
  });

  return (Array.isArray(sessions) ? sessions : []).map(session => ({
    ...session,
    ...(session.routineId || !session.routine
      ? {}
      : routineIdsByName.get(session.routine)?.length === 1
        ? { routineId: routineIdsByName.get(session.routine)[0] }
        : {}),
  }));
}

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

export function migrateRoutineStorage() {
  const routines = normalizeRoutines(readJson('routines', []));
  const sessions = normalizeSessions(readJson('sessions', []), routines);

  try {
    window.localStorage.setItem('routines', JSON.stringify(routines));
    window.localStorage.setItem('sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error migrating routine storage:', error);
  }

  return { routines, sessions };
}
