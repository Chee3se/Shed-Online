import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function LobbyShow({
                                      auth,
                                      lobby: initialLobby,
                                      canJoin,
                                      owners
                                  }) {
    const { post } = useForm();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [lobby, setLobby] = useState(initialLobby);

    useEffect(() => {
        // Join the lobby's private channel
        const channel = window.Echo.private(`lobby.${lobby.code}`);

        // Listen for ready status updates
        channel.listen('PlayerReadyStatusChanged', (e) => {
            setLobby(prevLobby => ({
                ...prevLobby,
                players: prevLobby.players.map(player =>
                    player.id === e.playerId
                        ? { ...player, pivot: { ...player.pivot, status: e.status } }
                        : player
                )
            }));
        });

        // Clean up on unmount
        return () => {
            channel.stopListening('PlayerReadyStatusChanged');
        };
    }, [lobby.code]);

    const handleJoinLobby = () => {
        post(route('lobby.join', lobby.code));
    };

    const handleLeaveLobby = () => {
        post(route('lobby.leave', lobby.code), {
            onSuccess: () => {
                window.location.href = route('lobby');
            }
        });
    };

    const handleReadyToggle = () => {
        // Update local state immediately
        const newStatus = currentPlayer?.pivot.status === 'ready' ? 'not_ready' : 'ready';
        setLobby(prevLobby => ({
            ...prevLobby,
            players: prevLobby.players.map(player =>
                player.id === auth.user.id
                    ? { ...player, pivot: { ...player.pivot, status: newStatus } }
                    : player
            )
        }));

        // Make the API call without page refresh
        post(route('lobby.toggle-ready', lobby.code), {
            preserveScroll: true,
            preserveState: true
        });
    };

    const handleStartGame = () => {
        post(route('lobby.start-game', lobby.code));
    };

    const currentPlayer = lobby.players?.find((player) => player.id === auth.user.id);
    const isCurrentPlayerReady = currentPlayer?.pivot.status === 'ready';
    const areAllPlayersReady = lobby.players?.every((player) =>
        player.id === lobby.owner_id || player.pivot.status === 'ready'
    );
    const canStartGame = lobby.current_players >= 2 && areAllPlayersReady;

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
                                    {lobby.current_players}/{lobby.max_players}
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
                                    {lobby.players && lobby.players.length > 0 ? (
                                        lobby.players.map((player: any) => (
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
                                                            <span className={`text-sm ${player.pivot.status === 'ready' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {player.pivot.status === 'ready' ? 'Ready' : 'Not Ready'}
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
                                            isCurrentPlayerReady
                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                : 'bg-green-500 hover:bg-green-600'
                                        } text-white`}
                                    >
                                        {isCurrentPlayerReady ? 'Not Ready' : 'Ready'}
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
