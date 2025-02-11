import React, { useEffect, useState, useRef } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import card from "@/Components/Cards/Card";
import { Card, DeckResponse, DrawResponse } from '@/types';
import MyCards from "@/Components/Cards/MyCards";

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
    const [cardsDealt, setCardsDealt] = useState<boolean>(false); // Add this to track if cards have been dealt

    const handleCardPlacement = async (card: Card | Card[], player: 'player' | 'bot') => {
        console.log('Card played:', card);
        await axios.post(`/cards/${code}/play`, { cards: [card] });
    };

    const isValidMove = (card: Card): boolean => {
        return true;
    };

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
                setPlayers(prevPlayers => {
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
                setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== user.id));
            });


        channel.listen('.deck-generated', ({ deck_id }: { deck_id: string }) => {
            console.log('Deck generated:', deck_id);
            deckId.current = deck_id;
            localStorage.setItem('deckId', deck_id);
            setGameStarted(true);
        });

        channel.listen('.card-played', ({ cards, player_id }: { cards: Card[], player_id: number }) => {
            console.log('Card played:', cards, 'by player:', player_id);
        })
        channel.listen('.cards-drawn', ({ cards }: { cards: Card[] }) => {
            console.log('Cards drawn:', cards);
        });

        return () => {
            window.Echo.leave(`lobby.${code}`);
        };
    }, [code]);

    const startGame = async (players: Player[]) => {
        if (gameStarted) return;
        try {
            await axios.post('/generate-deck', { code, deck_id: deckId.current });
        } catch (error) {
            console.error('Failed to start game:', error);
        }
    };

    const drawCards = async (count: number): Promise<Card[]> => {
        if (!deckId.current) {
            console.error('No deck ID available');
            return [];
        }

        try {
            const response = await axios.post<Card[]>(`/cards/${code}/draw`, {
                deck_id: deckId.current,
                count: count,
            });
            console.log('Draw response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error drawing cards:', error);
            return [];
        }
    };


    useEffect(() => {
        const dealCards = async () => {
            try {

                const playerDown = await drawCards(3);
                const playerUp = await drawCards(3);
                const playerHand = await drawCards(3);

                setPlayers(prevPlayers => {
                    const newPlayers = prevPlayers.map(player => {
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

                    return newPlayers;
                });
                setCardsDealt(true);
            } catch (error) {
                console.error('Error dealing cards:', error);
            }
        };

        dealCards();
    }, [gameStarted, deckId.current]);


    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
            <h1>
                Hello players {players.map(player => player.name + " ")}
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
                    {players.map(player => (
                        <div key={player.id}>
                            <h3>{player.name}'s Cards:</h3>
                            {player.id === auth.user.id && (
                                <MyCards
                                    handCards={player.handCards}
                                    downCards={player.faceDownCards}
                                    upCards={player.faceUpCards}
                                    handleCardPlacement={handleCardPlacement}
                                    isValidMove={isValidMove}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
