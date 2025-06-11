"use client";

import React, { useEffect, useState } from 'react';

const FacultesPage = () => {
  const [faculties, setFaculties] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:4000/admin/show/unniv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Universities data:', data);
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
        setError('Impossible de charger les universités. Veuillez vérifier que le serveur est en cours d\'exécution sur le port 4000.');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Fetch faculties when university is selected
  useEffect(() => {
    const fetchFaculties = async (nomUnniversite) => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching faculties for university:', nomUnniversite);
        
        const response = await fetch('http://localhost:4000/admin/show/fac', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ nomUnniversite })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Faculties data received:', data);
        
        // Check if data is an array and has items
        if (Array.isArray(data) && data.length > 0) {
          setFaculties(data);
        } else {
          console.log('No faculties found or data is not in expected format');
          setFaculties([]);
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching faculties:', error);
        setError('Impossible de charger les facultés. Veuillez vérifier que le serveur est en cours d\'exécution sur le port 4000.');
        setFaculties([]);
        return [];
      } finally {
        setLoading(false);
      }
    };

    if (selectedUniversity) {
      fetchFaculties(selectedUniversity);
    }
  }, [selectedUniversity]);

  if (loading && !selectedUniversity) {
    return <div className="p-4">Chargement des universités...</div>;
  }

  if (error && !selectedUniversity) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des Facultés</h1>
      
      <div className="mb-4">
        <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
          Sélectionnez une université
        </label>
        <select
          id="university"
          value={selectedUniversity}
          onChange={(e) => setSelectedUniversity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Sélectionnez une université</option>
          {universities.map((university, index) => (
            <option key={index} value={university.NomUnniversite}>
              {university.NomUnniversite}
            </option>
          ))}
        </select>
      </div>
      
      {loading && selectedUniversity ? (
        <div className="p-4">Chargement des facultés...</div>
      ) : error && selectedUniversity ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button 
            onClick={() => setSelectedUniversity(selectedUniversity)} 
            className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            Réessayer
          </button>
        </div>
      ) : selectedUniversity ? (
        faculties.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">Aucune faculté trouvée pour l'université "{selectedUniversity}"</p>
            <p className="text-sm text-yellow-600 mt-2">Vérifiez que l'université existe bien dans la base de données.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.map((faculty, index) => (
              <div key={index} className="border rounded p-4 shadow">
                <h2 className="font-bold">{faculty.nomFaculté || "Nom non disponible"}</h2>
                <p>ID: {faculty.idFaculté || "ID non disponible"}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        <p>Veuillez sélectionner une université pour voir ses facultés</p>
      )}
    </div>
  );
};

export default FacultesPage; 