'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function AddFilierePage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filiereName, setFiliereName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);

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

  useEffect(() => {
    if (!selectedUniversity) {
      setFaculties([]);
      setSelectedFaculty('');
      setDepartments([]);
      setSelectedDepartment('');
      setFiliereName('');
      return;
    }
    fetch('http://localhost:4000/Admin/show/fac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomUnniversite: selectedUniversity })
    })
      .then(res => res.json())
      .then(data => setFaculties(data))
      .catch(() => setFaculties([]));
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedFaculty) {
      setDepartments([]);
      setSelectedDepartment('');
      setFiliereName('');
      return;
    }
    fetch('http://localhost:4000/Admin/show/departement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomFaculte: selectedFaculty })
    })
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => setDepartments([]));
  }, [selectedFaculty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const nomUnniversite = selectedUniversity;
      const nomFaculte = selectedFaculty;
      const nomDepartement = selectedDepartment;
      const nomFiliere = filiereName;

      const response = await fetch('http://localhost:4000/Admin/addFiliere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomUnniversite,
          nomFaculte,
          nomDepartement,
          nomFiliere
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add filière');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/DashboardAdm/filieres');
      }, 2000);
    } catch (error) {
      console.error('Error adding filière:', error);
      setError('Impossible d\'ajouter la filière');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/DashboardAdm/filieres')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter une Filière</h1>
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
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <p>Filière ajoutée avec succès! Redirection...</p>
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
                  setDepartments([]);
                  setSelectedDepartment('');
                  setFiliereName('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Sélectionnez une université</option>
                {universities.map((university, idx) => (
                  <option key={university.NomUnniversite ? university.NomUnniversite : `uni-${idx}`} value={university.NomUnniversite}>
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
                onChange={e => {
                  setSelectedFaculty(e.target.value);
                  setDepartments([]);
                  setSelectedDepartment('');
                  setFiliereName('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={!selectedUniversity}
              >
                <option value="">Sélectionnez une faculté</option>
                {faculties.map((faculty, idx) => (
                  <option key={faculty.nomFaculté ? faculty.nomFaculté : `fac-${idx}`} value={faculty.nomFaculté}>
                    {faculty.nomFaculté}
                  </option>
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
                onChange={e => {
                  setSelectedDepartment(e.target.value);
                  setFiliereName('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={!selectedFaculty}
              >
                <option value="">Sélectionnez un département</option>
                {departments.map((department, idx) => (
                  <option key={department.Nom_departement ? department.Nom_departement : `dep-${idx}`} value={department.Nom_departement}>
                    {department.Nom_departement}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="filiereName" className="block text-sm font-medium text-gray-700">
                Nom de la Filière
              </label>
              <input
                type="text"
                id="filiereName"
                value={filiereName}
                onChange={e => setFiliereName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={!selectedDepartment}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/DashboardAdm/filieres')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 