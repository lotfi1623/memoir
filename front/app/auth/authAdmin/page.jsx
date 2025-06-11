'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserCircleIcon } from '@heroicons/react/24/solid';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/admin/adminonly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        document.cookie = `adminToken=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        router.push('/DashboardAdm');
      } else {
        setError(data.message || 'Email ou mot de passe incorrect.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800 p-6">
        <CardHeader className="text-center">
          <UserCircleIcon className="mx-auto w-16 h-16 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Connexion Admin</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@exmple.com"
                className="mt-1 w-full p-2 border rounded-md" 
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Mot de passe</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mot de passe"
                className="mt-1 w-full p-2 border rounded-md" 
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}







{/*'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircleIcon } from '@heroicons/react/24/solid';


export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [mtps, setMtps] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !mtps) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Veuillez entrer un email valide.');
      return;
    }

    // Simulation d'authentification (remplacer par un vrai appel API)
    if (email === 'admin@example.com' && mtps === '123456') {
      router.push('/admin/dashboard');
    } else {
      setError('Email ou MTPS incorrect.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800 p-6">
        <CardHeader>
        <UserCircleIcon className="mx-auto w-16 h-16 text-green-600 dark:text-green-400" />

        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@example.com"
                className="mt-1 w-full p-2 border rounded-md" 
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">MTPS</label>
              <Input 
                type="password" 
                value={mtps} 
                onChange={(e) => setMtps(e.target.value)} 
                placeholder="Mot de passe temporaire"
                className="mt-1 w-full p-2 border rounded-md" 
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} */}
