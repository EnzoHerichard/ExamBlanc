import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AddVehicle = () => {
  const [id, setId] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [annee, setAnnee] = useState('');
  const [idClient, setIdClient] = useState('');
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(baseURI + 'api/clients', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          alert('Erreur lors de la récupération des clients');
        }
      } catch (error) {
        alert('Erreur réseau');
      }
    };

    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(baseURI + 'api/vehicules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, marque, modele, annee, client_id: idClient }),
      });
      if (response.ok) {
        alert('Véhicule ajouté avec succès');
        navigate('/vehicules');
      } else {
        alert('Erreur lors de l\'ajout du véhicule');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  return (
    <div className="add-vehicle">
      <h2>Ajouter un Véhicule</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Immatriculation"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Marque"
          value={marque}
          onChange={(e) => setMarque(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Modèle"
          value={modele}
          onChange={(e) => setModele(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Année"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          required
        />
        <select
          value={idClient}
          onChange={(e) => setIdClient(e.target.value)}
          required
        >
          <option value="" disabled>Sélectionner un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.firstname} {client.lastname}
            </option>
          ))}
        </select>
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AddVehicle;
