import React, { useState } from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface MyCardsProps {
    handCards: CardType[];
    downCards: CardType[];
    upCards: CardType[];
    handleCardPlacement: (card: CardType, player: 'player' | 'bot') => void;
    isValidMove: (card: CardType) => boolean;
}

const MyCards: React.FC<MyCardsProps> = ({ handCards, downCards, upCards, handleCardPlacement, isValidMove }) => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const getCardStyle = (index: number, total: number) => ({
        transform: `${ total < 6 ? `rotate(${(index - (total - 1) / 2) * (total > 3 ? 20 / total : 10)}deg) translateX(${(index - (total - 1) / 2) * (total > 3 ? 150 / total : 50)}px)` : `translateX(${(index - (total - 1) / 2) * (30)}px)`}`,
        margin: '0 5px',
    });

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
                {downCards.map((card, index) => (
                    <div key={index} className="relative w-24 h-36">
                        <Card card={{ code: 'back', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }} cardType="down" />
                        {upCards[index] && (
                            <Card
                                card={upCards[index]}
                                className="top-5"
                                cardType="up"
                                isValidMove={isValidMove(upCards[index])}
                                hovered={hoveredCard === upCards[index].code}
                                onMouseEnter={() => setHoveredCard(upCards[index].code)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => handCards.length === 0 && handleCardPlacement(upCards[index], 'player')}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="relative w-72 h-36 flex justify-center">
                {handCards.map((card, index) => (
                    <Card
                        key={card.code}
                        card={card}
                        className="absolute"
                        style={getCardStyle(index, handCards.length)}
                        onClick={() => handleCardPlacement(card, 'player')}
                        isValidMove={isValidMove(card)}
                        cardType="hand"
                        hovered={hoveredCard === card.code}
                        onMouseEnter={() => setHoveredCard(card.code)}
                        onMouseLeave={() => setHoveredCard(null)}
                    />
                ))}
            </div>
        </div>
    );
};

export default MyCards;
