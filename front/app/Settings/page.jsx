'use client';

import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaUniversity, FaBuilding, FaSave } from "react-icons/fa";

export default function Settings() {
  const [formData, setFormData] = useState({
    nomFaculté: "",
    Nom_departement: "",
    Email: "",
    nomEnseignant: "",
    PrenomEnseignant: "",
    DateDeNaissance: ""
  });

  const idEnseignant = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idEnseignant) return;
    async function fetchEnseignantInfo() {
      try {
        const response = await fetch('http://localhost:4000/enseignant/show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idEnseignant }),
        });
        let data = {};
        try {
          data = await response.json();
        } catch (jsonError) {
          data = {};
          setError('Réponse non-JSON du backend');
        }
        if (!data || Object.keys(data).length === 0) {
          setError('Aucune information trouvée pour cet enseignant.');
        }
        setFormData(data);
        setLoading(false);
      } catch (error) {
        setError('Erreur lors du chargement des infos enseignant.');
        setLoading(false);
      }
    }
    fetchEnseignantInfo();
  }, [idEnseignant]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/enseignant/modifier', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEnseignant,
          nom: formData.nomEnseignant,
          prenom: formData.PrenomEnseignant,
          email: formData.Email,
          DateDeNaissance: formData.DateDeNaissance
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Mise à jour réussie !");
      } else {
        alert(data.message || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement des informations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F7F8FA] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-green-500 p-4 text-center">
            <h1 className="text-xl font-semibold text-white">Paramètres du Compte</h1>
          </div>

          <form onSubmit={handleUpdate} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <FaUser className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-green-600 font-medium mb-1">NOM</label>
                  <input
                    type="text"
                    name="nomEnseignant"
                    value={formData.nomEnseignant || ""}
                    onChange={e => setFormData({ ...formData, nomEnseignant: e.target.value })}
                    className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <FaUser className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-green-600 font-medium mb-1">PRÉNOM</label>
                  <input
                    type="text"
                    name="PrenomEnseignant"
                    value={formData.PrenomEnseignant || ""}
                    onChange={e => setFormData({ ...formData, PrenomEnseignant: e.target.value })}
                    className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <FaEnvelope className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-green-600 font-medium mb-1">EMAIL</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email || ""}
                    onChange={e => setFormData({ ...formData, Email: e.target.value })}
                    className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <FaUniversity className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-green-600 font-medium mb-1">FACULTÉ</label>
                  <input
                    type="text"
                    name="nomFaculté"
                    value={formData.nomFaculté || ""}
                    readOnly
                    className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <FaBuilding className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-green-600 font-medium mb-1">DÉPARTEMENT</label>
                  <input
                    type="text"
                    name="Nom_departement"
                    value={formData.Nom_departement || ""}
                    readOnly
                    className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <FaUser className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-green-600 font-medium mb-1">DATE DE NAISSANCE</label>
                  <input
                    type="text"
                    name="DateDeNaissance"
                    value={formData.DateDeNaissance || ""}
                    onChange={e => setFormData({ ...formData, DateDeNaissance: e.target.value })}
                    className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaSave className="w-4 h-4" />
                <span>Mettre à jour</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}