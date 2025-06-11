'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import NavbarDash from '@/components/NavbarDash';
import Menu from '@/components/Menu';

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAdd = searchParams.get('ajouter') === '1';

  // State for status
  const [inscriptionStatus, setInscriptionStatus] = useState(null);
  const [inscriptionLoading, setInscriptionLoading] = useState(true);

  // State for add form
  const [showInscriptionForm, setShowInscriptionForm] = useState(showAdd);
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
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [modules, setModules] = useState([]);
  const [inscError, setInscError] = useState('');
  const [inscLoading, setInscLoading] = useState(false);
  const [inscSuccess, setInscSuccess] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    fetch('http://localhost:4000/admin/liste/departement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => setDepartments([]));
  }, []);
  // Fetch filieres when departement changes
  useEffect(() => {
    if (!formData.departement) { setFilieres([]); setFormData(f => ({ ...f, filiere: '', specialite: '', module: '' })); return; }
    fetch('http://localhost:4000/admin/show/filiere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomDepartement: formData.departement })
    })
      .then(res => res.json())
      .then(data => setFilieres(Array.isArray(data) ? data : []))
      .catch(() => setFilieres([]));
  }, [formData.departement]);
  // Fetch specialites when filiere changes
  useEffect(() => {
    if (!formData.filiere) { setSpecialites([]); setFormData(f => ({ ...f, specialite: '', module: '' })); return; }
    fetch('http://localhost:4000/admin/show/specialite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomFiliere: formData.filiere })
    })
      .then(res => res.json())
      .then(data => setSpecialites(Array.isArray(data) ? data : []))
      .catch(() => setSpecialites([]));
  }, [formData.filiere]);
  // Fetch niveaux when specialite changes
  useEffect(() => {
    if (!formData.specialite) { setNiveaux([]); setFormData(f => ({ ...f, niveau: '' })); return; }
    fetch('http://localhost:4000/admin/show/niveau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomSpecialite: formData.specialite })
    })
      .then(res => res.json())
      .then(data => setNiveaux(Array.isArray(data) ? data : []))
      .catch(() => setNiveaux([]));
  }, [formData.specialite]);
  // Fetch modules when niveau changes
  useEffect(() => {
    if (!formData.niveau) { setModules([]); setFormData(f => ({ ...f, module: '' })); return; }
    fetch('http://localhost:4000/admin/show/module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomNiveau: formData.niveau })
    })
      .then(res => res.json())
      .then(data => setModules(Array.isArray(data) ? data : []))
      .catch(() => setModules([]));
  }, [formData.niveau]);

  // Fetch current inscription status
  useEffect(() => {
    const email = typeof window !== 'undefined' ? (localStorage.getItem('emailUser') || localStorage.getItem('email')) : null;
    if (!email) {
      setInscriptionLoading(false);
      return;
    }
    const fetchInscription = async () => {
      try {
        // Get users_id
        const idsResponse = await fetch('http://localhost:4000/user/idUnnivFac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (!idsResponse.ok) throw new Error('Failed to fetch user IDs');
        const idsData = await idsResponse.json();
        let users_id = null;
        if (Array.isArray(idsData) && idsData[0]) {
          users_id = idsData[0].users_id;
        } else if (idsData && idsData.users_id) {
          users_id = idsData.users_id;
        }
        if (!users_id) throw new Error('No users_id returned');
        // Now fetch enseignant data
        const response = await fetch('http://localhost:4000/vacateur/voir/demende', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser: users_id })
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setInscriptionStatus(data);
      } catch (error) {
        setInscriptionStatus(null);
      } finally {
        setInscriptionLoading(false);
      }
    };
    fetchInscription();
  }, []);

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

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="w-64 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 min-h-screen">
        <Menu />
      </div>
      <div className="w-[84%] p-6">
        <NavbarDash />
        <div className="mt-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700 mb-6">Gestion de l'inscription</h1>
          {/* Status Card */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            {inscriptionLoading ? (
              <div className="flex items-center space-x-2"><span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></span> <span>Chargement du statut d'inscription...</span></div>
            ) : inscriptionStatus ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">État de votre inscription</h2>
                  <span className={`font-semibold ${
                    inscriptionStatus?.status === 'pending'
                      ? 'text-yellow-600'
                      : inscriptionStatus?.status === 'validated'
                      ? 'text-green-600'
                      : inscriptionStatus?.status === 'refused'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {inscriptionStatus?.status === 'pending'
                      ? 'En attente de validation'
                      : inscriptionStatus?.status === 'validated'
                      ? 'Validé'
                      : inscriptionStatus?.status === 'refused'
                      ? 'Refusé'
                      : 'Inscription en attente'}
                  </span>
                </div>
                {/* Show details if available */}
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(inscriptionStatus) && inscriptionStatus.length > 0 ? (
                    inscriptionStatus.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-2 bg-gray-50 col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-700 font-bold">Votre inscription {inscriptionStatus.length > 1 ? idx + 1 : ''}</span>
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">En attente</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Université:</span> {item.NomUnniversite || 'Non spécifié'}</div>
                          <div><span className="font-medium">Faculté:</span> {item.nomFaculté || 'Non spécifié'}</div>
                          <div><span className="font-medium">Département:</span> {item.Nom_departement || 'Non spécifié'}</div>
                          <div><span className="font-medium">Filière:</span> {item.NomFilière || 'Non spécifié'}</div>
                          <div><span className="font-medium">Spécialité:</span> {item.NomSpécialité || 'Non spécifié'}</div>
                          <div><span className="font-medium">Niveau:</span> {item.NomNiveau || 'Non spécifié'}</div>
                          <div><span className="font-medium">Module:</span> {item.Nom_module || 'Non spécifié'}</div>
                          <div><span className="font-medium">Nom:</span> {item.nomEnseignant || 'Non spécifié'}</div>
                          <div><span className="font-medium">Prénom:</span> {item.PrenomEnseignant || 'Non spécifié'}</div>
                          <div><span className="font-medium">Date de naissance:</span> {item.DateDeNaissance ? new Date(item.DateDeNaissance).toLocaleDateString('fr-FR') : 'Non spécifié'}</div>
                          <div><span className="font-medium">Email:</span> {item.Email || 'Non spécifié'}</div>
                          <div><span className="font-medium">Rang:</span> {item.Rang || 'Non spécifié'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 col-span-2">Aucune inscription trouvée.</div>
                  )}
                  {inscriptionStatus?.status === 'pending' && (
                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg col-span-2">
                      <p className="text-yellow-800 text-sm">
                        Votre inscription est en cours d'examen par le chef de département. Vous recevrez une notification une fois votre compte validé.
                      </p>
                    </div>
                  )}
                  {inscriptionStatus?.status === 'refused' && (
                    <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-lg col-span-2">
                      <p className="text-red-800 text-sm">
                        Votre inscription a été refusée. Veuillez contacter le chef de département pour plus d'informations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          {/* Ajouter inscription button and form */}
          {inscriptionStatus?.status !== 'pending' && !showInscriptionForm && (
            <div className="mb-8 flex justify-end">
              <button
                onClick={() => setShowInscriptionForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md transition-colors"
              >
                Ajouter inscription
              </button>
            </div>
          )}
          {inscriptionStatus?.status !== 'pending' && showInscriptionForm && (
            <div className="mb-8 bg-white rounded-lg shadow p-6 relative">
              <button
                type="button"
                onClick={() => setShowInscriptionForm(false)}
                className="absolute top-0 right-0 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-3 py-1 text-xs font-semibold shadow-sm transition-colors"
              >
                Masquer
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Nouvelle inscription</h2>
              <form className="space-y-5" onSubmit={handleInscSubmit}>
                {inscError && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm" role="alert">{inscError}</div>}
                {inscSuccess && <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-xl shadow-lg animate-fade-in" role="alert">{inscSuccess}</div>}
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                  <Input id="nom" name="nom" required value={formData.nom} onChange={handleInscChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                  <Input id="prenom" name="prenom" required value={formData.prenom} onChange={handleInscChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label htmlFor="dateNaissance" className="block text-sm font-semibold text-gray-700 mb-1.5">Date de naissance</label>
                  <Input id="dateNaissance" name="dateNaissance" type="date" required value={formData.dateNaissance} onChange={handleInscChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label htmlFor="departement" className="block text-sm font-semibold text-gray-700 mb-1.5">Département</label>
                  <select id="departement" name="departement" required value={formData.departement} onChange={handleInscChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white">
                    <option value="">Sélectionner un département</option>
                    {departments.map((dept) => (
                      <option key={dept.Nom_departement} value={dept.Nom_departement}>{dept.Nom_departement}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filiere" className="block text-sm font-semibold text-gray-700 mb-1.5">Filière</label>
                  <select id="filiere" name="filiere" required value={formData.filiere} onChange={handleInscChange} disabled={!formData.departement} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500">
                    <option value="">Sélectionner filière</option>
                    {Array.isArray(filieres) && filieres.map((filiere) => (
                      <option key={filiere.nomFilière} value={filiere.nomFilière}>{filiere.nomFilière}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="specialite" className="block text-sm font-semibold text-gray-700 mb-1.5">Spécialité</label>
                  <select id="specialite" name="specialite" required value={formData.specialite} onChange={handleInscChange} disabled={!formData.filiere} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500">
                    <option value="">Sélectionner spécialité</option>
                    {Array.isArray(specialites) && specialites.map((specialite) => (
                      <option key={specialite.NomSpécialité} value={specialite.NomSpécialité}>{specialite.NomSpécialité}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="niveau" className="block text-sm font-semibold text-gray-700 mb-1.5">Niveau</label>
                  <select id="niveau" name="niveau" required value={formData.niveau} onChange={handleInscChange} disabled={!formData.specialite} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500">
                    <option value="">Sélectionner niveau</option>
                    {Array.isArray(niveaux) && niveaux.map((niveau) => (
                      <option key={niveau.nomNiveau} value={niveau.nomNiveau}>{niveau.nomNiveau}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="module" className="block text-sm font-semibold text-gray-700 mb-1.5">Module</label>
                  <select id="module" name="module" required value={formData.module} onChange={handleInscChange} disabled={!formData.niveau} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500">
                    <option value="">Sélectionner module</option>
                    {Array.isArray(modules) && modules.map((module) => (
                      <option key={module.Nom_module} value={module.Nom_module}>{module.Nom_module}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="typeEnseignant" className="block text-sm font-semibold text-gray-700 mb-1.5">Type d'enseignant</label>
                  <select id="typeEnseignant" name="typeEnseignant" required value={formData.typeEnseignant} onChange={handleInscChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white">
                    <option value="">Type d'enseignant</option>
                    <option value="vacataire">Vacataire</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md text-sm px-6 py-3 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" color="primary" disabled={inscLoading}>
                    {inscLoading ? 'Envoi...' : 'Finaliser l\'inscription'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 