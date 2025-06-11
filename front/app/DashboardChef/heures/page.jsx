"use client";

import { useEffect, useState } from "react";

export default function Heures() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({
    universite: '',
    faculte: '',
    departement: ''
  });

  useEffect(() => {
    const fetchHeures = async () => {
      try {
        setLoading(true);
        const idChef = localStorage.getItem('userId');
        const response = await fetch("http://localhost:4000/chefdepartement/calcule", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idChef })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des heures');
        }

        const data = await response.json();
        setEnseignants(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeures();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      const idChef = localStorage.getItem('userId');
      const response = await fetch("http://localhost:4000/chefdepartement/sommeParMois", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idChef })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }

      const data = await response.json();
      setMonthlyReport(data);

      // Set header info dynamically from the first item
      if (data.length > 0) {
        setHeaderInfo({
          universite: data[0].NomUnniversite?.trim() || '',
          faculte: data[0].nomFaculté || '',
          departement: data[0].Nom_departement || ''
        });
      }
      setShowReportModal(true);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // Helper to get unique months in order of appearance and sort by calendar order
  function getUniqueMonths(data) {
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const months = [];
    data.forEach(item => {
      if (item.mois && !months.includes(item.mois)) {
        months.push(item.mois);
      }
    });
    return months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  }
  const dynamicMonths = getUniqueMonths(monthlyReport);

  // Helper to group and sum hours by enseignant and month
  function groupByEnseignantAndMonth(data, months) {
    const result = [];
    data.forEach(item => {
      let found = result.find(e => e.nom === item.nomEnseignant && e.prenom === item.PrenomEnseignant);
      if (!found) {
        found = {
          nom: item.nomEnseignant,
          prenom: item.PrenomEnseignant,
          months: {},
          total: '00:00:00'
        };
        result.push(found);
      }
      found.months[item.mois] = item.total_heures;
    });
    // Calculate total for each enseignant
    result.forEach(e => {
      let totalSeconds = 0;
      months.forEach(m => {
        if (e.months[m]) {
          const [h, min, s] = e.months[m].split(':').map(Number);
          totalSeconds += h * 3600 + min * 60 + s;
        }
      });
      const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const min = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = (totalSeconds % 60).toString().padStart(2, '0');
      e.total = `${h}:${min}:${s}`;
    });
    return result;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-green-700 mb-2">Total des Heures par Enseignant</h2>
          <button
            onClick={handleGenerateReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {reportLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Générer Rapport"
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-6 max-w-5xl mx-auto">
          <table className="w-full rounded-2xl shadow-2xl overflow-hidden border-2 border-green-500">
            <thead className="bg-white sticky top-0 shadow z-10">
              <tr>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Nom</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Prénom</th>
                <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">Total des Heures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enseignants.map((enseignant, index) => (
                <tr key={index} className="even:bg-gray-50 hover:bg-green-50 transition-colors duration-150">
                  <td className="px-4 py-3">{enseignant.nomEnseignant}</td>
                  <td className="px-4 py-3">{enseignant.prenomEnseignant}</td>
                  <td className="px-4 py-3">{enseignant.total_heures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto font-sans">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="text-xs font-bold">République Algérienne Démocratique et Populaire</div>
                <div className="text-xs font-bold">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</div>
                <div className="text-xs font-bold">{headerInfo.universite}</div>
                <div className="text-xs font-bold">{headerInfo.faculte}</div>
                <div className="text-xs font-bold">Département {headerInfo.departement}</div>
                <div className="text-xs font-bold mt-2">Volume des heures supplémentaires du premier trimestre de l'année {new Date().getFullYear()}</div>
                <div className="text-xs font-bold">Enseignants vacataires</div>
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border text-center">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">N°</th>
                      <th className="border px-2 py-1">Nom et Prénom</th>
                      {dynamicMonths.map((month) => (
                        <th key={month} className="border px-2 py-1">{month}</th>
                      ))}
                      <th className="border px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByEnseignantAndMonth(monthlyReport, dynamicMonths).map((ens, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1">{ens.nom} {ens.prenom}</td>
                        {dynamicMonths.map((month) => (
                          <td key={month} className="border px-2 py-1">{ens.months[month] || '-'}</td>
                        ))}
                        <td className="border px-2 py-1">{ens.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Signature */}
              <div className="mt-8 flex justify-end">
                <div className="text-right">
                  <div>Le Chef de Département</div>
                  <div className="mt-8">.................</div>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="mt-6 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
