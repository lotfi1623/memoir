'use client';

import MenuLink from './MenuLink';
import {MdOutlineBrowseGallery,MdGroups, MdDashboard, MdSupervisedUserCircle,  } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import Image from 'next/image';
import { MdLogout } from "react-icons/md";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../app/utils/auth';

const menuItems = [
  { title: "Menu",
    list: [
        {
        title:"Dashboard",
        path: "/DashboardChef",
        icon: <MdDashboard size={24}/>,
    },
    {
        title:"Liste des enseignants",
        path: "/DashboardChef/ListeEns",
        icon: <MdGroups size={24}/>,
    },
    {
        title:"Heures saisies",
        path: "/DashboardChef/heures",
        icon: <MdOutlineBrowseGallery size={24}/>,
    },
    {
        title:"Inscriptions en attente",
        path: "/DashboardChef/Inscription",
        icon: <MdSupervisedUserCircle size={24}/>,
    },
  ],
  },
  {
    title: "Autre",
    list: [
      {
        title: " Paramétres",
        path: "/SettingsChef",
        icon: <IoMdSettings size={24}/>,
      },
      {
        title: "Se déconnecter",
        path: "/auth/authEns",
        icon: <MdLogout size={24}/>,
      },
    ],
  },
];

export default function MenuChef() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dark:border-none dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky top-[40px] bg-white">
      {/* Header Section */}
      <div className="flex items-center gap-2 p-3">
        <Image 
          src="/logos/informatique.png" 
          alt="Logo" 
          width={32} 
          height={32} 
          className="rounded"
        />
        <h1 className="text-base font-semibold text-green-600">
          Heure<span className="text-gray-900 dark:text-white">Track</span>
        </h1>
      </div>

      {/* Menu Items */}
      <div className="p-3 space-y-2">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-xs font-medium text-gray-600 mb-1">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.list.map((item) => (
                item.title === 'Se déconnecter' ? (
                  <button
                    key={item.title}
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-2.5 hover:bg-gray-100 transition-colors text-left ${pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </button>
                ) : (
                  <MenuLink 
                    key={item.path} 
                    item={item} 
                    pathname={pathname}
                  />
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}