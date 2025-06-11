'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnseignantData {
  nomFaculté: string;
  Nom_departement: string;
  Email: string;
  nomEnseignant: string;
  PrenomEnseignant: string;
  DateDeNaissance: string;
}

export default function SettingsEnsContent() {
  const [enseignantData, setEnseignantData] = useState<EnseignantData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    dateNaissance: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMessage, setShowMessage] = useState(false);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (message.text) {
      setShowMessage(true);
      timer = setTimeout(() => {
        setShowMessage(false);
        // Clear message after fade out animation
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 300); // Wait for fade out animation to complete
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message]);

  // Fetch enseignant data
  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('users_id') : null;
    if (!userId) {
      console.error('No user ID found in localStorage');
      return;
    }

    async function fetchEnseignantData() {
      try {
        const response = await fetch('http://localhost:4000/enseignant/show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idEnseignant: userId }),
        });
        const data = await response.json();
        console.log('Received enseignant data:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          const cleanedData = {
            ...data[0],
            PrenomEnseignant: data[0].PrenomEnseignant?.trim() || '',
            DateDeNaissance: new Date(data[0].DateDeNaissance).toLocaleDateString('fr-FR')
          };
          setEnseignantData(cleanedData);
          // Initialize form data
          setFormData({
            email: cleanedData.Email || '',
            dateNaissance: new Date(data[0].DateDeNaissance).toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error('Error fetching enseignant data:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      }
    }

    fetchEnseignantData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = typeof window !== 'undefined' ? localStorage.getItem('users_id') : null;
    if (!userId) {
      setMessage({ type: 'error', text: 'ID utilisateur non trouvé' });
      return;
    }

    // Validate form data
    if (!formData.email || !formData.dateNaissance) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    try {
      console.log('Sending update request with data:', {
        idEnseignant: userId,
        email: formData.email,
        DateDeNaissance: formData.dateNaissance
      });

      const response = await fetch('http://localhost:4000/enseignant/modifier', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          idEnseignant: parseInt(userId), // Convert to number if needed
          email: formData.email,
          DateDeNaissance: formData.dateNaissance
        }),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (response.ok && data.message === "infornation modifier avec seccu") {
        setMessage({ 
          type: 'success', 
          text: 'Informations modifiées avec succès' 
        });
        setIsEditing(false);
        
        // Update local state immediately
        setEnseignantData(prev => prev ? {
          ...prev,
          Email: formData.email,
          DateDeNaissance: new Date(formData.dateNaissance).toLocaleDateString('fr-FR')
        } : null);

        // Also update localStorage
        localStorage.setItem('Email', formData.email);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la modification' });
      }
    } catch (error) {
      console.error('Error updating enseignant:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    }
  };

  if (!enseignantData) {
    return (
      <div className="p-6 text-center text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        Chargement des données...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white shadow-lg rounded-xl">
      {/* Header Section */}
      <div className="px-6 py-8 border-b">
        <div className="flex items-center justify-between">
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
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>
      </div>

      {/* Message Display with Animation */}
      {message.text && (
        <div 
          className={`p-4 m-4 rounded-md transition-all duration-300 ease-in-out transform ${
            showMessage 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2'
          } ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200 font-medium' 
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Settings Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 gap-8">
          <Card className="relative overflow-hidden">
            <CardContent className="relative p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only fields */}
                <div className="space-y-1">
                  <p className="text-sm text-green-600">Nom</p>
                  <p className="font-medium text-gray-900">{enseignantData.nomEnseignant}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-green-600">Prénom</p>
                  <p className="font-medium text-gray-900">{enseignantData.PrenomEnseignant}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-green-600">Faculté</p>
                  <p className="font-medium text-gray-900">{enseignantData.nomFaculté}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-green-600">Département</p>
                  <p className="font-medium text-gray-900">{enseignantData.Nom_departement}</p>
                </div>

                {/* Editable fields */}
                <div className="space-y-1">
                  <label className="text-sm text-green-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    placeholder="Entrez votre email"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-green-600">Date de naissance</label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Submit button */}
                {isEditing && (
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Enregistrer les modifications
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}