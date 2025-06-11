// pages/DashboardAdm/faculties/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Check, X, Building2, Pencil, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function FacultiesPage() {
  const router = useRouter();
  const [faculties, setFaculties] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [facultyName, setFacultyName] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, id: null, name: '', universityName: '' });

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/admin/liste/faculte', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch faculties');
        }
        
        const data = await response.json();
        setFaculties(data);
      } catch (error) {
        console.error('Erreur lors du chargement des facultés:', error);
        setError('Impossible de charger les facultés');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/show/unniv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (!response.ok) throw new Error('Failed to fetch universities');
        const data = await response.json();
        setUniversities(data);
      } catch (err) {
        // fallback: do nothing
      }
    };
    fetchUniversities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!facultyName.trim()) {
      setError('Le nom de la faculté est obligatoire');
      return;
    }

    if (!selectedUniversity) {
      setError('Veuillez sélectionner une université');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Ajouter la nouvelle faculté à la liste
      const newFaculty = {
        id: faculties.length > 0 ? Math.max(...faculties.map(f => f.id)) + 1 : 1,
        name: facultyName,
        universityId: selectedUniversity
      };
      
      setFaculties([...faculties, newFaculty]);
      
      // Réinitialiser et fermer le formulaire
      setFacultyName('');
      setSelectedUniversity('');
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (faculty) => {
    setEditModal({ open: true, id: faculty.idFaculté, name: faculty.nomFaculté, universityName: (faculty.NomUnniversite || '').trim() });
  };

  const handleEditChange = (e) => {
    setEditModal((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleEditUniversityChange = (e) => {
    setEditModal((prev) => ({ ...prev, universityName: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const nomUnniv = editModal.universityName.trim();
      const response = await fetch('http://localhost:4000/admin/modifier/faculte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idFaculte: editModal.id, nomFaculte: editModal.name, nomUnniv })
      });
      const data = await response.text();
      if (data.toLowerCase().includes('updated') || data.toLowerCase().includes('modifié') || data.toLowerCase().includes('modifier')) {
        setFaculties(faculties.map(f => f.idFaculté === editModal.id ? { ...f, nomFaculté: editModal.name, NomUnniversite: nomUnniv } : f));
        setEditModal({ open: false, id: null, name: '', universityName: '' });
        alert('Faculté modifiée avec succès');
      } else {
        alert('Erreur lors de la modification: ' + data);
      }
    } catch (error) {
      alert('Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette faculté ?')) {
      try {
        const response = await fetch(`http://localhost:4000/admin/supprimer/faculte`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idFaculte: facultyId, idFaculté: facultyId })
        });
        if (!response.ok) {
          throw new Error('Failed to delete faculty');
        }
        setFaculties(faculties.filter(faculty => faculty.idFaculté !== facultyId));
        alert('Faculté supprimée avec succès');
      } catch (error) {
        setError('Impossible de supprimer la faculté');
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Get unique university names for the select
  const universityOptions = Array.from(new Set(faculties.map(f => f.NomUnniversite))).filter(Boolean);

  const filteredFaculties = selectedUniversity
    ? faculties.filter(f => f.NomUnniversite === selectedUniversity)
    : faculties;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Facultés</h1>
        <button
          onClick={() => router.push('/DashboardAdm/faculties/add')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une Faculté
        </button>
      </div>
      {/* University select filter */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="university-select" className="text-sm font-medium text-gray-700">Filtrer par université :</label>
        <select
          id="university-select"
          value={selectedUniversity}
          onChange={e => setSelectedUniversity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Toutes les universités</option>
          {universityOptions.map((u, idx) => (
            <option key={idx} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Chargement des facultés...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculties.map((faculty) => (
            <Card key={faculty.idFaculté} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{faculty.nomFaculté}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(faculty)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faculty.idFaculté)}
                      className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">ID: {faculty.idFaculté}</p>
                <p className="text-sm text-gray-600">Université: {faculty.NomUnniversite}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setEditModal({ open: false, id: null, name: '', universityName: '' })}
              title="Fermer"
            >
              <X size={22} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Modifier la faculté</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la faculté</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Université associée</label>
                <select
                  value={editModal.universityName}
                  onChange={handleEditUniversityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Sélectionner une université</option>
                  {universities.map((u) => (
                    <option key={u.idUnniversite} value={u.NomUnniversite.trim()}>{u.NomUnniversite}</option>
                  ))}
                </select>
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
}