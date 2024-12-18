import React, { useEffect, useState } from 'react';
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

export default function Offline({ auth }: { auth: any }) {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [remainingCount, setRemainingCount] = useState<number>(0);
    const [playerDownCards, setPlayerDownCards] = useState<Card[]>([]);
    const [playerUpCards, setPlayerUpCards] = useState<Card[]>([]);
    const [playerHandCards, setPlayerHandCards] = useState<Card[]>([]);
    const [botDownCards, setBotDownCards] = useState<Card[]>([]);
    const [botUpCards, setBotUpCards] = useState<Card[]>([]);
    const [botHandCards, setBotHandCards] = useState<Card[]>([]);
    const [middlePile, setMiddlePile] = useState<Card[]>([]);
    const [usedPile, setUsedPile] = useState<Card[]>([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
    const [gameOver, setGameOver] = useState<'player' | 'bot' | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeDeck = async () => {
            const response = await axios.get<DeckResponse>(`${DECK_API_BASE_URL}/new/shuffle/?deck_count=${DECK_COUNT}`);
            setDeckId(response.data.deck_id);
            setRemainingCount(response.data.remaining);
        };
        initializeDeck().catch(console.error);
    }, []);

    const drawCards = async (count: number) => {
        if (deckId) {
            const response = await axios.get<DrawResponse>(`${DECK_API_BASE_URL}/${deckId}/draw/?count=${count}`);
            setRemainingCount(response.data.remaining);
            return response.data.cards;
        }
        return [];
    };

    useEffect(() => {
        const dealCards = async () => {
            setIsLoading(true);
            const playerDown = await drawCards(3);
            const playerUp = await drawCards(3);
            const playerHand = await drawCards(3);
            const botDown = await drawCards(3);
            const botUp = await drawCards(3);
            const botHand = await drawCards(3);

            setPlayerDownCards(playerDown);
            setPlayerUpCards(playerUp);
            setPlayerHandCards(playerHand);
            setBotDownCards(botDown);
            setBotUpCards(botUp);
            setBotHandCards(botHand);

            setGameStarted(true);
            setIsLoading(false);
        };
        if (deckId) {
            dealCards();
        }
    }, [deckId]);

    const handleCardPlacement = async (cards: Card | Card[], player: 'player' | 'bot') => {
        // Ensure we're always working with an array
        const cardArray = Array.isArray(cards) ? cards : [cards];

        // Validate if all cards have the same value
        const sameValue = cardArray.every(card => card.value === cardArray[0].value);
        if (!sameValue) {
            console.error('Cards must have the same value for multiple placement');
            return;
        }

        const topCard = middlePile[middlePile.length - 1];
        const isSpecialCard = cardArray[0].value === '6' || cardArray[0].value === '10';

        // New check for four-of-a-kind rule
        const newMiddlePile = [...middlePile, ...cardArray];
        const fourOfAKind = newMiddlePile.filter(card => card.value === cardArray[0].value).length === 4;

        if (!topCard || getCardValue(cardArray[0]) >= getCardValue(topCard) || isSpecialCard) {
            if (cardArray[0].value === '10' || fourOfAKind) {
                // Clear middle pile for 10 or four-of-a-kind
                setUsedPile([...usedPile, ...newMiddlePile]);
                setMiddlePile([]);

                // If four-of-a-kind, the player who placed the last card keeps their turn
                if (fourOfAKind) {
                    // No turn change
                } else if (cardArray[0].value === '10') {
                    // Normal 10 card behavior
                    setIsPlayerTurn(player === 'player' ? false : true);
                }
            } else {
                // Add cards to middle pile with random offsets
                const updatedCards = cardArray.map(card => ({
                    ...card,
                    offsetX: Math.random() * 10 - 5,
                    offsetY: Math.random() * 10 - 5,
                    rotation: Math.random() * 20 - 10
                }));
                setMiddlePile([...middlePile, ...updatedCards]);

                // Normal turn change
                setIsPlayerTurn(player === 'player' ? false : true);
            }

            // Remove placed cards from appropriate location
            const updateCards = (cards: Card[], setCards: React.Dispatch<React.SetStateAction<Card[]>>) => {
                const remainingCards = cards.filter(c => !cardArray.some(placedCard => placedCard.code === c.code));
                setCards(remainingCards);
            };

            if (player === 'player') {
                if (cardArray.every(card => playerHandCards.some(c => c.code === card.code))) {
                    updateCards(playerHandCards, setPlayerHandCards);
                } else if (cardArray.every(card => playerUpCards.some(c => c.code === card.code)) && playerHandCards.length === 0) {
                    updateCards(playerUpCards, setPlayerUpCards);
                } else if (cardArray.every(card => playerDownCards.some(c => c.code === card.code)) && playerHandCards.length === 0 && playerUpCards.length === 0) {
                    updateCards(playerDownCards, setPlayerDownCards);
                }

                // Draw replacement cards
                if (remainingCount > 0 && playerHandCards.length <= 3 && cardArray[0].value !== '10' && !fourOfAKind) {
                    const newCards = await drawCards(cardArray.length);
                    setPlayerHandCards(prevHandCards => [...prevHandCards, ...newCards]);
                }
            } else {
                // Similar logic for bot
                if (cardArray.every(card => botHandCards.some(c => c.code === card.code))) {
                    updateCards(botHandCards, setBotHandCards);
                } else if (cardArray.every(card => botUpCards.some(c => c.code === card.code))) {
                    updateCards(botUpCards, setBotUpCards);
                } else if (cardArray.every(card => botDownCards.some(c => c.code === card.code))) {
                    updateCards(botDownCards, setBotDownCards);
                }

                // Draw replacement cards
                if (remainingCount > 0 && botHandCards.length <= 3 && cardArray[0].value !== '10' && !fourOfAKind) {
                    const newCards = await drawCards(cardArray.length);
                    setBotHandCards(prevHandCards => [...prevHandCards, ...newCards]);
                }
            }
        } else {
            // Invalid move handling remains the same
        }
    };

    const playerMove = (cards: Card | Card[]) => {
        const cardArray = Array.isArray(cards) ? cards : [cards];
        const sameValue = cardArray.every(card => card.value === cardArray[0].value);

        if (cardArray.every(card => isValidMove(card))) {
            handleCardPlacement(cardArray, 'player');
        } else {
            // Player picks up the middle pile if no valid move
            setPlayerHandCards([...playerHandCards, ...middlePile]);
            setMiddlePile([]);
            setIsPlayerTurn(false);
        }
    };

    useEffect(() => {
        if (!isPlayerTurn) {
            const botMove = () => {
                const validCard = botHandCards.find(card => isValidMove(card));
                const validUpCard = botUpCards.find(card => isValidMove(card));
                const validDownCard = botDownCards.find(card => isValidMove(card));

                if (validCard) {
                    handleCardPlacement(validCard, 'bot');
                } else if (validUpCard && botHandCards.length === 0) {
                    handleCardPlacement(validUpCard, 'bot');
                } else if (validDownCard && botHandCards.length === 0 && botUpCards.length === 0) {
                    handleCardPlacement(validDownCard, 'bot');
                } else {
                    // Bot picks up the middle pile if no valid move
                    setBotHandCards([...botHandCards, ...middlePile]);
                    setMiddlePile([]);
                    setIsPlayerTurn(true);
                }
            };
            setTimeout(botMove, 1000); // Simulate bot thinking time
        }
    }, [isPlayerTurn, botHandCards, botUpCards, botDownCards, middlePile]);

    useEffect(() => {
        if (playerHandCards.length === 0 && playerUpCards.length === 0 && playerDownCards.length > 0) {
            const nextCard = playerDownCards[0];
            setPlayerHandCards([nextCard]);
            setPlayerDownCards(playerDownCards.slice(1));
        }
    }, [playerHandCards, playerUpCards, playerDownCards]);

    useEffect(() => {
        // Check for game over conditions AFTER every state changea
        if(!gameStarted){
            return;
        }
        if (
            playerHandCards.length === 0 &&
            playerUpCards.length === 0 &&
            playerDownCards.length === 0
        ) {
            setGameOver('player');
        } else if (
            botHandCards.length === 0 &&
            botUpCards.length === 0 &&
            botDownCards.length === 0
        ) {
            setGameOver('bot');
        }
    }, [
        playerHandCards,
        playerUpCards,
        playerDownCards,
        botHandCards,
        botUpCards,
        botDownCards
    ]);

    const isValidMove = (card: Card) => {
        if (card.value === '6' || card.value === '10') {
            return true;
        }
        const topCard = middlePile[middlePile.length - 1];
        return !topCard || getCardValue(card) >= getCardValue(topCard);
    };

    // Game over renderer
    const renderGameOver = () => {
        if (!gameOver) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {gameOver === 'player' ? 'Congratulations! You Won!' : 'Game Over! Bot Wins!'}
                    </h2>
                    <p className="text-xl mb-6">
                        {gameOver === 'player'
                            ? 'You successfully got rid of all your cards!'
                            : 'The bot cleared all of its cards before you.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Layout auth={auth}>
            <Head title="Offline" />
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Spinner />
                </div>
            )}
            {renderGameOver()}
            {!isLoading && (
                <div className="flex flex-col items-center gap-5 pt-12">
                    <OpponentCards handCards={botHandCards} downCards={botDownCards} upCards={botUpCards} />
                    <div className="flex items-center gap-6">
                        <RemainingPile remainingCount={remainingCount} />
                        <MiddlePile middlePile={middlePile} />
                        <UsedPile usedPile={usedPile} />
                    </div>
                    <MyCards
                        handCards={playerHandCards}
                        downCards={playerDownCards}
                        upCards={playerUpCards}
                        handleCardPlacement={playerMove}
                        isValidMove={isValidMove}
                    />
                </div>
            )}
        </Layout>
    );
}
