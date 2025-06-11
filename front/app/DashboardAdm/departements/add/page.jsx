'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function AddDepartmentPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/admin/liste/unniversite', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Erreur lors du chargement des universités:', error);
        setError('Impossible de charger les universités');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    const fetchFaculties = async () => {
      if (!selectedUniversity) {
        setFaculties([]);
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/admin/liste/faculte', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nomUnniversite: selectedUniversity })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch faculties');
        }
        
        const data = await response.json();
        setFaculties(data);
      } catch (error) {
        console.error('Erreur lors du chargement des facultés:', error);
        setError('Impossible de charger les facultés');
      }
    };

    fetchFaculties();
  }, [selectedUniversity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUniversity) {
      setError('Veuillez sélectionner une université');
      return;
    }
    
    if (!selectedFaculty) {
      setError('Veuillez sélectionner une faculté');
      return;
    }
    
    if (!departmentName.trim()) {
      setError('Veuillez entrer un nom de département');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/admin/ajouter/departement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomUnniversite: selectedUniversity,
          nomFaculte: selectedFaculty,
          nomDepartement: departmentName
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add department');
      }
      
      const data = await response.json();
      console.log('Response:', data);
      
      setSuccess(true);
      
      // Reset form
      setDepartmentName('');
      setSelectedUniversity('');
      setSelectedFaculty('');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/DashboardAdm/departements');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du département:', error);
      setError('Impossible d\'ajouter le département');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/DashboardAdm/departements')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un Département</h1>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Chargement des universités...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <p>Département ajouté avec succès!</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                Université <span className="text-red-500">*</span>
              </label>
              <select
                id="university"
                value={selectedUniversity}
                onChange={(e) => {
                  setSelectedUniversity(e.target.value);
                  setSelectedFaculty('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Sélectionnez une université</option>
                {universities.map((university, index) => (
                  <option key={index} value={university.NomUnniversite}>
                    {university.NomUnniversite}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                Faculté <span className="text-red-500">*</span>
              </label>
              <select
                id="faculty"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={!selectedUniversity}
              >
                <option value="">Sélectionnez une faculté</option>
                {faculties.map((faculty, index) => (
                  <option key={index} value={faculty.nomFaculté}>
                    {faculty.nomFaculté}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">
                Nom du Département <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="departmentName"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ex: Département d'Informatique"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/DashboardAdm/departements')}
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