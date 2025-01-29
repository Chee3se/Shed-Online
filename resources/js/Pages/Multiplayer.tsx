import React, { useEffect, useState, useRef } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import card from "@/Components/Cards/Card";
import { Card, DeckResponse, DrawResponse } from '@/types';
import MyCards from '@/Components/Cards/MyCards';
import OpponentCards from '@/Components/Cards/OpponentCards';

interface Player {
    id: number;
    name: string;
    faceDownCards: Card[];
    faceUpCards: Card[];
    handCards: Card[];
}

export default function Multiplayer({ auth, code, lobby }: { auth: any; code: string; lobby: any }) {
    const [players, setPlayers] = useState<Player[]>([{ id: auth.user.id, name: auth.user.name, faceDownCards: [], faceUpCards: [], handCards: [] }]);
    const deckId = useRef<string>('123456789');
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    const handleCardPlacement = (card: Card | Card[], player: 'player' | 'bot') => {
        console.log('Card played:', card);

    };

    const isValidMove = (card: Card): boolean => {
        return true;
    };

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

    const drawCards = async (count: number): Promise<Card[]> => {
        console.log('Drawing cards with deck_id:', deckId.current);
        try {

            const response = await axios.post<DrawResponse>(`/cards/${code}/draw`, {
                deck_id: deckId.current,
                count: count
            });

            return response.data.cards;
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

                setPlayers((prevPlayers) => {
                    return prevPlayers.map((player) => {
                        if (player.id === auth.user.id) {
                            const updatedPlayer = {
                                ...player,
                                faceDownCards: playerDown,
                                faceUpCards: playerUp,
                                handCards: playerHand,
                            };
                            console.log('Updated player state:', updatedPlayer);
                            return updatedPlayer;
                        }
                        return player;
                    });
                });
            } catch (error) {
                console.error('Error in dealCards:', error);
            }
        };

        if (deckId.current && gameStarted) {
            console.log('Dealing cards with deck_id:', deckId.current);
            dealCards();
        }
    }, [deckId.current, gameStarted]);

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
            <div className="p-6">
                {!gameStarted && (
                    <div>
                        <h2>Waiting for players to join...</h2>
                        <p>Players in lobby: {players.length}</p>
                    </div>
                )}

                {gameStarted && (
                    <div className="space-y-6">
                        {/* Other players' cards */}
                        {players.filter(player => player.id !== auth.user.id).map((player) => (
                            <div key={player.id}>
                                <h3 className="font-medium mb-2">{player.name}'s Cards</h3>
                                <OpponentCards
                                    handCards={player.handCards} // Empty array since we don't show hand cards
                                    downCards={player.faceDownCards} // Show face down cards
                                    upCards={player.faceUpCards} // Show face up cards
                                />
                            </div>
                        ))}

                        {/* Current player's cards */}
                        {players.map((player) => player.id === auth.user.id && (
                            <div key={player.id}>
                                <MyCards
                                    handCards={player.handCards}
                                    downCards={player.faceDownCards}
                                    upCards={player.faceUpCards}
                                    handleCardPlacement={handleCardPlacement}
                                    isValidMove={isValidMove}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
