"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle, Save, Edit, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import Input from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { isLoggedIn, getUserType } from "../utils/auth";

export default function DashboardEnseignant() {
  const router = useRouter();
  // Données dynamiques
  const [enseignantData, setEnseignantData] = useState({
    nom: "",
    prenom: "",
    id: ""
  });
  const [enseignantInfo, setEnseignantInfo] = useState(null);

  const [modules, setModules] = useState([]);

  const [specialites, setSpecialites] = useState([]);

  const [niveaux, setNiveaux] = useState([]);
  
  
  const [heures, setHeures] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedHeures = localStorage.getItem("heures");
      return savedHeures ? JSON.parse(savedHeures) : [{
        date: "", debut: "", fin: "", niveau: "",
        specialite: "", groupe: "", module: "",
        type: "", sujet: ""
      }];
    }
    return [{
      date: "", debut: "", fin: "", niveau: "",
      specialite: "", groupe: "", module: "",
      type: "", sujet: ""
    }];
  });

  const [sujetEnEdition, setSujetEnEdition] = useState(null);
  const types = ["Cours", "TD", "TP"];
  const groupes = ["Groupe A", "Groupe B", "Groupe C"];

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get the user email from localStorage
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const [userId, setUserId] = useState(null);

  const [inscriptionStatus, setInscriptionStatus] = useState(null);
  const [inscriptionLoading, setInscriptionLoading] = useState(true);

  // Add state for inscription form
  const [showInscriptionForm, setShowInscriptionForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    departement: '',
    filiere: '',
    specialite: '',
    module: '',
    niveau: '',
    typeEnseignant: '',
  });
  const [departments, setDepartments] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [inscError, setInscError] = useState('');
  const [inscLoading, setInscLoading] = useState(false);
  const [inscSuccess, setInscSuccess] = useState('');

  // First useEffect to get the user ID from email
  useEffect(() => {
    if (!userEmail) {
      console.error('No user email found in localStorage');
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

        if (!response.ok) {
          throw new Error('Failed to fetch user ID');
        }

        const data = await response.json();
        console.log('Received user ID:', data);
        
        if (data) {
          setUserId(data);
          localStorage.setItem('users_id', data);
        }
    } catch (error) {
        console.error('Error fetching user ID:', error);
        router.push('/auth/authEns');
    }
  };

    fetchUserId();
  }, [userEmail, router]);

  // Memoize the fetch functions
  const fetchInitialData = useCallback(async () => {
    if (!userId) return;

    try {
      // Make all API calls in parallel
      const [enseignantRes, modulesRes, specialitesRes, niveauxRes] = await Promise.all([
        fetch("http://localhost:4000/enseignant/show", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idEnseignant: userId })
        }),
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

      const [enseignantData, modulesData, specialitesData, niveauxData] = await Promise.all([
        enseignantRes.json(),
        modulesRes.json(),
        specialitesRes.json(),
        niveauxRes.json()
      ]);

      // Update all states at once to minimize re-renders
      setEnseignantInfo(enseignantData);
      setEnseignantData(prev => ({
        ...prev,
        id: userId,
        nom: enseignantData.nomEnseignant || '',
        prenom: enseignantData.PrenomEnseignant || ''
      }));

      // Store relevant fields in localStorage
      if (enseignantData) {
        localStorage.setItem('userType', 'enseignant');
        localStorage.setItem('nomEnseignant', enseignantData.nomEnseignant || '');
        localStorage.setItem('PrenomEnseignant', enseignantData.PrenomEnseignant || '');
        localStorage.setItem('Email', enseignantData.Email || '');
        localStorage.setItem('nomFaculté', enseignantData.nomFaculté || '');
        localStorage.setItem('Nom_departement', enseignantData.Nom_departement || '');
      }

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
      console.error('Error fetching initial data:', error);
      router.push('/auth/authEns');
    }
  }, [userId, router]);

  // Replace multiple useEffects with a single one
  useEffect(() => {
    if (userId) {
      fetchInitialData();
    }
  }, [userId, fetchInitialData]);

  // Memoize handlers
  const modifierValeur = useCallback((index, champ, valeur) => {
    setHeures(prev => {
      const newHeures = [...prev];
      newHeures[index] = { ...newHeures[index], [champ]: valeur };
      return newHeures;
    });
  }, []);

  const ajouterLigne = useCallback(() => {
    setHeures(prev => [...prev, {
      date: "", debut: "", fin: "", niveau: "",
      specialite: "", groupe: "", module: "",
      type: "", sujet: ""
    }]);
  }, []);

  const supprimerLigne = useCallback((index) => {
    setHeures(prev => prev.filter((_, i) => i !== index));
  }, []);

  const sauvegarderHeures = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/relever/ajouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEnseignant: userId,
          heures: heures
        })
      });

      if (!response.ok) throw new Error('Failed to save hours');

      const data = await response.json();
      if (data.success) {
        setHeures([{
          date: "", debut: "", fin: "", niveau: "",
          specialite: "", groupe: "", module: "",
          type: "", sujet: ""
        }]);
      }
    } catch (error) {
      console.error('Error saving hours:', error);
    }
  }, [heures, userId]);

  // Memoize the notifications fetch
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch('http://localhost:4000/notification/voir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEnseignant: userId }),
      });
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(Array.isArray(data) ? data.filter(n => !n.lu).length : 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [userId]);

  // Memoize the markAsRead function
  const markAsRead = useCallback(async (idNotification) => {
    try {
      await fetch('http://localhost:4000/notification/marquer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNotification }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    localStorage.setItem("heures", JSON.stringify(heures));
  }, [heures]);

  const handleInscChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInscSubmit = async (e) => {
    e.preventDefault();
    setInscLoading(true);
    setInscSuccess('');
    setInscError('');
    try {
      let users_id = localStorage.getItem('users_id');
      if (!users_id) {
        const emailUser = localStorage.getItem('emailUser') || localStorage.getItem('email');
        const idsResponse = await fetch('http://localhost:4000/user/idUnnivFac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailUser })
        });
        if (idsResponse.ok) {
          const idsData = await idsResponse.json();
          if (Array.isArray(idsData) && idsData[0]) {
            users_id = idsData[0].users_id;
            localStorage.setItem('users_id', users_id);
          }
        }
      }
      if (!users_id) {
        setInscError("Impossible de trouver l'ID utilisateur. Veuillez réessayer.");
        setInscLoading(false);
        return;
      }
      const emailUser = localStorage.getItem('emailUser') || localStorage.getItem('email');
      if (!emailUser) {
        setInscError("Email non trouvé. Veuillez retourner à la page d'inscription.");
        setInscLoading(false);
        return;
      }
      const requestBody = {
        email: emailUser,
        nomDepartement: formData.departement,
        nomfiliere: formData.filiere,
        nomSpecialite: formData.specialite,
        nomNiveau: formData.niveau,
        nomModule: formData.module,
        nom: formData.nom,
        prenom: formData.prenom,
        dateDeNecaence: formData.dateNaissance,
        rang: formData.typeEnseignant
      };
      const response = await fetch('http://localhost:4000/vacateur/inscrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await response.text();
      if (data.includes('Inscription successful')) {
        setInscSuccess('Inscription réussie !');
        setShowInscriptionForm(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setInscError(data || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setInscError("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setInscLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/auth/authEns";
    } else if (getUserType() !== "enseignant") {
      const type = getUserType();
      if (type === "chef_departement") window.location.href = "/DashboardChef";
      else if (type === "admin") window.location.href = "/DashboardAdm";
      else window.location.href = "/auth/authEns";
    }
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Description and Go to Inscription Button */}
        <div className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Bienvenue sur votre espace enseignant</h1>
            <p className="text-gray-700 max-w-2xl">
              Ici, vous pouvez gérer vos heures d'enseignement et suivre l'état de votre inscription. Pour voir ou ajouter une inscription, cliquez sur le bouton ci-dessous ou utilisez le menu "Inscription" dans la barre de navigation.
            </p>
          </div>
          <button
            onClick={() => router.push('/inscription')}
            className="mt-4 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-colors"
          >
            Accéder à l'inscription
          </button>
        </div>
        {/* Affichage des informations de l'enseignant connecté */}
        

        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-green-700 mb-2">Gestion des Heures d'Enseignement</h2>
        </div>

        {/* Notification Bell */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              className="rounded-full w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity relative"
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown) fetchNotifications();
              }}
            >
              <Image 
                src="/images/notif.png" 
                alt="Notifications" 
                width={20} 
                height={20}
                priority
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 font-semibold border-b">Notifications</div>
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="p-4 text-gray-500 text-center">Aucune notification</li>
                  ) : (
                    notifications.map((notif, idx) => (
                      <li key={notif.idNotification || idx} className={`p-4 border-b last:border-b-0 ${notif.lu ? 'bg-gray-50' : 'bg-green-50'}`}>
                        <div className="font-medium">{notif.message}</div>
                        <div className="text-xs text-gray-400">{notif.date}</div>
                        <div className="text-xs text-gray-500">{notif.type === 'chef' ? 'Chef de département' : 'Enseignant'}</div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto mt-6 max-w-5xl mx-auto">
          <table className="w-full rounded-2xl shadow-2xl overflow-hidden border-2 border-green-500">
            <thead className="bg-white sticky top-0 shadow z-10">
              <tr>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Début</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Fin</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Niveau</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Spécialité</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Groupe</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Module</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Sujet</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {heures.map((item, index) => (
                <tr key={index} className="even:bg-gray-50 hover:bg-green-50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <input type="date" value={item.date} onChange={(e) => modifierValeur(index, "date", e.target.value)} 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="time" value={item.debut} onChange={(e) => modifierValeur(index, "debut", e.target.value)} 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="time" value={item.fin} onChange={(e) => modifierValeur(index, "fin", e.target.value)} 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400" />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.niveau}
                      onChange={e => modifierValeur(index, "niveau", e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                    >
                      <option value="">Sélectionner</option>
                      {niveaux.map(niveau => (
                        <option key={niveau.nom} value={niveau.nom}>
                          {niveau.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.specialite}
                      onChange={(e) => modifierValeur(index, "specialite", e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                    >
                      <option value="">Sélectionner</option>
                      {specialites.map(specialite => (
                        <option key={specialite.id} value={specialite.nom}>
                          {specialite.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.groupe}
                      onChange={(e) => modifierValeur(index, "groupe", e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                      placeholder="Groupe"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.module}
                      onChange={(e) => modifierValeur(index, "module", e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                    >
                      <option value="">Sélectionner</option>
                      {modules.map(module => (
                        <option key={module.id} value={module.id}>
                          {module.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={item.type} onChange={(e) => modifierValeur(index, "type", e.target.value)} 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 placeholder-gray-400">
                      <option value="">Sélectionner</option>
                      {types.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 relative">
                    {sujetEnEdition === index ? (
                      <div className="absolute z-10 right-0 w-64 bg-white border border-gray-200 shadow-lg rounded-lg">
                        <textarea
                          autoFocus
                          value={item.sujet}
                          onChange={(e) => modifierValeur(index, "sujet", e.target.value)}
                          onBlur={() => setSujetEnEdition(null)}
                          className="w-full p-3 border-0 rounded-lg focus:ring-2 focus:ring-green-500"
                          rows="3"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.sujet}
                        onFocus={() => setSujetEnEdition(index)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 cursor-pointer placeholder-gray-400"
                        readOnly
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => supprimerLigne(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={ajouterLigne}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors shadow-md active:scale-95"
          >
            <PlusCircle size={20} />
            <span>Ajouter ligne</span>
          </button>
          <button
            onClick={sauvegarderHeures}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors shadow-md active:scale-95"
          >
            <Save size={20} />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  );
}
