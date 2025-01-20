import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function Lobby({
                                  auth,
                                  lobbies: initialLobbies,
                                  owners,
                                  currentUserLobby
                              }: {
    auth: any,
    lobbies: any[],
    owners: { [key: string]: string },
    currentUserLobby: any
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [lobbies, setLobbies] = useState(
        initialLobbies.filter((lobby: any) => !lobby.deleted)
    );
    const { post } = useForm();

    useEffect(() => {
        const channel = window.Echo.channel('lobbies')
            .listen('.new-lobby', (event: any) => {
                setLobbies((prevLobbies: any[]) => [...prevLobbies, event]);
                console.log(event);
            })
            .listen('.lobby-deleted', (event: any) => {
                setLobbies((prevLobbies: any[]) => {
                    console.log('Removing lobby:', event.code);
                    return prevLobbies.filter((lobby: any) => lobby.code !== event.code);
                });
            })
            .listen('.lobby-updated', (event: any) => {
                setLobbies((prevLobbies: any[]) => {
                    return prevLobbies.map((lobby: any) => {
                        if (lobby.code === event.code) {
                            return event;
                        }
                        return lobby;
                    });
                });
            });

        return () => {
            channel.stopListening('.new-lobby');
            channel.stopListening('.lobby-deleted');
            channel.stopListening('.lobby-updated');
        };
    }, []);



    const filteredLobbies = lobbies.filter((lobby: any) => {
        const matchesSearch = lobby.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isNotDeletedOwnerLobby = !(lobby.owner_id === auth.user.id && currentUserLobby?.code === lobby.code);
        return matchesSearch && isNotDeletedOwnerLobby;
    });



    return (
        <Layout auth={auth}>
            <Head title="Game Lobbies"/>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-5xl">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="font-['Phosphate'] font-bold text-6xl text-gray-900 tracking-wider">
                                Shed Lobbies
                            </h1>
                            <p className="text-xl text-gray-600">
                                Join a game or create your own lobby
                            </p>
                        </div>


                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl ring-1 ring-gray-200">
                            {/* Search and Create Section */}
                            <div className="max-w-2xl mx-auto mb-8 space-y-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search lobbies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/80 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>


                                    <Link
                                        href={route('lobby.create')}
                                        className=" inline-flex items-center justify-center px-8 py-4 text-lg text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Create New Lobby
                                    </Link>

                            </div>

                            {/* Lobbies Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredLobbies.length > 0 ? (
                                    filteredLobbies.map((lobby: any) => (
                                        <div key={lobby.code}
                                             className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 hover:ring-blue-500 transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className=" text-2xl text-gray-800">{lobby.name}</h2>
                                                {lobby.is_public == 1 ? (
                                                    <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Public</span>
                                                ) : (
                                                    <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Private</span>
                                                )}
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <span>{lobby.current_players} / {lobby.max_players} Players</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{lobby.code}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{owners[lobby.owner_id] || 'Unknown'}</span>
                                                </div>
                                            </div>

                                            {lobby.current_players < lobby.max_players ? (

                                                    <Link
                                                        href={route('lobby.show', lobby.code)}
                                                        className=" w-full block text-center bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all duration-300"
                                                    >
                                                        Join Game
                                                    </Link>

                                            ) : (
                                                <button
                                                    disabled
                                                    className=" w-full block text-center bg-gray-200 text-gray-500 py-3 rounded-xl cursor-not-allowed"
                                                >
                                                    Lobby Full
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center">
                                        <h3 className=" text-2xl text-gray-800 mb-2">No Active Lobbies</h3>
                                        <p className="text-gray-600">Create a new lobby to start playing!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
