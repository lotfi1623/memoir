"use client";
import { useState } from "react";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function AddUniversitePage() {
  const [nom, setNom] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, tu peux envoyer les données à ton backend
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setNom("");
      setLogo(null);
      setLogoPreview(null);
      router.push('/DashboardAdm/unniversites');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/DashboardAdm/unniversites')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter une Université</h1>
      </div>
      <Card className="p-6">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>Université ajoutée avec succès! Redirection...</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 mb-2" htmlFor="nom">Nom de l'université</label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Ex: Université de Hassiba Ben Bouali"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-gray-700 mb-2" htmlFor="logo">Logo de l'université</label>
            <div className="flex items-center gap-4">
              <label htmlFor="logo" className="cursor-pointer inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow">
                Choisir un logo
              </label>
              <span className="text-gray-600 text-sm truncate max-w-[150px]">{logo ? logo.name : "Aucun fichier choisi"}</span>
            </div>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            {logoPreview && (
              <div className="mt-4 flex justify-center">
                <img src={logoPreview} alt="Aperçu du logo" className="h-24 w-24 object-contain rounded border border-gray-300 bg-white" />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/DashboardAdm/unniversites')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ajouter l'université
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
