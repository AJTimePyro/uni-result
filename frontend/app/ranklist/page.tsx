'use client'

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import TopPerformers from '@/components/layouts/TopPerformers';
import RanklistTable from '@/components/ui/RanklistTable';
import RankListFilters from '@/components/layouts/RankListFilters';

const mockRanklistData = [
    {
        rank: 1,
        name: "Aisha Patel",
        rollNumber: "2021CSE001",
        cgpa: 9.8,
        marks: "1200/1500"
    },
    {
        rank: 2,
        name: "Rohan Sharma",
        rollNumber: "2021ECE005",
        cgpa: 9.6,
        marks: "1200/1500"
    },
    {
        rank: 3,
        name: "Priya Gupta",
        rollNumber: "2021MECH010",
        cgpa: 9.5,
        marks: "1200/1500"
    },
    ...Array.from({ length: 47 }, (_, i) => ({
        rank: i + 4,
        name: `Student ${i + 4}`,
        rollNumber: `2021XXX${String(i + 4).padStart(3, '0')}`,
        cgpa: 9.0 - (i * 0.1),
        marks: `${1200 - (i * 50)}/1500`
    }))
];

const CosmicRanklistPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredData = useMemo(() => {
        return mockRanklistData.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNumber.includes(searchQuery)
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white p-6 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="container mx-auto relative z-10 space-y-5">
                <div className="relative col-span-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-indigo-300" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Explore students by name or cosmic identifier"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-indigo-900/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <RankListFilters />

                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500"
                    >
                        Academic Cosmos Leaderboard
                    </motion.h1>

                    <TopPerformers topStudents={mockRanklistData.slice(0, 3)} />

                    <RanklistTable students={filteredData} />
                </div>
            </div>
        </div>
    );
};

export default CosmicRanklistPage;