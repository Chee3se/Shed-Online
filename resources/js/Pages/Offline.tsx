import React, { useEffect, useState } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';

const DECK_API_BASE_URL = 'https://deckofcardsapi.com/api/deck';
const DECK_COUNT = 1;

interface Card {
    code: string;
    images: {
        svg: string;
        png: string;
    };
    value: string;
    suit: string;
}
interface DeckResponse {
    success: boolean;
    deck_id: string;
    shuffled: boolean;
    remaining: number;
}
interface DrawResponse {
    success: boolean;
    deck_id: string;
    cards: Card[];
    remaining: number;
}

export default function Offline({ auth }: { auth: any }) {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [botCards, setBotCards] = useState<Card[]>([]);
    const [tableCards, setTableCards] = useState<Card[]>([]);

    useEffect(() => {
        const initializeDeck = async () => {
            const response = await axios.get<DeckResponse>(`${DECK_API_BASE_URL}/new/shuffle/?deck_count=${DECK_COUNT}`);
            setDeckId(response.data.deck_id);
        };
        initializeDeck();
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
            const playerInitialCards = await drawCards(3);
            const botInitialCards = await drawCards(3);
            setPlayerCards(playerInitialCards);
            setBotCards(botInitialCards);
        };
        if (deckId) {
            dealCards();
        }
    }, [deckId]);

    return (
        <Layout auth={auth}>
            <Head title="Offline" />
            <div className="justify-center items-center w-fit mx-auto pt-40 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                    {botCards.map((card, index) => (
                        <div key={index} className="w-fit">
                            <img src="https://deckofcardsapi.com/static/img/back.png" alt="Back of card"
                                 className="w-32"/>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {playerCards.map((card) => (
                        <div key={card.code} className="w-fit">
                            <img src={card.images.png} alt={card.code} className="w-32"/>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
);
}
