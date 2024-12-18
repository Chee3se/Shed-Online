import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function LobbyShow({
                                      auth,
                                      lobby,
                                      canJoin,
                                      owners
                                  }:{ auth?: any; lobby?: any; canJoin?: boolean; owners?: any}) {
    const { post } = useForm();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            event.preventDefault();
            handleLeaveLobby();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

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

    return (
        <Layout auth={auth}>
            <Head title={`Lobby: ${lobby.name}`} />

            {isLeaveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">
                            {lobby.owner_id === auth.user.id ? "Delete Lobby?" : "Leave Lobby?"}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {lobby.owner_id === auth.user.id
                                ? "As the lobby owner, leaving will permanently delete this lobby and remove all players."
                                : "Are you sure you want to leave this lobby?"}
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsLeaveModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLeaveLobby}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                {lobby.owner_id === auth.user.id ? "Delete Lobby" : "Leave Lobby"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center px-4 py-8">
                <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
                            {lobby.name} 🃏
                        </h1>

                        <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Lobby Details</h2>
                                {lobby.is_public ? (
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Public</span>
                                ) : (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Private</span>
                                )}
                            </div>

                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <strong>Lobby Code:</strong>{' '}
                                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">{lobby.code}</span>
                                </p>
                                <p>
                                    <strong>Created by:</strong> {owners[lobby.owner_id]}
                                </p>
                                <p>
                                    <strong>Players:</strong> {lobby.current_players} / {lobby.max_players}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Players</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {lobby.players && lobby.players.length > 0 ? (
                                    lobby.players.map((player: any) => (
                                        <div key={player.id} className="bg-white border rounded-lg p-4 flex items-center">
                                            <div className="ml-3">
                                                <p className="font-semibold">{player.name}</p>
                                                {player.id === lobby.owner_id && (
                                                    <span className="text-xs text-gray-500">(Lobby Owner)</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No players in this lobby yet</p>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsLeaveModalOpen(true)}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Leave Lobby
                            </button>

                            {lobby.owner_id === auth.user.id && (
                                <button
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                                    disabled={lobby.current_players < 2}
                                >
                                    Start Game
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
}
