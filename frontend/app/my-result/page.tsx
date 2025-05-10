'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

// Define TypeScript interfaces
interface Subject {
    subject_name: string;
    subject_code: string;
    subject_id: string;
    max_marks: number;
}

interface SemesterResult {
    roll_num: string;
    name: string;
    college_id: string;
    total_marks_scored: string;
    max_marks_possible: string;
    cgpa: string;
    [key: string]: string; // For dynamic subject results
}

interface Results {
    [key: string]: {
        results?: SemesterResult;
        error?: string;
    };
}

interface StudentData {
    subjects: Subject[];
    results: Results;
}


// Mock data based on the provided structure
const mockData: StudentData = {
    "subjects": [
        { "subject_name": "PROGRAMMING IN 'C'", "subject_code": "ES-101", "subject_id": "027101", "max_marks": 100 },
        { "subject_name": "APPLIED CHEMISTRY", "subject_code": "BS-103", "subject_id": "027103", "max_marks": 100 },
        { "subject_name": "APPLIED PHYSICS - I", "subject_code": "BS-105", "subject_id": "027105", "max_marks": 100 },
        { "subject_name": "ELECTRICAL SCIENCE", "subject_code": "ES-107", "subject_id": "027107", "max_marks": 100 },
        { "subject_name": "ENVIRONMENTAL STUDIES", "subject_code": "BS-109", "subject_id": "027109", "max_marks": 100 },
        { "subject_name": "APPLIED MATHEMATICS - I", "subject_code": "BS-111", "subject_id": "027111", "max_marks": 100 },
        { "subject_name": "COMMUNICATIONS SKILLS", "subject_code": "HS-113", "subject_id": "027113", "max_marks": 100 },
        { "subject_name": "INDIAN CONSTITUTION", "subject_code": "HS-115", "subject_id": "027115", "max_marks": 100 },
        { "subject_name": "HUMAN VALUES AND ETHICS", "subject_code": "HS-117", "subject_id": "027117", "max_marks": 100 },
        { "subject_name": "MANUFACTURING PROCESS", "subject_code": "ES-119", "subject_id": "027119", "max_marks": 100 },
        { "subject_name": "PHYSICS - I LAB", "subject_code": "BS-151", "subject_id": "027151", "max_marks": 100 },
        { "subject_name": "PROGRAMMING IN 'C' LAB", "subject_code": "ES-153", "subject_id": "027153", "max_marks": 100 },
        { "subject_name": "APPLIED CHEMISTRY", "subject_code": "BS-155", "subject_id": "027155", "max_marks": 100 },
        { "subject_name": "ENGINEERING GRAPHICS-I", "subject_code": "ES-157", "subject_id": "027157", "max_marks": 100 },
        { "subject_name": "ELECTRICAL SCIENCE LAB", "subject_code": "ES-159", "subject_id": "027159", "max_marks": 100 },
        { "subject_name": "ENVIRONMENTAL STUDIES LAB", "subject_code": "BS-161", "subject_id": "027161", "max_marks": 100 }
    ],
    "results": {
        "1": {
            "results": {
                "roll_num": "05715602722",
                "name": "ADITYA KUMAR JHA",
                "college_id": "156",
                "total_marks_scored": "29",
                "max_marks_possible": "100",
                "cgpa": "0.0",
                "sub_027105": "",
                "sub_027107": "",
                "sub_027111": "[21, 8, 'F', 4]",
                "sub_027119": "",
                "sub_027155": "",
                "sub_027159": "",
                "sub_027101": "",
                "sub_027109": "",
                "sub_027103": "",
                "sub_027115": "",
                "sub_027117": "",
                "sub_027153": "",
                "sub_027113": "",
                "sub_027151": "",
                "sub_027157": "",
                "sub_027161": ""
            }
        },
        "2": {
            "results": {
                "roll_num": "05715602722",
                "name": "ADITYA KUMAR JHA",
                "college_id": "156",
                "total_marks_scored": "582",
                "max_marks_possible": "700",
                "cgpa": "8.3",
                "sub_027105": "[65, 24, 'B', 8]",
                "sub_027107": "[72, 26, 'A', 9]",
                "sub_027111": "[68, 25, 'B', 8]",
                "sub_027119": "[78, 28, 'A', 9]",
                "sub_027155": "[82, 30, 'A', 9]",
                "sub_027159": "[80, 29, 'A', 9]"
            }
        },
        "3": {
            "results": {
                "roll_num": "05715602722",
                "name": "ADITYA KUMAR JHA",
                "college_id": "156",
                "total_marks_scored": "635",
                "max_marks_possible": "800",
                "cgpa": "7.9",
                "sub_027101": "[75, 27, 'B', 8]",
                "sub_027109": "[68, 25, 'B', 8]",
                "sub_027103": "[62, 23, 'C', 7]",
                "sub_027115": "[85, 31, 'A', 9]",
                "sub_027117": "[78, 28, 'A', 9]",
                "sub_027153": "[72, 26, 'B', 8]",
                "sub_027113": "[80, 29, 'A', 9]"
            }
        },
        "4": {
            "results": {
                "roll_num": "05715602722",
                "name": "ADITYA KUMAR JHA",
                "college_id": "156",
                "total_marks_scored": "425",
                "max_marks_possible": "500",
                "cgpa": "8.5",
                "sub_027151": "[88, 32, 'A', 9]",
                "sub_027157": "[82, 30, 'A', 9]",
                "sub_027161": "[85, 31, 'A', 9]",
                "sub_027159": "[78, 28, 'A', 9]",
                "sub_027153": "[92, 33, 'A+', 10]"
            }
        },
        "5": {
            "error": "Error : Student not found"
        }
    }
};

const formatScore = (scoreStr: string) => {
    if (!scoreStr) return null;

    try {
        const scoreArray = JSON.parse(scoreStr.replace(/'/g, '"'));
        return {
            marks: scoreArray[0],
            percentage: scoreArray[1],
            grade: scoreArray[2],
            gradePoint: scoreArray[3]
        };
    } catch (e) {
        return null;
    }
};

// Cosmos background component
const CosmosBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-80">
                {/* Stars */}
                {[...Array(200)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: Math.random() * 2 + 1 + "px",
                            height: Math.random() * 2 + 1 + "px",
                            top: Math.random() * 100 + "%",
                            left: Math.random() * 100 + "%",
                            opacity: Math.random() * 0.8 + 0.2,
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* Nebula effects */}
                <motion.div
                    className="absolute rounded-full bg-purple-500 bg-opacity-10 blur-3xl"
                    style={{
                        width: "40%",
                        height: "40%",
                        top: "10%",
                        left: "20%",
                    }}
                    animate={{
                        opacity: [0.1, 0.15, 0.1],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <motion.div
                    className="absolute rounded-full bg-blue-500 bg-opacity-10 blur-3xl"
                    style={{
                        width: "35%",
                        height: "35%",
                        top: "50%",
                        left: "60%",
                    }}
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.03, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </div>
    );
};

// Student profile component
const StudentProfile = ({ studentData }: { studentData: Student }) => {
    return (
        <motion.div
            className="relative z-10 flex items-center justify-center p-6 mb-8 text-white rounded-lg bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-indigo-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-indigo-500">
                    <div className="w-full h-full flex items-center justify-center bg-indigo-800">
                        <span className="text-2xl font-bold">{studentData.name.charAt(0)}</span>
                    </div>
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                        animate={{
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-2xl font-bold text-white">{studentData.name}</h1>
                    <div className="mt-2 space-y-1 text-indigo-200">
                        <p><span className="text-indigo-400">Roll No:</span> {studentData.roll_num}</p>
                        <p><span className="text-indigo-400">College ID:</span> {studentData.college_id}</p>
                        <p><span className="text-indigo-400">Overall CGPA:</span> {calculateOverallCGPA()}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    function calculateOverallCGPA() {
        // Calculate average CGPA from all available semesters
        let totalCGPA = 0;
        let semesterCount = 0;

        for (const semKey in mockData.results) {

            if (mockData.results[semKey].results?.cgpa) {
                totalCGPA += parseFloat(mockData.results[semKey].results?.cgpa!);
                semesterCount++;
            }
        }

        return semesterCount > 0 ? (totalCGPA / semesterCount).toFixed(2) : "N/A";
    }
};

// Semester selector component
const SemesterSelector = ({ activeSemester, setActiveSemester }: { activeSemester: number, setActiveSemester: (sem: number) => void }) => {
    const availableSemesters = Object.keys(mockData.results)
        .filter(semKey => !mockData.results[semKey].error)
        .map(semKey => parseInt(semKey));

    return (
        <motion.div
            className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {availableSemesters.map((sem) => (
                <button
                    key={sem}
                    onClick={() => setActiveSemester(sem)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeSemester === sem
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-900/40 hover:bg-indigo-800/40 text-indigo-200 backdrop-blur-md'
                        }`}
                >
                    Semester {sem}
                </button>
            ))}
        </motion.div>
    );
};

// Semester summary card component
const SemesterSummary = ({ semesterData }: { semesterData: SemesterResult }) => {
    return (
        <motion.div
            className="relative z-10 p-6 mb-8 text-white rounded-lg bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md border border-blue-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <h2 className="text-xl font-bold mb-4 text-blue-200">Semester Performance</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-900/40 backdrop-blur-sm border border-blue-500/20">
                    <h3 className="text-sm font-medium text-blue-300 mb-1">Total Marks</h3>
                    <p className="text-xl font-bold">{semesterData.total_marks_scored} / {semesterData.max_marks_possible}</p>
                    <p className="text-sm text-blue-300">
                        {Math.round((parseInt(semesterData.total_marks_scored) / parseInt(semesterData.max_marks_possible)) * 100)}% Overall
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-indigo-900/40 backdrop-blur-sm border border-indigo-500/20">
                    <h3 className="text-sm font-medium text-indigo-300 mb-1">CGPA</h3>
                    <p className="text-xl font-bold">{semesterData.cgpa}</p>
                    <div className="flex mt-1">
                        {renderCGPAStars(parseFloat(semesterData.cgpa))}
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-900/40 backdrop-blur-sm border border-purple-500/20">
                    <h3 className="text-sm font-medium text-purple-300 mb-1">Subjects</h3>
                    <p className="text-xl font-bold">{getSubjectsCount(semesterData)}</p>
                    <p className="text-sm text-purple-300">
                        {getPassedSubjectsCount(semesterData)} Passed
                    </p>
                </div>
            </div>
        </motion.div>
    );

    function renderCGPAStars(cgpa: number) {
        const fullStars = Math.floor(cgpa);
        const hasHalfStar = cgpa - fullStars >= 0.5;

        return (
            <div className="flex">
                {[...Array(10)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={`${i < fullStars
                            ? 'text-yellow-400 fill-yellow-400'
                            : i === fullStars && hasHalfStar
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
                    />
                ))}
            </div>
        );
    }

    function getSubjectsCount(semesterData: SemesterResult) {
        return Object.keys(semesterData).filter(key => key.startsWith('sub_') && semesterData[key]).length;
    }

    function getPassedSubjectsCount(semesterData: SemesterResult) {
        let passedCount = 0;

        Object.keys(semesterData).forEach(key => {
            if (key.startsWith('sub_') && semesterData[key]) {
                const score = formatScore(semesterData[key]);
                if (score && score.grade !== 'F') {
                    passedCount++;
                }
            }
        });

        return passedCount;
    }
};

// Subject card component
const SubjectCard = ({ subjectId, subjectScore, subjectInfo }: { subjectId: string, subjectScore: string, subjectInfo?: Subject }) => {
    if (!subjectScore) return null;

    const score = formatScore(subjectScore);
    if (!score) return null;

    const subject = subjectInfo || {
        subject_name: "Unknown Subject",
        subject_code: subjectId.replace('sub_', '')
    };

    // Determine background color based on grade
    const getBgColor = () => {
        switch (score.grade) {
            case 'A+': return 'from-emerald-900/40 to-green-900/40 border-emerald-500/30';
            case 'A': return 'from-green-900/40 to-teal-900/40 border-green-500/30';
            case 'B': return 'from-blue-900/40 to-indigo-900/40 border-blue-500/30';
            case 'C': return 'from-indigo-900/40 to-purple-900/40 border-indigo-500/30';
            case 'D': return 'from-amber-900/40 to-orange-900/40 border-amber-500/30';
            case 'F': return 'from-red-900/40 to-rose-900/40 border-red-500/30';
            default: return 'from-gray-900/40 to-slate-900/40 border-gray-500/30';
        }
    };

    const getTextColor = () => {
        switch (score.grade) {
            case 'A+': return 'text-emerald-200';
            case 'A': return 'text-green-200';
            case 'B': return 'text-blue-200';
            case 'C': return 'text-indigo-200';
            case 'D': return 'text-amber-200';
            case 'F': return 'text-red-200';
            default: return 'text-gray-200';
        }
    };

    return (
        <motion.div
            className={`relative z-10 p-4 text-white rounded-lg bg-gradient-to-br ${getBgColor()} backdrop-blur-md border`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold truncate max-w-3/4" title={subject.subject_name}>
                    {subject.subject_name}
                </h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${score.grade === 'F' ? 'bg-red-900/60 text-red-100' :
                    score.grade === 'A+' ? 'bg-emerald-900/60 text-emerald-100' :
                        'bg-blue-900/60 text-blue-100'
                    }`}>
                    {score.grade}
                </span>
            </div>

            <p className="text-sm text-blue-200 mb-2">{subject.subject_code}</p>

            <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                    <p className="text-xs text-gray-400">Marks</p>
                    <p className={`font-medium ${getTextColor()}`}>{score.marks}/100</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Percentage</p>
                    <p className={`font-medium ${getTextColor()}`}>{score.percentage}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Grade Point</p>
                    <p className={`font-medium ${getTextColor()}`}>{score.gradePoint}/10</p>
                </div>
            </div>

            {/* Circular progress indicator */}
            <div className="mt-3 relative h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className={`absolute top-0 left-0 h-full rounded-full ${score.grade === 'F' ? 'bg-red-500' :
                        score.grade === 'A+' ? 'bg-emerald-500' :
                            score.grade === 'A' ? 'bg-green-500' :
                                score.grade === 'B' ? 'bg-blue-500' :
                                    score.grade === 'C' ? 'bg-indigo-500' :
                                        'bg-amber-500'
                        }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
            </div>
        </motion.div>
    );
};

// Performance chart component
const PerformanceChart = () => {
    const cgpaData: { semester: number, cgpa: number }[] = [];
    const marksData: { semester: number, percentage: number }[] = [];

    Object.keys(mockData.results).forEach(semKey => {
        if (!mockData.results[semKey].error && mockData.results[semKey].results) {
            const semData = mockData.results[semKey].results;
            cgpaData.push({
                semester: parseInt(semKey),
                cgpa: parseFloat(semData?.cgpa || '0')
            });

            const totalMarks = parseInt(semData?.total_marks_scored || '0');
            const maxMarks = parseInt(semData?.max_marks_possible || '0');
            marksData.push({
                semester: parseInt(semKey),
                percentage: (totalMarks / maxMarks) * 100
            });
        }
    });

    return (
        <motion.div
            className="relative z-10 p-6 mb-8 text-white rounded-lg bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            <h2 className="text-xl font-bold mb-6 text-purple-200">Performance Trends</h2>

            <div className="flex flex-col space-y-4">
                <div className="h-24 relative">
                    <div className="absolute top-0 left-0 text-xs text-purple-300">CGPA</div>
                    <div className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-800/50" />

                    <div className="flex justify-between items-end h-full pt-6 pb-2">
                        {cgpaData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <motion.div
                                    className="w-4 bg-purple-500 rounded-t-sm"
                                    style={{ height: `${(data.cgpa / 10) * 100}%` }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(data.cgpa / 10) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.6 + (index * 0.1) }}
                                />
                                <div className="mt-1 text-xs text-purple-300">S{data.semester}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-24 relative">
                    <div className="absolute top-0 left-0 text-xs text-indigo-300">Percentage</div>
                    <div className="absolute left-0 bottom-0 w-full h-0.5 bg-indigo-800/50" />

                    <div className="flex justify-between items-end h-full pt-6 pb-2">
                        {marksData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <motion.div
                                    className="w-4 bg-indigo-500 rounded-t-sm"
                                    style={{ height: `${data.percentage}%` }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${data.percentage}%` }}
                                    transition={{ duration: 1, delay: 0.8 + (index * 0.1) }}
                                />
                                <div className="mt-1 text-xs text-indigo-300">S{data.semester}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Main function component
export default function StudentResultsPage() {
    const [activeSemester, setActiveSemester] = useState(1);
    const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});

    useEffect(() => {
        // Create subject ID to subject info mapping
        const map: Record<string, Subject> = {};
        mockData.subjects.forEach(subject => {
            map[subject.subject_id] = subject;
        });
        setSubjectMap(map);

        // Find first valid semester
        let firstValidSem = 1;
        while (mockData.results[firstValidSem]?.error && firstValidSem <= 8) {
            firstValidSem++;
        }

        if (firstValidSem <= 8 && !mockData.results[firstValidSem]?.error) {
            setActiveSemester(firstValidSem);
        }
    }, []);

    const semesterData = mockData.results[activeSemester]?.results;
    const hasError = mockData.results[activeSemester]?.error;

    return (
        <div className="min-h-screen text-white relative bg-black overflow-hidden">
            {/* Cosmos Background */}
            <CosmosBackground />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 relative z-10">
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

                {/* Student Profile */}
                {semesterData && <StudentProfile studentData={semesterData} />}

                {/* Semester Selection */}
                <SemesterSelector
                    activeSemester={activeSemester}
                    setActiveSemester={setActiveSemester}
                />

                {/* Semester Summary */}
                {hasError ? (
                    <motion.div
                        className="p-6 mb-8 text-center text-red-200 rounded-lg bg-red-900/30 backdrop-blur-md border border-red-500/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-bold mb-2">No Data Available</h2>
                        <p>{mockData.results[activeSemester].error}</p>
                    </motion.div>
                ) : (
                    <>
                        {semesterData && <SemesterSummary semesterData={semesterData} />}

                        {/* Performance Chart */}
                        <PerformanceChart />

                        {/* Subject Cards */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            {semesterData && Object.keys(semesterData)
                                .filter(key => key.startsWith('sub_') && semesterData[key])
                                .map((subjectKey) => {
                                    const subjectId = subjectKey.replace('sub_', '');
                                    return (
                                        <SubjectCard
                                            key={subjectKey}
                                            subjectId={subjectKey}
                                            subjectScore={semesterData[subjectKey]}
                                            subjectInfo={subjectMap[subjectId]}
                                        />
                                    );
                                })}
                        </motion.div>
                    </>
                )}
            </div>

            {/* Footer */}
            <motion.footer
                className="py-4 text-center text-indigo-400 text-sm relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                <p>&copy; {new Date().getFullYear()} Cosmos University Portal</p>
            </motion.footer>
        </div>
    );
}