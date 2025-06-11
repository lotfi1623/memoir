// Définit la structure globale du site (header, footer, sidebar...)
"use client";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname(); // Récupérer le chemin actuel
  const isAuthPage = ["/auth/authEns", "/auth/authAdmin" ,
     "/DashbordEns" ,"/admin" , "/DashboardAdm/adminUniv"  ,
     "/Settings" , "/DashboardAdm/adminChef" ,
     "/DashboardAdm/adminChef/add",
      "/DashboardChef" ,
     "/DashboardChef/ListeEns", "/DashboardChef/heures" ,
      "/DashboardChef/Inscription" , "/auth/completProfile" ,"/auth/pending",
     "/chef/profile" , "/ProfileEns" , "/SettingsEns" ,
      "/SettingsChef", "/DashboardAdm",
      "/DashboardAdm/universities",
      "/DashboardAdm/faculties",
      "/DashboardAdm/faculties/add",
      "/DashboardAdm/filieres",
      "/DashboardAdm/filieres/add",
      "/DashboardAdm/departements",
      "/DashboardAdm/departements/add",
      "/DashboardAdm/modules",
      "/DashboardAdm/modules/add",
      "/DashboardAdm/unniversites",
      "/DashboardAdm/specialites",
      "/DashboardAdm/specialites/add",
      "/DashboardAdm/unniversites/add",
      "/EspaceInfo",
      "/inscription"
    ].includes(pathname); // Ajout de /admin/login

  return (
    <html lang="fr">
      <body className="bg-white dark:bg-gray-900">
        {!isAuthPage && <Navbar />}
        {children}
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}
