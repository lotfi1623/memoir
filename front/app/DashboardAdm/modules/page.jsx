// pages/DashboardAdm/modules/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { Bookmark, Plus, Check, X, Building, GraduationCap, BookOpen, Layers, Edit2, Trash2, Building2, Pencil } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function ModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [moduleData, setModuleData] = useState({
    name: '',
    code: '',
    universityId: '',
    facultyId: '',
    departementId: '',
    specialtyId: '',
    level: '',
    credits: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Niveaux disponibles
  const availableLevels = ['L1', 'L2', 'L3', 'M1', 'M2'];

  // Chargement des données initiales
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using POST method for consistency with other endpoints
        const response = await fetch('http://localhost:4000/admin/liste/module', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch modules: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Modules data:', data);
        
        if (Array.isArray(data)) {
          setModules(data);
        } else {
          console.error('Expected array but got:', typeof data);
          setError('Format de données incorrect');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
        setError(`Impossible de charger les modules: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setModuleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!moduleData.name.trim() || !moduleData.code.trim()) {
      setError('Le nom et le code du module sont obligatoires');
      return;
    }
    if (!moduleData.universityId || !moduleData.facultyId || 
        !moduleData.departementId || !moduleData.specialtyId || !moduleData.level) {
      setError('Veuillez sélectionner tous les niveaux académiques');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (editingId) {
        // Mise à jour
        setModules(modules.map(m => 
          m.id === editingId ? { ...moduleData, id: editingId } : m
        ));
      } else {
        // Création
        const newModule = {
          ...moduleData,
          id: Math.max(0, ...modules.map(m => m.id)) + 1
        };
        setModules([...modules, newModule]);
      }
      
      // Réinitialisation
      handleCancel();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Édition d'un module
  const handleEdit = (module) => {
    setModuleData({
      name: module.name,
      code: module.code,
      universityId: module.universityId,
      facultyId: module.facultyId,
      departementId: module.departementId,
      specialtyId: module.specialtyId,
      level: module.level,
      credits: module.credits,
      description: module.description
    });
    setEditingId(module.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Suppression d'un module
  const handleDelete = async (moduleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      try {
        const response = await fetch(`http://localhost:4000/admin/supprimer/module`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idModule: moduleId })
        });

        if (!response.ok) {
          throw new Error('Failed to delete module');
        }

        // Remove the deleted module from the state
        setModules(modules.filter(module => module.idModule !== moduleId));
        
        // Show success message
        alert('Module supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Impossible de supprimer le module');
      }
    }
  };

  // Annulation
  const handleCancel = () => {
    setModuleData({
      name: '',
      code: '',
      universityId: '',
      facultyId: '',
      departementId: '',
      specialtyId: '',
      level: '',
      credits: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  // Filtres hiérarchiques
  const filteredFaculties = faculties.filter(f => f.universityId == moduleData.universityId);
  const filteredDepartements = departements.filter(d => d.facultyId == moduleData.facultyId);
  const filteredSpecialites = specialites.filter(s => s.departementId == moduleData.departementId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Modules</h1>
        <button
          onClick={() => router.push('/DashboardAdm/modules/add')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un Module
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Chargement des modules...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            Réessayer
          </button>
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p>Aucun module trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{module.Nom_module}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/DashboardAdm/modules/edit/${module.idModule}`)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(module.idModule)}
                      className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">ID: {module.idModule}</p>
                <p className="text-sm text-gray-600">Filière: {module.Nom_filiere}</p>
                <p className="text-sm text-gray-600">Département: {module.Nom_departement}</p>
                <p className="text-sm text-gray-600">Faculté: {module.nomFaculté}</p>
                <p className="text-sm text-gray-600">Université: {module.NomUnniversite}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}