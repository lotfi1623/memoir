'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { FaUserCircle } from "react-icons/fa";

export default function NavbarEns() {
  const pathname = usePathname();

  const [enseignant, setEnseignant] = useState({
    nom: '',
    prenom: '',
    avatar: '/images/noavatr.png'
  });

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState('all'); 
  const [userId, setUserId] = useState(null);
  const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;

  useEffect(() => {
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('users_id') : null;
    
    if (!storedUserId) {
      console.error('No user ID found in localStorage');
      return;
    }

    setUserId(storedUserId);
    console.log('Using user ID from login:', storedUserId);
    
    async function fetchUserData() {
      try {
        let url = 'http://localhost:4000/enseignant/show';
        let body = { idEnseignant: storedUserId };
        
        if (userType === 'chef_departement') {
          url = 'http://localhost:4000/chefdepartement/show';
          body = { idChef: storedUserId };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched user data:', data);

        if (data && Array.isArray(data) && data.length > 0) {
          const userData = data[0]; // Get the first item from the array
          // Update enseignant state based on user type
          if (userType === 'enseignant') {
            setEnseignant({
              nom: userData.nomEnseignant || '',
              prenom: userData.PrenomEnseignant?.trim() || '', // Trim to remove \r\n
              avatar: '/images/noavatr.png'
            });
          } else if (userType === 'chef_departement') {
            setEnseignant({
              nom: userData.nomChef || '',
              prenom: userData.prenomChef || '',
              avatar: '/images/noavatr.png'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Try to use stored information as fallback
        const storedInfo = {
          nom: userType === 'enseignant' ? localStorage.getItem('nomEnseignant') : localStorage.getItem('nomChef'),
          prenom: userType === 'enseignant' ? localStorage.getItem('PrenomEnseignant') : localStorage.getItem('prenomChef'),
          avatar: '/images/noavatr.png'
        };
        setEnseignant(storedInfo);
      }
    }

    fetchUserData();
  }, [localStorage.getItem('users_id')]);

  const fetchNotifications = async (filter = 'all') => {
    if (!userId) {
      console.error('No user ID found for notifications');
      return;
    }

    let url = 'http://localhost:4000/notification/voir';
    if (filter === 'lu') url = 'http://localhost:4000/notification/voir/lu';
    if (filter === 'nonlu') url = 'http://localhost:4000/notification/voir/nonlu';
    if (filter === 'toutlu') url = 'http://localhost:4000/notification/voir/tout';

    if (filter === 'all') {
      try {
        const [luRes, nonluRes] = await Promise.all([
          fetch('http://localhost:4000/notification/voir/lu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              idEnseignant: userId,
              userType
            }),
          }),
          fetch('http://localhost:4000/notification/voir/nonlu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              idEnseignant: userId,
              userType
            }),
          })
        ]);
        const lu = await luRes.json();
        const nonlu = await nonluRes.json();
        const all = [...(Array.isArray(nonlu) ? nonlu : []), ...(Array.isArray(lu) ? lu : [])];
        setNotifications(all);
        setUnreadCount(Array.isArray(nonlu) ? nonlu.length : 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idEnseignant: userId,
          userType
        }),
      });
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(Array.isArray(data) ? data.filter(n => !n.lu).length : 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (idNotification) => {
    // Optimistically update UI
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.idNotification === idNotification ? { ...n, lu: 1 } : n
      );
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch('http://localhost:4000/notification/lire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNotification }),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotifClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) fetchNotifications(notifFilter);
  };

  const handleFilterClick = async (filter) => {
    setNotifFilter(filter);
    if (filter === 'toutlu') {
      try {
        await fetch('http://localhost:4000/notification/voir/tout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idEnseignant: userId }),
        });
        fetchNotifications('all');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } else {
      fetchNotifications(filter);
    }
  };

  return (
    <nav className="w-full max-w-screen-xl mx-auto mt-4 px-6 py-4 bg-white border border-gray-200 shadow-md rounded-lg flex items-center justify-between">
      <div className="text-black font-semibold capitalize text-lg">
        Page {pathname.split('/').pop()}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-full flex items-center justify-center relative"
            onClick={handleNotifClick}
          >
           <IoMdNotificationsOutline className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fade-in">
              <div className="p-4 font-semibold border-b text-green-700 bg-green-50 rounded-t-xl flex flex-col gap-2">
                <span>Notifications</span>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-150 focus:outline-none ${notifFilter === 'all' ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                    onClick={() => handleFilterClick('all')}
                  >
                    Toutes
                  </button>
                  <button
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-150 focus:outline-none ${notifFilter === 'lu' ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                    onClick={() => handleFilterClick('lu')}
                  >
                    Lu
                  </button>
                  <button
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-150 focus:outline-none ${notifFilter === 'nonlu' ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                    onClick={() => handleFilterClick('nonlu')}
                  >
                    Non lu
                  </button>
                  <button
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-150 focus:outline-none ${notifFilter === 'toutlu' ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                    onClick={() => handleFilterClick('toutlu')}
                  >
                    Tout lu
                  </button>
                </div>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <li className="p-4 text-gray-400 text-center">Aucune notification</li>
                ) : (
                  notifications.map((notif, idx) => (
                    <li
                      key={notif.idNotification || idx}
                      className={`p-4 cursor-pointer transition-colors duration-200 ${
                        !!notif.lu
                          ? 'bg-green-100 hover:bg-green-200 border-l-4 border-green-400'
                          : 'bg-white hover:bg-gray-50 border-l-4 border-gray-300'
                      } flex flex-col gap-1`}
                      onClick={() => !notif.lu && markAsRead(notif.idNotification)}
                    >
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        {!notif.lu && <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                        {notif.message}
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between items-center">
                        <span>{notif.date}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${notif.type === 'chef' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {notif.type === 'chef' ? 'Chef de département' : 'Enseignant'}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        <Link href={userType === 'chef_departement' ? "/ProfileChef" : "/ProfileEns"} className="flex flex-col cursor-pointer group">
          <span className="text-xs leading-3 font-medium text-gray-800 group-hover:text-green-600">
            {enseignant.nom && enseignant.prenom ? `${enseignant.nom} ${enseignant.prenom}` : 'Nom Prénom'}
          </span>
          <span className="text-[10px] text-gray-500 text-right group-hover:text-green-500">
            {userType === 'chef_departement' ? 'Chef de département' : 'Enseignant'}
          </span>
        </Link>
        <div className="rounded-full hover:opacity-80 transition-opacity">
          <FaUserCircle className="w-7 h-7" />
        </div>
      </div>
    </nav>
  );
}


{/* 
'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const NavbarDash = () => {
    // Données statiques temporairement
    const [enseignant, setEnseignant] = useState({
        nom: "Harbouche",
        prenom: "Ahmed",
        avatar: "/images/avatar.png"
    });

    return ( 
        <nav className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
            <div className="hidden md:flex"></div>
            <div className="flex items-center gap-6">
                <button className="rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200">
                    <Image 
                        src="/images/notif.png" 
                        alt="Notifications" 
                        width={20} 
                        height={20}
                        priority
                    />
                </button>
                <Link href="/Profile" className="flex flex-col cursor-pointer group">
                    <span className="text-xs leading-3 font-medium text-gray-800 group-hover:text-green-600">
                        {`${enseignant.nom} ${enseignant.prenom}`}
                    </span>
                    <span className="text-[10px] text-gray-500 text-right group-hover:text-green-500">Enseignant</span>
                </Link>
                <div className="rounded-full hover:opacity-80 transition-opacity duration-200">
                    <Image 
                        src={enseignant.avatar}
                        className="cursor-pointer rounded-full" 
                        alt="Profile avatar" 
                        width={36} 
                        height={36}
                        priority
                    />
                </div>
            </div>
        </nav>
    );
}

export default NavbarDash;*/}