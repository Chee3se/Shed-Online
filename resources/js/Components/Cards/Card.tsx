import React from 'react';
import { Card as CardType } from '@/types';

interface CardProps {
    card: CardType;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ card, className, style, onClick }) => {
    return (
        <img
            src={card.images.png}
            alt={card.code}
            className={`absolute w-24 h-36 ${className}`}
            style={style}
            onClick={onClick}
        />
    );
};

export default Card;
