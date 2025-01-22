import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card as CardType } from '@/types';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import MyCards from '@/Components/Cards/MyCards';
import OpponentCards from '@/Components/Cards/OpponentCards';
import MiddlePile from '@/Components/Cards/MiddlePile';
import RemainingPile from '@/Components/Cards/RemainingPile';
import UsedPile from '@/Components/Cards/UsedPile';

const Multiplayer: React.FC = ({ auth, code }) => {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [remainingCount, setRemainingCount] = useState<number>(0);
    const [playerHandCards, setPlayerHandCards] = useState<CardType[]>([]);
    const [playerDownCards, setPlayerDownCards] = useState<CardType[]>([]);
    const [playerUpCards, setPlayerUpCards] = useState<CardType[]>([]);
    const [opponentHandCards, setOpponentHandCards] = useState<CardType[]>([]);
    const [opponentDownCards, setOpponentDownCards] = useState<CardType[]>([]);
    const [opponentUpCards, setOpponentUpCards] = useState<CardType[]>([]);
    const [middlePile, setMiddlePile] = useState<CardType[]>([]);
    const [usedPile, setUsedPile] = useState<CardType[]>([]);

    useEffect(() => {
        const initializeDeck = async () => {
            try {
                const response = await axios.post('/generate-deck');
                setDeckId(response.data.deck_id);
                setRemainingCount(response.data.remaining);
            } catch (error) {
                console.error('Failed to create deck:', error);
            }
        };

        initializeDeck();
    }, []);


    useEffect(() => {
        if (!deckId) return;

        const dealCards = async () => {
            try {
                // Draw cards for the player
                const playerCards = await drawCards(deckId, 9); // 3 face-down, 3 face-up, 3 in-hand
                setPlayerDownCards(playerCards.slice(0, 3));
                setPlayerUpCards(playerCards.slice(3, 6));
                setPlayerHandCards(playerCards.slice(6, 9));

                // Draw cards for the opponent
                const opponentCards = await drawCards(deckId, 9); // 3 face-down, 3 face-up, 3 in-hand
                setOpponentDownCards(opponentCards.slice(0, 3));
                setOpponentUpCards(opponentCards.slice(3, 6));
                setOpponentHandCards(opponentCards.slice(6, 9));
            } catch (error) {
                console.error('Failed to deal cards:', error);
            }
        };

        dealCards();
    }, [deckId]);


    const drawCards = async (deckId: string, count: number): Promise<CardType[]> => {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
        setRemainingCount(response.data.remaining);
        return response.data.cards;
    };

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer" />
            <div className="flex flex-col items-center gap-5 pt-12">
                {/* Opponent's cards */}
                <OpponentCards
                    handCards={opponentHandCards}
                    downCards={opponentDownCards}
                    upCards={opponentUpCards}
                />

                {/* Middle pile, remaining pile, and used pile */}
                <div className="flex items-center gap-6">
                    <RemainingPile remainingCount={remainingCount} />
                    <MiddlePile middlePile={middlePile} />
                    <UsedPile usedPile={usedPile} />
                </div>

                {/* Player's cards */}

                <MyCards
                    handCards={playerHandCards}
                    downCards={playerDownCards}
                    upCards={playerUpCards}
                    handleCardPlacement={(cards) => console.log('Cards placed:', cards)}
                    isValidMove={(card) => true}
                    disabled={false}
                />
            </div>
        </Layout>
    );
};

export default Multiplayer;
