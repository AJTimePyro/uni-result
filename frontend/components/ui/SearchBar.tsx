import { Search } from 'lucide-react';
import { Dispatch, SetStateAction, ChangeEvent } from 'react';

interface SearchBarProps {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    type?: string;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ value, setValue, type = "text", placeholder = "Enter text", className = "" }: SearchBarProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // If type is number, only allow numeric input
        if (type === "number") {
            // Only allow numeric characters (including decimal points)
            if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
                setValue(newValue);
            }
        } else {
            setValue(newValue);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-indigo-300" size={20} />
            </div>
            <input
                type={type === "number" ? "text" : type} // Use text type for numbers to handle our own validation
                inputMode={type === "number" ? "decimal" : undefined} // Better mobile keyboard for numbers
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-indigo-900/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
        </div>
    );
}