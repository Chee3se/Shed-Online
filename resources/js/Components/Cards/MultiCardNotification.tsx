import React from 'react';

interface MultiCardNotificationProps {
    message: string;
    isVisible: boolean;
}

const MultiCardNotification: React.FC<MultiCardNotificationProps> = ({
                                                                         message,
                                                                         isVisible
                                                                     }) => {
    if (!isVisible) return null;

    return (
        <div
            className="fixed top-20 right-4
               bg-white shadow-lg rounded-lg
               px-8 py-5 text-center z-50
               animate-bounce transition-all duration-300 ease-in-out"
        >
            <p className="text-blue-600 font-semibold text-lg">{message}</p>
        </div>
    );
};

export default MultiCardNotification;
