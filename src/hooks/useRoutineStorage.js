import { useEffect, useState } from 'react';
import { migrateRoutineStorage } from '../data/routineStorage';

export function useRoutineStorage(key, initialValue = []) {
  const [data, setData] = useState(() => migrateRoutineStorage()[key] || initialValue);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, data]);

  return [data, setData];
}
