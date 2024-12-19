'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image'; 

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const usersRef = collection(db, 'utilisateurs');
            const q = query(usersRef, where('userName', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('Utilisateur non trouvé');
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const userId = userData.userId;

            router.push(`/dashboard?user=${encodeURIComponent(username)}`);
        } catch (err) {
            console.error('Erreur lors de la connexion:', err);
            setError('Une erreur est survenue lors de la connexion');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <Image src="/logo_bbl-groupe2.png" alt="Logo BBL Groupe" width={100} height={70} />
            </div>
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connexion
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Identifiant
                            </label>
                            {error && (
                                <div className="text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Identifiant"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>


                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            OK
                        </button>
                    </div>
                    <div className="text-gray-500 text-sm text-center">
                        <span>
                            Bienvenue à bord du Spacecraft Discovery One !
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
