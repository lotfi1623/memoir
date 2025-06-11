"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function AddSpecialitePage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [specialiteName, setSpecialiteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculté, setSelectedFaculté] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');

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

  // Facultés selon université
  useEffect(() => {
    if (!selectedUniversity) {
      setFaculties([]);
      setSelectedFaculté('');
      setDepartments([]);
      setSelectedDepartment('');
      setFilieres([]);
      setSelectedFiliere('');
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

  // Départements selon faculté
  useEffect(() => {
    if (!selectedFaculté) {
      setDepartments([]);
      setSelectedDepartment('');
      setFilieres([]);
      setSelectedFiliere('');
      return;
    }
    fetch('http://localhost:4000/Admin/show/departement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomFaculte: selectedFaculté })
    })
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => setDepartments([]));
  }, [selectedFaculté]);

  // Filières selon département
  useEffect(() => {
    if (!selectedDepartment) {
      setFilieres([]);
      setSelectedFiliere('');
      return;
    }
    fetch('http://localhost:4000/Admin/show/filiere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomDepartement: selectedDepartment })
    })
      .then(res => res.json())
      .then(data => setFilieres(data))
      .catch(() => setFilieres([]));
  }, [selectedDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const nomUnniversite = universities.find(u => u.NomUnniversite === selectedUniversity)?.NomUnniversite || '';
      const nomFaculte = faculties.find(f => f.nomFaculté === selectedFaculté)?.nomFaculté || '';
      const nomDepartement = departments.find(dep => dep.Nom_departement === selectedDepartment)?.Nom_departement || '';
      const nomFiliere = filieres.find(fil => fil.nomFilière === selectedFiliere)?.nomFilière || '';
      const nomSpecialite = specialiteName;

      const response = await fetch('http://localhost:4000/Admin/addSpecialite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomUnniversite,
          nomFaculte,
          nomDepartement,
          nomFiliere,
          nomSpecialite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add specialty');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/DashboardAdm/specialites');
      }, 2000);
    } catch (error) {
      console.error('Error adding specialty:', error);
      setError('Impossible d\'ajouter la spécialité');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/DashboardAdm/specialites')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter une Spécialité</h1>
      </div>
      <Card className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>Spécialité ajoutée avec succès! Redirection...</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="university" className="block text-sm font-medium text-gray-700">
              Université
            </label>
            <select
              id="university"
              value={selectedUniversity}
              onChange={e => {
                setSelectedUniversity(e.target.value);
                setSelectedFaculté('');
                setDepartments([]);
                setSelectedDepartment('');
                setFilieres([]);
                setSelectedFiliere('');
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
            <label htmlFor="faculté" className="block text-sm font-medium text-gray-700">
              Faculté
            </label>
            <select
              id="faculté"
              value={selectedFaculté}
              onChange={e => {
                setSelectedFaculté(e.target.value);
                setDepartments([]);
                setSelectedDepartment('');
                setFilieres([]);
                setSelectedFiliere('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
              disabled={!selectedUniversity}
            >
              <option value="">Sélectionnez une faculté</option>
              {faculties.map((faculte, idx) => (
                <option key={faculte.nomFaculté ? faculte.nomFaculté : `fac-${idx}`} value={faculte.nomFaculté}>
                  {faculte.nomFaculté}
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
                setFilieres([]);
                setSelectedFiliere('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
              disabled={!selectedFaculté}
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
            <label htmlFor="filiere" className="block text-sm font-medium text-gray-700">
              Filière
            </label>
            <select
              id="filiere"
              value={selectedFiliere}
              onChange={e => setSelectedFiliere(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              disabled={!selectedDepartment}
            >
              <option value="">Sélectionnez une filière</option>
              {filieres.map((filiere, idx) => (
                <option key={filiere.nomFilière ? filiere.nomFilière : `fil-${idx}`} value={filiere.nomFilière}>
                  {filiere.nomFilière}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="specialiteName" className="block text-sm font-medium text-gray-700">
              Nom de la Spécialité
            </label>
            <input
              type="text"
              id="specialiteName"
              value={specialiteName}
              onChange={(e) => setSpecialiteName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/DashboardAdm/specialites')}
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
        </form>
      </Card>
    </div>
  );

} 