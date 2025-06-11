'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Sun, Moon } from 'lucide-react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { FaUserCircle } from "react-icons/fa";

export default function NavbarChef() {
  const pathname = usePathname();

  const [chef, setChef] = useState({
    nom: '',
    prenom: '',
    avatar: "/images/noavatr.png"
  });

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const [sendToId, setSendToId] = useState('');
  const [sending, setSending] = useState(false);
  const [sendType, setSendType] = useState('chef');

  // Example: list of enseignants to send to (replace with real fetch if needed)
  const [enseignants, setEnseignants] = useState([]);
  useEffect(() => {
    // Fetch enseignants list for dropdown from chefdepartement/listeEnseignant
    async function fetchEnseignants() {
      try {
        const idChef = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!idChef) return setEnseignants([]);
        const response = await fetch('http://localhost:4000/chefdepartement/listeEnseignant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idChef }),
        });
        const data = await response.json();
        setEnseignants(Array.isArray(data) ? data : []);
      } catch (e) {
        setEnseignants([]);
      }
    }
    fetchEnseignants();
  }, []);

  useEffect(() => {
    const idChef = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!idChef) return;
    async function fetchChef() {
      try {
        const response = await fetch('http://localhost:4000/chefdepartement/showChefInfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idChef }),
        });
        const data = await response.json();
        const chefData = Array.isArray(data) ? data[0] : data;
        setChef({
          nom: chefData.nomEnseignant || '',
          prenom: chefData.PrenomEnseignant || '',
          avatar: '/images/noavatr.png'
        });
        // Update localStorage.chefData for profile page
        localStorage.setItem('chefData', JSON.stringify({
          nom: chefData.nomEnseignant || '',
          prenom: chefData.PrenomEnseignant || '',
          email: chefData.email || '',
          universite: chefData.universite || '',
          faculte: chefData.faculte || '',
          departement: chefData.departement || '',
          dateNaissance: chefData.dateNaissance || ''
        }));
      } catch (error) {
        // fallback to default
      }
    }
    fetchChef();
  }, []);

  const idChef = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const fetchNotifications = async () => {
    if (!idChef) return;
    try {
      const response = await fetch('http://localhost:4000/notification/voir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEnseignant: idChef }),
      });
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(Array.isArray(data) ? data.filter(n => !n.lu).length : 0);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleNotifClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) fetchNotifications();
  };

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!sendToId || !sendMessage) return;
    setSending(true);
    try {
      const response = await fetch('http://localhost:4000/notification/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEnseignant: sendToId, message: sendMessage, type: sendType })
      });
      const data = await response.text();
      if (data.includes('notification envoyer')) {
        alert('Notification envoyée !');
        setShowSendModal(false);
        setSendMessage('');
        setSendToId('');
        setSendType('chef');
      } else {
        alert('Erreur lors de l\'envoi');
      }
    } catch (e) {
      alert('Erreur lors de l\'envoi');
    }
    setSending(false);
  }

  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    // Charger le thème au démarrage
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  return (
    <nav className="dark:border-none w-full px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 shadow flex items-center justify-between rounded-lg text-gray-900 dark:text-gray-100">
      <div className="text-gray-900 font-semibold capitalize text-lg">
        Page {pathname.split('/').pop()}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-full flex items-center justify-center relative"
            onClick={handleNotifClick}
          ><IoMdNotificationsOutline className="w-6 h-6" />
         {/*   <Image 
              src="/images/notif.png" 
              alt="Notifications" 
              width={20} 
              height={20}
              priority
            />*/}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 dark:border-gray-700 border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 font-semibold border-b dark:border-gray-700 dark:text-gray-100">Notifications</div>
              <ul className="max-h-64 overflow-y-auto dark:bg-gray-900">
                {notifications.length === 0 ? (
                  <li className="p-4 text-gray-500 dark:text-gray-400 text-center">Aucune notification</li>
                ) : (
                  notifications.map((notif, idx) => (
                    <li key={notif.idNotification || idx} className={`p-4 border-b last:border-b-0 ${notif.lu ? 'bg-gray-50 dark:bg-gray-800' : 'bg-green-50 dark:bg-green-900/30'} dark:border-gray-700`}>
                      <div className="font-medium dark:text-gray-100">{notif.message}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-400">{notif.date}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">{notif.type === 'chef' ? 'Chef de département' : 'Enseignant'}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        {/* Send Message Button */}
        <button
          className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-full flex items-center justify-center"
          title="Envoyer un message à un enseignant"
          onClick={() => setShowSendModal(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        {/* Modal for sending message */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6 w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setShowSendModal(false)}
              >
                ×
              </button>
              <h3 className="text-lg font-semibold mb-4">Envoyer un message à un enseignant</h3>
              <form onSubmit={handleSendMessage}>
                <label className="block mb-2 text-sm font-medium">Choisir enseignant</label>
                <select
                  className="w-full mb-4 p-2 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  value={sendToId}
                  onChange={e => setSendToId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner</option>
                  {enseignants.map(e => (
                    <option key={e.users_id} value={e.users_id}>
                      {e.nomEnseignant} {e.PrenomEnseignant}
                    </option>
                  ))}
                </select>
                <label className="block mb-2 text-sm font-medium">Type de notification</label>
                <select
                  className="w-full mb-4 p-2 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  value={sendType}
                  onChange={e => setSendType(e.target.value)}
                  required
                >
                  <option value="chef">Chef de département</option>
                  <option value="info">Information</option>
                  <option value="alerte">Alerte</option>
                </select>
                <label className="block mb-2 text-sm font-medium">Message</label>
                <textarea
                  className="w-full mb-4 p-2 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  rows={3}
                  value={sendMessage}
                  onChange={e => setSendMessage(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full dark:bg-green-800 dark:hover:bg-green-700"
                  disabled={sending}
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            </div>
          </div>
        )}
        <Link href="/chef/profile" className="flex flex-col cursor-pointer group">
          <span className="text-xs leading-3 font-medium text-gray-900 group-hover:text-green-600 dark:text-white ">
            {`${chef.nom} ${chef.prenom}`.trim() || 'Nom Prénom'}
          </span>
          <span className="dark:text-gray-400  text-[10px] text-gray-600 text-right group-hover:text-green-500">Chef de Département</span>
        </Link>
        <div className="rounded-full hover:opacity-80 transition-opacity">
          <FaUserCircle className="w-7 h-7" />
         
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          className="ml-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          title={dark ? "Mode clair" : "Mode sombre"}
        >
          {dark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-700" />}
        </button>
      </div>
    </nav>
  );
}
