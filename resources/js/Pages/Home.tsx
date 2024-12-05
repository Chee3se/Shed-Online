import React, { useState } from 'react';
import { Head, Link } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function Home({ auth }: { auth: any }) {
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

    const openRulesModal = () => setIsRulesModalOpen(true);
    const closeRulesModal = () => setIsRulesModalOpen(false);

    const RulesModal = () => (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
            onClick={closeRulesModal}
        >
            <div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeRulesModal}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-bold text-gray-800 mb-6">Shed Card Game Rules</h2>

                <div className="space-y-4 text-gray-700">


                    <section>
                        <h3 className="text-xl font-semibold mb-2">Example IRL – Demonstration</h3>
                        <ul className="list-disc pl-5">
                            <li>Maximum cards: 52 (without jokers).</li>
                            <li>Suit does not matter: for example, you can place a ♥8 on top of a ♠8.</li>
                            <li>3 Hidden Cards can only be used after all 3 Top Cards have been played.</li>
                            <li>3 Face-Up Cards can be played when the deck and/or hand cards are exhausted.</li>
                            <li>3 Cards in Hand are used to play the game itself. (You must always have 3 cards in hand
                                while the deck allows it.)
                            </li>
                            <li>If the last card in hand is a Jack, and there is also a Jack among the face-up cards, you can confidently play it on the table.</li>

                        </ul>
                    </section>

                    <section>
                    <h3 className="text-xl font-semibold mb-2">Special cards</h3>
                        <p>Players take turns playing cards. You can play:</p>
                        <ul className="list-disc pl-5">
                            <li>A card equal to or higher than the previous card</li>
                            <li>A card of the same value (burning the pile)</li>
                            <li>A 10 clears the entire pile</li>
                        </ul>
                    </section>


                    <section>
                        <h3 className="text-xl font-semibold mb-2">Winning</h3>
                        <p>The first player to get rid of all cards wins. The last player with cards is the "Shithead"!</p>
                    </section>
                </div>
            </div>
        </div>
    );

    return (
        <Layout auth={auth}>
            <Head title="Shed - Card Game" />

            {isRulesModalOpen && <RulesModal />}

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
                            Shed 🃏
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Choose your game mode and challenge yourself!
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Singleplayer Card */}
                            <div className="bg-indigo-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    Single Player
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Play against AI opponents. Perfect for practicing your strategy!
                                </p>
                                <Link
                                    href="/singleplayer"
                                    className="w-full block text-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Start Solo Game
                                </Link>
                            </div>

                            {/* Multiplayer Card */}
                            <div className="bg-purple-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    Multiplayer
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Challenge friends online or join a random game room!
                                </p>
                                <Link
                                    href="/multiplayer"
                                    className="w-full block text-center bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Join Multiplayer
                                </Link>
                            </div>
                        </div>

                        {/* Optional: Quick Rules Section */}
                        <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Quick Game Rules
                            </h3>
                            <p className="text-gray-600">
                                Shed is a fun card game where players try to get rid of all their cards.
                                The last player holding cards becomes the "Shithead"!
                            </p>
                            <button
                                onClick={openRulesModal}
                                className="mt-4 inline-block text-indigo-600 hover:underline"
                            >
                                Learn Full Rules
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
