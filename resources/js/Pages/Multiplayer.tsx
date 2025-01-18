import React, { useEffect, useState, useCallback } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import MyCards from '@/Components/Cards/MyCards';
import OpponentCards from '@/Components/Cards/OpponentCards';
import MiddlePile from '@/Components/Cards/MiddlePile';
import RemainingPile from '@/Components/Cards/RemainingPile';
import UsedPile from '@/Components/Cards/UsedPile';
import { Card, DeckResponse, DrawResponse } from '@/types';
import { getCardValue } from '@/utils';
import Spinner from "@/Components/Spinner/Spinner";

const DECK_API_BASE_URL = 'https://deckofcardsapi.com/api/deck';
const DECK_COUNT = 1;
const CARD_PLACEMENT_COOLDOWN = 500;

interface GameState {
    deckId: string | null;
    remainingCount: number;
    middlePile: Card[];
    usedPile: Card[];
    currentTurn: number;
    gameStarted: boolean;
    gameOver: string | null;
}

interface PlayerState {
    id: number;
    name: string;
    handCards: Card[];
    upCards: Card[];
    downCards: Card[];
}

export default function Multiplayer({ auth, gameId, initialPlayers }: { auth: any; gameId: string; initialPlayers: any[] }) {
    const [gameState, setGameState] = useState<GameState>({
        deckId: null,
        remainingCount: 0,
        middlePile: [],
        usedPile: [],
        currentTurn: initialPlayers[0]?.id,
        gameStarted: false,
        gameOver: null
    });

    const [playerState, setPlayerState] = useState<PlayerState>({
        id: auth.user.id,
        name: auth.user.name,
        handCards: [],
        upCards: [],
        downCards: []
    });

    const [opponentState, setOpponentState] = useState<PlayerState>({
        id: initialPlayers.find(p => p.id !== auth.user.id)?.id,
        name: initialPlayers.find(p => p.id !== auth.user.id)?.name,
        handCards: [],
        upCards: [],
        downCards: []
    });

    const [isLoading, setIsLoading] = useState(true);
    const { isOnCooldown, startCooldown } = useCardCooldown(CARD_PLACEMENT_COOLDOWN);
    const [hasReceivedInitialState, setHasReceivedInitialState] = useState(false);

    useEffect(() => {
        const channel = window.Echo.join(`game.${gameId}`)
            .here((users: any[]) => {
                console.log('Players in game:', users);
            })
            .joining((user: any) => {
                console.log('Player joined:', user);
            })
            .leaving((user: any) => {
                console.log('Player left:', user);
                setGameState(prev => ({
                    ...prev,
                    gameOver: 'disconnect'
                }));
            })
            .listen('.game.initial-state', (data: {
                gameState: GameState;
                playerStates: Record<number, PlayerState>;
            }) => {
                setGameState(data.gameState);

                // Set player states based on received data
                const currentPlayerState = data.playerStates[auth.user.id];
                const otherPlayerId = Object.keys(data.playerStates)
                    .find(id => Number(id) !== auth.user.id);

                if (currentPlayerState && otherPlayerId) {
                    setPlayerState(currentPlayerState);
                    setOpponentState(data.playerStates[Number(otherPlayerId)]);
                    setHasReceivedInitialState(true);
                    setIsLoading(false);
                }
            })
            .listenForWhisper('game-state-update', (newState: any) => {
                setGameState(newState.gameState);
                if (newState.playerState.id === auth.user.id) {
                    setPlayerState(newState.playerState);
                } else {
                    setOpponentState(newState.playerState);
                }
            });

        return () => {
            window.Echo.leave(`game.${gameId}`);
        };
    }, [gameId, auth.user.id]);

    useEffect(() => {
        const initializeGame = async () => {
            if (auth.user.id === initialPlayers[0].id) { // Only owner initializes the deck
                try {
                    setIsLoading(true);
                    const response = await axios.get<DeckResponse>(`${DECK_API_BASE_URL}/new/shuffle/?deck_count=${DECK_COUNT}`);
                    const deckId = response.data.deck_id;

                    // Deal initial cards
                    const player1Cards = await dealInitialCards(deckId);
                    const player2Cards = await dealInitialCards(deckId);

                    const initialGameState = {
                        deckId,
                        remainingCount: response.data.remaining,
                        middlePile: [],
                        usedPile: [],
                        currentTurn: initialPlayers[0].id,
                        gameStarted: true,
                        gameOver: null
                    };

                    // Broadcast initial game state using a public channel event
                    window.Echo.private(`game.${gameId}`).whisper('game.initial-state', {
                        gameState: initialGameState,
                        playerStates: {
                            [initialPlayers[0].id]: {
                                ...player1Cards,
                                id: initialPlayers[0].id,
                                name: initialPlayers[0].name
                            },
                            [initialPlayers[1].id]: {
                                ...player2Cards,
                                id: initialPlayers[1].id,
                                name: initialPlayers[1].name
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error initializing game:', error);
                    setIsLoading(false);
                }
            }
        };

        if (gameId && !gameState.gameStarted && !hasReceivedInitialState) {
            initializeGame();
        }
    }, [gameId, gameState.gameStarted, hasReceivedInitialState, auth.user.id, initialPlayers]);

    const dealInitialCards = async (deckId: string) => {
        const handCards = await drawCards(deckId, 3);
        const upCards = await drawCards(deckId, 3);
        const downCards = await drawCards(deckId, 3);
        return { handCards, upCards, downCards };
    };

    const drawCards = async (deckId: string, count: number) => {
        const response = await axios.get<DrawResponse>(`${DECK_API_BASE_URL}/${deckId}/draw/?count=${count}`);
        return response.data.cards;
    };

    const handleCardPlacement = async (cards: Card | Card[]) => {
        if (!isYourTurn() || isOnCooldown) return;

        const cardArray = Array.isArray(cards) ? cards : [cards];
        if (!isValidMove(cardArray[0])) {
            // Pick up pile
            const newPlayerState = {
                ...playerState,
                handCards: [...playerState.handCards, ...gameState.middlePile]
            };
            const newGameState = {
                ...gameState,
                middlePile: [],
                currentTurn: opponentState.id
            };

            broadcastGameUpdate(newGameState, newPlayerState);
            return;
        }

        startCooldown();
        const newGameState = {
            ...gameState,
            middlePile: [...gameState.middlePile, ...cardArray],
            currentTurn: opponentState.id
        };

        const newPlayerState = removeCardsFromPlayer(cardArray);
        broadcastGameUpdate(newGameState, newPlayerState);
    };

    const broadcastGameUpdate = (newGameState: GameState, newPlayerState: PlayerState) => {
        window.Echo.join(`game.${gameId}`).whisper('card-played', {
            playerId: auth.user.id,
            newGameState,
            newPlayerState
        });

        setGameState(newGameState);
        setPlayerState(newPlayerState);
    };

    const removeCardsFromPlayer = (cards: Card[]) => {
        const newPlayerState = { ...playerState };
        cards.forEach(card => {
            if (playerState.handCards.some(c => c.code === card.code)) {
                newPlayerState.handCards = playerState.handCards.filter(c => c.code !== card.code);
            } else if (playerState.upCards.some(c => c.code === card.code)) {
                newPlayerState.upCards = playerState.upCards.filter(c => c.code !== card.code);
            } else if (playerState.downCards.some(c => c.code === card.code)) {
                newPlayerState.downCards = playerState.downCards.filter(c => c.code !== card.code);
            }
        });
        return newPlayerState;
    };

    const isYourTurn = () => gameState.currentTurn === auth.user.id;

    const isValidMove = (card: Card) => {
        if (card.value === '6' || card.value === '10') return true;
        const topCard = gameState.middlePile[gameState.middlePile.length - 1];
        return !topCard || getCardValue(card) >= getCardValue(topCard);
    };

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Spinner />
                </div>
            )}
            {!isLoading && (
                <div className="flex flex-col items-center gap-5 pt-12">
                    <div className="text-xl mb-4">
                        {isYourTurn() ? "Your Turn" : `${opponentState.name}'s Turn`}
                    </div>
                    <OpponentCards
                        handCards={opponentState.handCards}
                        downCards={opponentState.downCards}
                        upCards={opponentState.upCards}
                        isOpponentTurn={!isYourTurn()}
                    />
                    <div className="flex items-center gap-6">
                        <RemainingPile remainingCount={gameState.remainingCount} />
                        <MiddlePile middlePile={gameState.middlePile} />
                        <UsedPile usedPile={gameState.usedPile} />
                    </div>
                    <MyCards
                        handCards={playerState.handCards}
                        downCards={playerState.downCards}
                        upCards={playerState.upCards}
                        handleCardPlacement={handleCardPlacement}
                        isValidMove={isValidMove}
                        disabled={!isYourTurn() || isOnCooldown}
                    />
                </div>
            )}
        </Layout>
    );
}

function useCardCooldown(cooldownTime: number) {
    const [isOnCooldown, setIsOnCooldown] = useState(false);

    const startCooldown = useCallback(() => {
        setIsOnCooldown(true);
        setTimeout(() => {
            setIsOnCooldown(false);
        }, cooldownTime);
    }, [cooldownTime]);

    return { isOnCooldown, startCooldown };
}
