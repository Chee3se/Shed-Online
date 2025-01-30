import React, { useEffect, useState, useRef } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import card from "@/Components/Cards/Card";
import { Card, DeckResponse, DrawResponse } from '@/types';

interface Player {
    id: number;
    name: string;
    faceDownCards: Card[];
    faceUpCards: Card[];
    handCards: Card[];
}

export default function Multiplayer({ auth, code, lobby }: { auth: any; code: string; lobby: any }) {
    const [players, setPlayers] = useState<Player[]>([{ id: auth.user.id, name: auth.user.name, faceDownCards: [], faceUpCards: [], handCards: [] }]);
    const deckId = useRef<string>('');
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    useEffect(() => {
        const savedDeckId = localStorage.getItem('deckId');
        if (savedDeckId) {
            deckId.current = savedDeckId;
            setGameStarted(true);
        }

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


                if (users.length >= 2 && auth.user.id === lobby.owner_id) {
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
            localStorage.setItem('deckId', deck_id); // Save to localStorage
            setGameStarted(true);
            console.log('Deck ID:', deck_id);
        })
        .listen('.card-drawn', ({ player_id, card }: { player_id: number; card: Card }) => {
            console.log('Card drawn:', card);
        })
        .listen('.card-played', ({ player_id, card }: { player_id: number; card: Card }) => {
            console.log('Card played:', card);
        })
        .listen('.card-taken', ({ player_id, card }: { player_id: number; card: Card }) => {
            console.log('Card taken:', card);
        })



        return () => {
            window.Echo.leave(`lobby.${code}`);
        };
    }, [code]);

    const startGame = async (players: Player[]) => {
        if (gameStarted) return;
        try {
            const response = await axios.post('/generate-deck', {code:code, deck_id: deckId?.current});
        } catch (error) {
            console.error('Failed to start game:', error);
        }
    };

    const drawCards = async (count: number) => {
        if (deckId) {
            const response = await axios.post<DrawResponse>(`/cards/${code}/draw`, {count: 3, deck_id: deckId.current});
            console.log('Drawn cards:', response.data);
        }
        return [];
    }

    useEffect(() => {
        const dealCards = async () => {

            const playerDown = await drawCards(3);
            const playerUp = await drawCards(3);
            const playerHand = await drawCards(3);


            setPlayers((prevPlayers) => {
                return prevPlayers.map((player) => {
                    if (player.id === auth.user.id) {
                        return {
                            ...player,
                            faceDownCards: playerDown,
                            faceUpCards: playerUp,
                            handCards: playerHand,
                        };
                    }
                    return player;
                });
            });


        };
        if (deckId) {
            dealCards();
        }
    }, [deckId]);

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
