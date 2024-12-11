import React from 'react';
import { Card as CardType } from '@/types';
import Card from './Card';

interface UsedPileProps {
    usedPile: CardType[];
}

const UsedPile: React.FC<UsedPileProps> = ({ usedPile }) => {
    return (
        <div className="relative w-24 h-36">
            {usedPile.map((card, index) => (
                <Card
                    key={index}
                    card={{ ...card, images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' } }}
                    style={{
                        top: `${index * 2}px`,
                        left: `${index * 2}px`,
                        zIndex: index,
                    }}
                    cardType="used"
                />
            ))}
        </div>
    );
};

export default UsedPile;
