'use client';

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  universite: string;
  faculte: string;
  departement: string;
  dateNaissance: string;
}

export default function SettingsChefContent() {
  const [formData, setFormData] = useState<FormData>({
    nom: "Benali",
    prenom: "Karim",
    email: "karim.benali@uhbc.dz",
    universite: "Université Hassiba Ben Bouali",
    faculte: "Faculté des Sciences Exactes et Informatique",
    departement: "Informatique",
    dateNaissance: "1985-06-21",
  });

  // Load data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('chefData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chefData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const idChef = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!idChef) return;
    async function fetchChefInfo() {
      try {
        const response = await fetch('http://localhost:4000/chefdepartement/showChefInfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idChef }),
        });
        const data = await response.json();
        const chef = Array.isArray(data) ? data[0] : data;
        setFormData({
          nom: chef.nomEnseignant || "",
          prenom: chef.PrenomEnseignant || "",
          email: chef.Email || "",
          dateNaissance: chef.DateDeNaissance || "",
          universite: chef.NomUnniversite || "",
          faculte: chef.nomFaculté || "",
          departement: chef.Nom_departement || "",
        });
      } catch (error) {
        // handle error
      }
    }
    fetchChefInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const idChef = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!idChef) return;
    try {
      const response = await fetch('http://localhost:4000/chefdepartement/updateChef', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idChef,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          date: formData.dateNaissance
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("chef updated successfully");
      } else {
        alert(data.message || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
      console.error(error);
    }
  };

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

      {/* Settings Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 gap-8">
          <Card className="relative overflow-hidden">
            <CardContent className="relative p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="space-y-1 group">
                  <p className="text-sm text-green-600 capitalize group-hover:text-green-800 transition-colors">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type={key === 'dateNaissance' ? 'date' : 'text'}
                      name={key}
                      value={value}
                      onChange={key === 'email' ? handleInputChange : undefined}
                      readOnly={key !== 'email'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}