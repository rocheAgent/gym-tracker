import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

describe('App', () => {
  it('renders the Mi rutina page at its route', () => {
    render(
      <MemoryRouter initialEntries={['/my-routine']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Mi rutina' })).toBeInTheDocument();
    expect(screen.getByText('No tienes rutinas disponibles')).toBeInTheDocument();
  });
});
