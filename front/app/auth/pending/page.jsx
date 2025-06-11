'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MenuPending from '@/components/MenuPending';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { isLoggedIn, getUserType } from "../../utils/auth";

export default function PendingPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      const type = getUserType();
      const status = typeof window !== 'undefined' ? localStorage.getItem('enseignantStatus') : null;
      if (type === "enseignant" && status === "accepted") {
        window.location.href = "/DashbordEns";
      } else if (type === "chef_departement") window.location.href = "/DashboardChef";
      else if (type === "admin") window.location.href = "/DashboardAdm";
      else if (type === "enseignant" && status !== "pending") {
        window.location.href = "/auth/authEns";
      }
    }

    // Get email from localStorage (from signup page)
    const email = localStorage.getItem('emailUser') || localStorage.getItem('email');
    console.log('Email from localStorage (signup):', email);
    if (!email) {
      setLoading(false);
      return;
    }

    // Fetch user IDs using email
    const fetchUserIdsAndData = async () => {
      try {
        // Fetch users_id from /user/idUnnivFac
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
        console.log('users_id from /user/idUnnivFac:', users_id);
        if (!users_id) throw new Error('No users_id returned');
        // Now fetch enseignant data
        const response = await fetch('http://localhost:4000/vacateur/voir/demende', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser: users_id })
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserIdsAndData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-64 bg-white p-4 border-r border-gray-200 min-h-screen">
          <MenuPending />
        </div>
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 border-r border-gray-200 min-h-screen">
        <MenuPending />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">État de votre inscription</h1>
              <div className="flex items-center space-x-2">
                {userData?.status === 'pending' ? (
                  <Clock className="w-6 h-6 text-yellow-500" />
                ) : userData?.status === 'validated' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-500" />
                )}
                <span className={`font-semibold ${
                  userData?.status === 'pending' 
                    ? 'text-yellow-600' 
                    : userData?.status === 'validated' 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {userData?.status === 'pending' 
                    ? 'En attente de validation' 
                    : userData?.status === 'validated' 
                    ? 'Validé' 
                    : 'Inscription en attente'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {Array.isArray(userData) && userData.length > 0 ? (
                userData.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-green-700">Votre inscription {userData.length > 1 ? idx + 1 : ''}</h2>
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">En attente</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                <div className="text-gray-500">Aucune inscription trouvée.</div>
              )}

              {userData?.status === 'pending' && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    Votre inscription est en cours d'examen par le chef de département. 
                    Vous recevrez une notification une fois votre compte validé.
                  </p>
                </div>
              )}

              {userData?.status === 'refused' && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">
                    Votre inscription a été refusée. Veuillez contacter le chef de département 
                    pour plus d'informations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
