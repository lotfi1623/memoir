// pages/DashboardAdm/specialites/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Check, X, Building2, Pencil, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function SpecialitesPage() {
  const router = useRouter();
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSpecialite, setEditingSpecialite] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [formData, setFormData] = useState({
    nomSpecialite: '',
    idUniversite: '',
    idFaculte: '',
    idDepartement: '',
    idFiliere: ''
  });

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/show/unniv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
        setError('Failed to load universities');
      }
    };
    fetchUniversities();
  }, []);

  // Fetch faculties when university is selected
  useEffect(() => {
    if (formData.idUniversite) {
      const fetchFaculties = async () => {
        try {
          const response = await fetch('http://localhost:4000/admin/show/fac', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nomUnniversite: formData.idUniversite })
          });
          const data = await response.json();
          setFaculties(data);
        } catch (error) {
          console.error('Error fetching faculties:', error);
          setError('Failed to load faculties');
        }
      };
      fetchFaculties();
    } else {
      setFaculties([]);
    }
  }, [formData.idUniversite]);

  // Fetch departments when faculty is selected
  useEffect(() => {
    if (formData.idFaculte) {
      const fetchDepartments = async () => {
        try {
          const response = await fetch('http://localhost:4000/admin/show/departement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nomFaculte: formData.idFaculte })
          });
          const data = await response.json();
          setDepartments(data);
        } catch (error) {
          console.error('Error fetching departments:', error);
          setError('Failed to load departments');
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]);
    }
  }, [formData.idFaculte]);

  // Fetch filieres when department is selected
  useEffect(() => {
    if (formData.idDepartement) {
      const fetchFilieres = async () => {
        try {
          const response = await fetch('http://localhost:4000/admin/show/filiere', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nomDepartement: formData.idDepartement })
          });
          const data = await response.json();
          setFilieres(data);
        } catch (error) {
          console.error('Error fetching filieres:', error);
          setError('Failed to load filieres');
        }
      };
      fetchFilieres();
    } else {
      setFilieres([]);
    }
  }, [formData.idDepartement]);

  useEffect(() => {
    const fetchSpecialites = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:4000/admin/liste/specialite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch specialités: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Specialités data:', data);
        
        if (Array.isArray(data)) {
          setSpecialites(data);
        } else {
          console.error('Expected array but got:', typeof data);
          setError('Format de données incorrect');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des specialités:', error);
        setError(`Impossible de charger les specialités: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialites();
  }, []);

  const handleDelete = async (specialiteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
      try {
        console.log('Attempting to delete spécialité with ID:', specialiteId);
        
        const response = await fetch('http://localhost:4000/admin/supprimer/specialite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ idSpecialite: specialiteId })
        });

        console.log('Delete response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to delete spécialité');
        }

        // Remove the deleted specialité from the state
        setSpecialites(specialites.filter(specialite => specialite.idSpecialite !== specialiteId));
        alert('Spécialité supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Impossible de supprimer la spécialité');
      }
    }
  };

  const handleEdit = (specialite) => {
    setEditingSpecialite(specialite);
    setFormData({
      nomSpecialite: specialite.NomSpécialité || '',
      idUniversite: specialite.NomUnniversite || '',
      idFaculte: specialite.nomFaculté || '',
      idDepartement: specialite.Nom_departement || '',
      idFiliere: specialite.nomFilière || ''
    });
    setEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Editing specialité:', editingSpecialite); // Debug log
      const response = await fetch('http://localhost:4000/admin/modifier/specialite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idSpecialite: editingSpecialite.idSpecialite,
          nomSpecialite: formData.nomSpecialite,
          nomUnniversite: formData.idUniversite,
          nomFaculte: formData.idFaculte,
          nomDepartement: formData.idDepartement,
          nomFiliere: formData.idFiliere
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update spécialité');
      }

      // Update the specialites list with the edited specialite
      setSpecialites(specialites.map(s => 
        s.idSpecialite === editingSpecialite.idSpecialite 
          ? { ...s, 
              idSpecialite: editingSpecialite.idSpecialite,
              NomSpécialité: formData.nomSpecialite,
              NomUnniversite: formData.idUniversite,
              nomFaculté: formData.idFaculte,
              Nom_departement: formData.idDepartement,
              nomFilière: formData.idFiliere
            } 
          : s
      ));

      alert('Spécialité modifiée avec succès');
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating spécialité:', error);
      setError('Failed to update spécialité');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Spécialités</h1>
        <button
          onClick={() => router.push('/DashboardAdm/specialites/add')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une Spécialité
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Chargement des spécialités...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            Réessayer
          </button>
        </div>
      ) : specialites.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p>Aucune spécialité trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialites.map((specialite, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{specialite.NomSpécialité}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(specialite)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(specialite.idSpecialite)}
                      className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">ID: {specialite.idSpecialite}</p>
                <p className="text-sm text-gray-600">Université: {specialite.NomUnniversite}</p>
                <p className="text-sm text-gray-600">Faculté: {specialite.nomFaculté}</p>
                <p className="text-sm text-gray-600">Département: {specialite.Nom_departement}</p>
                <p className="text-sm text-gray-600">Filière: {specialite.nomFilière}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Modifier la Spécialité</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nomSpecialite" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la Spécialité
                  </label>
                  <input
                    type="text"
                    id="nomSpecialite"
                    value={formData.nomSpecialite}
                    onChange={(e) => setFormData({ ...formData, nomSpecialite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="idUniversite" className="block text-sm font-medium text-gray-700 mb-2">
                    Université
                  </label>
                  <select
                    id="idUniversite"
                    value={formData.idUniversite}
                    onChange={(e) => setFormData({ ...formData, idUniversite: e.target.value, idFaculte: '', idDepartement: '', idFiliere: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Sélectionnez une université</option>
                    {universities.map((univ) => (
                      <option key={univ.idUnniversite} value={univ.NomUnniversite}>
                        {univ.NomUnniversite}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idFaculte" className="block text-sm font-medium text-gray-700 mb-2">
                    Faculté
                  </label>
                  <select
                    id="idFaculte"
                    value={formData.idFaculte}
                    onChange={(e) => setFormData({ ...formData, idFaculte: e.target.value, idDepartement: '', idFiliere: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={!formData.idUniversite}
                  >
                    <option value="">Sélectionnez une faculté</option>
                    {faculties.map((fac) => (
                      <option key={fac.idFaculté} value={fac.nomFaculté}>
                        {fac.nomFaculté}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idDepartement" className="block text-sm font-medium text-gray-700 mb-2">
                    Département
                  </label>
                  <select
                    id="idDepartement"
                    value={formData.idDepartement}
                    onChange={(e) => setFormData({ ...formData, idDepartement: e.target.value, idFiliere: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={!formData.idFaculte}
                  >
                    <option value="">Sélectionnez un département</option>
                    {departments.map((dep) => (
                      <option key={dep.Nom_departement} value={dep.Nom_departement}>
                        {dep.Nom_departement}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idFiliere" className="block text-sm font-medium text-gray-700 mb-2">
                    Filière
                  </label>
                  <select
                    id="idFiliere"
                    value={formData.idFiliere}
                    onChange={(e) => setFormData({ ...formData, idFiliere: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={!formData.idDepartement}
                  >
                    <option value="">Sélectionnez une filière</option>
                    {filieres.map((fil) => (
                      <option key={fil.nomFilière} value={fil.nomFilière}>
                        {fil.nomFilière}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}