'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StudentProfile from '@/components/ui/StudentProfileCard';
import SemesterSelector from '@/components/ui/SemesterSelector';
import SemesterSummary from '@/components/layouts/SemesterSummary';
import SubjectCard from '@/components/ui/SubjectCard';
import PerformanceChart from '@/components/layouts/PerformanceChart';

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

export default function StudentResultClientSide() {
    const [activeSemester, setActiveSemester] = useState(1);
    const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});
    const [studentRes, setStudentRes] = useState<Results>(mockData.results);
    const [subjectData, setSubjectData] = useState<Subject[]>(mockData.subjects);

    useEffect(() => {
        // Create subject ID to subject info mapping
        const map: Record<string, Subject> = {};
        subjectData.forEach(subject => {
            map[subject.subject_id] = subject;
        });
        setSubjectMap(map);

        // Find first valid semester
        let firstValidSem = 1;
        while (studentRes[firstValidSem]?.error) {
            firstValidSem++;
        }

        if (!studentRes[firstValidSem]?.error) {
            setActiveSemester(firstValidSem);
        }
    }, []);

    const semesterData = studentRes[activeSemester]?.results;

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

            {/* Student Profile */}
            {semesterData && <StudentProfile studentActiveSemRes={semesterData} overallCGPA={calculateOverallCGPA()} />}

            {/* Semester Selection */}
            <SemesterSelector
                activeSemester={activeSemester}
                setActiveSemester={setActiveSemester}
                studentResult={mockData}
            />

            {semesterData && <SemesterSummary semesterData={semesterData} />}

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

            {/* Performance Chart */}
            <PerformanceChart studentResult={studentRes} />
        </div>
    );
}