import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const EditVehicule = () => {
  const { id } = useParams();
  const [newid, setNewId] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [annee, setAnnee] = useState('');
  const [idClient, setIdClient] = useState('');
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicule = async () => {
      try {
        const response = await fetch(baseURI + `api/vehicule/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setNewId(data.id);  // Ensure this field is updated
          setMarque(data.marque);
          setModele(data.modele);
          setAnnee(data.annee);
          setIdClient(data.client_id);
        } else {
          alert('Erreur lors de la récupération du véhicule');
        }
      } catch (error) {
        alert('Erreur réseau');
      }
    };

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

    fetchVehicule();
    fetchClients();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(baseURI + `api/vehicule/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newid, marque, modele, annee, client_id: idClient }),
      });
      if (response.ok) {
        alert('Véhicule modifié avec succès');
        navigate('/vehicules');
      } else {
        alert('Erreur lors de la modification du véhicule');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  return (
    <div className="edit-vehicule">
      <h2>Modifier le Véhicule</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Immatriculation"
          value={newid}
          onChange={(e) => setNewId(e.target.value)}
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
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.firstname} {client.lastname}
            </option>
          ))}
        </select>
        <button type="submit">Modifier</button>
      </form>
    </div>
  );
};

export default EditVehicule;
