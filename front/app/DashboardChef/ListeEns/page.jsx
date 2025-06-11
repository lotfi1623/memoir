"use client";

import { useEffect, useState } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ListeEns() {
  const [enseignants, setEnseignants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [enseignantHeures, setEnseignantHeures] = useState([]);
  const [showHeuresModal, setShowHeuresModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'verified', 'unverified'

  useEffect(() => {
    const fetchEnseignants = async () => {
      try {
        setLoading(true);
        const idChef = localStorage.getItem('userId');
        const response = await fetch("http://localhost:4000/chefdepartement/listeEnseignant", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ idChef })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('Erreur lors de la récupération des enseignants: ' + errorText);
        }
        const data = await response.json();
        setEnseignants(data);
        setFiltered(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnseignants();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(enseignants);
      return;
    }

    const searchLower = search.toLowerCase();
    const filteredData = enseignants.filter((ens) =>
      [
        ens.nomEnseignant,
        ens.PrenomEnseignant,
        ens.Email,
        ens.Nom_departement,
        ens.Rang
      ].some(val =>
        val?.toString().toLowerCase().includes(searchLower)
      )
    );
    setFiltered(filteredData);
  }, [search, enseignants]);

  const generatePDF = (enseignant, semester) => {
    console.log('Generating PDF for:', enseignant, 'Semester:', semester);
    const doc = new jsPDF();
    doc.text(`Rapport - ${enseignant.nomEnseignant} ${enseignant.PrenomEnseignant} - Semestre ${semester}`, 10, 10);
    doc.text(`Département: ${enseignant.Nom_departement}`, 10, 20);
    doc.text(`Spécialité: ${enseignant.specialite}`, 10, 30);
    doc.text(`Niveau: ${enseignant.niveau}`, 10, 40);

    // Example data structure for modules and hours
    const modulesData = [
      { module: 'POO', mois: 'Janvier', heures: 6 },
      { module: 'POO', mois: 'Février', heures: 4 },
      { module: 'Web', mois: 'Février', heures: 3 },
      // Add more data as needed
    ];

    let startY = 50;
    doc.text('Modules:', 10, startY);
    startY += 10;
    doc.autoTable({
      startY,
      head: [['Module', 'Mois', 'Nombre d\'heures']],
      body: modulesData.map(item => [item.module, item.mois, item.heures]),
    });

    doc.save(`Rapport_${enseignant.nomEnseignant}_${enseignant.PrenomEnseignant}_Semestre${semester}.pdf`);
  };

  const handleVoirHeures = async (enseignant, type = 'all') => {
    setSelectedEnseignant(enseignant);
    try {
      const url = type === 'verified' 
        ? 'http://localhost:4000/relever/affiche/verifier'
        : type === 'error'
        ? 'http://localhost:4000/relever/affiche/error'
        : 'http://localhost:4000/relever/affiche';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idEnseignant: enseignant.users_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        if (text === "heure valider") {
          data = [];
        } else {
          throw new Error('Unexpected response format');
        }
      }

      setEnseignantHeures(Array.isArray(data) ? data : []);
      setShowHeuresModal(true);
      setFilterType(type);
    } catch (error) {
      console.error('Error fetching enseignant hours:', error);
      setEnseignantHeures([]);
    }
  };

  const handleVerifier = async (heure) => {
    try {
      console.log('Verifying heure:', heure);
      const response = await fetch('http://localhost:4000/relever/verifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idRelever: heure.idRelever,
          idEnseignant: selectedEnseignant.users_id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Verification response:', responseText);
      
      if (responseText === "heure valider") {
        setVerificationMessage('Relevé vérifié avec succès');
      } else {
        setVerificationMessage(responseText);
      }
      
      setShowVerificationModal(true);
      handleVoirHeures(selectedEnseignant, filterType);
      
    } catch (error) {
      console.error('Error verifying relever:', error);
      setVerificationMessage('Erreur lors de la vérification');
      setShowVerificationModal(true);
    }
  };

  const handleError = async (heure) => {
    try {
      console.log('Reporting error for heure:', heure);
      const response = await fetch('http://localhost:4000/relever/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idRel: heure.idRelever
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Error report response:', responseText);
      
      if (responseText === "Erreur signalée avec succès") {
        setVerificationMessage('Erreur signalée avec succès');
        handleVoirHeures(selectedEnseignant, filterType);
      } else {
        setVerificationMessage(responseText);
      }
      
      setShowVerificationModal(true);
      
    } catch (error) {
      console.error('Error reporting error:', error);
      setVerificationMessage('Erreur lors du signalement');
      setShowVerificationModal(true);
    }
  };

  const handleEdit = (enseignant) => {
    setSelectedEnseignant(enseignant);
    setShowModal(true);
  };

  const handleDelete = async (idEnseignant) => {
    try {
      const response = await fetch('http://localhost:4000/chefdepartement/deleteEnseignant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idEnseignant })
      });
      if (response.ok) {
        setEnseignants(enseignants.filter((ens) => ens.idEnseignant !== idEnseignant));
        setFiltered(filtered.filter((ens) => ens.idEnseignant !== idEnseignant));
      } else {
        console.error('Erreur lors de la suppression de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEnseignant((prevEnseignant) => ({
      ...prevEnseignant,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/chefdepartement/updateEnseignant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedEnseignant)
      });
      if (response.ok) {
        setEnseignants(enseignants.map((ens) =>
          ens.idEnseignant === selectedEnseignant.idEnseignant ? selectedEnseignant : ens
        ));
        setFiltered(filtered.map((ens) =>
          ens.idEnseignant === selectedEnseignant.idEnseignant ? selectedEnseignant : ens
        ));
        setShowModal(false);
      } else {
        console.error('Erreur lors de la mise à jour de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-green-700 mb-2">Liste des Enseignants</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-6 max-w-5xl mx-auto">
          <table className="w-full rounded-2xl shadow-2xl overflow-hidden border-2 border-green-500">
            <thead className="bg-white sticky top-0 shadow z-10">
              <tr>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Nom</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Prénom</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Date de naissance</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enseignants.map((enseignant) => (
                <tr key={enseignant.idEnseignant} className="even:bg-gray-50 hover:bg-green-50 transition-colors duration-150">
                  <td className="px-4 py-3">{enseignant.nomEnseignant}</td>
                  <td className="px-4 py-3">{enseignant.PrenomEnseignant}</td>
                  <td className="px-4 py-3">{enseignant.Email}</td>
                  <td className="px-4 py-3">{enseignant.DateDeNaissance}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVoirHeures(enseignant)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        Voir Heures
                      </button>
                      <button
                        onClick={() => handleEdit(enseignant)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(enseignant.idEnseignant)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heures Modal */}
        {showHeuresModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-700">
                  Heures de {selectedEnseignant?.nomEnseignant} {selectedEnseignant?.PrenomEnseignant}
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVoirHeures(selectedEnseignant, 'verified')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filterType === 'verified'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Vérifiés
                    </button>
                    <button
                      onClick={() => handleVoirHeures(selectedEnseignant, 'unverified')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filterType === 'unverified'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Non Vérifiés
                    </button>
                    <button
                      onClick={() => handleVoirHeures(selectedEnseignant, 'error')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filterType === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Erreurs
                    </button>
                  </div>
                  <button
                    onClick={() => setShowHeuresModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Module</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Début</th>
                      <th className="px-4 py-2 text-left">Fin</th>
                      <th className="px-4 py-2 text-left">Niveau</th>
                      <th className="px-4 py-2 text-left">Spécialité</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Sujet</th>
                      {filterType === 'unverified' && (
                        <th className="px-4 py-2 text-left">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {enseignantHeures.map((heure) => (
                      <tr key={`${heure.idRelever || heure.idRel}-${heure.Date}-${heure.Début}`} className="border-b">
                        <td className="px-4 py-2">{heure.Nom_module}</td>
                        <td className="px-4 py-2">{new Date(heure.Date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{heure.Début.split('.')[0]}</td>
                        <td className="px-4 py-2">{heure.Fin.split('.')[0]}</td>
                        <td className="px-4 py-2">{heure.NomNiveau}</td>
                        <td className="px-4 py-2">{heure.NomSpécialité}</td>
                        <td className="px-4 py-2">{heure.Type}</td>
                        <td className="px-4 py-2">{heure.Sujet}</td>
                        {filterType === 'unverified' && (
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVerifier(heure)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                              >
                                Vérifier
                              </button>
                              <button
                                onClick={() => handleError(heure)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                              >
                                Signaler Erreur
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-700">
                  {verificationMessage.includes('Erreur') ? 'Signalement d\'Erreur' : 'Vérification du Relevé'}
                </h3>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-center py-4">
                <p className={`text-lg ${verificationMessage.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
                  {verificationMessage}
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-700">
                  Modifier l'enseignant
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="nomEnseignant"
                    value={selectedEnseignant?.nomEnseignant || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    name="PrenomEnseignant"
                    value={selectedEnseignant?.PrenomEnseignant || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={selectedEnseignant?.Email || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                  <input
                    type="date"
                    name="DateDeNaissance"
                    value={selectedEnseignant?.DateDeNaissance || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
