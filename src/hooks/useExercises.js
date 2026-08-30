import { useEffect, useState } from 'react';
import { defaultExercises } from '../data/defaultExercises';
import { loadExerciseCatalog } from '../data/exerciseCatalog';
import { useLocalStorage } from './useLocalStorage';

export function useExercises() {
  const [catalog, setCatalog] = useState(defaultExercises);
  const [customExercises, setCustomExercises] = useLocalStorage('customExercises', []);
  const [isLoading, setIsLoading] = useState(true);

  const exercises = [...catalog, ...customExercises];

  const setExercises = nextExercises => {
    setCustomExercises(currentCustom => {
      const currentExercises = [...catalog, ...currentCustom];
      const resolvedExercises = typeof nextExercises === 'function'
        ? nextExercises(currentExercises)
        : nextExercises;

      return resolvedExercises.filter(exercise => exercise.isCustom);
    });
  };

  useEffect(() => {
    if (window.localStorage.getItem('customExercisesMigrated') === '1') return;

    try {
      const legacyExercises = JSON.parse(window.localStorage.getItem('exercises'));
      const legacyCustom = Array.isArray(legacyExercises)
        ? legacyExercises.filter(exercise => exercise.isCustom)
        : [];

      if (legacyCustom.length > 0) {
        setCustomExercises(current => [...current, ...legacyCustom]);
      }
      window.localStorage.setItem('customExercisesMigrated', '1');
    } catch (error) {
      console.error('Error migrating custom exercises:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    loadExerciseCatalog()
      .then(catalog => {
        if (!active) return;
        setCatalog(catalog);
      })
      .catch(error => {
        console.error('Error loading exercise catalog:', error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { exercises, setExercises, isLoading };
}
