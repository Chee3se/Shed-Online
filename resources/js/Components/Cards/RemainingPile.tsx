import React from 'react';

interface RemainingPileProps {
    remainingCount: number;
}

const RemainingPile: React.FC<RemainingPileProps> = ({ remainingCount }) => {
    return (
        <div className="relative w-24 h-36 flex flex-col items-center justify-center bg-gray-200 rounded-lg">
            <div className="text-xl font-bold">{remainingCount}</div>
            <div className="text-sm">Cards Left</div>
        </div>
    );
};

export default RemainingPile;
