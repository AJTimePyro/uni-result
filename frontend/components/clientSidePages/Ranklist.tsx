'use client'

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RankListFilters from "../layouts/RankListFilters";
import { motion } from "framer-motion";
import TopPerformers from "../layouts/TopPerformers";
import RanklistTable from "../ui/RanklistTable";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, fetchRanklistResult } from "@/queries";

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

export default function RankListClientSide() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [requestJson, setRequestJson] = useState<RankListRequestJSON>({
        uniName: '',
        batchYear: 0,
        degreeID: '',
        collegeID: '',
        semNum: 0,
        degreeDocID: ''
    });

    const { data, isFetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.rankList(requestJson),
        queryFn: () => fetchRanklistResult(requestJson),
        enabled: false
    })

    useEffect(() => {
        console.log(isFetching)
    }, [isFetching])

    const callBackFetchResult = (requestJson: RankListRequestJSON) => {
        setRequestJson(requestJson)
        refetch()
    }

    const filteredData = useMemo(() => {
        return mockRanklistData.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNumber.includes(searchQuery)
        );
    }, [searchQuery]);

    return (
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

            <RankListFilters callBackFetchResult={callBackFetchResult} />

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
    )
}