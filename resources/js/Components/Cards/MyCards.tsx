import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey) {
                setIsShiftPressed(true);
            }

            // Handle space key for placing selected cards
            if (e.code === 'Space' && isShiftPressed && selectedCards.length > 0) {
                e.preventDefault(); // Prevent default space key behavior
                if (selectedCards.every(card => isValidMove(card))) {
                    handleCardPlacement(selectedCards, 'player');
                    setSelectedCards([]);
                }
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
    }, [isShiftPressed, selectedCards, isValidMove, handleCardPlacement]);

    const cardGroups = handCards.reduce((acc, card) => {
        if (!acc[card.value]) {
            acc[card.value] = [];
        }
        acc[card.value].push(card);
        return acc;
    }, {} as Record<string, CardType[]>);

    const getCardStyle = (index: number, total: number, card?: CardType) => {
        const baseStyle = {
            transform: `${total < 6 ? `rotate(${(index - (total - 1) / 2) * (total > 3 ? 20 / total : 10)}deg) translateX(${(index - (total - 1) / 2) * (total > 3 ? 150 / total : 50)}px)` : `translateX(${(index - (total - 1) / 2) * (30)}px)`}`,
            margin: '0 5px',
            transition: 'transform 0.2s ease-in-out',
        };

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
            const isCardAlreadySelected = selectedCards.includes(card);

            if (isCardAlreadySelected) {
                // If the card is already selected, remove it
                setSelectedCards(prevSelected =>
                    prevSelected.filter(selectedCard => selectedCard !== card)
                );
            } else {
                // If the card is not selected, check if it matches the existing selection's value
                const hasExistingSelection = selectedCards.length > 0;

                if (!hasExistingSelection || selectedCards[0].value === card.value) {
                    // Add the card to selected cards
                    setSelectedCards(prevSelected => [...prevSelected, card]);
                }
            }
        } else {
            handleCardPlacement(card, 'player');
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="">
                {isShiftPressed && selectedCards.length > 0 && (
                    <MultiCardNotification
                        message={`Press SPACE to place ${selectedCards.length} cards ${selectedCards[0].value}'s` || ''}
                        isVisible={true}
                    />
                )}
            </div>

            <div className="flex gap-2">
                {downCards.map((card, index) => (
                    <div key={index} className="relative w-24 h-36">
                        <Card
                            card={{ code: 'back', image: 'https://deckofcardsapi.com/static/img/back.png', images: { png: 'https://deckofcardsapi.com/static/img/back.png', svg: '' }, value: '', suit: '' }}
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
            <div className="relative w-72 h-36 flex justify-center">
                {handCards.map((card, index) => (
                    <Card
                        key={card.code}
                        card={card}
                        selected={isShiftPressed && selectedCards.includes(card)}
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
