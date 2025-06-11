"use client";

import { useEffect, useState } from "react";
import { isLoggedIn, getUserType } from "../utils/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardChef() {
  const router = useRouter();
  const [stats, setStats] = useState({
    enseignants: 0,
    enAttente: 0,
    nonValides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/auth/authEns";
    } else if (getUserType() !== "chef_departement") {
      const type = getUserType();
      if (type === "enseignant") window.location.href = "/DashbordEns";
      else if (type === "admin") window.location.href = "/DashboardAdm";
      else window.location.href = "/auth/authEns";
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the chef ID from localStorage
        const idChef = localStorage.getItem('userId');
        
        if (!idChef) {
          setError("ID du chef non trouvé. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        
        // Fetch accepted enseignants count
        const enseignantsRes = await fetch("http://localhost:4000/chefdepartement/accepter/count", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ idChef })
        });
        
        if (!enseignantsRes.ok) {
          const errorText = await enseignantsRes.text();
          throw new Error(`HTTP error! status: ${enseignantsRes.status}, message: ${errorText}`);
        }
        
        const enseignantsData = await enseignantsRes.json();
        
        // Fetch non-accepted count
        const nonAccepteRes = await fetch("http://localhost:4000/chefdepartement/NoAccepter/count", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ idChef })
        });
        
        if (!nonAccepteRes.ok) {
          const errorText = await nonAccepteRes.text();
          throw new Error(`HTTP error! status: ${nonAccepteRes.status}, message: ${errorText}`);
        }
        
        const nonAccepteData = await nonAccepteRes.json();

        // Fetch non validated hours
        const nonValidesRes = await fetch("http://localhost:4000/relever/num/noVerifier", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ idChef })
        });
        if (!nonValidesRes.ok) {
          const errorText = await nonValidesRes.text();
          throw new Error(`HTTP error! status: ${nonValidesRes.status}, message: ${errorText}`);
        }
        const nonValidesData = await nonValidesRes.json();

        // Update stats with the fetched data
        setStats({
          enseignants: (Array.isArray(enseignantsData) ? enseignantsData[0]?.count : enseignantsData.count) || 0,
          enAttente: (Array.isArray(nonAccepteData) ? nonAccepteData[0]?.count : nonAccepteData.count) || 0,
          nonValides: nonValidesData.nHeure || 0,
        });
        
      } catch (error) {
        console.error("Erreur lors du fetch des stats :", error);
        setError("Erreur lors du chargement des statistiques. Veuillez réessayer. " + (error.message || ""));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/relever/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        
        // Process data for chart
        const processedData = processChartData(data.info);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processChartData = (data) => {
    // Group data by enseignant
    const enseignantData = {};
    const monthlyStats = {};

    data.forEach(item => {
      const key = `${item.nomEnseignant} ${item.PrenomEnseignant}`;
      const date = new Date(item.Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Process enseignant data
      if (!enseignantData[key]) {
        enseignantData[key] = {
          totalSeances: 0,
          dates: [],
          seances: []
        };
      }
      enseignantData[key].totalSeances += item.nombre_seances;
      enseignantData[key].dates.push(date.toLocaleDateString());
      enseignantData[key].seances.push(item.nombre_seances);

      // Process monthly data
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          totalSeances: 0,
          enseignants: new Set()
        };
      }
      monthlyStats[monthKey].totalSeances += item.nombre_seances;
      monthlyStats[monthKey].enseignants.add(key);
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyStats).sort();
    const monthlyChartData = {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      }),
      datasets: [{
        label: 'Nombre total de séances',
        data: sortedMonths.map(month => monthlyStats[month].totalSeances),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4
      }]
    };

    // Prepare bar chart data
    const labels = Object.keys(enseignantData);
    const barChartData = {
      labels,
      datasets: [{
        label: 'Nombre de séances',
        data: labels.map(key => enseignantData[key].totalSeances),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }]
    };

    return {
      barChartData,
      monthlyChartData
    };
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistiques des séances par enseignant',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de séances'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Enseignants'
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des séances par mois',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de séances'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Inscription Button */}
        <div className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Tableau de bord du chef de département</h1>
            <p className="text-gray-700 max-w-2xl">
              Gérez les inscriptions des enseignants et consultez les statistiques des séances.
            </p>
          </div>
          <Button
            onClick={() => router.push('/DashboardChef/Inscription')}
            className="mt-4 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-colors"
          >
            Voir les inscriptions en attente
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enseignants acceptés</p>
                <p className="text-2xl font-bold text-green-600">{stats.enseignants}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enseignants en attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Heures non validées</p>
                <p className="text-2xl font-bold text-red-600">{stats.nonValides}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Monthly Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Évolution mensuelle des séances</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : chartData?.monthlyChartData ? (
              <div className="h-[400px]">
                <Line options={lineOptions} data={chartData.monthlyChartData} />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aucune donnée disponible
              </div>
            )}
          </div>

          {/* Per Teacher Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques par enseignant</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : chartData?.barChartData ? (
              <div className="h-[400px]">
                <Bar options={barOptions} data={chartData.barChartData} />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
