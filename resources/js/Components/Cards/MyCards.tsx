import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface MyCardsProps {
    handCards: CardType[];
    downCards: CardType[];
    upCards: CardType[];
    handleCardPlacement: (card: CardType, player: 'player' | 'bot') => void;
}

const MyCards: React.FC<MyCardsProps> = ({ handCards, downCards, upCards, handleCardPlacement }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
                {downCards.map((card, index) => (
                    <div key={index} className="relative w-24 h-36">
                        <Card card={{ code: 'back', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }} />
                        <Card card={upCards[index]} className="top-5" />
                    </div>
                ))}
            </div>
            <div className="relative w-72 h-36 flex justify-center">
                {handCards.map((card, index) => (
                    <Card
                        key={card.code}
                        card={card}
                        className={`transform ${index === 0 ? '-rotate-12 translate-x-4 translate-y-2' : index === 1 ? 'rotate-0' : 'rotate-12 -translate-x-4 translate-y-2'}`}
                        style={{ left: `${index * 100}px` }}
                        onClick={() => handleCardPlacement(card, 'player')}
                    />
                ))}
            </div>
        </div>
    );
};

export default MyCards;
