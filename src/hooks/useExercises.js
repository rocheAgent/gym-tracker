import { useState } from 'react';
import { workoutExercises } from '../data/exerciseCatalog';
import { useLocalStorage } from './useLocalStorage';

export function useExercises() {
  const [customExercises, setCustomExercises] = useLocalStorage('customExercises', []);

  const exercises = [...workoutExercises, ...customExercises];

  const setExercises = nextExercises => {
    setCustomExercises(currentCustom => {
      const currentExercises = [...workoutExercises, ...currentCustom];
      const resolvedExercises = typeof nextExercises === 'function'
        ? nextExercises(currentExercises)
        : nextExercises;

      return resolvedExercises.filter(exercise => exercise.isCustom);
    });
  };

  return { exercises, setExercises, isLoading: false };
}
