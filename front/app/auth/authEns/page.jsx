'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUserType } from "../../utils/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('enseignant');
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [formData, setFormData] = useState({
    emailUser: '',
    mdpUser: '',
    confirmePassword: ''
  });
  const [status, setStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      const type = getUserType();
      if (type === "enseignant" && window.location.pathname !== "/DashbordEns") {
        router.replace("/DashbordEns");
      } else if (type === "chef_departement" && window.location.pathname !== "/DashboardChef") {
        router.replace("/DashboardChef");
      } else if (type === "admin" && window.location.pathname !== "/DashboardAdm") {
        router.replace("/DashboardAdm");
      }
      // Do NOT redirect to /auth/authEns if already here
    }
  }, [router]);

  useEffect(() => {
    const fetchUniversities = async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          console.log('Tentative de chargement des universités...');
          const response = await fetch('http://localhost:4000/admin/show/Unniv', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Données brutes reçues du serveur:', data);
          
          // Vérifier si data est un tableau ou un objet contenant un tableau
          const universitiesArray = Array.isArray(data) ? data : (data.universities || data.data || []);
          
          if (universitiesArray.length > 0) {
            console.log('Universités trouvées:', universitiesArray);
            setUniversities(universitiesArray);
            break; // Success, exit the retry loop
          } else {
            console.error('Aucune université trouvée dans la réponse');
            setStatus('Aucune université disponible');
            break;
          }
        } catch (error) {
          console.error(`Erreur détaillée lors du chargement des universités (tentative ${4-retries}/3):`, error);
          retries--;
          if (retries === 0) {
            setStatus("Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d'exécution.");
          } else {
            // Wait 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      const fetchFaculties = async () => {
        let retries = 3;
        while (retries > 0) {
          try {
            console.log('Chargement des facultés pour l\'université:', selectedUniversity);
            
            const response = await fetch('http://localhost:4000/admin/show/fac', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ nomUnniversite: selectedUniversity })
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Réponse brute du serveur pour les facultés:', data);
            
            if (Array.isArray(data)) {
              setFaculties(data);
              console.log('Facultés mises à jour dans le state:', data);
              break; // Success, exit the retry loop
            } else {
              console.error('Format de données invalide pour les facultés:', data);
              setStatus('Format de données invalide reçu du serveur');
              break;
            }
          } catch (error) {
            console.error(`Erreur détaillée lors du chargement des facultés (tentative ${4-retries}/3):`, error);
            retries--;
            if (retries === 0) {
              setStatus("Impossible de charger les facultés. Veuillez réessayer plus tard.");
            } else {
              // Wait 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
      };
  
      fetchFaculties();
    } else {
      setFaculties([]);
    }
  }, [selectedUniversity]);
  
  const handleUniversityChange = (e) => {
    console.log('Université sélectionnée:', e.target.value);
    setSelectedUniversity(e.target.value);
    setSelectedFaculty(''); // Réinitialiser la faculté sélectionnée
  };

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.mdpUser !== formData.confirmePassword) {
      setStatus("Les mots de passe ne correspondent pas.");
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    try {
      setStatus("Connexion en cours...");
      
      // Choose endpoint based on userType for login
      let endpoint;
      if (isLogin) {
        if (userType === 'chef_departement') {
          endpoint = 'http://localhost:4000/chefdepartement/login';
        } else {
          endpoint = 'http://localhost:4000/user/login';
        }
      } else {
        endpoint = 'http://localhost:4000/user/signup';
      }
      
      // Prepare the data to send to the backend
      const bodyData = isLogin
        ? (userType === 'chef_departement'
            ? {
                emailUser: formData.emailUser,
                mdpUser: formData.mdpUser
              }
            : {
                emailUser: formData.emailUser,
                mdpUser: formData.mdpUser,
                userType: userType
              }
          )
        : {
            emailUser: formData.emailUser,
            mdpUser: formData.mdpUser,
            confirmePassword: formData.confirmePassword,
            nomUnniversite: selectedUniversity,
            nomFaculte: selectedFaculty,
            userType: 'enseignant'
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Clear localStorage before setting new session data
          localStorage.clear();
          
          // Store all user data in localStorage for login
          console.log('Login response data:', data);
          
          if (userType === 'chef_departement') {
            localStorage.setItem('userId', data.id); // Store chef ID
            localStorage.setItem('users_id', data.id); // For compatibility
            localStorage.setItem('userType', 'chef_departement');
            localStorage.setItem('idUniversite', data.idUnniversite || '');
            localStorage.setItem('idFaculte', data.idFaculte || '');
            localStorage.setItem('email', data.emailUser || '');
            localStorage.setItem('status', data.status || 'validated');
            localStorage.setItem('token', data.token || '');
            localStorage.setItem('userToken', data.token || '1'); // Set session token
            localStorage.setItem('enseignantStatus', data.role || 'pending'); // NEW: Store enseignantStatus
            router.push('/DashboardChef');
          } else {
            localStorage.setItem('users_id', data.users_id || '');
            localStorage.setItem('userType', userType);
            localStorage.setItem('enseignantStatus', data.role || 'pending'); // NEW: Store enseignantStatus
            localStorage.setItem('idUniversite', data.idUnniversite || '');
            localStorage.setItem('idFaculte', data.idFaculte || '');
            localStorage.setItem('email', data.Email || '');
            localStorage.setItem('status', data.status || 'validated');
            localStorage.setItem('token', data.token || '');
            localStorage.setItem('userToken', data.token || '1'); // Set session token
            if (data.redirectionPath) {
              router.push(data.redirectionPath);
            } else {
              setStatus("Aucune redirection fournie par le serveur.");
              setTimeout(() => setStatus(null), 5000);
            }
          }
        } else {
          // SIGNUP: DO NOT set session data!
          localStorage.removeItem('userToken');
          localStorage.removeItem('userType');
          localStorage.setItem('emailUser', formData.emailUser);
          localStorage.setItem('nomFaculté', selectedFaculty);
          localStorage.setItem('users_id', data.users_id || '');
          router.push('/auth/pending');
        }
      } else {
        setStatus(data.message || "Erreur d'authentification.");
        setTimeout(() => setStatus(null), 5000);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setStatus("Erreur de connexion au serveur.");
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-700 to-green-900">
      <div className="flex w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Partie gauche */}
        <div className="w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500/10 to-green-700/10 min-h-[500px]">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-4">Bienvenue sur notre plateforme</h2>
          <p className="text-base text-green-700 text-center mb-6">
            {isLogin
              ? "Connectez-vous à votre compte"
              : "Inscrivez-vous pour commencer à suivre vos heures"}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-4 py-2 bg-green-700 text-white rounded-xl hover:bg-green-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/20"
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>
        </div>

        {/* Partie droite */}
        <div className="w-1/2 flex flex-col items-center justify-center p-8 min-h-[500px]">
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            {/* Email */}
            <input
              type="email"
              name="emailUser"
              placeholder="Email"
              value={formData.emailUser}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none"
            />

            {/* Password */}
            <input
              type="password"
              name="mdpUser"
              placeholder="Mot de passe"
              value={formData.mdpUser}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none"
            />

            {/* Confirm Password (only for signup) */}
            {!isLogin && (
              <input
                type="password"
                name="confirmePassword"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmePassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none"
              />
            )}

            {/* UserType (only login) */}
            {isLogin && (
              <>  
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none"
                required
              >
                <option key="default-type" value="">Type d'utilisateur</option>
                <option key="enseignant" value="enseignant">Enseignant</option>
                <option key="chef" value="chef_departement">Chef de département</option>
              </select>
              </>
            )}

            {/* University + Faculty (only signup) */}
            {!isLogin && (
              <>
               <select
  onChange={handleUniversityChange}
  value={selectedUniversity}
  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-700 focus:ring-2"
  required
>
  <option value="">Sélectionner une université</option>
  {universities && universities.length > 0 ? (
    universities.map((univ) => (
      <option key={univ.idUnniversite} value={univ.idUnniversite}>
        {univ.NomUnniversite || 'Université sans nom'}
      </option>
    ))
  ) : (
    <option value="" disabled>Aucune université disponible</option>
  )}
</select>


<select
  onChange={handleFacultyChange}
  value={selectedFaculty}
  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-700 focus:ring-2"
  disabled={!selectedUniversity}
  required
>
  <option value="">Sélectionner une faculté</option>
  {faculties.map((fac) => (
    <option key={fac.idFaculte} value={fac.idFaculte}>
      {fac.nomFaculté || 'faculte sans nom'}
    </option>
  ))}
</select>

              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-700 text-white rounded-xl hover:bg-green-900 transition duration-300 transform hover:scale-105"
            >
              {isLogin ? 'Se connecter' : 'Créer un compte'}
            </button>

            {status && (
              <div className="mt-3 p-3 text-red-600 bg-red-50 rounded-xl border border-red-200">
                {status}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

AuthPage.authPage = true;
