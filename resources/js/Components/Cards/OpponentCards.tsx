import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface OpponentCardsProps {
    handCards: CardType[];
    downCards: CardType[];
    upCards: CardType[];
}

const OpponentCards: React.FC<OpponentCardsProps> = ({ handCards, downCards, upCards }) => {
    const getCardStyle = (index: number, total: number) => {
        const angle = total > 3 ? 20 / total : 10;
        const offset = total > 3 ? 150 / total : 50;
        const rotation = (index - (total - 1) / 2) * angle;
        const translation = (index - (total - 1) / 2) * -offset;
        return {
            transform: `rotate(${rotation}deg) translateX(${translation}px)`,
            margin: '0 5px',
        };
    };

    return (
        <div className="flex flex-col items-center gap-2 rotate-180">
            <div className="flex gap-2">
                {downCards.map((card, index) => (
                    <div key={index} className="relative w-24 h-36">
                        <Card card={{ code: 'back', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }} cardType="down" />
                        <Card card={upCards[index]} className="top-5" cardType="up" />
                    </div>
                ))}
            </div>
            <div className="relative w-72 h-36 flex justify-center">
                {handCards.map((card, index) => (
                    <Card
                        key={card.code}
                        card={{ code: 'back', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }}
                        className="absolute"
                        style={getCardStyle(index, handCards.length)}
                        cardType="hand"
                    />
                ))}
            </div>
        </div>
    );
};

export default OpponentCards;
