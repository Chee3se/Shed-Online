import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface MiddlePileProps {
    middlePile: CardType[];
}

const MiddlePile: React.FC<MiddlePileProps> = ({ middlePile }) => {
    const getRandomOffset = () => {
        const offset = Math.random() * 10 - 5; // Random value between -5 and 5
        return `${offset}px`;
    };

    const getRandomRotation = () => {
        const rotation = Math.random() * 20 - 10; // Random value between -10 and 10 degrees
        return `rotate(${rotation}deg)`;
    };

    return (
        <div className="relative w-24 h-36">
            {middlePile.map((card, index) => (
                <Card
                    key={index}
                    card={card}
                    style={{
                        top: getRandomOffset(),
                        left: getRandomOffset(),
                        transform: getRandomRotation()
                    }}
                />
            ))}
        </div>
    );
};

export default MiddlePile;
