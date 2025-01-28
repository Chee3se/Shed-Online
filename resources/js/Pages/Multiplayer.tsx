import React, { useEffect, useState, useRef } from 'react';
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
    const [players, setPlayers] = useState<Player[]>([{ id: auth.user.id, name: auth.user.name, faceDownCards: [], faceUpCards: [], handCards: [] }]);
    const deckId = useRef<string>('123456789');
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


                if (users.length >= 2) {
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


                    if (updatedPlayers.length >= 2 && auth.user.id === lobby.owner_id) {
                        startGame(updatedPlayers);
                    }

                    return updatedPlayers;
                });
            })
            .leaving((user: Player) => {
                console.log('User left:', user);
                setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== user.id));
            })
        .listen('.deck-generated', ({ deck_id }: { deck_id: string }) => {
            deckId.current = deck_id;
            setGameStarted(true);
            console.log('Deck ID:', deck_id);
        })

        return () => {
            window.Echo.leave(`lobby.${code}`);
        };
    }, [code]);

    const startGame = async (players: Player[]) => {
        if (gameStarted) return;
        try {
            const response = await axios.post('/generate-deck', {code:code});
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
