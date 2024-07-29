// src/VehiculesList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehiculesList.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const VehiculesList = () => {
  const [vehicules, setVehicules] = useState([]);
  const [error, setError] = useState(null); // Ajouté pour l'affichage des erreurs
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const response = await fetch(baseURI + 'api/vehicules', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setVehicules(data);
          setError(null); // Réinitialiser l'erreur en cas de succès
        } else {
          setError('Erreur lors de la récupération des véhicules'); // Définir le message d'erreur
        }
      } catch (error) {
        setError('Erreur réseau'); // Définir le message d'erreur en cas d'exception
      }
    };

    fetchVehicules();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        const response = await fetch(baseURI + `api/vehicule/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          alert('Véhicule supprimé avec succès');
          setVehicules(vehicules.filter(vehicule => vehicule.id !== id));
        } else {
          alert('Erreur lors de la suppression du véhicule');
        }
      } catch (error) {
        alert('Erreur réseau');
      }
    }
  };

  return (
    <div className="vehicules-list">
      <button onClick={() => navigate('/dashboard')}>Retour</button>
      <h2>Liste des Véhicules</h2>
      {error && <p className="error-message">{error}</p>} {/* Afficher l'erreur ici */}
      <table>
        <thead>
          <tr>
            <th>Immatriculation</th>
            <th>Marque</th>
            <th>Modèle</th>
            <th>Année</th>
            <th>Propriétaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicules.map(vehicule => (
            <tr key={vehicule.id}>
              <td>{vehicule.id}</td>
              <td>{vehicule.marque}</td>
              <td>{vehicule.modele}</td>
              <td>{vehicule.annee}</td>
              <td>{vehicule.firstname ? `${vehicule.firstname} ${vehicule.lastname}` : 'Non assigné'}</td>
              <td>
                <button onClick={() => navigate(`/edit-vehicules/${vehicule.id}`)}>Modifier</button>
                <button onClick={() => handleDelete(vehicule.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehiculesList;
