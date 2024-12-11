import { Card } from './types';

export const getCardValue = (card: Card): number => {
    if (card.value === '6') return 1;
    if (card.value === '10') return 10;
    const values: { [key: string]: number } = {
        "ACE": 14, "KING": 13, "QUEEN": 12, "JACK": 11,
        "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2
    };
    return values[card.value];
};
