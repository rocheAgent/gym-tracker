import {
  exercises,
  getAssetUrl,
  getExercise,
  searchExercises,
} from '@bryllim/workout-guide';

const muscleLabels = {
  Back: 'Espalda',
  Biceps: 'Bícep',
  Chest: 'Pecho',
  Core: 'Core',
  Glutes: 'Glúteos',
  Hamstrings: 'Isquiotibiales',
  'Lower Back': 'Espalda baja',
  'Lower Legs': 'Pantorrilla',
  Quadriceps: 'Cuádriceps',
  Shoulders: 'Hombro',
  Triceps: 'Trícep',
  'Upper Back': 'Espalda alta',
};

const equipmentLabels = {
  Barbell: 'Barra',
  Bodyweight: 'Peso corporal',
  Cable: 'Polea',
  Dumbbell: 'Mancuernas',
  Machine: 'Máquina',
};

export function mapWorkoutExercise(exercise) {
  return {
    id: exercise.slug,
    name: exercise.name,
    muscle: muscleLabels[exercise.primaryMuscle] || exercise.primaryMuscle,
    equipment: equipmentLabels[exercise.equipment] || exercise.equipment,
    exerciseType: exercise.exerciseType,
    secondaryMuscles: exercise.secondaryMuscles,
    isStretch: exercise.isStretch,
    image: getAssetUrl(exercise.slug, 1),
    frames: exercise.frames.map(frame => ({
      ...frame,
      url: getAssetUrl(exercise.slug, frame.index),
    })),
    attribution: exercise.attribution,
  };
}

export const workoutExercises = exercises.map(mapWorkoutExercise);

export { getExercise, searchExercises };
