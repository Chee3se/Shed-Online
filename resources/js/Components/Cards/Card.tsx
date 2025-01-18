import React from 'react';
import { Card as CardType } from '@/types';

interface CardProps {
    card: CardType;
    className?: string;
    selected?: boolean;
    style?: React.CSSProperties;
    onClick?: () => void;
    disabled?: boolean;
    isValidMove?: boolean;
    cardType: 'down' | 'up' | 'hand' | 'middle' | 'used';
    hovered?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const Card: React.FC<CardProps> = ({ card, className, selected, style, onClick, isValidMove, cardType, hovered, onMouseEnter, onMouseLeave }) => {
    return (
        <div
            className={`card ${className} ${cardType === 'hand' ? 'cursor-pointer' : ''} ${hovered && cardType === 'hand' ? 'bg-blue-500' : ''} ${selected ? 'bg-yellow-400 ' : ''} ${(isValidMove && cardType === 'hand') ? (hovered ? 'bg-blue-600' : 'bg-green-600') : ''} bg-opacity-30 rounded-xl absolute w-28 p-1.5`}
            style={style}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <img src={card.images.png} alt={card.code} />
        </div>
    );
};

export default Card;
