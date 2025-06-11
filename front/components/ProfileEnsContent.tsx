'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileData {
  nomFaculté: string;
  Nom_departement: string;
  Email: string;
  nomEnseignant: string;
  PrenomEnseignant: string;
  DateDeNaissance: string;
}

export default function ProfileEnsContent() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('users_id') : null;
    if (!userId) {
      console.error('No user ID found in localStorage');
      return;
    }

    async function fetchProfile() {
      try {
        const response = await fetch('http://localhost:4000/enseignant/show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idEnseignant: userId }),
        });
        const data = await response.json();
        console.log('Received profile data:', data);
        
        // Handle array response
        if (Array.isArray(data) && data.length > 0) {
          // Clean up the data (remove \r\n from PrenomEnseignant)
          const cleanedData = {
            ...data[0],
            PrenomEnseignant: data[0].PrenomEnseignant?.trim() || '',
            DateDeNaissance: new Date(data[0].DateDeNaissance).toLocaleDateString('fr-FR')
          };
          console.log('Cleaned profile data:', cleanedData);
          setProfileData(cleanedData);
        } else {
          console.error('Invalid data format received:', data);
          setProfileData(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileData(null);
      }
    }
    fetchProfile();
  }, []);

  if (!profileData) {
    return (
      <div className="p-6 text-center text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        Chargement des données...
      </div>
    );
  }

  // Format the data for display
  const displayData = [
    { label: "Nom", value: profileData.nomEnseignant },
    { label: "Prénom", value: profileData.PrenomEnseignant },
    { label: "Email", value: profileData.Email },
    { label: "Faculté", value: profileData.nomFaculté },
    { label: "Département", value: profileData.Nom_departement },
    { label: "Date de naissance", value: profileData.DateDeNaissance }
  ];

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white shadow-lg rounded-xl">
      {/* Header Section */}
      <div className="px-6 py-8 border-b">
        <div className="flex items-center gap-4">
          <Image 
            src="/logos/informatique.png" 
            alt="Logo" 
            width={48} 
            height={48} 
            className="rounded"
          />
          <h1 className="text-2xl font-bold text-green-600">
            Heure<span className="text-gray-900">Track</span>
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 gap-8">
          <Card className="relative overflow-hidden">
            <CardContent className="relative p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayData.map(({ label, value }) => (
                <div key={label} className="space-y-1 group">
                  <p className="text-sm text-green-600 capitalize group-hover:text-green-800 transition-colors">
                    {label}
                  </p>
                  <p className="font-medium text-gray-900 group-hover:text-green-900 transition-colors">
                    {value || 'Non spécifié'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
