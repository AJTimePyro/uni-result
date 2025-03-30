'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Star, Telescope } from 'lucide-react';

interface CosmicButtonProps {
    onClick: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    loadingText?: string;
    className?: string;
}

const CosmicButton: React.FC<CosmicButtonProps> = ({
    onClick,
    disabled = false,
    children = 'Cosmic Button',
    loadingText = 'Loading...',
    className = ''
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const textRef = useRef<HTMLSpanElement>(null);
    const loadingTextRef = useRef<HTMLSpanElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [fixedWidth, setFixedWidth] = useState<number>(0);

    useEffect(() => {
        if (textRef.current && loadingTextRef.current) {
            const contentWidth = Math.max(
                textRef.current.offsetWidth,
                loadingTextRef.current.offsetWidth
            );
            setFixedWidth(contentWidth + 60); // Extra padding to account for button padding
        }
    }, [children, loadingText]);

    const handleClick = () => {
        setIsLoading(true);
        try {
            onClick();
        } finally {
            setIsLoading(false);
        }
    };

    const buttonText = children || 'Cosmic Button';

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            disabled={isLoading || disabled}
            className={`relative group cursor-pointer overflow-hidden px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 ${className}`}
            type="button"
            style={{ width: `${fixedWidth}px` }}
        >
            <div className="absolute inset-0 w-full h-full">
                <Star className="absolute text-white/20 w-4 h-4 animate-pulse" style={{ top: '20%', left: '10%' }} />
                <Star className="absolute text-white/20 w-3 h-3 animate-pulse" style={{ top: '50%', left: '80%', animationDelay: '0.5s' }} />
                <Star className="absolute text-white/20 w-2 h-2 animate-pulse" style={{ top: '70%', left: '30%', animationDelay: '1s' }} />
            </div>

            <span ref={textRef} className="absolute opacity-0 pointer-events-none">{buttonText}</span>
            <span ref={loadingTextRef} className="absolute opacity-0 pointer-events-none">{loadingText}</span>

            <div className="relative flex items-center justify-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isLoading || disabled ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Telescope className="w-5 h-5" />
                    )}
                </div>

                <span className="inline-block text-center w-full">
                    {isLoading || disabled ? loadingText : buttonText}
                </span>
            </div>

            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </button>
    );
};

export default CosmicButton;