'use client'

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RankListFilters from "../layouts/RankListFilters";
import { motion } from "framer-motion";
import TopPerformers from "../layouts/TopPerformers";
import RanklistTable from "../ui/RanklistTable";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, fetchRanklistResult } from "@/queries";
import StudentCard from "../layouts/StudentCard";

const mockRanklistData: StudentWithRank[] = [
    {
        rank: 1,
        name: "Aisha Patel",
        roll_num: "2021CSE001",
        cgpa: '9.8',
        total_marks_scored: '1200',
        max_marks_possible: '1500'
    },
    {
        rank: 2,
        name: "Rohan Sharma",
        roll_num: "2021ECE005",
        cgpa: '9.6',
        total_marks_scored: '1200',
        max_marks_possible: '1500'
    },
    {
        rank: 3,
        name: "Priya Gupta",
        roll_num: "2021MECH010",
        cgpa: '9.5',
        total_marks_scored: '1200',
        max_marks_possible: '1500'
    },
    ...Array.from({ length: 47 }, (_, i) => ({
        rank: i + 4,
        name: `Student ${i + 4}`,
        roll_num: `2021XXX${String(i + 4).padStart(3, '0')}`,
        cgpa: `${9.0 - (i * 0.1)}`,
        total_marks_scored: `${1200 - (i * 50)}`,
        max_marks_possible: '1500'
    }))
];

export default function RankListClientSide() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [requestJson, setRequestJson] = useState<RankListRequestJSON>({
        college_id: '',
        degree_doc_id: '',
        result_file_id: ''
    });
    const [rankListResult, setRankListResult] = useState<StudentWithRank[]>(mockRanklistData)
    const [shouldRefetch, setShouldRefetch] = useState(false)
    const [subjectData, setSubjectData] = useState<Subject[]>([])
    const [studentModalOpen, setStudentModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

    const { data, isSuccess, isFetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.rankList(requestJson),
        queryFn: () => fetchRanklistResult(requestJson),
        enabled: false
    })

    useEffect(() => {
        if (shouldRefetch) {
            refetch()
            setShouldRefetch(false)
        }
    }, [shouldRefetch])

    useEffect(() => {
        if (isSuccess) {
            setRankListResult(data.result)
            setSubjectData(data.subjects)
        }
    }, [isSuccess])

    const callBackFetchResult = (requestJson: RankListRequestJSON) => {
        setRequestJson(requestJson)
        setShouldRefetch(true)
    }

    const filteredStudents = useMemo(() => {
        return rankListResult.slice(3).filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.roll_num.includes(searchQuery)
        );
    }, [searchQuery, rankListResult]);

    return (
        <div className="mx-auto relative z-10 space-y-5">
            <div className="relative space-y-5 max-md:p-6">
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
                <RankListFilters isButtonLoading={isFetching} callBackFetchResult={callBackFetchResult} />
            </div>

            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-12 px-4 md:px-0 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500"
                >
                    Academic Cosmos Leaderboard
                </motion.h1>

                <TopPerformers topStudents={rankListResult?.slice(0, 3)} setSelectedStudent={setSelectedStudent} setIsModalOpen={setStudentModalOpen} />

                <RanklistTable students={filteredStudents} setSelectedStudent={setSelectedStudent} setIsModalOpen={setStudentModalOpen} />
            </div>

            {
                studentModalOpen &&
                <StudentCard
                    studentData={selectedStudent!}
                    subjectsList={subjectData}
                    open={studentModalOpen}
                    setIsModalOpen={setStudentModalOpen}
                />
            }
        </div>
    )
}