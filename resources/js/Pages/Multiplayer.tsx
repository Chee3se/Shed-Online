import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from "@/Layouts/Layout";
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import MyCards from "@/Components/Cards/MyCards";
import OpponentCards from "@/Components/Cards/OpponentCards";
import RemainingPile from "@/Components/Cards/RemainingPile";
import MiddlePile from "@/Components/Cards/MiddlePile";
import UsedPile from "@/Components/Cards/UsedPile";
import { getCardValue } from '@/utils';

interface Player {
    id: number;
    name: string;
    faceDownCards: Card[];
    faceUpCards: Card[];
    handCards: Card[];
}

interface GameState {
    currentTurn: number;
    turnOrder: number[];
}

interface Card {
    code: string;
    image: string;
    images: {
        svg: string;
        png: string;
    };
    value: string;
    suit: string;
    offsetX?: number;
    offsetY?: number;
    rotation?: number;
}

export default function Multiplayer({ auth, code, lobby }: { auth: any; code: string; lobby: any }) {
    const [players, setPlayers] = useState<Player[]>([{
        id: auth.user.id,
        name: auth.user.name,
        faceDownCards: [],
        faceUpCards: [],
        handCards: []
    }]);
    const deckId = useRef<string>('');
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [cardsDealt, setCardsDealt] = useState<boolean>(false);
    const [middlePile, setMiddlePile] = useState<Card[]>([]);
    const [usedPile, setUsedPile] = useState<Card[]>([]);
    const [remainingCount, setRemainingCount] = useState<number>(52 - 9);
    const [gameState, setGameState] = useState<GameState>({
        currentTurn: lobby.owner_id,
        turnOrder: []
    });

    const isMyTurn = useCallback(() => {
        return gameState.currentTurn === auth.user.id;
    }, [gameState.currentTurn, auth.user.id]);

    const getNextPlayerId = () => {
        const currentIndex = gameState.turnOrder.indexOf(gameState.currentTurn);
        const nextIndex = (currentIndex + 1) % gameState.turnOrder.length;
        return gameState.turnOrder[nextIndex];
    };

    const handleCardPlacement = async (cards: Card | Card[], player: 'player' | 'bot') => {
        if (!isMyTurn()) return;
        if (!cards) return;

        const cardArray = Array.isArray(cards) ? cards : [cards];
        if (cardArray.length === 0) return;

        const sameValue = cardArray.every(card => card.value === cardArray[0].value);
        if (!sameValue) {
            console.error('Cards must have the same value for multiple placement');
            return;
        }

        const currentPlayer = players.find(p => p.id === auth.user.id);
        if (!currentPlayer) return;

        const topCard = middlePile[middlePile.length - 1];
        const isSpecialCard = cardArray[0].value === '6' || cardArray[0].value === '10';
        const newMiddlePile = [...middlePile, ...cardArray];
        const fourOfAKind = newMiddlePile.filter(card => card.value === cardArray[0].value).length === 4;

        let nextPlayer = getNextPlayerId();
        if ((cardArray[0].value === '10' || fourOfAKind) && !fourOfAKind && cardArray[0].value === '10') {
            nextPlayer = gameState.currentTurn;
        }

        if (!topCard || getCardValue(cardArray[0]) >= getCardValue(topCard) || isSpecialCard) {
            if (cardArray[0].value === '10' || fourOfAKind) {
                setUsedPile(prev => [...prev, ...newMiddlePile]);
                setMiddlePile([]);
                if (!fourOfAKind && cardArray[0].value !== '10') {
                    setGameState(prevState => ({
                        ...prevState,
                        currentTurn: nextPlayer
                    }));
                }
            } else {
                const updatedCards = cardArray.map(card => ({
                    ...card,
                    offsetX: Math.random() * 10 - 5,
                    offsetY: Math.random() * 10 - 5,
                    rotation: Math.random() * 20 - 10
                }));
                setMiddlePile(prev => [...prev, ...updatedCards]);
                setGameState(prevState => ({
                    ...prevState,
                    currentTurn: nextPlayer
                }));
            }

            setPlayers(prevPlayers => prevPlayers.map(p => {
                if (p.id === auth.user.id) {
                    const updatedPlayer = { ...p };
                    if (p.handCards.some(c => cardArray.some(played => played.code === c.code))) {
                        updatedPlayer.handCards = p.handCards.filter(c => !cardArray.some(played => played.code === c.code));
                    } else if (p.faceUpCards.some(c => cardArray.some(played => played.code === c.code))) {
                        updatedPlayer.faceUpCards = p.faceUpCards.filter(c => !cardArray.some(played => played.code === c.code));
                    } else if (p.faceDownCards.some(c => cardArray.some(played => played.code === c.code))) {
                        updatedPlayer.faceDownCards = p.faceDownCards.filter(c => !cardArray.some(played => played.code === c.code));
                    }

                    // Draw cards to ensure the player has 3 cards in hand
                    const cardsToDrawCount = Math.min(3 - updatedPlayer.handCards.length, remainingCount);
                    if (cardsToDrawCount > 0) {
                        drawCards(cardsToDrawCount).then(newCards => {
                            setPlayers(prevPlayers => prevPlayers.map(p => {
                                if (p.id === auth.user.id) {
                                    return {
                                        ...p,
                                        handCards: [...p.handCards, ...newCards]
                                    };
                                }
                                return p;
                            }));
                        });
                    }

                    return updatedPlayer;
                }
                return p;
            }));

            try {
                await axios.post(`/cards/${code}/play`, {
                    cards: cardArray,
                    next_player: nextPlayer,
                    current_player: gameState.currentTurn // Add this line
                });
            } catch (error) {
                // Handle the error, possibly revert the local state
                console.error('Failed to play cards:', error);
                // Optionally refresh the game state or show an error message
                return;
            }
        } else {
            // Invalid move - pick up the pile
            if (middlePile.length === 0) return; // Prevent picking up empty pile

            const nextPlayer = getNextPlayerId();

            setPlayers(prevPlayers => prevPlayers.map(p => {
                if (p.id === auth.user.id) {
                    return {
                        ...p,
                        handCards: [...p.handCards, ...middlePile]
                    };
                }
                return p;
            }));
            setMiddlePile([]);
            setGameState(prevState => ({
                ...prevState,
                currentTurn: nextPlayer
            }));

            await axios.post(`/cards/${code}/take`, {
                cards: middlePile,
                next_player: nextPlayer
            });
        }
    };

    const isValidMove = (card: Card): boolean => {
        if (!isMyTurn()) return false;
        if (!card) return false;
        if (card.value === '6' || card.value === '10') return true;
        const topCard = middlePile[middlePile.length - 1];
        if (!topCard) return true;
        return getCardValue(card) >= getCardValue(topCard);
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
                const playersList = users.map(user => ({
                    ...user,
                    faceDownCards: [],
                    faceUpCards: [],
                    handCards: [],
                }));
                setPlayers(playersList);
                setGameState(prevState => ({
                    ...prevState,
                    turnOrder: playersList.map(p => p.id)
                }));

                if (users.length >= 2 && auth.user.id === lobby.owner_id) {
                    startGame(playersList);
                }
            })
            .joining((user: Player) => {
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
                setPlayers(prevPlayers => {
                    const updatedPlayers = prevPlayers.filter(player => player.id !== user.id);

                    // If this was the last player, clean up the lobby
                    if (updatedPlayers.length === 0) {
                        cleanupEmptyLobby();
                    }

                    return updatedPlayers;
                });
            });

        channel.listen('.card-taken', ({ cards, player_id, next_player }: { cards: Card[], player_id: number, next_player: number }) => {
            setPlayers(prevPlayers => prevPlayers.map(p => {
                if (p.id === player_id) {
                    return {
                        ...p,
                        handCards: [...p.handCards, ...cards]
                    };
                }
                return p;
            }));
            setMiddlePile([]);
            setGameState(prevState => ({
                ...prevState,
                currentTurn: next_player
            }));
        });

        channel.listen('.deck-generated', ({ deck_id }: { deck_id: string }) => {
            deckId.current = deck_id;
            localStorage.setItem('deckId', deck_id);
            setGameStarted(true);
        });

        channel.listen('.card-played', ({ cards, player_id, next_player }: { cards: Card[], player_id: number, next_player: number }) => {
            setPlayers(prevPlayers => {
                const updatedPlayers = prevPlayers.map(p => {
                    if (p.id === player_id) {
                        const updatedPlayer = { ...p };
                        if (p.handCards.length > 0) {
                            updatedPlayer.handCards = p.handCards.filter(c => !cards.some(played => played.code === c.code));
                        } else if (p.faceUpCards.length > 0) {
                            updatedPlayer.faceUpCards = p.faceUpCards.filter(c => !cards.some(played => played.code === c.code));
                        } else if (p.faceDownCards.length > 0) {
                            updatedPlayer.faceDownCards = p.faceDownCards.filter(c => !cards.some(played => played.code === c.code));
                        }
                        return updatedPlayer;
                    }
                    return p;
                });

                const isSpecialCard = cards[0].value === '6' || cards[0].value === '10';
                const newMiddlePile = [...middlePile, ...cards];
                const fourOfAKind = newMiddlePile.filter(card => card.value === cards[0].value).length === 4;

                if (cards[0].value === '10' || fourOfAKind) {
                    setUsedPile(prev => [...prev, ...newMiddlePile]);
                    setMiddlePile([]);
                } else {
                    const updatedCards = cards.map(card => ({
                        ...card,
                        offsetX: Math.random() * 10 - 5,
                        offsetY: Math.random() * 10 - 5,
                        rotation: Math.random() * 20 - 10
                    }));
                    setMiddlePile(prev => [...prev, ...updatedCards]);
                }

                setGameState(prevState => ({
                    ...prevState,
                    currentTurn: next_player
                }));

                return updatedPlayers;
            });
        });

        channel.listen('.card-drawn', ({ cards, player_id }: { cards: number, player_id: number }) => {
            setRemainingCount(prevCount => prevCount - cards);
        });

        return () => {
            leaveLobbyAndCleanup();
        };
    }, [code]);

    const cleanupEmptyLobby = async () => {
        try {
            await axios.delete(route('lobby.delete', code));
            localStorage.removeItem('deckId');
            router.get(route('lobby'));
        } catch (error) {
            console.error('Failed to cleanup empty lobby:', error);
        }
    };


    const leaveLobbyAndCleanup = async () => {
        try {

            window.Echo.leave(`lobby.${code}`);
            await axios.post(route('lobby.leave', code));
            const response = await axios.get(route('lobby', code));
            const remainingPlayers = response.data.players;

            if (remainingPlayers.length === 0) {
                await cleanupEmptyLobby();
            }
        } catch (error) {
            console.error('Error during lobby cleanup:', error);
        }
    };

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
            throw new Error('No deck ID available');
        }

        try {
            const response = await axios.post(`/cards/${code}/draw`, {
                deck_id: deckId.current,
                count: count
            });

            const cards: Card[] = response.data.map((card: Card) => ({
                ...card,
                offsetX: Math.random() * 10 - 5,
                offsetY: Math.random() * 10 - 5,
                rotation: Math.random() * 20 - 10
            }));

            // Update the remaining card count
            setRemainingCount(prevCount => prevCount - count);

            return cards;
        } catch (error) {
            console.error('Error drawing cards:', error);
            throw error;
        }
    };

    useEffect(() => {
        const dealCards = async () => {
            if (!deckId.current || cardsDealt) return;

            try {
                const playerDown = await drawCards(3);
                const playerUp = await drawCards(3);
                const playerHand = await drawCards(3);

                setPlayers(prevPlayers => prevPlayers.map(player => {
                    if (player.id === auth.user.id) {
                        return {
                            ...player,
                            faceDownCards: playerDown,
                            faceUpCards: playerUp,
                            handCards: playerHand,
                        };
                    }
                    // Initialize other players with face-down cards
                    return {
                        ...player,
                        faceDownCards: Array(3).fill(null).map((_, index) => ({
                            code: `back-down-${index}`,
                            image: 'https://deckofcardsapi.com/static/img/back.png',
                            images: {
                                png: 'https://deckofcardsapi.com/static/img/back.png',
                                svg: ''
                            },
                            value: '',
                            suit: ''
                        })),
                        faceUpCards: Array(3).fill(null).map((_, index) => ({
                            code: `back-up-${index}`,
                            image: 'https://deckofcardsapi.com/static/img/back.png',
                            images: {
                                png: 'https://deckofcardsapi.com/static/img/back.png',
                                svg: ''
                            },
                            value: '',
                            suit: ''
                        })),
                        handCards: Array(3).fill(null).map((_, index) => ({
                            code: `back-hand-${index}`,
                            image: 'https://deckofcardsapi.com/static/img/back.png',
                            images: {
                                png: 'https://deckofcardsapi.com/static/img/back.png',
                                svg: ''
                            },
                            value: '',
                            suit: ''
                        }))
                    };
                }));
                setCardsDealt(true);
            } catch (error) {
                console.error('Error dealing cards:', error);
            }
        };

        if (gameStarted && !cardsDealt) {
            dealCards();
        }
    }, [gameStarted, cardsDealt]);

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
            <div className="min-h-screen bg-white px-4 py-6">
                {!gameStarted ? (
                    <div className="text-center py-8">
                        <h2 className="text-xl font-semibold text-gray-800">Waiting for players to join...</h2>
                        <p className="text-gray-600 mt-2">Players in lobby: {players.length}</p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        {/* Turn Status */}
                        <div className="text-center mb-4">
                            {isMyTurn() ? (
                                <span className="inline-block px-4 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                  It's your turn!
                </span>
                            ) : (
                                <span className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {players.find(p => p.id === gameState.currentTurn)?.name}'s turn
                </span>
                            )}
                        </div>

                        {/* Opponents - Now in horizontal layout */}
                        <div className="flex justify-center gap-4 mb-6">
                            {players.map(player => {
                                if (player.id !== auth.user.id) {
                                    return (
                                        <div
                                            key={player.id}
                                            className={`
                        bg-gray-50 rounded p-3
                        ${player.id === gameState.currentTurn ? 'ring-1 ring-blue-300' : ''}
                      `}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium">{player.name}</span>
                                                {player.id === gameState.currentTurn &&
                                                    <span className="text-xs text-blue-600">(Current)</span>
                                                }
                                            </div>
                                            <OpponentCards
                                                handCards={player.handCards}
                                                downCards={player.faceDownCards}
                                                upCards={player.faceUpCards}
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {/* Game Piles */}
                        <div className="flex justify-center items-center gap-6 mb-6">
                            <div>
                                <RemainingPile remainingCount={remainingCount} />
                                <p className="mt-1 text-xs text-gray-500 text-center">{remainingCount}</p>
                            </div>

                            <div>
                                <MiddlePile middlePile={middlePile} />
                                <p className="mt-1 text-xs text-gray-500 text-center">Middle</p>
                            </div>

                            <div>
                                <UsedPile usedPile={usedPile} />
                                <p className="mt-1 text-xs text-gray-500 text-center">Used</p>
                            </div>
                        </div>

                        {/* Player's Hand */}
                        {(() => {
                            const currentPlayer = players.find(player => player.id === auth.user.id);
                            if (currentPlayer) {
                                return (
                                    <div
                                        className={`
                      bg-gray-50 rounded p-3
                      ${isMyTurn() ? 'ring-1 ring-green-300' : ''}
                    `}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Your Cards</span>
                                            {isMyTurn() && (
                                                <span className="text-xs text-green-600">Your Turn</span>
                                            )}
                                        </div>
                                        <MyCards
                                            handCards={currentPlayer.handCards}
                                            downCards={currentPlayer.faceDownCards}
                                            upCards={currentPlayer.faceUpCards}
                                            handleCardPlacement={handleCardPlacement}
                                            isValidMove={isValidMove}
                                            disabled={!isMyTurn()}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}
            </div>
        </Layout>
    );
}
