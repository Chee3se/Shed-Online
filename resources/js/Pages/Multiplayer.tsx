import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
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

            await axios.post(`/cards/${code}/play`, {
                cards: cardArray,
                next_player: nextPlayer
            });
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
                setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== user.id));
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
            const isSpecialCard = cards[0].value === '6' || cards[0].value === '10';
            const newMiddlePile = [...middlePile, ...cards];
            const fourOfAKind = newMiddlePile.filter(card => card.value === cards[0].value).length === 4;

            if (cards[0].value === '10' || fourOfAKind) {
                setUsedPile(prev => [...prev, ...newMiddlePile]);
                setMiddlePile([]);
                if (!fourOfAKind && cards[0].value !== '10') {
                    setGameState(prevState => ({
                        ...prevState,
                        currentTurn: next_player
                    }));
                }
            } else {
                const updatedCards = cards.map(card => ({
                    ...card,
                    offsetX: Math.random() * 10 - 5,
                    offsetY: Math.random() * 10 - 5,
                    rotation: Math.random() * 20 - 10
                }));
                setMiddlePile(prev => [...prev, ...updatedCards]);
                setGameState(prevState => ({
                    ...prevState,
                    currentTurn: next_player
                }));
            }

            setPlayers(prevPlayers => prevPlayers.map(p => {
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
            }));
        });

        channel.listen('.card-drawn', ({ cards, player_id }: { cards: number, player_id: number }) => {
            setRemainingCount(prevCount => prevCount - cards);
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
            {!gameStarted ? (
                <div>
                    <h2>Waiting for players to join...</h2>
                    <p>Players in lobby: {players.length}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-5 pt-12">
                    <h2>Game Started!</h2>
                    <div className="mb-4 text-lg font-semibold">
                        {isMyTurn() ? (
                            <span className="text-green-600">It's your turn!</span>
                        ) : (
                            <span className="text-red-600">
                                Waiting for {players.find(p => p.id === gameState.currentTurn)?.name}'s turn...
                            </span>
                        )}
                    </div>
                    {players.map(player => {
                        if (player.id !== auth.user.id) {
                            return (
                                <div key={player.id} className={`${player.id === gameState.currentTurn ? 'border-2 border-green-500 p-4 rounded' : ''}`}>
                                    <h3>{player.name}'s Cards {player.id === gameState.currentTurn && '(Current Turn)'}</h3>
                                    <OpponentCards
                                        handCards={player.handCards}  // Keep track of actual cards but display as face down
                                        downCards={player.faceDownCards}  // Keep track of actual cards but display as face down
                                        upCards={player.faceUpCards}  // Show face up cards as they are visible to all
                                    />
                                </div>
                            );
                        }
                        return null;
                    })}
                    <div className="flex items-center gap-6">
                        <RemainingPile remainingCount={remainingCount} />
                        <MiddlePile middlePile={middlePile} />
                        <UsedPile usedPile={usedPile} />
                    </div>
                    {(() => {
                        const currentPlayer = players.find(player => player.id === auth.user.id);
                        if (currentPlayer) {
                            return (
                                <div key={currentPlayer.id} className={`${isMyTurn() ? 'border-2 border-green-500 p-4 rounded' : ''}`}>
                                    <h3>{currentPlayer.name}'s Cards {isMyTurn() && '(Your Turn)'}</h3>
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
        </Layout>
    );
}
