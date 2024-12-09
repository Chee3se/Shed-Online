import React, { useEffect, useState } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import MyCards from '@/Components/Cards/MyCards';
import OpponentCards from '@/Components/Cards/OpponentCards';
import MiddlePile from '@/Components/Cards/MiddlePile';
import { Card, DeckResponse, DrawResponse } from '@/types';
import { getCardValue } from '@/utils';

const DECK_API_BASE_URL = 'https://deckofcardsapi.com/api/deck';
const DECK_COUNT = 1;

export default function Offline({ auth }: { auth: any }) {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [playerDownCards, setPlayerDownCards] = useState<Card[]>([]);
    const [playerUpCards, setPlayerUpCards] = useState<Card[]>([]);
    const [playerHandCards, setPlayerHandCards] = useState<Card[]>([]);
    const [botDownCards, setBotDownCards] = useState<Card[]>([]);
    const [botUpCards, setBotUpCards] = useState<Card[]>([]);
    const [botHandCards, setBotHandCards] = useState<Card[]>([]);
    const [middlePile, setMiddlePile] = useState<Card[]>([]);

    useEffect(() => {
        const initializeDeck = async () => {
            const response = await axios.get<DeckResponse>(`${DECK_API_BASE_URL}/new/shuffle/?deck_count=${DECK_COUNT}`);
            setDeckId(response.data.deck_id);
        };
        initializeDeck().catch(console.error);
    }, []);

    useEffect(() => {
        const drawCards = async (count: number) => {
            if (deckId) {
                const response = await axios.get<DrawResponse>(`${DECK_API_BASE_URL}/${deckId}/draw/?count=${count}`);
                return response.data.cards;
            }
            return [];
        };
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

    const handleCardPlacement = (card: Card, player: 'player' | 'bot') => {
        const topCard = middlePile[middlePile.length - 1];
        if (!topCard || getCardValue(card) >= getCardValue(topCard)) {
            setMiddlePile([...middlePile, card]);
            if (player === 'player') {
                setPlayerHandCards(playerHandCards.filter(c => c.code !== card.code));
            } else {
                setBotHandCards(botHandCards.filter(c => c.code !== card.code));
            }
        } else {
            alert("You can only place a card of the same or higher value.");
        }
    };

    return (
        <Layout auth={auth}>
            <Head title="Offline" />
            <div className="flex flex-col items-center gap-5 pt-12">
                <OpponentCards handCards={botHandCards} downCards={botDownCards} upCards={botUpCards} />
                <MiddlePile middlePile={middlePile} />
                <MyCards handCards={playerHandCards} downCards={playerDownCards} upCards={playerUpCards} handleCardPlacement={handleCardPlacement} />
            </div>
        </Layout>
    );
}
