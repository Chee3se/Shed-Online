import React, { useState } from 'react';
import { Head, Link } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function Home({ auth }: { auth: any }) {
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);

    const openRulesModal = () => setIsRulesModalOpen(true);
    const closeRulesModal = () => setIsRulesModalOpen(false);
    const openGameModal = () => setIsGameModalOpen(true);
    const closeGameModal = () => setIsGameModalOpen(false);

    const GameModeModal = () => (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={closeGameModal}
        >
            <div
                className="bg-white/90 backdrop-blur rounded-3xl max-w-xl w-full p-8 relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeGameModal}
                    className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className=" text-3xl text-gray-800 mb-8">Choose Your Mode</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <Link
                        href="/singleplayer"
                        className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 hover:ring-blue-500 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-blue-50 p-4 group-hover:bg-blue-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className=" text-xl text-gray-800">Solo Play</h3>
                            <p className="text-sm text-gray-500">Practice against AI</p>
                        </div>
                    </Link>

                    <Link
                        href="/lobby"
                        className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 hover:ring-purple-500 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-purple-50 p-4 group-hover:bg-purple-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className=" text-xl text-gray-800">Multiplayer</h3>
                            <p className="text-sm text-gray-500">Play with friends</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );

    const RulesModal = () => (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={closeRulesModal}
        >
            <div
                className="bg-white/90 backdrop-blur rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeRulesModal}
                    className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className=" text-3xl text-gray-800 mb-8">Game Rules</h2>

                <div className="space-y-6 text-gray-600">
                    <section>
                        <h3 className=" text-xl text-gray-800 mb-3">How to Play</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Maximum 52 cards (no jokers)
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Suit doesn't matter - ♥8 can be placed on ♠8
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Hidden Cards playable after Top Cards
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h3 className=" text-xl text-gray-800 mb-3">Special Cards</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Play equal or higher cards
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Same value burns the pile
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                10 clears the entire pile
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );

    return (
        <Layout auth={auth}>
            <Head title="Shed - Card Game"/>

            {isRulesModalOpen && <RulesModal/>}
            {isGameModalOpen && <GameModeModal/>}

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-3xl">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="font-['Phosphate'] font-bold text-8xl text-gray-900 tracking-wider">
                                Shed
                            </h1>
                            <p className="text-xl text-gray-600">
                                The ultimate card game experience
                            </p>
                        </div>

                        <button
                            onClick={openGameModal}
                            className="font-['Phosphate'] inline-flex items-center justify-center px-8 py-4 text-lg text-white bg-black rounded-full hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                            Start Playing
                        </button>

                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg ring-1 ring-gray-200">
                            <div className="max-w-2xl mx-auto">
                                <h3 className="font-['Phosphate'] text-xl text-gray-800 mb-4">
                                    Quick Overview
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Get rid of all your cards to win. Last player holding cards becomes the "Shithead"!
                                </p>
                                <button
                                    onClick={openRulesModal}
                                    className=" text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View Complete Rules
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
