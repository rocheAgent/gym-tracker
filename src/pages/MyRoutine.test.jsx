import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import MyRoutine from './MyRoutine';

const routinesKey = 'routines';

function renderMyRoutine(initialEntry = '/my-routine') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/my-routine" element={<MyRoutine />} />
        <Route path="/my-routine/:routineId" element={<MyRoutine />} />
        <Route path="/routines" element={<h1>Rutinas</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function persistRoutines(routines) {
  window.localStorage.setItem(routinesKey, JSON.stringify(routines));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('MyRoutine', () => {
  it('shows the empty state when no routines are persisted', () => {
    renderMyRoutine();

    expect(screen.getByRole('heading', { name: 'Mi rutina' })).toBeInTheDocument();
    expect(screen.getByText('No tienes rutinas disponibles')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir a Rutinas/i })).toHaveAttribute('href', '/routines');
    expect(window.localStorage.getItem(routinesKey)).toBe('[]');
  });

  it('lists persisted routines without creating an implicit routine', () => {
    persistRoutines([
      { id: 'push', name: 'Empuje', exercises: [] },
      { id: 'pull', name: 'Tirón', exercises: [] },
    ]);

    renderMyRoutine();

    expect(screen.getByRole('link', { name: /Empuje 0 ejercicios/i })).toHaveAttribute(
      'href',
      '/my-routine/push',
    );
    expect(screen.getByRole('link', { name: /Tirón 0 ejercicios/i })).toBeInTheDocument();
    expect(screen.queryByText('No tienes rutinas disponibles')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(routinesKey))).toHaveLength(2);
  });

  it('shows only the selected routine exercises with persisted metadata and targets', () => {
    persistRoutines([
      {
        id: 'push',
        name: 'Empuje',
        exercises: [
          {
            id: 'bench',
            name: 'Press banca',
            muscle: 'Pecho',
            equipment: 'Barra',
            target: { sets: '4', reps: '8', weight: '60' },
          },
        ],
      },
      {
        id: 'pull',
        name: 'Tirón',
        exercises: [{ id: 'row', name: 'Remo', muscle: 'Espalda', equipment: 'Mancuernas' }],
      },
    ]);

    renderMyRoutine('/my-routine/push');

    expect(screen.getByRole('heading', { name: 'Empuje', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Press banca' })).toBeInTheDocument();
    expect(screen.getByText('Pecho')).toBeInTheDocument();
    expect(screen.getByText('Barra')).toBeInTheDocument();
    expect(screen.getByText('4 series · 8 reps · 60 kg')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Remo' })).not.toBeInTheDocument();
  });

  it('guides an empty selected routine to Rutinas', async () => {
    persistRoutines([{ id: 'empty', name: 'Descanso', exercises: [] }]);
    const user = userEvent.setup();

    renderMyRoutine('/my-routine/empty');

    expect(screen.getByText('Esta rutina todavía no tiene ejercicios')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Configurar en Rutinas' }));

    expect(screen.getByRole('heading', { name: 'Rutinas' })).toBeInTheDocument();
  });

  it('returns to the routine list through back navigation', async () => {
    persistRoutines([{ id: 'push', name: 'Empuje', exercises: [] }]);
    const user = userEvent.setup();

    renderMyRoutine('/my-routine/push');
    await user.click(screen.getByRole('link', { name: /Volver a Mi rutina/i }));

    expect(screen.getByRole('heading', { name: 'Mi rutina' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Empuje 0 ejercicios/i })).toBeInTheDocument();
  });
});
