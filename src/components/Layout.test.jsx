import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Layout from './Layout';

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  it('shows the available workout navigation links without the unfinished session tab', () => {
    renderLayout();

    const destinations = [
      ['Ejercicios', '/exercises'],
      ['Rutinas', '/routines'],
      ['Mi rutina', '/my-routine'],
      ['Historial', '/history'],
    ];

    destinations.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    });
    expect(screen.queryByRole('link', { name: 'Nueva Sesión' })).not.toBeInTheDocument();
  });
});
