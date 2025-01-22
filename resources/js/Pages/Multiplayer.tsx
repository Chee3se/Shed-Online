import React, { useEffect, useState } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';

interface Player {
    id: number;
    name: string;
    faceDownCards: any[];
    faceUpCards: any[];
    handCards: any[];
}

export default function Multiplayer({ auth, code, lobby }: { auth: any; code: string; lobby: any }) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [deckId, setDeckId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    useEffect(() => {
        window.axios.defaults.headers.common['X-Socket-ID'] = window.Echo.socketId();

        const channel = window.Echo.join(`lobby.${code}`)
            .here((users: Player[]) => {
                console.log('Users in the lobby:', users);
                setPlayers(users.map(user => ({
                    ...user,
                    faceDownCards: [],
                    faceUpCards: [],
                    handCards: [],
                })));

                // Start the game if all players have joined
                if (users.length >= 2) { // Minimum 2 players required
                    startGame(users);
                }
            })
            .joining((user: Player) => {
                console.log('User joined:', user);
                setPlayers((prevPlayers) => {
                    const updatedPlayers = [
                        ...prevPlayers,
                        {
                            ...user,
                            faceDownCards: [],
                            faceUpCards: [],
                            handCards: [],
                        },
                    ];

                    // Start the game if all players have joined
                    if (updatedPlayers.length >= 2) { // Minimum 2 players required
                        startGame(updatedPlayers);
                    }

                    return updatedPlayers;
                });
            })
            .leaving((user: Player) => {
                console.log('User left:', user);
                setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== user.id));
            });

        return () => {
            window.Echo.leave(`lobby.${code}`);
        };
    }, [code]);

    const startGame = async (players: Player[]) => {
        if (gameStarted) return; // Prevent multiple starts

        try {
            // Call the backend to generate a deck and deal cards
            const response = await axios.post('/generate-deck', {
                players: players.map(player => player.id), // Send player IDs
            });

            const { deck_id, dealt_cards } = response.data;

            // Update state with the deck ID and dealt cards
            setDeckId(deck_id);
            setPlayers(prevPlayers => prevPlayers.map(player => ({
                ...player,
                faceDownCards: dealt_cards[player.id].face_down,
                faceUpCards: dealt_cards[player.id].face_up,
                handCards: dealt_cards[player.id].in_hand,
            })));

            // Mark the game as started
            setGameStarted(true);
        } catch (error) {
            console.error('Failed to start game:', error);
        }
    };

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
            <h1>
                Hello players {players.map((player) => player.name + " ")}
            </h1>

            {!gameStarted && (
                <div>
                    <h2>Waiting for players to join...</h2>
                    <p>Players in lobby: {players.length}</p>
                </div>
            )}

            {gameStarted && (
                <div>
                    <h2>Game Started!</h2>
                    {players.map((player) => (
                        <div key={player.id}>
                            <h3>{player.name}'s Cards:</h3>
                            <p>Face Down: {player.faceDownCards.length}</p>
                            <p>Face Up: {player.faceUpCards.length}</p>
                            <p>In Hand: {player.handCards.length}</p>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
