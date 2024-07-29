// tests/VehiculesList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VehiculesList from '../src/components/VehiculesList';
import { BrowserRouter as Router } from 'react-router-dom';

global.fetch = vi.fn();

describe('VehiculesList', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render the list of vehicles', async () => {
    const mockData = [
      { id: '1', marque: 'Toyota', modele: 'Corolla', annee: '2022', firstname: 'John', lastname: 'Doe' },
      { id: '2', marque: 'Honda', modele: 'Civic', annee: '2021', firstname: 'Jane', lastname: 'Doe' },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <Router>
        <VehiculesList />
      </Router>
    );

    expect(await screen.findByText('Liste des Véhicules')).toBeInTheDocument();
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(await screen.findByText('Corolla')).toBeInTheDocument();
  });

  it('should handle vehicle deletion', async () => {
    const mockData = [
      { id: '1', marque: 'Toyota', modele: 'Corolla', annee: '2022', firstname: 'John', lastname: 'Doe' },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <Router>
        <VehiculesList />
      </Router>
    );

    // Ensure that the "Supprimer" button is rendered
    expect(await screen.findByText('Supprimer')).toBeInTheDocument();

    // Mock the fetch response for deletion
    fetch.mockResolvedValueOnce({ ok: true });

    // Mock window.confirm to always return true
    window.confirm = vi.fn(() => true);

    // Find and click the delete button
    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    // Check that the fetch call was made with the correct URL
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('api/vehicule/1'), expect.any(Object));
    });

    // Check that the vehicle is removed from the document
    await waitFor(() => {
      expect(screen.queryByText('Toyota')).not.toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    render(
      <Router>
        <VehiculesList />
      </Router>
    );

    // Wait for the error message to appear
    expect(await screen.findByText('Erreur lors de la récupération des véhicules')).toBeInTheDocument();
  });
});
