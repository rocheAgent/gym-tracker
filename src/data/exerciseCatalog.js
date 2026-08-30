const bodyPartLabels = {
  back: 'Espalda',
  cardio: 'Cardio',
  chest: 'Pecho',
  'lower arms': 'Antebrazo',
  'lower legs': 'Pantorrilla',
  neck: 'Cuello',
  shoulders: 'Hombro',
  'upper arms': 'Brazos',
  'upper legs': 'Pierna',
  waist: 'Core',
};

export function mapDatasetExercise(exercise) {
  const baseUrl = import.meta.env.BASE_URL;

  return {
    id: exercise.id,
    name: exercise.name,
    muscle: bodyPartLabels[exercise.body_part] || exercise.body_part,
    equipment: exercise.equipment,
    image: `${baseUrl}exercises/${exercise.image}`,
    gif: `${baseUrl}exercises/${exercise.gif_url}`,
    instructions: exercise.instructions.es,
    instructionSteps: exercise.instruction_steps.es,
    target: exercise.target,
    muscleGroup: exercise.muscle_group,
    secondaryMuscles: exercise.secondary_muscles,
    attribution: exercise.attribution,
  };
}

export async function loadExerciseCatalog() {
  const response = await fetch(`${import.meta.env.BASE_URL}exercises/data/exercises.json`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (${response.status})`);
  }

  const exercises = await response.json();
  return exercises.map(mapDatasetExercise);
}
