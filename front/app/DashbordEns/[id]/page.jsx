"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardEnsDetails() {
  const params = useParams();
  const { id } = params;
  const [enseignant, setEnseignant] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    // Fetch enseignant details from the correct endpoint
    fetch("http://localhost:4000/enseignant/show", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idEnseignant: id })
    })
      .then(res => res.json())
      .then(data => {
        setEnseignant(data);
        // Set localStorage with the correct fields
        if (data) {
          // Set userId for consistency
          if (id) localStorage.setItem('userId', id);
          // Optionally set userType if you know it
          localStorage.setItem('userType', 'enseignant');
          if (data.nomEnseignant) localStorage.setItem('nomEnseignant', data.nomEnseignant);
          if (data.PrenomEnseignant) localStorage.setItem('PrenomEnseignant', data.PrenomEnseignant);
          if (data.Email) localStorage.setItem('Email', data.Email);
          if (data.nomFaculté) localStorage.setItem('nomFaculté', data.nomFaculté);
          if (data.Nom_departement) localStorage.setItem('Nom_departement', data.Nom_departement);
          if (data.DateDeNaissance) localStorage.setItem('DateDeNaissance', data.DateDeNaissance);
        }
      })
      .catch(err => console.error("Erreur lors de la récupération", err));
  }, [id]);

  if (!enseignant) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-8 mt-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-600">Détails de l'Enseignant</h2>
      <div className="space-y-4">
        <div>
          <label className="font-semibold">Nom :</label>
          <input className="w-full border rounded px-3 py-2 bg-gray-100" value={enseignant.nomEnseignant || ''} readOnly />
        </div>
        <div>
          <label className="font-semibold">Prénom :</label>
          <input className="w-full border rounded px-3 py-2 bg-gray-100" value={enseignant.PrenomEnseignant || ''} readOnly />
        </div>
        <div>
          <label className="font-semibold">Email :</label>
          <input className="w-full border rounded px-3 py-2 bg-gray-100" value={enseignant.Email || ''} readOnly />
        </div>
        {/* Ajoute d'autres champs si besoin */}
      </div>
      {role === "chefdepartement" && (
        <div className="flex gap-2 mt-6">
          <Button className="bg-green-600 text-white">Valider</Button>
          <Button className="bg-red-600 text-white">Refuser</Button>
        </div>
      )}
    </div>
  );
}