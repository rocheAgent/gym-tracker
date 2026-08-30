import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import Dashboard from './Dashboard';

beforeEach(() => {
  window.localStorage.clear();
});

describe('Dashboard routine targets', () => {
  it('uses saved targets for the initial session sets', async () => {
    window.localStorage.setItem('routines', JSON.stringify([{
      id: 'push',
      name: 'Empuje',
      exercises: [{ id: 'bench', name: 'Press banca', muscle: 'Pecho', target: { weight: '60', sets: '3', reps: '8' } }],
    }]));
    const user = userEvent.setup();

    render(<Dashboard />);
    await user.selectOptions(screen.getByLabelText('Rutina (opcional)'), 'push');

    expect(screen.getAllByDisplayValue('60')).toHaveLength(3);
    expect(screen.getAllByDisplayValue('8')).toHaveLength(3);
  });

  it('does not invent values for targets that are empty', async () => {
    window.localStorage.setItem('routines', JSON.stringify([{
      id: 'push', name: 'Empuje', exercises: [{ id: 'bench', name: 'Press banca', target: { weight: '', sets: '', reps: '' } }],
    }]));
    const user = userEvent.setup();

    render(<Dashboard />);
    await user.selectOptions(screen.getByLabelText('Rutina (opcional)'), 'push');

    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    screen.getAllByRole('spinbutton').forEach(input => expect(input).toHaveValue(null));
    expect(screen.getByText('0/1 series completadas')).toBeInTheDocument();
  });
});
