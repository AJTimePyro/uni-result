import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-indigo-300" size={20} />
            </div>
            <input
                type="text"
                placeholder="Explore students by name or cosmic identifier"
                value={value}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-indigo-900/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
}
