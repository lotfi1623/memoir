"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UniversitiesPage = () => {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, id: null, name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);

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

  const handleEditClick = (id, name) => {
    setEditModal({ open: true, id, name });
  };

  const handleEditChange = (e) => {
    setEditModal((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/admin/modifier/unniversite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUnniversite: editModal.id, idUnniversité: editModal.id, nomUnniversite: editModal.name })
      });
      const data = await response.text();
      if (data.toLowerCase().includes('updated') || data.toLowerCase().includes('midifier') || data.toLowerCase().includes('modifier')) {
        setUniversities(universities.map(u => u.idUnniversité === editModal.id ? { ...u, NomUnniversite: editModal.name } : u));
        setEditModal({ open: false, id: null, name: '' });
        alert('Université modifiée avec succès');
      } else {
        alert('Erreur lors de la modification: ' + data);
      }
    } catch (error) {
      alert('Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (idUnniversité) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette université ?')) return;
    try {
      const response = await fetch('http://localhost:4000/admin/supprimer/unniversite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUnniversite: idUnniversité, idUnniversité })
      });
      const data = await response.text();
      if (data.toLowerCase().includes('supprimer')) {
        setUniversities(universities.filter(u => u.idUnniversité !== idUnniversité));
        alert('Université supprimée avec succès');
      } else {
        alert('Erreur lors de la suppression: ' + data);
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSelectUniversity = (id) => {
    setSelectedUniversityId(id);
    console.log('Selected university ID:', id);
  };

  if (loading) {
    return <div className="p-4">Chargement des universités...</div>;
  }

  if (error) {
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
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Liste des Universités</h1>
        <button
          onClick={() => router.push('/DashboardAdm/unniversites/add')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une Université
        </button>
        </div>
      
      
      {universities.length === 0 ? (
        <p>Aucune université trouvée</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universities.map((university, index) => (
            <div
              key={index}
              className={`border rounded p-4 shadow bg-white flex flex-col gap-2 relative group transition hover:shadow-lg cursor-pointer ${selectedUniversityId === university.idUnniversité ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => handleSelectUniversity(university.idUnniversité)}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg text-gray-900">{university.NomUnniversite || "Nom non disponible"}</h2>
                <div className="flex space-x-2 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={e => { e.stopPropagation(); handleEditClick(university.idUnniversité, university.NomUnniversite); }}
                    className="p-2 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    title="Modifier"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(university.idUnniversité); }}
                    className="p-2 rounded-full hover:bg-red-50 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">ID: {university.idUnniversité || "ID non disponible"}</p>
            </div>
          ))}
        </div>
      )}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setEditModal({ open: false, id: null, name: '' })}
              title="Fermer"
            >
              <X size={22} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Modifier l'université</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'université</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Modification...' : 'Modifier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitiesPage; 