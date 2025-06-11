'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Input from '@/components/ui/input.jsx'
import { Select, SelectItem } from '@/components/ui/select.jsx'
import { Button } from '@/components/ui/button.jsx'
import { isLoggedIn, getUserType } from "../../utils/auth"

export default function CompleteProfile() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  })
  const [departments, setDepartments] = useState([])
  const [filieres, setFilieres] = useState([])
  const [specialites, setSpecialites] = useState([])
  const [niveaux, setNiveaux] = useState([])
  const [modules, setModules] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isLoggedIn()) {
      const type = getUserType();
      const status = typeof window !== 'undefined' ? localStorage.getItem('enseignantStatus') : null;
      if (type === "enseignant" && status === "accepted") {
        window.location.href = "/DashbordEns";
      } else if (type === "enseignant" && status === "pending") {
        // Stay on complete profile page
      } else if (type === "chef_departement") window.location.href = "/DashboardChef";
      else if (type === "admin") window.location.href = "/DashboardAdm";
      else window.location.href = "/auth/authEns";
    }
  }, []);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userId = localStorage.getItem('userId')
    const email = localStorage.getItem('emailUser')
    console.log('=== Email Debug Info ===');
    console.log('Email from localStorage:', email);
    console.log('=====================');
    
    if (!email) {
      console.error('No email found in localStorage');
      setError('Email non trouvé. Veuillez retourner à la page d\'inscription.');
      return;
    }

    

    // Fetch departments based on faculty chosen at login
    const nomFaculte = localStorage.getItem('nomFaculté')
    if (nomFaculte) {
      fetch('http://localhost:4000/admin/show/departement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomFaculte })
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDepartments(data)
          }
        })
        .catch(err => {
          console.error('Error fetching departments:', err)
          setError('Impossible de charger les départements')
        })
    }
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log('Handling change:', name, value); // Debug log
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log('New form data:', newData); // Debug log
      return newData;
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Fetch IDs before submitting
      let users_id = localStorage.getItem('users_id');
      if (!users_id) {
        try {
          const emailUser = localStorage.getItem('emailUser');
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
        } catch (err) {
          console.error('Could not fetch user ID before profile completion:', err);
        }
      }

      if (!users_id) {
        setError('Impossible de trouver l\'ID utilisateur. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      const emailUser = localStorage.getItem('emailUser');
      if (!emailUser) {
        setError('Email non trouvé. Veuillez retourner à la page d\'inscription.');
        setLoading(false);
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
      
      console.log('Request body:', requestBody); // Debug log

      const response = await fetch('http://localhost:4000/vacateur/inscrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.text();
      console.log('Response:', data);

      if (data.includes('Inscription successful')) {
        setSuccess('Inscription réussie !');
        setTimeout(() => {
          router.push('/auth/pending');
        }, 2000);
      } else {
        setError(data || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les filières selon le département
  useEffect(() => {
    if (!formData.departement) {
      setFilieres([]);
      setFormData(f => ({ ...f, filiere: '', specialite: '', module: '' }));
      return;
    }
    console.log('Fetching filières for department:', formData.departement);
    fetch('http://localhost:4000/admin/show/filiere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomDepartement: formData.departement })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Received filières data:', data);
        if (Array.isArray(data)) {
          setFilieres(data);
        } else {
          console.error('Received non-array data:', data);
          setFilieres([]);
        }
      })
      .catch(err => {
        console.error('Error fetching filières:', err);
        setError('Impossible de charger les filières');
        setFilieres([]);
      });
  }, [formData.departement]);

  // Add a debug effect to monitor filières state
  useEffect(() => {
    console.log('Current filières state:', filieres);
  }, [filieres]);

  // Charger les spécialités selon la filière
  useEffect(() => {
    if (!formData.filiere) {
      setSpecialites([]);
      setFormData(f => ({ ...f, specialite: '', module: '' }));
      return;
    }
    console.log('Fetching specialites for filiere:', formData.filiere);
    fetch('http://localhost:4000/admin/show/specialite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomFiliere: formData.filiere })
    })
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Received specialites data:', data);
        if (Array.isArray(data)) {
          setSpecialites(data);
        } else {
          console.error('Received non-array data:', data);
          setSpecialites([]);
        }
      })
      .catch(err => {
        console.error('Error fetching specialites:', err);
        setError('Impossible de charger les spécialités');
        setSpecialites([]);
      });
  }, [formData.filiere]);

  // Debug effect for form data
  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  // Debug effect for specialites
  useEffect(() => {
    console.log('Current specialites state:', specialites);
  }, [specialites]);

  // Charger les modules selon le niveau
  useEffect(() => {
    if (!formData.niveau) {
      setModules([]);
      setFormData(f => ({ ...f, module: '' }));
      return;
    }
    console.log('Fetching modules for niveau:', formData.niveau);
    fetch('http://localhost:4000/admin/show/module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomNiveau: formData.niveau })
    })
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Received modules data:', data);
        if (Array.isArray(data)) {
          setModules(data);
        } else {
          console.error('Received non-array data:', data);
          setModules([]);
        }
      })
      .catch(err => {
        console.error('Error fetching modules:', err);
        setError('Impossible de charger les modules');
        setModules([]);
      });
  }, [formData.niveau]);

  // Debug effect for modules
  useEffect(() => {
    console.log('Current modules state:', modules);
  }, [modules]);

  // Charger les niveaux selon la spécialité
  useEffect(() => {
    if (!formData.specialite) {
      setNiveaux([]);
      setFormData(f => ({ ...f, niveau: '' }));
      return;
    }
    console.log('Fetching niveaux for specialite:', formData.specialite);
    fetch('http://localhost:4000/admin/show/niveau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomSpecialite: formData.specialite })
    })
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Received niveaux data:', data);
        if (Array.isArray(data)) {
          setNiveaux(data);
        } else {
          console.error('Received non-array data:', data);
          setNiveaux([]);
        }
      })
      .catch(err => {
        console.error('Error fetching niveaux:', err);
        setError('Impossible de charger les niveaux');
        setNiveaux([]);
      });
  }, [formData.specialite]);

  // Debug effect for niveaux
  useEffect(() => {
    console.log('Current niveaux state:', niveaux);
  }, [niveaux]);

  useEffect(() => {
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/liste/departement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Impossible de charger les départements');
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    // Fetch specialites when department is selected
    const fetchSpecialites = async () => {
      if (!formData.department) return;
      try {
        const response = await fetch('http://localhost:4000/relever/specialite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idEnseignant: formData.department })
        });
        const data = await response.json();
        setSpecialites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching specialites:', error);
        setError('Impossible de charger les spécialités');
      }
    };

    fetchSpecialites();
  }, [formData.department]);

  useEffect(() => {
    // Fetch modules when specialite is selected
    const fetchModules = async () => {
      if (!formData.specialite) return;
      try {
        const response = await fetch('http://localhost:4000/relever/module', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idEnseignant: formData.specialite })
        });
        const data = await response.json();
        setModules(Array.isArray(data.modules) ? data.modules : []);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Impossible de charger les modules');
      }
    };

    fetchModules();
  }, [formData.specialite]);

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-green-900">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 md:p-8 max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Compléter votre profil</h2>
        <div className="flex justify-center mb-4">
          <Button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-sm px-4 py-2 mr-2"
            onClick={() => router.push('/auth/pending')}
          >
            Retour à la page d'attente
          </Button>
        </div>
        <p className="text-center text-gray-600 mb-6">Veuillez remplir les informations suivantes pour finaliser votre inscription</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm" role="alert">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-2 border-green-500 text-green-800 p-6 rounded-xl shadow-lg animate-fade-in" role="alert">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-semibold">{success}</p>
              </div>
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
              <Input
                id="nom"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
              <Input
                id="prenom"
                name="prenom"
                required
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="dateNaissance" className="block text-sm font-semibold text-gray-700 mb-1.5">Date de naissance</label>
              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                required
                value={formData.dateNaissance}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="departement" className="block text-sm font-semibold text-gray-700 mb-1.5">Département</label>
              <select
                id="departement"
                name="departement"
                required
                value={formData.departement}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              >
                <option value="">Sélectionner un département</option>
                {departments.map((dept) => (
                  <option key={dept.Nom_departement} value={dept.Nom_departement}>
                    {dept.Nom_departement}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filiere" className="block text-sm font-semibold text-gray-700 mb-1.5">Filière</label>
              <select
                id="filiere"
                name="filiere"
                required
                value={formData.filiere}
                onChange={handleChange}
                disabled={!formData.departement}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Sélectionner filière</option>
                {Array.isArray(filieres) && filieres.map((filiere) => (
                  <option key={filiere.nomFilière} value={filiere.nomFilière}>
                    {filiere.nomFilière}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="specialite" className="block text-sm font-semibold text-gray-700 mb-1.5">Spécialité</label>
              <select
                id="specialite"
                name="specialite"
                required
                value={formData.specialite}
                onChange={handleChange}
                disabled={!formData.filiere}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Sélectionner spécialité</option>
                {Array.isArray(specialites) && specialites.map((specialite) => (
                  <option key={specialite.NomSpécialité} value={specialite.NomSpécialité}>
                    {specialite.NomSpécialité}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="niveau" className="block text-sm font-semibold text-gray-700 mb-1.5">Niveau</label>
              <select
                id="niveau"
                name="niveau"
                required
                value={formData.niveau}
                onChange={handleChange}
                disabled={!formData.specialite}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Sélectionner niveau</option>
                {Array.isArray(niveaux) && niveaux.map((niveau) => (
                  <option key={niveau.nomNiveau} value={niveau.nomNiveau}>
                    {niveau.nomNiveau}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="module" className="block text-sm font-semibold text-gray-700 mb-1.5">Module</label>
              <select
                id="module"
                name="module"
                required
                value={formData.module}
                onChange={handleChange}
                disabled={!formData.niveau}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Sélectionner module</option>
                {Array.isArray(modules) && modules.map((module) => (
                  <option key={module.Nom_module} value={module.Nom_module}>
                    {module.Nom_module}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="typeEnseignant" className="block text-sm font-semibold text-gray-700 mb-1.5">Type d'enseignant</label>
              <select
                  id="typeEnseignant"
                  name="typeEnseignant"
                  required
                  value={formData.typeEnseignant}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
                >
                <option value="">Type d'enseignant</option>
                <option value="vacataire">Vacataire</option>
                <option value="permanent">Permanent</option>
              </select>
              </div>
            <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md text-sm px-6 py-3 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  color="primary"
                >
                  Finaliser l'inscription
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
