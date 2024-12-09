export interface Card {
    code: string;
    images: {
        svg: string;
        png: string;
    };
    value: string;
    suit: string;
}

export interface DeckResponse {
    success: boolean;
    deck_id: string;
    shuffled: boolean;
    remaining: number;
}

export interface DrawResponse {
    success: boolean;
    deck_id: string;
    cards: Card[];
    remaining: number;
}
