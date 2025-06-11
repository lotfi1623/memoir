// components/SidebarAdmin.tsx
'use client';
import StatCard from '@/components/StatCard'; 
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Microscope,
  Dna,
  Building,
  Users,
  ChevronDown,
  Book
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/DashboardAdm',
  },
  {
    title: 'Universités',
    icon: <Building2 size={20} />,
    submenu: [
      { title: 'Liste des universités', path: '/DashboardAdm/unniversites' },
      { title: 'Ajouter une université', path: '/DashboardAdm/unniversites/add' },
    ],
  },
  {
    title: 'Facultés',
    icon: <GraduationCap size={20} />,
    submenu: [
      { title: 'Liste des facultés', path: '/DashboardAdm/faculties' },
      { title: 'Ajouter une faculté', path: '/DashboardAdm/faculties/add' },
    ],
  },
  {
    title: 'Filières',
    icon: <Microscope size={20} />,
    submenu: [
      { title: 'Liste des filières', path: '/DashboardAdm/filieres' },
      { title: 'Ajouter une filière', path: '/DashboardAdm/filieres/add' },
    ],
  },
  {
    title: 'Spécialités',
    icon: <Dna size={20} />,
    submenu: [
      { title: 'Liste des spécialités', path: '/DashboardAdm/specialites' },
      { title: 'Ajouter une spécialité', path: '/DashboardAdm/specialites/add' },
    ],
  },
  {
    title: 'Modules',
    icon: <Book size={20} />,
    submenu: [
      { title: 'Liste des modules', path: '/DashboardAdm/modules' },
      { title: 'Ajouter un module', path: '/DashboardAdm/modules/add' },
    ],
  },
  {
    title: 'Départements',
    icon: <Building size={20} />,
    submenu: [
      { title: 'Liste des départements', path: '/DashboardAdm/departements' },
      { title: 'Ajouter un département', path: '/DashboardAdm/departements/add' },
    ],
  },
  {
    title: 'Chefs de Département',
    icon: <Users size={20} />,
    submenu: [
      { title: 'Liste des chefs', path: '/DashboardAdm/adminChef' },
      { title: 'Ajouter un chef', path: '/DashboardAdm/adminChef/add' },
    ],
  },
];

// Helper to clear a cookie
function clearCookie(name) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export default function SidebarAdmin() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const router = useRouter();

  const toggleSubmenu = (title) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Logout handler
  function handleLogout() {
    clearCookie('adminToken');
    clearCookie('userType');
    router.replace('/auth/authAdmin');
  }

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto flex flex-col justify-between">
      <div>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-600">
            Heure<span className="text-gray-900">Track</span>
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 ${
                        pathname.includes(item.title.toLowerCase()) ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform ${
                          openMenus[item.title] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openMenus[item.title] && (
                      <ul className="ml-8 mt-2 space-y-2">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              href={subItem.path}
                              className={`block p-2 rounded-lg hover:bg-gray-100 ${
                                pathname === subItem.path ? 'bg-gray-100 text-green-600' : ''
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${
                      pathname === item.path ? 'bg-gray-100 text-green-600' : ''
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold shadow-md justify-center"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
} 
