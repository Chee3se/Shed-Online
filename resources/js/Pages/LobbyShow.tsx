import React from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function LobbyShow({
                                      auth,
                                      lobby,
                                      canJoin
                                  }: {
    auth: any,
    lobby: any,
    canJoin: boolean
}) {
    const { post } = useForm();

    const handleJoinLobby = () => {
        post(route('lobby.join', lobby.id));
    };

    return (
        <Layout auth={auth}>
            <Head title={`Lobby: ${lobby.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center px-4 py-8">
                <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
                            {lobby.name} 🃏
                        </h1>

                        <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Lobby Details
                                </h2>
                                {lobby.is_public ? (
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                                        Public
                                    </span>
                                ) : (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                                        Private
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <strong>Lobby Code:</strong>{' '}
                                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                                        {lobby.code}
                                    </span>
                                </p>
                                <p>
                                    <strong>Created by:</strong> {lobby.owner?.name}
                                </p>
                                <p>
                                    <strong>Players:</strong> {lobby.current_players} / {lobby.max_players}
                                </p>
                            </div>
                        </div>

                        {/* Player List */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Players
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {lobby.players && lobby.players.length > 0 ? (
                                    lobby.players.map((player) => (
                                        <div
                                            key={player.id}
                                            className="bg-white border rounded-lg p-4 flex items-center"
                                        >
                                            <div className="ml-3">
                                                <p className="font-semibold">{player.name}</p>
                                                {player.id === lobby.owner_id && (
                                                    <span className="text-xs text-gray-500">
                        (Lobby Owner)
                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No players in this lobby yet</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            {canJoin && lobby.current_players < lobby.max_players ? (
                                <button
                                    onClick={handleJoinLobby}
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Join Lobby
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="flex-1 bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed"
                                >
                                    {lobby.current_players >= lobby.max_players
                                        ? 'Lobby Full'
                                        : 'Cannot Join'}
                                </button>
                            )}

                            {lobby.owner_id === auth.user.id && (
                                <button
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Start Game
                                </button>
                            )}
                        </div>

                        {/* Back to Lobbies Link */}
                        <div className="mt-6 text-center">
                            <Link
                                href={route('lobby')}
                                className="text-indigo-600 hover:underline"
                            >
                                Back to Lobbies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
