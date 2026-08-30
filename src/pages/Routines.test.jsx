import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Routines from './Routines';

beforeEach(() => {
  window.localStorage.clear();
});

describe('Routines modals', () => {
  it('opens accessible centered modal flows and scrolls only the exercise picker', async () => {
    const user = userEvent.setup();

    render(<Routines />);

    await user.click(screen.getByRole('button', { name: 'Nueva Rutina' }));
    expect(screen.getByRole('dialog', { name: 'Nueva Rutina' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Agregar Ejercicio' }));
    expect(screen.getByRole('dialog', { name: 'Seleccionar Ejercicio' })).toBeInTheDocument();

    const exerciseList = document.querySelector('.routine-exercise-picker .exercise-list');
    const scrollTo = vi.fn();
    exerciseList.scrollTo = scrollTo;
    expect(screen.queryByRole('button', { name: 'Volver arriba' })).not.toBeInTheDocument();
    Object.defineProperty(exerciseList, 'scrollTop', { configurable: true, value: 301 });
    fireEvent.scroll(exerciseList);

    const returnButton = await screen.findByRole('button', { name: 'Volver arriba' });
    await user.click(returnButton);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(screen.getByRole('dialog', { name: 'Seleccionar Ejercicio' })).toBeInTheDocument();
  });
});
