import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface MiddlePileProps {
    middlePile: CardType[];
}

const MiddlePile: React.FC<MiddlePileProps> = ({ middlePile }) => {
    return (
        <div className="relative w-24 h-36">
            {middlePile.map((card, index) => (
                <Card
                    key={index}
                    card={card}
                    style={{
                        top: `${card.offsetY}px`,
                        left: `${card.offsetX}px`,
                        transform: `rotate(${card.rotation}deg)`
                    }}
                    cardType="middle"
                />
            ))}
        </div>
    );
};

export default MiddlePile;
