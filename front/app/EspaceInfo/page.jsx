"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Edit2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import NavbarEns from "@/components/NavbarDash";
import MenuEns from "@/components/Menu";

export default function EspaceInfo() {
  const router = useRouter();
  const [heures, setHeures] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '', show: false });
  
  // Add states for dropdowns
  const [modules, setModules] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [userId, setUserId] = useState(null);

  // Add new states
  const [filterType, setFilterType] = useState('pending'); // 'pending' or 'error'
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHeure, setSelectedHeure] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Add useEffect for message timeout
  useEffect(() => {
    if (message.show) {
      const timer = setTimeout(() => {
        setMessage(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.show]);

  // First useEffect to get userId
  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      router.push('/auth/authEns');
      return;
    }

    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:4000/user/id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });

        if (!response.ok) throw new Error('Failed to fetch user ID');
        const data = await response.json();
        setUserId(data);
        localStorage.setItem('users_id', data);
      } catch (error) {
        console.error('Error fetching user ID:', error);
        router.push('/auth/authEns');
      }
    };

    fetchUserId();
  }, [router]);

  // Memoize the fetch functions
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      // Make all API calls in parallel
      const [modulesRes, specialitesRes, niveauxRes] = await Promise.all([
        fetch('http://localhost:4000/relever/module', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idEnseignant: userId }),
        }),
        fetch('http://localhost:4000/relever/specialite', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idEnseignant: userId }),
        }),
        fetch('http://localhost:4000/relever/niveau', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idEnseignant: userId }),
        })
      ]);

      const [modulesData, specialitesData, niveauxData] = await Promise.all([
        modulesRes.json(),
        specialitesRes.json(),
        niveauxRes.json()
      ]);

      // Update all states at once to minimize re-renders
      setModules(Array.isArray(modulesData.modules) ? modulesData.modules.map((nom, idx) => ({ id: idx + 1, nom })) : []);
      setSpecialites(Array.isArray(specialitesData) ? specialitesData.map((item, idx) => ({
        id: idx + 1,
        nom: item.nom || ''
      })) : []);
      setNiveaux(Array.isArray(niveauxData) ? niveauxData.map((item, idx) => ({
        id: idx + 1,
        nom: item.NomNiveau || item
      })) : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données', show: true });
    }
  }, [userId]);

  // Replace the three separate useEffects with a single one
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Fetch unverified hours
  useEffect(() => {
    const fetchHeures = async () => {
      try {
        const userId = localStorage.getItem('users_id');
        if (!userId) {
          router.push('/auth/authEns');
          return;
        }

        const response = await fetch('http://localhost:4000/relever/affiche/enseignant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idEnseignant: userId }),
        });

        const data = await response.json();
        console.log('Raw server data:', JSON.stringify(data, null, 2)); // Log the exact data structure

        // Log the first item's keys to see available fields
        if (Array.isArray(data) && data.length > 0) {
          console.log('Available fields in first item:', Object.keys(data[0]));
        }

        setHeures(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching hours:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des heures', show: true });
      }
    };

    fetchHeures();
  }, [router]);

  // Memoize the filtered hours
  const filteredHeures = useMemo(() => {
    return heures.filter(heure => {
      if (filterType === 'pending') return !heure.verified;
      if (filterType === 'error') return heure.error;
      return true;
    });
  }, [heures, filterType]);

  // Memoize handlers
  const handleEdit = useCallback((heure) => {
    if (!heure.idRelever) {
      setMessage({ type: 'error', text: 'ID de relevé non trouvé', show: true });
      return;
    }

    setIsEditing(heure.idRelever);
    setEditedData({
      idRelever: heure.idRelever,
      niveau: heure.NomNiveau,
      specialite: heure.NomSpécialité,
      module: heure.Nom_module,
      Début: heure.Début.split('.')[0].slice(0, 5),
      Fin: heure.Fin.split('.')[0].slice(0, 5),
      type: heure.Type,
      sujet: heure.Sujet,
      Date: heure.Date
    });
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (!editedData.idRelever) {
        setMessage({ type: 'error', text: 'ID de relevé manquant', show: true });
        return;
      }

      const requestData = {
        idRelever: Number(editedData.idRelever),
        niveau: editedData.niveau,
        specialite: editedData.specialite,
        module: editedData.module,
        Début: editedData.Début,
        Fin: editedData.Fin,
        type: editedData.type,
        sujet: editedData.sujet,
        Date: editedData.Date
      };

      const endpoint = filterType === 'error' 
        ? 'http://localhost:4000/relever/update/error'
        : 'http://localhost:4000/relever/modifier';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

      const data = await response.text();
      
      if (data.includes("heure modifier avec seccu") || data.includes("heure valider")) {
        setMessage({ type: 'success', text: 'Heure modifiée avec succès', show: true });
        setIsEditing(null);
        setEditedData(null);
        handleVoirHeures(filterType);
      } else {
        setMessage({ type: 'error', text: data || 'Erreur lors de la modification', show: true });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage({ 
        type: 'error', 
        text: `Erreur lors de la modification: ${error.message}`, 
        show: true 
      });
    }
  }, [editedData, filterType, handleVoirHeures]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVoirHeures = async (type = 'pending') => {
    try {
      let url;
      switch(type) {
        case 'error':
          url = 'http://localhost:4000/relever/affiche/error';
          break;
        default:
          url = 'http://localhost:4000/relever/affiche/enseignant';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idEnseignant: localStorage.getItem('users_id') }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      // Format the data consistently
      const formattedData = Array.isArray(data) ? data.map(heure => ({
        idRelever: heure.idRelever,
        Nom_module: heure.Nom_module,
        Date: heure.Date,
        Début: heure.Début,
        Fin: heure.Fin,
        NomNiveau: heure.NomNiveau,
        NomSpécialité: heure.NomSpécialité,
        Type: heure.Type,
        Sujet: heure.Sujet
      })) : [];

      setHeures(formattedData);
      setFilterType(type);
    } catch (error) {
      console.error('Error fetching enseignant hours:', error);
      setMessage({ 
        type: 'error', 
        text: `Erreur lors du chargement des heures: ${error.message}`, 
        show: true 
      });
      setHeures([]);
    }
  };

  const handleEditHeure = (heure) => {
    setSelectedHeure(heure);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/relever/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idRelever: selectedHeure.idRelever,
          Date: selectedHeure.Date,
          Début: selectedHeure.Début,
          Fin: selectedHeure.Fin,
          Type: selectedHeure.Type,
          Sujet: selectedHeure.Sujet
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (responseText === "heure valider") {
        setVerificationMessage('Heure modifiée avec succès');
        setShowEditModal(false);
        setShowVerificationModal(true);
        handleVoirHeures(filterType);
      } else {
        setVerificationMessage(responseText);
        setShowVerificationModal(true);
      }
    } catch (error) {
      console.error('Error updating heure:', error);
      setVerificationMessage('Erreur lors de la modification');
      setShowVerificationModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 min-h-screen">
        <MenuEns />
      </div>

      {/* Main Content */}
      <div className="w-[84%] p-6">
        <NavbarEns />
        <div className="mt-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-extrabold text-green-700 mb-6">Espace d'information</h2>
            
            {/* Filter Buttons */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => handleVoirHeures('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Attente
              </button>
              <button
                onClick={() => handleVoirHeures('error')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Erreurs
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              {filterType === 'pending' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <span className="w-2 h-2 mr-2 bg-blue-600 rounded-full"></span>
                  En Attente
                </div>
              )}
              {filterType === 'error' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <span className="w-2 h-2 mr-2 bg-red-600 rounded-full"></span>
                  Erreurs
                </div>
              )}
            </div>

            {/* Animated Message Display */}
            {message.show && (
              <div 
                className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                } ${
                  message.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
                style={{
                  animation: message.show ? 'slideIn 0.5s ease-out' : 'slideOut 0.5s ease-in',
                  zIndex: 1000
                }}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Hours Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    filterType === 'pending' ? 'bg-blue-50' :
                    filterType === 'error' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHeures.map((heure, index) => (
                      <tr key={index} className={`hover:bg-gray-50 ${
                        filterType === 'pending' ? 'hover:bg-blue-50' :
                        filterType === 'error' ? 'hover:bg-red-50' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(heure.Date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <input
                              type="time"
                              value={editedData.Début}
                              onChange={(e) => handleInputChange('Début', e.target.value)}
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            heure.Début.split('.')[0].slice(0, 5)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <input
                              type="time"
                              value={editedData.Fin}
                              onChange={(e) => handleInputChange('Fin', e.target.value)}
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            heure.Fin.split('.')[0].slice(0, 5)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <select
                              value={editedData.niveau}
                              onChange={(e) => handleInputChange('niveau', e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            >
                              <option value="">Sélectionner</option>
                              {niveaux.map(niveau => (
                                <option key={niveau.nom} value={niveau.nom}>
                                  {niveau.nom}
                                </option>
                              ))}
                            </select>
                          ) : (
                            heure.NomNiveau
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <select
                              value={editedData.specialite}
                              onChange={(e) => handleInputChange('specialite', e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            >
                              <option value="">Sélectionner</option>
                              {specialites.map(specialite => (
                                <option key={specialite.id} value={specialite.nom}>
                                  {specialite.nom}
                                </option>
                              ))}
                            </select>
                          ) : (
                            heure.NomSpécialité
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <select
                              value={editedData.module}
                              onChange={(e) => handleInputChange('module', e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            >
                              <option value="">Sélectionner</option>
                              {modules.map(module => (
                                <option key={module.id} value={module.nom}>
                                  {module.nom}
                                </option>
                              ))}
                            </select>
                          ) : (
                            heure.Nom_module
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <select
                              value={editedData.type}
                              onChange={(e) => handleInputChange('type', e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            >
                              <option value="">Sélectionner</option>
                              <option value="Cours">Cours</option>
                              <option value="TD">TD</option>
                              <option value="TP">TP</option>
                            </select>
                          ) : (
                            heure.Type
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <input
                              type="text"
                              value={editedData.sujet}
                              onChange={(e) => handleInputChange('sujet', e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            heure.Sujet
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing === heure.idRelever ? (
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(heure)}
                              className={`${
                                filterType === 'error' 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-blue-600 hover:text-blue-900'
                              }`}
                            >
                              <Edit2 size={20} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heures Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-700">
                {verificationMessage.includes('Erreur') ? 'Signalement d\'Erreur' : 'Modification'}
              </h3>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-4">
              <p className={`text-lg ${verificationMessage.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
                {verificationMessage}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
} 