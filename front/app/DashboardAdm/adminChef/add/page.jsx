"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function AddChefPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwords, setPasswords] = useState({});
  const [existingChef, setExistingChef] = useState(null);
  const [checkingChef, setCheckingChef] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/liste/unniversite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }

        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
        setError('Impossible de charger les universités');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Fetch faculties when university is selected
  useEffect(() => {
      if (!selectedUniversity) {
        setFaculties([]);
        setSelectedFaculty('');
        return;
      }
    const fetchFaculties = async () => {
      try {
        const nomUnniversite = selectedUniversity;
        console.log('nomUnniversite sent to backend:', nomUnniversite);
        const response = await fetch('http://localhost:4000/admin/show/fac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomUnniversite })
        });
        const data = await response.json();
        setFaculties(data);
      } catch (err) {
        setError("Impossible de charger les facultés");
      }
    };
    fetchFaculties();
  }, [selectedUniversity]);

  // Fetch departments when faculty is selected
  useEffect(() => {
      if (!selectedFaculty) {
        setDepartments([]);
        setSelectedDepartment('');
        return;
      }
    const fetchDepartments = async () => {
      try {
        const nomFaculte = selectedFaculty;
        console.log('nomFaculte sent to backend:', nomFaculte);
        const response = await fetch('http://localhost:4000/admin/show/departement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomFaculte })
        });
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        setError("Impossible de charger les départements");
      }
    };
    fetchDepartments();
  }, [selectedFaculty]);

  // Fetch teachers when department is selected
  useEffect(() => {
    if (!selectedUniversity || !selectedFaculty || !selectedDepartment) {
        setTeachers([]);
        setSelectedTeacher('');
        return;
      }
    const fetchTeachers = async () => {
      try {
        const nomUnniversite = selectedUniversity;
        const nomFaculte = selectedFaculty;
        const nomDepartement = selectedDepartment;
        console.log('Enseignant fetch body:', { nomUnniversite, nomFaculte, nomDepartement });
        const response = await fetch('http://localhost:4000/admin/findEnseignant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomUnniversite, nomFaculte, nomDepartement })
        });
        if (!response.ok) throw new Error('Failed to fetch teachers');
        const data = await response.json();
        setTeachers(Array.isArray(data) ? data : []);
        console.log('Fetched teachers:', data);
      } catch (err) {
        setError("Impossible de charger les enseignants");
      }
    };
    fetchTeachers();
  }, [selectedUniversity, selectedFaculty, selectedDepartment]);

  // Check for existing chef when department or teacher changes
  useEffect(() => {
    setExistingChef(null);
    if (!selectedDepartment || !selectedTeacher) return;
    const [users_id] = selectedTeacher.split('|');
    setCheckingChef(true);
    fetch('http://localhost:4000/Admin/showEnsByChef', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idEnseignant: users_id })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.users_id) setExistingChef(data);
        else setExistingChef(null);
      })
      .catch(() => setExistingChef(null))
      .finally(() => setCheckingChef(false));
  }, [selectedDepartment, selectedTeacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      setError('Veuillez sélectionner un enseignant');
      return;
    }
    const [users_id, nom, prenom, email, idx] = selectedTeacher.split('|');
    const password = passwords[selectedTeacher] || '';
    if (!password) {
      setError('Veuillez saisir un mot de passe pour le chef sélectionné');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/Admin/choisir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idChef: users_id, password })
      });
      const data = await response.json();
      if (response.ok && (typeof data === 'string' && data.toLowerCase().includes('added'))) {
      setSuccess(true);
        setShowAddSuccess(true);
        setTimeout(() => setShowAddSuccess(false), 2000);
      setTimeout(() => {
          alert(`${nom} ${prenom} est le chef`);
        router.push('/DashboardAdm/adminChef');
      }, 2000);
      } else if (data && data.message) {
        setError(data.message);
      } else {
        setError('Erreur lors de la création du chef');
      }
    } catch (error) {
      setError("Impossible d'ajouter le chef");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChef = async (idChef) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chef ?')) return;
    try {
      setCheckingChef(true);
      const res = await fetch('http://localhost:4000/Admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idChef })
      });
      if (res.ok) {
        setExistingChef(null);
        setSelectedTeacher('');
        setTeachers(teachers => [...teachers]); // force refresh
        setDeleteSuccess(true);
        alert('Chef est supprimé');
        setTimeout(() => setDeleteSuccess(false), 2000);
      }
    } finally {
      setCheckingChef(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => router.push('/DashboardAdm/adminChef')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un Chef</h1>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {showAddSuccess && (
              <div className="flex items-center gap-3 bg-green-100 border border-green-400 text-green-800 px-5 py-3 rounded-lg shadow mb-4 animate-fade-in">
                <CheckCircle className="text-green-600" size={24} />
                <span className="font-semibold text-lg">Chef ajouté avec succès</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                Université
              </label>
              <select
                id="university"
                value={selectedUniversity}
                onChange={e => {
                  setSelectedUniversity(e.target.value);
                  setSelectedFaculty('');
                  setSelectedDepartment('');
                  setSelectedTeacher('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Sélectionnez une université</option>
                {universities.map((university) => (
                  <option key={university.idUnniversite} value={university.NomUnniversite}>
                    {university.NomUnniversite}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                Faculté
              </label>
              <select
                id="faculty"
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setSelectedDepartment('');
                  setSelectedTeacher('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={!selectedUniversity}
              >
                <option value="">Sélectionnez une faculté</option>
                {faculties.map((f, idx) => (
                  <option key={f.nomFaculté || idx} value={f.nomFaculté}>{f.nomFaculté}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Département
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedTeacher('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={!selectedFaculty}
              >
                <option value="">Sélectionnez un département</option>
                {departments.map((d, idx) => (
                  <option key={d.Nom_departement || idx} value={d.Nom_departement}>{d.Nom_departement}</option>
                ))}
              </select>
            </div>
            
            {/* Enseignant selection as a table */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enseignant
              </label>
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Choisir</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mot de passe</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {teachers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-gray-400">Aucun enseignant trouvé</td>
                      </tr>
                    ) : (
                      teachers.map((t, idx) => {
                        const uniqueValue = `${t.users_id}|${t.nomEnseignant}|${t.PrenomEnseignant}|${t.Email}|${idx}`;
                        return (
                          <tr key={uniqueValue} className={selectedTeacher === uniqueValue ? 'bg-green-50' : ''}>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="radio"
                                name="selectedTeacher"
                                value={uniqueValue}
                                checked={selectedTeacher === uniqueValue}
                                onChange={() => setSelectedTeacher(uniqueValue)}
                                className="accent-green-600"
                required
                              />
                            </td>
                            <td className="px-4 py-2">{t.users_id}</td>
                            <td className="px-4 py-2">{t.nomEnseignant}</td>
                            <td className="px-4 py-2">{t.PrenomEnseignant}</td>
                            <td className="px-4 py-2">{t.Email}</td>
                            <td className="px-4 py-2">
                              <input
                                type="password"
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                value={passwords[uniqueValue] || ''}
                                onChange={e => setPasswords(p => ({ ...p, [uniqueValue]: e.target.value }))}
                                placeholder="Mot de passe"
                                required={selectedTeacher === uniqueValue}
                                disabled={selectedTeacher !== uniqueValue}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Existing Chef Table */}
            {existingChef && (
              <div className="mb-6">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-2" role="alert">
                  <p>Un chef existe déjà pour ce département :</p>
                </div>
                <div className="overflow-x-auto rounded-md border border-gray-200 mb-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-2">{existingChef.users_id}</td>
                        <td className="px-4 py-2">{existingChef.nomEnseignant}</td>
                        <td className="px-4 py-2">{existingChef.PrenomEnseignant}</td>
                        <td className="px-4 py-2">{existingChef.Email}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteChef(existingChef.users_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            disabled={checkingChef}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Only show the add form if no existing chef */}
            {!existingChef && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/DashboardAdm/adminChef')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {submitting ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
            )}
          </form>
        )}
      </Card>
    </div>
  );
} 