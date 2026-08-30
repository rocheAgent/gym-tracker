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

  it('shows the latest matching session with each set preserved', async () => {
    persistRoutines([{
      id: 'push',
      name: 'Empuje',
      exercises: [{ id: 'bench', name: 'Press banca' }],
    }]);
    window.localStorage.setItem('sessions', JSON.stringify([
      {
        id: 'old',
        routineId: 'push',
        date: '2026-08-01',
        exercises: [{ id: 'bench', name: 'Press banca', sets: [{ id: 'old-set', weight: '50', reps: '10' }] }],
      },
      {
        id: 'latest',
        routineId: 'push',
        date: '2026-08-20',
        exercises: [{
          id: 'bench',
          name: 'Press banca',
          sets: [
            { id: 'set-1', weight: '60', reps: '8' },
            { id: 'set-2', weight: '65', reps: '5' },
          ],
        }],
      },
      {
        id: 'other-routine',
        routineId: 'pull',
        date: '2026-08-30',
        exercises: [{ id: 'bench', name: 'Press banca', sets: [{ weight: '100', reps: '1' }] }],
      },
    ]));

    const user = userEvent.setup();
    renderMyRoutine('/my-routine/push');
    await user.click(screen.getByRole('button', { name: /Press banca/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Última sesión en Empuje/)).toBeInTheDocument();
    expect(screen.getByText(/20 ago 2026/)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === '2 series')).toBeInTheDocument();
    expect(screen.getByText('60 kg × 8 reps')).toBeInTheDocument();
    expect(screen.getByText('65 kg × 5 reps')).toBeInTheDocument();
    expect(screen.queryByText('100 kg × 1 reps')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Press banca' })).toBeInTheDocument();
  });

  it('shows an empty state when the exercise has no session history', async () => {
    persistRoutines([{ id: 'push', name: 'Empuje', exercises: [{ id: 'bench', name: 'Press banca' }] }]);
    const user = userEvent.setup();

    renderMyRoutine('/my-routine/push');
    await user.click(screen.getByRole('button', { name: /Press banca/i }));

    expect(screen.getByText('No hay historial para este ejercicio')).toBeInTheDocument();
  });

  it('saves exercise targets without changing session history', async () => {
    persistRoutines([{ id: 'push', name: 'Empuje', exercises: [{ id: 'bench', name: 'Press banca' }] }]);
    window.localStorage.setItem('sessions', JSON.stringify([{
      id: 'session', routineId: 'push', date: '2026-08-20',
      exercises: [{ id: 'bench', sets: [{ weight: '50', reps: '10' }] }],
    }]));
    const user = userEvent.setup();

    renderMyRoutine('/my-routine/push');
    await user.click(screen.getByRole('button', { name: /Press banca/i }));
    await user.type(screen.getByLabelText('Peso (kg)'), '60');
    await user.type(screen.getByLabelText('Series'), '4');
    await user.type(screen.getByLabelText('Repeticiones'), '8');
    await user.click(screen.getByRole('button', { name: /Guardar objetivos/i }));

    expect(JSON.parse(window.localStorage.getItem('routines'))[0].exercises[0].target)
      .toEqual({ weight: '60', sets: '4', reps: '8' });
    expect(JSON.parse(window.localStorage.getItem('sessions'))[0].exercises[0].sets[0])
      .toEqual({ weight: '50', reps: '10' });
  });

  it('keeps empty targets editable and discards changes on cancel', async () => {
    persistRoutines([{ id: 'push', name: 'Empuje', exercises: [{ id: 'bench', name: 'Press banca' }] }]);
    const user = userEvent.setup();

    renderMyRoutine('/my-routine/push');
    await user.click(screen.getByRole('button', { name: /Press banca/i }));
    expect(screen.getByLabelText('Peso (kg)')).toHaveValue(null);
    expect(screen.getByLabelText('Series')).toHaveValue(null);
    expect(screen.getByLabelText('Repeticiones')).toHaveValue(null);
    await user.type(screen.getByLabelText('Series'), '5');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(JSON.parse(window.localStorage.getItem('routines'))[0].exercises[0].target)
      .toEqual({ weight: '', sets: '', reps: '' });
  });

  it('requires a positive integer for the target series count', async () => {
    persistRoutines([{ id: 'push', name: 'Empuje', exercises: [{ id: 'bench', name: 'Press banca' }] }]);
    const user = userEvent.setup();

    renderMyRoutine('/my-routine/push');
    await user.click(screen.getByRole('button', { name: /Press banca/i }));
    await user.type(screen.getByLabelText('Series'), '1.5');

    expect(screen.getByText(/Las series deben ser/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar objetivos/i })).toBeDisabled();
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
