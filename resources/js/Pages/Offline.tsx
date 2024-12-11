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
        };
        if (deckId) {
            dealCards();
        }
    }, [deckId]);

    const handleCardPlacement = async (card: Card, player: 'player' | 'bot') => {
        const topCard = middlePile[middlePile.length - 1];
        const isSpecialCard = card.value === '6' || card.value === '10';

        if (!topCard || getCardValue(card) >= getCardValue(topCard) || isSpecialCard) {
            if (card.value === '10') {
                setUsedPile([...usedPile, ...middlePile, card]); // Move middle pile to used pile
                setMiddlePile([]); // Clear the middle pile for card 10
            } else {
                setMiddlePile([...middlePile, card]);
            }

            const updateCards = (cards: Card[], setCards: React.Dispatch<React.SetStateAction<Card[]>>) => {
                setCards(cards.filter(c => c.code !== card.code));
            };

            if (player === 'player') {
                if (playerHandCards.includes(card)) {
                    updateCards(playerHandCards, setPlayerHandCards);
                } else if (playerUpCards.includes(card) && playerHandCards.length === 0) {
                    updateCards(playerUpCards, setPlayerUpCards);
                } else if (playerDownCards.includes(card) && playerHandCards.length === 0 && playerUpCards.length === 0) {
                    updateCards(playerDownCards, setPlayerDownCards);
                }
                if (card.value !== '10') {
                    setIsPlayerTurn(false);
                }

                // Draw one more card into the player's hand if there are cards remaining
                if (remainingCount > 0 && playerHandCards.length <= 3) {
                    const cards = await drawCards(1);
                    setPlayerHandCards(prevHandCards => [...prevHandCards, ...cards]);
                    setRemainingCount(remainingCount - 1);
                }
            } else {
                if (botHandCards.includes(card)) {
                    updateCards(botHandCards, setBotHandCards);
                } else if (botUpCards.includes(card) && botHandCards.length === 0) {
                    updateCards(botUpCards, setBotUpCards);
                } else if (botDownCards.includes(card) && botHandCards.length === 0 && botUpCards.length === 0) {
                    updateCards(botDownCards, setBotDownCards);
                }
                if (card.value !== '10') {
                    setIsPlayerTurn(true);
                }

                // Draw one more card into the player's hand if there are cards remaining
                if (remainingCount > 0 && botHandCards.length <= 3) {
                    const cards = await drawCards(1);
                    setBotHandCards(prevHandCards => [...prevHandCards, ...cards]);
                    setRemainingCount(remainingCount - 1);
                }
            }
        } else {
            // Handle invalid move
        }
    };

    const playerMove = (card: Card) => {
        if (isValidMove(card)) {
            handleCardPlacement(card, 'player');
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
                if (validCard) {
                    handleCardPlacement(validCard, 'bot');
                } else if (botHandCards.length === 0 && validUpCard) {
                    handleCardPlacement(validUpCard, 'bot');
                } else {
                    // Bot picks up the middle pile if no valid move
                    setBotHandCards([...botHandCards, ...middlePile]);
                    setMiddlePile([]);
                    setIsPlayerTurn(true);
                }
            };
            setTimeout(botMove, 1000); // Simulate bot thinking time
        }
    }, [isPlayerTurn, botHandCards, middlePile]);

    useEffect(() => {
        if (playerHandCards.length === 0 && playerUpCards.length === 0 && playerDownCards.length > 0) {
            const nextCard = playerDownCards[0];
            setPlayerHandCards([nextCard]);
            setPlayerDownCards(playerDownCards.slice(1));
        }
    }, [playerHandCards, playerUpCards, playerDownCards]);

    const isValidMove = (card: Card) => {
        if (card.value === '6' || card.value === '10') {
            return true;
        }
        const topCard = middlePile[middlePile.length - 1];
        return !topCard || getCardValue(card) >= getCardValue(topCard);
    };

    return (
        <Layout auth={auth}>
            <Head title="Offline" />
            <div className="flex flex-col items-center gap-5 pt-12">
                <OpponentCards handCards={botHandCards} downCards={botDownCards} upCards={botUpCards} />
                <div className="flex items-center gap-6">
                    <RemainingPile remainingCount={remainingCount} />
                    <MiddlePile middlePile={middlePile} />
                    <UsedPile usedPile={usedPile} />
                </div>
                <MyCards handCards={playerHandCards} downCards={playerDownCards} upCards={playerUpCards} handleCardPlacement={playerMove} isValidMove={isValidMove} />
            </div>
        </Layout>
    );
}
