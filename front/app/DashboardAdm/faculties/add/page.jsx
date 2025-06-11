'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function AddFacultyPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
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
        console.error('Erreur lors du chargement des universités:', error);
        setError('Impossible de charger les universités');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUniversity) {
      setError('Veuillez sélectionner une université');
      return;
    }
    
    if (!facultyName.trim()) {
      setError('Veuillez entrer un nom de faculté');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const nomUnniversite = selectedUniversity;
      const nomFaculte = facultyName;
      const response = await fetch('http://localhost:4000/Admin/addFaculte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomUnniversite,
          nomFaculte
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add faculty');
      }
      
      setSuccess(true);
      
      // Reset form
      setFacultyName('');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/DashboardAdm/faculties');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la faculté:', error);
      setError('Impossible d\'ajouter la faculté');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/DashboardAdm/faculties')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter une Faculté</h1>
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
                <p>Faculté ajoutée avec succès!</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                Université <span className="text-red-500">*</span>
              </label>
              <select
                id="university"
                value={selectedUniversity}
                onChange={e => {
                  setSelectedUniversity(e.target.value);
                  setFacultyName('');
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
              <label htmlFor="facultyName" className="block text-sm font-medium text-gray-700">
                Nom de la Faculté <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="facultyName"
                value={facultyName}
                onChange={e => setFacultyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ex: Faculté des Sciences Exactes et Informatique"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo de la Faculté
              </label>
              <div className="flex items-center gap-4">
                <label htmlFor="logo" className="cursor-pointer inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow">
                  Choisir un logo
                </label>
                <span className="text-gray-600 text-sm truncate max-w-[150px]">{logo ? logo.name : "Aucun fichier choisi"}</span>
              </div>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              {logoPreview && (
                <div className="mt-4 flex justify-center">
                  <img src={logoPreview} alt="Aperçu du logo" className="h-24 w-24 object-contain rounded border border-gray-300 bg-white" />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/DashboardAdm/faculties')}
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
