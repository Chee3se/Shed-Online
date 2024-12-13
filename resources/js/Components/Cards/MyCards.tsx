import React, { useState, useEffect, useCallback } from 'react';
import MultiCardNotification from '@/Components/Cards/MultiCardNotification';
import Card from './Card';
import { Card as CardType } from '@/types';

interface MyCardsProps {
    handCards: CardType[];
    downCards: CardType[];
    upCards: CardType[];
    handleCardPlacement: (cards: CardType | CardType[], player: 'player' | 'bot') => void;
    isValidMove: (card: CardType) => boolean;
}

const MyCards: React.FC<MyCardsProps> = ({
                                             handCards,
                                             downCards,
                                             upCards,
                                             handleCardPlacement,
                                             isValidMove
                                         }) => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
    const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

    // Handle Shift key events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey) {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.shiftKey) {
                setIsShiftPressed(false);
                setSelectedCards([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Group cards by value for easy same-value card identification
    const cardGroups = handCards.reduce((acc, card) => {
        if (!acc[card.value]) {
            acc[card.value] = [];
        }
        acc[card.value].push(card);
        return acc;
    }, {} as Record<string, CardType[]>);

    const getCardStyle = (index: number, total: number, card?: CardType) => {
        const baseStyle = {
            transform: `${ total < 6 ? `rotate(${(index - (total - 1) / 2) * (total > 3 ? 20 / total : 10)}deg) translateX(${(index - (total - 1) / 2) * (total > 3 ? 150 / total : 50)}px)` : `translateX(${(index - (total - 1) / 2) * (30)}px)`}`,
            margin: '0 5px',
            transition: 'transform 0.2s ease-in-out',
        };

        // Additional styling for selected cards when Shift is pressed
        if (isShiftPressed && card && selectedCards.includes(card)) {
            return {
                ...baseStyle,
                transform: `${baseStyle.transform} translateY(-30px)`,
                zIndex: 10,
            };
        }

        return baseStyle;
    };

    const handleCardClick = (card: CardType) => {
        if (isShiftPressed) {
            // When Shift is pressed, handle multiple same-value cards
            const sameValueCards = cardGroups[card.value] || [];

            // If all same-value cards are selected, deselect all
            const allSameSelected = sameValueCards.every(c => selectedCards.includes(c));

            if (allSameSelected) {
                setSelectedCards([]);
            } else {
                // Select all cards with the same value
                setSelectedCards(sameValueCards);
            }
        } else {
            // Normal single card placement
            handleCardPlacement(card, 'player');
        }
    };

    const handleShiftCardPlacement = () => {
        if (isShiftPressed && selectedCards.length > 0) {
            // Validate that all selected cards are valid moves
            if (selectedCards.every(card => isValidMove(card))) {
                // Place all selected cards
                handleCardPlacement(selectedCards, 'player');
                setSelectedCards([]);
            }
        }
    };

    return (

        <div className="flex flex-col items-center gap-2">
            <div className="">
                {isShiftPressed && selectedCards.length > 0 && (
                    <MultiCardNotification
                        message={`Press to place ${selectedCards.length} cards ${selectedCards[0].value}'s` || ''}
                        isVisible={true}
                    />
                )}
            </div>

            <div className="flex gap-2">
                {downCards.map((card, index) => (
                    <div key={index} className="relative w-24 h-36">
                        <Card
                            card={{ code: 'back', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }}
                            cardType="down"
                        />
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
            <div
                className="relative w-72 h-36 flex justify-center"
                onClick={handleShiftCardPlacement}
            >
                {handCards.map((card, index) => (
                    <Card
                        key={card.code}
                        card={card}
                        className={`absolute ${
                            isShiftPressed && selectedCards.includes(card)
                                ? 'border-4 border-blue-500 rounded-lg'
                                : ''
                        }`}
                        style={getCardStyle(index, handCards.length, card)}
                        onClick={() => handleCardClick(card)}
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
