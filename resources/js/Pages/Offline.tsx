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
const CARD_PLACEMENT_COOLDOWN = 500; // milliseconds between card placements

const useCardCooldown = (cooldownTime: number) => {
    const [isOnCooldown, setIsOnCooldown] = useState(false);

    const startCooldown = useCallback(() => {
        setIsOnCooldown(true);
        setTimeout(() => {
            setIsOnCooldown(false);
        }, cooldownTime);
    }, [cooldownTime]);

    return { isOnCooldown, startCooldown };
};

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
    const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<'player' | 'bot' | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { isOnCooldown, startCooldown } = useCardCooldown(CARD_PLACEMENT_COOLDOWN);

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
        const cardArray = Array.isArray(cards) ? cards : [cards];
        const sameValue = cardArray.every(card => card.value === cardArray[0].value);

        if (!sameValue) {
            console.error('Cards must have the same value for multiple placement');
            return;
        }

        const topCard = middlePile[middlePile.length - 1];
        const isSpecialCard = cardArray[0].value === '6' || cardArray[0].value === '10';
        const newMiddlePile = [...middlePile, ...cardArray];
        const fourOfAKind = newMiddlePile.filter(card => card.value === cardArray[0].value).length === 4;

        if (!topCard || getCardValue(cardArray[0]) >= getCardValue(topCard) || isSpecialCard) {
            if (cardArray[0].value === '10' || fourOfAKind) {
                setUsedPile([...usedPile, ...newMiddlePile]);
                setMiddlePile([]);
                // Keep turn if playing a 10
                if (!fourOfAKind && cardArray[0].value !== '10') {
                    setIsPlayerTurn(player === 'player' ? false : true);
                }
            } else {
                const updatedCards = cardArray.map(card => ({
                    ...card,
                    offsetX: Math.random() * 10 - 5,
                    offsetY: Math.random() * 10 - 5,
                    rotation: Math.random() * 20 - 10
                }));
                setMiddlePile([...middlePile, ...updatedCards]);
                setIsPlayerTurn(player === 'player' ? false : true);
            }

            const updateCards = (cards: Card[], setCards: React.Dispatch<React.SetStateAction<Card[]>>) => {
                const remainingCards = cards.filter(c => !cardArray.some(placedCard => placedCard.code === c.code));
                setCards(remainingCards);
                return remainingCards;
            };

            if (player === 'player') {
                let remainingHandCards = playerHandCards;
                if (cardArray.every(card => playerHandCards.some(c => c.code === card.code))) {
                    remainingHandCards = updateCards(playerHandCards, setPlayerHandCards);

                    // Draw cards if needed after playing (including after playing a 10)
                    if (remainingCount > 0 && remainingHandCards.length < 3) {
                        const cardsNeeded = Math.min(3 - remainingHandCards.length, remainingCount);
                        if (cardsNeeded > 0) {
                            const newCards = await drawCards(cardsNeeded);
                            setPlayerHandCards(prevHandCards => [...prevHandCards, ...newCards]);
                        }
                    }
                } else if (cardArray.every(card => playerUpCards.some(c => c.code === card.code)) && playerHandCards.length === 0) {
                    updateCards(playerUpCards, setPlayerUpCards);
                } else if (cardArray.every(card => playerDownCards.some(c => c.code === card.code)) && playerHandCards.length === 0 && playerUpCards.length === 0) {
                    updateCards(playerDownCards, setPlayerDownCards);
                }
            } else {
                let remainingBotHandCards = botHandCards;
                if (cardArray.every(card => botHandCards.some(c => c.code === card.code))) {
                    remainingBotHandCards = updateCards(botHandCards, setBotHandCards);

                    // Draw cards if needed after playing (including after playing a 10)
                    if (remainingCount > 0 && remainingBotHandCards.length < 3) {
                        const cardsNeeded = Math.min(3 - remainingBotHandCards.length, remainingCount);
                        if (cardsNeeded > 0) {
                            const newCards = await drawCards(cardsNeeded);
                            setBotHandCards(prevHandCards => [...prevHandCards, ...newCards]);
                        }
                    }
                } else if (cardArray.every(card => botUpCards.some(c => c.code === card.code))) {
                    updateCards(botUpCards, setBotUpCards);
                } else if (cardArray.every(card => botDownCards.some(c => c.code === card.code))) {
                    updateCards(botDownCards, setBotDownCards);
                }
            }
        }
    };

    const playerMove = (cards: Card | Card[]) => {
        if (!isPlayerTurn || isOnCooldown || isBotThinking) return;

        const cardArray = Array.isArray(cards) ? cards : [cards];
        if (cardArray.every(card => isValidMove(card))) {
            startCooldown();
            handleCardPlacement(cardArray, 'player');
        } else {
            startCooldown();
            setPlayerHandCards([...playerHandCards, ...middlePile]);
            setMiddlePile([]);
            setIsPlayerTurn(false);
        }
    };

    useEffect(() => {
        if (!isPlayerTurn) {
            setIsBotThinking(true);
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
                    setBotHandCards([...botHandCards, ...middlePile]);
                    setMiddlePile([]);
                    setIsPlayerTurn(true);
                }
                setIsBotThinking(false);
            };
            setTimeout(botMove, 1000);
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
        if(!gameStarted) return;

        if (playerHandCards.length === 0 && playerUpCards.length === 0 && playerDownCards.length === 0) {
            setGameOver('player');
        } else if (botHandCards.length === 0 && botUpCards.length === 0 && botDownCards.length === 0) {
            setGameOver('bot');
        }
    }, [gameStarted, playerHandCards, playerUpCards, playerDownCards, botHandCards, botUpCards, botDownCards]);

    const isValidMove = (card: Card) => {
        if (card.value === '6' || card.value === '10') return true;
        const topCard = middlePile[middlePile.length - 1];
        return !topCard || getCardValue(card) >= getCardValue(topCard);
    };

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
                        disabled={isOnCooldown || !isPlayerTurn || isBotThinking}
                    />
                    {!isPlayerTurn && isBotThinking && (
                        <div className="text-gray-600 mt-2">Bot is thinking...</div>
                    )}
                </div>
            )}
        </Layout>
    );
}
