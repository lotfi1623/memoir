"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function AddModulePage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculté, setSelectedFaculté] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [specialites, setSpecialites] = useState([]);
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState('');


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

  // Spécialités selon filière
  useEffect(() => {
    if (!selectedFiliere) {
      setSpecialites([]);
      setSelectedSpecialite('');
      return;
    }
    fetch('http://localhost:4000/Admin/show/specialite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomFiliere: selectedFiliere })
    })
      .then(res => res.json())
      .then(data => setSpecialites(data))
      .catch(() => setSpecialites([]));
  }, [selectedFiliere]);

  // Niveaux selon spécialité
  useEffect(() => {
    if (!selectedSpecialite) {
      setNiveaux([]);
      setSelectedNiveau('');
      return;
    }
    fetch('http://localhost:4000/Admin/show/niveau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomSpecialite: selectedSpecialite })
    })
      .then(res => res.json())
      .then(data => setNiveaux(data))
      .catch(() => setNiveaux([]));
  }, [selectedSpecialite]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/admin/addModule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomUnniversite: selectedUniversity,
          nomFaculte: selectedFaculté,
          nomDepartement: selectedDepartment,
          nomFiliere: selectedFiliere,
          nomSpecialite: selectedSpecialite,
          nomNiveau: selectedNiveau,
          nomModule: moduleName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add module');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/DashboardAdm/modules');
      }, 2000);
    } catch (error) {
      console.error('Error adding module:', error);
      setError('Impossible d\'ajouter le module');
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
          onClick={() => router.push('/DashboardAdm/modules')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un Module</h1>
      </div>
      <Card className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2" role="alert">
            <PlusCircle className="text-green-600" />
            <span>Module ajouté avec succès!</span>
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
                setSelectedFiliere('');
                setSelectedSpecialite('');
                setSelectedDepartment('');
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
            <label htmlFor="faculte" className="block text-sm font-medium text-gray-700">
              Faculté
            </label>
            <select
              id="faculte"
              value={selectedFaculté}
              onChange={e => {
                setSelectedFaculté(e.target.value);
                setSelectedFiliere('');
                setSelectedSpecialite('');
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
            <label htmlFor="filiere" className="block text-sm font-medium text-gray-700">
              Filière
            </label>
            <select
              id="filiere"
              value={selectedFiliere}
              onChange={e => {
                setSelectedFiliere(e.target.value);
                setSelectedSpecialite('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
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
            <label htmlFor="specialite" className="block text-sm font-medium text-gray-700">
              Spécialité
            </label>
            <select
              id="specialite"
              value={selectedSpecialite}
              onChange={e => setSelectedSpecialite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
              disabled={!selectedFiliere}
            >
              <option value="">Sélectionnez une spécialité</option>
              {specialites.map((specialite, idx) => (
                <option key={specialite.NomSpécialité ? specialite.NomSpécialité : `spec-${idx}`} value={specialite.NomSpécialité}>
                  {specialite.NomSpécialité}
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
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
              disabled={!selectedUniversity}
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
            <label htmlFor="niveau" className="block text-sm font-medium text-gray-700">
              Niveau
            </label>
            <select
              id="niveau"
              value={selectedNiveau}
              onChange={e => setSelectedNiveau(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Sélectionnez un niveau</option>
              {niveaux.map((niveau, idx) => (
                <option key={niveau.nomNiveau ? niveau.nomNiveau : `niv-${idx}`} value={niveau.nomNiveau}>
                  {niveau.nomNiveau}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="moduleName" className="block text-sm font-medium text-gray-700">
              Nom du Module
            </label>
            <input
              type="text"
              id="moduleName"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/DashboardAdm/modules')}
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