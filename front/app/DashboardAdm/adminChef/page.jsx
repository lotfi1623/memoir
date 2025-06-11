"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { User, Mail, Building2, GraduationCap, RefreshCw, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminChefPage() {
  const router = useRouter();
  const [chefs, setChefs] = useState([]);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChefsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching chefs data...');
      
      const response = await fetch('http://localhost:4000/admin/showChef', {
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
      console.log('Raw response data:', data);
      
      if (!data) {
        throw new Error('No data received from the server');
      }

      // Ensure data is an array
      const chefsArray = Array.isArray(data) ? data : [data];
      console.log('Processed chefs data:', chefsArray);
      
      setChefs(chefsArray);
      setFilteredChefs(chefsArray);
    } catch (error) {
      console.error('Error details:', error);
      
      let errorMessage = 'Impossible de charger les données des chefs';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution sur http://localhost:4000';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `Erreur du serveur: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefsData();
  }, []);

  // Filter chefs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChefs(chefs);
    } else {
      const filtered = chefs.filter(chef => 
        (chef.nomEnseignant && chef.nomEnseignant.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chef.PrenomEnseignant && chef.PrenomEnseignant.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chef.Email && chef.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chef.nomFaculté && chef.nomFaculté.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chef.Nom_departement && chef.Nom_departement.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredChefs(filtered);
    }
  }, [searchTerm, chefs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddChef = () => {
    router.push('/DashboardAdm/adminChef/add');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button 
            onClick={fetchChefsData} 
            className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Chefs</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchChefsData}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            title="Actualiser les données"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={handleAddChef}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus size={18} className="mr-2" />
            Ajouter un chef
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un chef..."
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
      </div>

      {filteredChefs.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p>Aucun chef trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChefs.map((chef, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-lg">{chef.nomEnseignant || "Non disponible"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prénom</p>
                    <p className="text-lg">{chef.PrenomEnseignant || "Non disponible"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg">{chef.Email || "Non disponible"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Faculté</p>
                    <p className="text-lg">{chef.nomFaculté || "Non disponible"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Département</p>
                    <p className="text-lg">{chef.Nom_departement || "Non disponible"}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
