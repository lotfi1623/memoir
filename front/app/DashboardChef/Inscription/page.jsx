'use client';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function InscriptionEnAttente() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVacateurs = async () => {
    try {
      setLoading(true);
      const idChef = localStorage.getItem('userId');
      const response = await fetch('http://localhost:4000/chefdepartement/listeVacateur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ idChef })
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des inscriptions');
      const data = await response.json();
      setEnseignants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacateurs();
  }, []);

  // Helper to fetch id by email
  const fetchIdByEmail = async (email) => {
    try {
      const response = await fetch('http://localhost:4000/user/id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error('Failed to fetch user ID');
      const data = await response.json();
      return data;
    } catch (err) {
      alert('Impossible de trouver l\'ID de l\'enseignant pour cet email.');
      return null;
    }
  };

  const handleAccept = async (idEnseignant, email) => {
    let id = idEnseignant;
    if (!id && email) {
      id = await fetchIdByEmail(email);
    }
    if (!id) {
      alert("Impossible de trouver l'ID de l'enseignant.");
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/chefdepartement/accepter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEnseignant: id })
      });
      if (!response.ok) throw new Error('Erreur lors de l\'acceptation');
      alert('Message de acceptation envoyé');
      fetchVacateurs();
    } catch (error) {
      alert('Une erreur est survenue lors de l\'acceptation');
    }
  };

  const handleRefuse = async (idEnseignant, email) => {
    let id = idEnseignant;
    if (!id && email) {
      id = await fetchIdByEmail(email);
    }
    if (!id) {
      alert("Impossible de trouver l'ID de l'enseignant.");
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/chefdepartement/refuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEnseignant: id })
      });
      if (!response.ok) throw new Error('Erreur lors du refus');
      alert('Message de refusation envoyé');
      fetchVacateurs();
    } catch (error) {
      alert('Une erreur est survenue lors du refus');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">Inscriptions en attente</h2>
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full table-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-100">
          <thead className="bg-gray-100 text-center text-gray-700">
            <tr className="bg-gray-100 text-center text-gray-700">
              <th className="p-2 border font-semibold text-center">Nom</th>
              <th className="p-2 border font-semibold text-center">Prénom</th>
              <th className="p-2 border font-semibold text-center">Email</th>
              <th className="p-2 border font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enseignants.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Aucun enseignant en attente</td>
              </tr>
            ) : (
              enseignants.map((ens) => (
                <tr key={ens.Email} className="border-b text-center">
                  <td className="p-2 text-center">{ens.nomEnseignant}</td>
                  <td className="p-2 text-center">{ens.PrenomEnseignant}</td>
                  <td className="p-2 text-center">{ens.Email}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    <Button onClick={() => handleAccept(ens.idEnseignant, ens.Email)} className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleRefuse(ens.idEnseignant, ens.Email)} className="bg-red-600 hover:bg-red-700 text-white">
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
