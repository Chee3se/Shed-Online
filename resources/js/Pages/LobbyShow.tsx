import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from "@inertiajs/react";
import Layout from '../Layouts/Layout';
import axios from "axios";

interface Player {
    id: number;
    name: string;
}

export default function LobbyShow({
                                      auth,
                                      initialLobby,
                                      canJoin,
                                      owners,
                                  } : {
    auth: any,
    initialLobby: any,
    canJoin: boolean,
    owners: any,
}) {
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [lobby, setLobby] = useState(initialLobby);
    const [leaveOnRedirect, setLeaveOnRedirect] = useState(true);
    const [players, setPlayers] = useState<Player[]>([]);
    const [readyPlayers, setReadyPlayers] = useState<Player[]>([]);

    useEffect(() => {
        window.axios.defaults.headers.common['X-Socket-ID'] = window.Echo.socketId();
        const channel = window.Echo.join(`lobby.${lobby.code}`)
            .here((users: Player[]) => {
                console.log(users, ' here');
                setPlayers(users);
            })
            .joining((user: Player) => {
                console.log(user, ' joined');
                setPlayers((prevPlayers) => [...prevPlayers, user]);
            })
            .leaving((user: Player) => {
                console.log(user, ' left');
                setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== user.id));
                setReadyPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== user.id));
            })

            .listenForWhisper('lobby-deleted', () => {router.get(route('lobby'));})
            .listenForWhisper('ready-toggle', (player: Player) => {
                setReadyPlayers((prevPlayers) => {
                    const isPlayerReady = prevPlayers.some((p) => p.id === player.id);
                    console.log(player.name + (isPlayerReady ? ' is not ready' : ' is ready'));
                    return isPlayerReady
                        ? prevPlayers.filter((p) => p.id !== player.id)
                        : [...prevPlayers, player];
                });
            })
            .listenForWhisper('game-starting', () => {
                setLeaveOnRedirect(false);
                router.get(route('lobby.game', lobby.code));
            })

        return () => {
            window.Echo.leave(`lobby.${lobby.code}`);
            if (leaveOnRedirect) {
                axios.post(route('lobby.leave', lobby.code)).then(() => {
                    window.Echo.leave(`lobby.${lobby.code}`);
                })
            }
        }
    }, [lobby.code]);

    const handleLeaveLobby = () => {
        if (lobby.owner_id === auth.user.id) {
            window.Echo.join(`lobby.${lobby.code}`).whisper('lobby-deleted');
        }
        axios.post(route('lobby.leave', lobby.code)).then(() => {
            router.get(route('lobby'));
        });
    };

    const handleReadyToggle = () => {
        const me: Player = { id: auth.user.id, name: auth.user.name };
        window.Echo.join(`lobby.${lobby.code}`).whisper('ready-toggle', me)
        setReadyPlayers((prevPlayers) => {
            const isPlayerReady = prevPlayers.some((p) => p.id === me.id);
            console.log('You' + (isPlayerReady ? ' are not ready' : ' are ready'));
            return isPlayerReady
                ? prevPlayers.filter((p) => p.id !== me.id)
                : [...prevPlayers, me];
        });
    };

    // In the handleStartGame function
    const handleStartGame = () => {
        if (!canStartGame) {
            return;
        }

        setLeaveOnRedirect(false);

        window.Echo.join(`lobby.${lobby.code}`).whisper('game-starting');

        router.get(route('lobby.game', lobby.code));
    };

// Add this to your useEffect hook's channel listener setup

    const ownerIsPresent = players.some(p => p.id === lobby.owner_id);
    const areAllPlayersReady = players.length === (readyPlayers.length + (ownerIsPresent ? 1 : 0));
    const canStartGame = players.length >= 2 && areAllPlayersReady;

    return (
        <Layout auth={auth}>
            <Head title={`Lobby: ${lobby.name}`} />

            {/* Rest of your component code remains exactly the same */}
            {isLeaveModalOpen && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl ring-1 ring-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl text-gray-800">
                                {lobby.owner_id === auth.user.id ? "Delete Lobby" : "Leave Lobby"}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-8">
                            {lobby.owner_id === auth.user.id
                                ? "This action will permanently delete the lobby and remove all players."
                                : "Are you sure you want to leave this lobby?"}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsLeaveModalOpen(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLeaveLobby}
                                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                            >
                                {lobby.owner_id === auth.user.id ? "Delete Lobby" : "Leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl ring-1 ring-gray-200">
                        <div className="mb-8">
                            <h1 className="text-4xl text-gray-800 mb-4">
                                {lobby.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    {players.length}/{lobby.max_players}
                                </span>
                                <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                                    lobby.is_public
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {lobby.is_public ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/80 rounded-2xl ring-1 ring-gray-200">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        <code className="font-mono bg-gray-100 px-3 py-1 rounded-lg">
                                            {lobby.code}
                                        </code>
                                    </div>
                                    <button
                                        className="text-blue-600 hover:text-blue-700 transition-colors"
                                        onClick={() => navigator.clipboard.writeText(lobby.code)}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Created by {owners[lobby.owner_id]}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl text-gray-800">Players</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {players && players.length > 0 ? (
                                        players.map((player: any) => (
                                            <div
                                                key={player.id}
                                                className="group bg-white/80 rounded-2xl p-4 ring-1 ring-gray-200 hover:ring-blue-500 flex items-center justify-between transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600 ring-1 ring-gray-200">
                                                        {player.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{player.name}</p>
                                                        {player.id === lobby.owner_id ? (
                                                            <span className="text-sm text-gray-500">
                                                                Lobby Owner
                                                            </span>
                                                        ) : (
                                                            <span className={`text-sm ${readyPlayers.some((p) => p.id === player.id) ? 'text-green-600' : 'text-red-600'}`}>
                                                                {readyPlayers.some((p) => p.id === player.id) ? 'Ready' : 'Not Ready'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-center py-8 text-gray-500 bg-white/50 rounded-2xl">
                                            No players in lobby
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsLeaveModalOpen(true)}
                                    className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                                >
                                    Leave Lobby
                                </button>
                                {lobby.owner_id !== auth.user.id && (
                                    <button
                                        onClick={handleReadyToggle}
                                        className={`flex-1 px-6 py-4 rounded-xl transition-all ${
                                                'bg-green-500 hover:bg-green-600'
                                        } text-white`}
                                    >
                                        {'Ready'}
                                    </button>
                                )}
                                {lobby.owner_id === auth.user.id && (
                                    <button
                                        onClick={handleStartGame}
                                        className={`flex-1 px-6 py-4 rounded-xl transition-all ${
                                            !canStartGame
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                        disabled={!canStartGame}
                                    >
                                        Start Game
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
