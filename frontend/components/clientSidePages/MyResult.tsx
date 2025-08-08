'use client'

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import StudentProfile from '@/components/ui/StudentProfileCard';
import SemesterSelector from '@/components/ui/SemesterSelector';
import SemesterSummary from '@/components/layouts/SemesterSummary';
import SubjectCard from '@/components/ui/SubjectCard';
import PerformanceChart from '@/components/layouts/PerformanceChart';
import SearchBar from '../ui/SearchBar';
import CosmicButton from '../ui/CosmicButton';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, fetchStudentResult } from '@/queries';

interface StudentResultProps {
    studentRes: Results;
    subjectData: Subject[];
}

function StudentResult({ studentRes, subjectData }: StudentResultProps) {
    const [activeSemesterNum, setActiveSemesterNum] = useState(1);
    const [activeSemesterData, setActiveSemesterData] = useState<SemesterResult>({
        roll_num: '',
        name: '',
        college_id: '',
        total_marks_scored: '',
        max_marks_possible: '',
        cgpa: ''
    });
    const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});

    useEffect(() => {
        // Create subject ID to subject info mapping
        const map: Record<string, Subject> = {};
        subjectData.forEach(subject => {
            map[subject.subject_id] = subject;
        });
        setSubjectMap(map);
    }, [subjectData]);

    useEffect(() => {
        // Find first valid semester
        let firstValidSem = 1;
        for (const semKey in studentRes) {
            if (studentRes[semKey].results) {
                setActiveSemesterNum(firstValidSem);
                break;
            }
            firstValidSem++;
        }
    }, [studentRes]);

    useEffect(() => {
        if (studentRes[activeSemesterNum]?.results) {
            setActiveSemesterData(studentRes[activeSemesterNum].results!);
        }
    }, [activeSemesterNum]);

    const calculateOverallCGPA = () => {
        let totalCGPA = 0;
        let semesterCount = 0;

        for (const semKey in studentRes) {
            if (studentRes[semKey].results?.cgpa) {
                totalCGPA += parseFloat(studentRes[semKey].results?.cgpa || '0');
                semesterCount++;
            }
        }

        return semesterCount > 0 ? (totalCGPA / semesterCount).toFixed(2) : "N/A";
    }

    if (!activeSemesterData) return (
        <p className="text-center text-red-500">Student Result not found</p>
    )

    return (
        <section>
            <StudentProfile studentActiveSemRes={activeSemesterData} overallCGPA={calculateOverallCGPA()} />
            <SemesterSelector
                activeSemester={activeSemesterNum}
                setActiveSemester={setActiveSemesterNum}
                studentResult={studentRes}
            />
            <SemesterSummary semesterData={activeSemesterData} />

            {/* Subject Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {Object.keys(activeSemesterData)
                    .filter(key => key.startsWith('sub_') && activeSemesterData[key])
                    .map((subjectKey) => {
                        const subjectId = subjectKey.replace('sub_', '');
                        return (
                            <SubjectCard
                                key={subjectKey}
                                subjectId={subjectKey}
                                subjectScore={activeSemesterData[subjectKey]}
                                subjectInfo={subjectMap[subjectId]}
                            />
                        );
                    })}
            </motion.div>

            <PerformanceChart studentResult={studentRes} />
        </section>
    );
}

export default function StudentResultClientSide() {
    const [studentResultNSub, setStudentResultNSub] = useState<StudentData>({
        subjects: [],
        results: {}
    });
    const [searchRollNumQuery, setSearchRollNumQuery] = useState<string>('');
    const [shouldRefetch, setShouldRefetch] = useState(false);

    const { data, isSuccess, isFetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.student(searchRollNumQuery),
        queryFn: () => fetchStudentResult(searchRollNumQuery),
        enabled: false
    })

    useEffect(() => {
        if (data) {
            setStudentResultNSub(data)
        }
    }, [isSuccess])

    useEffect(() => {
        if (shouldRefetch) {
            refetch()
            setShouldRefetch(false)
        }
    }, [shouldRefetch])

    const callBackFetchResult = useCallback(() => {
        setShouldRefetch(true)
    }, [searchRollNumQuery])

    return (
        <div className="min-h-screen text-white overflow-hidden container mx-auto px-4 py-8 z-10">
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Cosmic Academic Results
                </h1>
                <p className="text-indigo-300 mt-2">Exploring your academic journey across the stars</p>
            </motion.div>

            <form
                className="flex items-center justify-between gap-5 sm:gap-10 w-auto mb-10"
                onSubmit={(e) => {
                    e.preventDefault()
                    callBackFetchResult()
                }}
            >
                <SearchBar
                    value={searchRollNumQuery}
                    setValue={setSearchRollNumQuery}
                    placeholder="Search by roll number"
                    type="number"
                    className="w-full"
                />

                <CosmicButton
                    onClick={callBackFetchResult}
                    className="w-max"
                    loadingText="Fetching..."
                    disabled={isFetching}
                >
                    Search
                </CosmicButton>
            </form>

            <StudentResult studentRes={studentResultNSub.results} subjectData={studentResultNSub.subjects} />
        </div>
    )
}