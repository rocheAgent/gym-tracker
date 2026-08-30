import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Exercises from './Exercises';

beforeEach(() => {
  window.localStorage.clear();
});

describe('Exercises', () => {
  it('creates a routine with multiple selected exercises', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click(screen.getByRole('button', { name: /Crear rutina \(2\)/i }));
    await user.type(screen.getByLabelText('Nombre de la Rutina'), 'Full body');
    await user.click(screen.getByRole('button', { name: 'Crear Rutina' }));

    await waitFor(() => {
      const routines = JSON.parse(window.localStorage.getItem('routines'));
      expect(routines).toHaveLength(1);
      expect(routines[0].name).toBe('Full body');
      expect(routines[0].exercises).toHaveLength(2);
      expect(routines[0].exercises[0].target).toEqual({ weight: '', sets: '', reps: '' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows an accessible return-to-top button after scrolling the catalog', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });

    render(<Exercises />);

    expect(screen.queryByRole('button', { name: 'Volver arriba' })).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 301 });
    fireEvent.scroll(window);

    const returnButton = await screen.findByRole('button', { name: 'Volver arriba' });
    await user.click(returnButton);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });
});
