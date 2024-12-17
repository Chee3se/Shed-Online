import React, {useEffect, useState} from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function Lobby({
                                  auth,
                                  lobbies,
                                  owners
                              }: {
    auth: any,
    lobbies: any[],
    owners: { [key: number]: string }
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const { post } = useForm();

    const webSocketChannel = `lobbies`;

    const connectWebSocket = () => {
        window.Echo.channel(webSocketChannel)
            .listen('NewLobby', async (event: any) => {
                console.log("new lobby")
            });
    }

    useEffect(() => {
        connectWebSocket();
    }, []);

    // Filter lobbies based on search term
    const filteredLobbies = lobbies.filter(lobby =>
        lobby.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleJoinLobby = (lobbyId: number) => {
        post(route('lobby.join', lobbyId));
    };

    return (
        <Layout auth={auth}>
            <Head title="Game Lobbies"/>

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
                                Shed Lobbies 🃏
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Find or create a game lobby to play Shed
                            </p>

                            {/* Search Input */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search lobbies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Create Lobby Button */}
                            <div className="mb-8 text-center">
                                <Link
                                    href={route('lobby.create')}
                                    className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Create New Lobby
                                </Link>
                            </div>
                        </div>

                        {/* Lobbies Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredLobbies.length > 0 ? (
                                filteredLobbies.map((lobby) => (
                                    <div
                                        key={lobby.id}
                                        className="bg-indigo-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {lobby.name}
                                            </h2>
                                            {lobby.is_public === 1 ? (
                                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                                                    Private
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-gray-600 mb-4">
                                            <p className="mb-2">
                                                <strong>Players:</strong> {lobby.current_players} / {lobby.max_players}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Lobby Code:</strong>{' '}
                                                <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                                                    {lobby.code}
                                                </span>
                                            </p>
                                            <p>
                                                <strong>Created by:</strong> {owners[lobby.owner_id] || 'Unknown'}
                                            </p>
                                        </div>

                                        {lobby.current_players < lobby.max_players ? (
                                            <button
                                                onClick={() => handleJoinLobby(lobby.id)}
                                                className="w-full block text-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Join Lobby
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full block text-center bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed"
                                            >
                                                Lobby Full
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center bg-gray-50 p-8 rounded-xl">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                        No Lobbies Available
                                    </h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
