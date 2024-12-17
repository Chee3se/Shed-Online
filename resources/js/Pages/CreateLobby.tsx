import React from 'react';
import { useForm, Head, Link } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function CreateLobby({ auth }: { auth: any }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        max_players: 4,
        is_public: true,
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('lobby.store'), {
            onSuccess: () => {
                // This will handle the redirect to the lobby after creation
            }
        });
    };

    return (
        <Layout auth={auth}>
            <Head title="Create Lobby" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center px-4 py-8">
                <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
                            Create Lobby 🃏
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 text-center">
                            Set up your Shed game lobby
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Lobby Name */}
                            <div>
                                <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                                    Lobby Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        errors.name
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-indigo-500'
                                    } focus:outline-none focus:ring-2`}
                                    placeholder="Enter lobby name"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>


                            {/* Max Players */}
                            <div>
                                <label htmlFor="max_players" className="block text-gray-700 font-bold mb-2">
                                    Max Players
                                </label>
                                <select
                                    id="max_players"
                                    value={data.max_players}
                                    onChange={(e) => setData('max_players', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {[2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>
                                            {num} Players
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lobby Visibility */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">
                                    Lobby Type
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="is_public"
                                            checked={data.is_public === true}
                                            onChange={() => setData('is_public', true)}
                                            className="form-radio text-indigo-600"
                                        />
                                        <span className="ml-2">Public</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="is_public"
                                            checked={data.is_public === false}
                                            onChange={() => setData('is_public', false)}
                                            className="form-radio text-indigo-600"
                                        />
                                        <span className="ml-2">Private</span>
                                    </label>
                                </div>
                            </div>

                            {/* Password for Private Lobby */}
                            {!data.is_public && (
                                <div>
                                    <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                                        Lobby Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.password
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-indigo-500'
                                        } focus:outline-none focus:ring-2`}
                                        placeholder="Enter lobby password"
                                        required={!data.is_public}
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Lobby'}
                                </button>
                            </div>
                        </form>

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
