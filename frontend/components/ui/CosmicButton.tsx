import { motion } from 'framer-motion';
import { Telescope } from 'lucide-react';

interface CosmicSearchButtonProps {
    onClick: () => void;
    text: string;
    className?: string;
}

const CosmicSearchButton = ({ onClick, text, className = '' }: CosmicSearchButtonProps) => {
    return (
        <motion.button
            onClick={onClick}
            className={`relative px-6 py-3 overflow-hidden font-medium rounded-lg text-white bg-indigo-900 group hover:cursor-pointer ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Subtle cosmic background gradient */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 opacity-80" />

            {/* Stars effect (minimal for performance) */}
            <span className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-white opacity-90" />
            <span className="absolute top-3/4 left-1/3 w-1 h-1 rounded-full bg-white opacity-70" />
            <span className="absolute top-2/4 right-1/4 w-1 h-1 rounded-full bg-white opacity-80" />

            {/* Subtle glow effect */}
            <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out rounded-lg opacity-0 bg-gradient-to-br from-blue-400 via-transparent to-transparent group-hover:opacity-20" />

            {/* Text with space-themed search icon */}
            <div className="flex items-center gap-2">
                <Telescope className="stroke-white" />
                <span className="text-white opacity-100 font-semibold">{text}</span>
            </div>
        </motion.button>
    );
};

export default CosmicSearchButton;