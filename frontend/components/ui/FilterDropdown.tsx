import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface RanklistFilterDropdownProps {
    options: string[];
    selectedValue: string;
    label: DropdownKey;
    onSelect: (value: string) => void;
    isActive: boolean;
    toggleDropdown: (label: DropdownKey) => void;
}

const RanklistFilterDropdown: React.FC<RanklistFilterDropdownProps> = ({
    options,
    selectedValue,
    label,
    onSelect,
    isActive,
    toggleDropdown,
}) => {
    const isDisabled = options.length === 0 || (options.length === 1 && !options[0]);

    return (
        <div className="relative">
            <button
                onClick={() => !isDisabled && toggleDropdown(label)}
                disabled={isDisabled}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition border border-indigo-700/50 
                ${isDisabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : isActive ? "bg-indigo-800" : "bg-indigo-900/50 hover:bg-indigo-800"}`}
            >
                {selectedValue || `Select ${label}`}
                <ChevronDown
                    size={20}
                    className={`transform transition-transform ${isActive ? "rotate-180" : ""} ${isDisabled ? "opacity-50" : ""}`}
                />
            </button>

            {isActive && !isDisabled && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-20 mt-2 w-full bg-indigo-900 rounded-lg shadow-2xl border border-indigo-700 max-h-60 overflow-y-auto"
                >
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => onSelect(option)}
                            className="px-4 py-3 hover:bg-indigo-800 cursor-pointer border-b border-indigo-700/30 last:border-b-0"
                        >
                            {option}
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default RanklistFilterDropdown;
