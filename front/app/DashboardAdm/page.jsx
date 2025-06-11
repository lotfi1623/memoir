'use client';

import { Card } from "@/components/ui/card";
import { Building2, GraduationCap, Users, Building, BookOpen, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUserType } from "../utils/auth";

// Helper to get a cookie value by name
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Helper to clear a cookie
function clearCookie(name) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    universites: 0,
    facultes: 0,
    departements: 0,
    chefs: 0
  });
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedUniversityFaculties, setSelectedUniversityFaculties] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchFaculties = async (nomUnniversite) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching faculties for university:', nomUnniversite);
      const response = await fetch('http://localhost:4000/admin/show/fac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ nomUnniversite })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Faculties data received:', data);
      if (Array.isArray(data) && data.length > 0) {
        setFaculties(data);
      } else {
        setFaculties([]);
      }
      return data;
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Impossible de charger les facultés. Veuillez vérifier que le serveur est en cours d\'exécution sur le port 4000.');
      setFaculties([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getCookie('adminToken');
    const userType = getCookie('userType');
    if (!token || userType !== 'admin') {
      router.replace('/auth/authAdmin');
      return;
    }
    // Optionally, validate token with backend here for extra security
    setIsAdmin(true);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [universitesRes, facultesRes, departementsRes, chefsRes] = await Promise.all([
          fetch('http://localhost:4000/Admin/count/unniversite', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }),
          fetch('http://localhost:4000/Admin/count/faculte', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }),
          fetch('http://localhost:4000/Admin/count/departement', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }),
          fetch('http://localhost:4000/Admin/count/chef', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          })
        ]);

        if (!universitesRes.ok || !facultesRes.ok || !departementsRes.ok || !chefsRes.ok) {
          throw new Error('One or more API endpoints returned an error');
        }

        const [universitesData, facultesData, departementsData, chefsData] = await Promise.all([
          universitesRes.json(),
          facultesRes.json(),
          departementsRes.json(),
          chefsRes.json()
        ]);

        setStats({
          universites: universitesData.count || 0,
          facultes: facultesData.count || 0,
          departements: departementsData.count || 0,
          chefs: chefsData.count || 0
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setError('Impossible de charger les statistiques. Veuillez vérifier que le serveur est en cours d\'exécution sur le port 4000 et que les endpoints sont corrects.');
        setStats({
          universites: 0,
          facultes: 0,
          departements: 0,
          chefs: 0
        });
      }
    };
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:4000/admin/show/unniv', {
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
        setUniversities(data);
      } catch (error) {
        setError('Impossible de charger les universités. Veuillez vérifier que le serveur est en cours d\'exécution sur le port 4000.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchUniversities();
  }, []);

  const handleUniversitySelect = async (universityName) => {
    setSelectedUniversity(universityName);
    setLoadingFaculties(true);
    
    try {
      const facultiesData = await fetchFaculties(universityName);
      setSelectedUniversityFaculties(facultiesData);
    } catch (error) {
      console.error('Error fetching faculties for university:', error);
    } finally {
      setLoadingFaculties(false);
    }
  };

  const statCards = [
    {
      title: 'Universités',
      value: stats.universites,
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      description: 'Nombre total d\'universités'
    },
    {
      title: 'Facultés',
      value: stats.facultes,
      icon: <GraduationCap className="w-8 h-8 text-green-600" />,
      description: 'Nombre total de facultés'
    },
    {
      title: 'Départements',
      value: stats.departements,
      icon: <Building className="w-8 h-8 text-green-600" />,
      description: 'Nombre total de départements'
    },
    {
      title: 'Chefs de Département',
      value: stats.chefs,
      icon: <Users className="w-8 h-8 text-green-600" />,
      description: 'Nombre total de chefs'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Liste des Universités</h2>
          {loading ? (
            <p className="text-gray-600">Chargement des universités...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="space-y-4">
              {universities.map((university, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${selectedUniversity === university.NomUnniversite ? 'bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                  onClick={() => handleUniversitySelect(university.NomUnniversite)}
                >
                  <span className="font-medium">{university.NomUnniversite}</span>
                  {selectedUniversity === university.NomUnniversite && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedUniversity 
              ? `Facultés de ${selectedUniversity}` 
              : 'Sélectionnez une université pour voir ses facultés'}
          </h2>
          {loadingFaculties ? (
            <p className="text-gray-600">Chargement des facultés...</p>
          ) : selectedUniversityFaculties.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">Aucune faculté trouvée pour l'université "{selectedUniversity}"</p>
              <p className="text-sm text-yellow-600 mt-2">Vérifiez que l'université existe bien dans la base de données.</p>
              <button 
                onClick={() => handleUniversitySelect(selectedUniversity)} 
                className="mt-3 px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedUniversityFaculties.map((faculty, index) => (
                <div key={index} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{faculty.nomFaculté}</span>
                  <span className="text-sm text-gray-600 mt-1">ID: {faculty.idFaculté}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Universités récentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universities.slice(0, 3).map((university, index) => (
            <Card key={index} className="p-4">
              <h3 className="font-semibold text-lg">{university.NomUnniversite || "Nom non disponible"}</h3>
              <p className="text-gray-600">ID: {university.idUnniversite || "ID non disponible"}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord administrateur</h1>
        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
            >
              Réessayer
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/DashboardAdm/unniversites">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Universités</h2>
                  <p className="text-gray-600">Gérer les universités</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/DashboardAdm/facultes">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Facultés</h2>
                  <p className="text-gray-600">Gérer les facultés</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/DashboardAdm/departements">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Départements</h2>
                  <p className="text-gray-600">Gérer les départements</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/DashboardAdm/specialites">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Spécialités</h2>
                  <p className="text-gray-600">Gérer les spécialités</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/DashboardAdm/filieres">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Filières</h2>
                  <p className="text-gray-600">Gérer les filières</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/DashboardAdm/adminChef">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <UserPlus className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Chefs</h2>
                  <p className="text-gray-600">Gérer les chefs</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
} 