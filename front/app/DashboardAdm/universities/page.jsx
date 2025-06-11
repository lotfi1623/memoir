// pages/DashboardAdm/universities/page.jsx
"use client";
import { useState } from 'react';
import { Building2, Plus, Check, X } from 'lucide-react';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([
    { id: 1, name: "Université de Sciences" },
    { id: 2, name: "Université de Technologie" }
    // Vos universités initiales
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [universityName, setUniversityName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!universityName.trim()) {
      setError('Le nom de l\'université est obligatoire');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Ajouter la nouvelle université à la liste
      const newUniversity = {
        id: universities.length > 0 ? Math.max(...universities.map(u => u.id)) + 1 : 1,
        name: universityName
      };
      
      setUniversities([...universities, newUniversity]);
      
      // Réinitialiser et fermer le formulaire
      setUniversityName('');
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Building2 className="text-green-600 mr-2" />
          Universités
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          {showForm ? (
            <>
              <X size={18} className="mr-1" />
              Annuler
            </>
          ) : (
            <>
              <Plus size={18} className="mr-1" />
              Ajouter Université
            </>
          )}
        </button>
      </div>
      
      {/* Formulaire d'ajout (affiché conditionnellement) */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Ajouter une nouvelle université</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'université <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="universityName"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className={`w-full py-2 px-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="Université de..."
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Traitement...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Tableau des universités */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {universities.map((university) => (
              <tr key={university.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {university.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {university.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">
                    Modifier
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            
            {universities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune université trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}