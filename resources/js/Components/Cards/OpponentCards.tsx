import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface OpponentCardsProps {
    handCards: CardType[];
    downCards: CardType[];
    upCards: CardType[];
}

const OpponentCards: React.FC<OpponentCardsProps> = ({ handCards, downCards, upCards }) => {
    return (
        <div className="flex flex-col items-center gap-2 rotate-180">
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
                        card={{ code: 'back', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }}
                        className={`transform ${index === 0 ? 'rotate-12 translate-x-4 -translate-y-2' : index === 1 ? 'rotate-0' : '-rotate-12 -translate-x-4 -translate-y-2'}`}
                        style={{ left: `${index * 100}px` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default OpponentCards;
