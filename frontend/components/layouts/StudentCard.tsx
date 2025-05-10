import React, { useState, useMemo, useCallback, memo } from 'react';
import { Star, User, Book, ChevronDown, ChevronUp, Award, Hash, CreditCard, GitMerge, Bookmark } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { getCGPADescription, getGradeDescription, getGradePoint, parseMarkData } from '@/lib/resultUtil';

// interface Student {
//     name: string;
//     roll_num: string;
//     total_marks_scored: number;
//     max_marks_possible: number;
//     cgpa: number;
//     [key: string]: any;
// }

interface SubjectWithMarks extends Subject {
    internal_marks: number;
    external_marks: number;
    grade: string;
    total_marks: number;
    subject_credit: number;
}

interface StudentCardProps {
    studentData: Student;
    subjectsList: Subject[];
    open: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
}

const StudentInfoHeader = memo(({ name, rollNum }: { name: string, rollNum: string }) => (
    <div className="mb-4 sm:mb-0 w-full sm:w-auto">
        <h2 className="text-2xl font-bold text-white flex items-center">
            <User size={20} className="mr-2 text-blue-300" />
            {name}
        </h2>
        <p className="text-sm text-blue-300 flex items-center mt-1">
            <Bookmark size={16} className="mr-2" />
            Roll: {rollNum}
        </p>
    </div>
));

const ScoreSummary = memo(({ totalScore, maxScore, cgpa }: { totalScore: string, maxScore: string, cgpa: string }) => (
    <div className="mt-5 p-4 bg-gray-900 bg-opacity-40 backdrop-blur-sm rounded-lg grid grid-cols-3 gap-4">
        <div>
            <p className="text-sm text-blue-300">Percentage</p>
            <p className="text-xl font-bold text-white">{isNaN(parseFloat(totalScore)) || isNaN(parseFloat(maxScore)) ? 0 : (parseFloat(totalScore)/parseFloat(maxScore) * 100).toFixed(2)} %</p>
        </div>
        <div>
            <p className="text-sm text-blue-300">CGPA</p>
            <p className="text-xl font-bold text-white">{cgpa || 0}</p>
        </div>
        <div>
            <p className="text-sm text-blue-300">Total Marks</p>
            <p className="text-xl font-bold text-white">{totalScore}/{maxScore}</p>
        </div>
    </div>
));

const SubjectDetails = memo(({
    subject,
    isExpanded,
    onToggle,
    index
}: {
    subject: SubjectWithMarks,
    isExpanded: boolean,
    onToggle: (index: number) => void,
    index: number
}) => (
    <div
        className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-700 transition-colors duration-200"
    >
        <div
            onClick={() => onToggle(index)}
            className={`p-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer
            hover:bg-gray-700 transition-colors duration-200
            ${isExpanded ? 'bg-gray-700' : ''}`}
        >
            <div className="flex-1 mb-3 sm:mb-0 w-full sm:w-auto">
                <h4 className="font-medium text-white">{subject.subject_name}</h4>
                <p className="text-sm text-blue-300">{subject.subject_code}</p>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center space-x-6">
                    <div className="text-center">
                        <p className="text-sm text-blue-300">Total</p>
                        <p className="font-bold text-white">{subject.total_marks}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-blue-300">Grade</p>
                        <p className="font-bold text-white">{subject.grade}</p>
                    </div>
                </div>
                <div className="text-blue-400 ml-4">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
        </div>

        {isExpanded && (
            <div className="px-5 pb-5 text-gray-300 border-t border-gray-700">
                <div className="pt-4 pl-3 border-l-2 border-blue-500 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                            <Hash size={14} className="mr-2 text-blue-400" />
                            <span>ID: {subject.subject_id}</span>
                        </div>
                        <div className="flex items-center">
                            <CreditCard size={14} className="mr-2 text-blue-400" />
                            <span>Credits: {subject.subject_credit}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-blue-300 mb-1">Internal Marks</p>
                            <p>{subject.internal_marks}</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-300 mb-1">External Marks</p>
                            <p>{subject.external_marks}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-blue-300 mb-1">Grade Details</p>
                        <p className="flex items-center">
                            <GitMerge size={14} className="mr-2 text-blue-400" />
                            <span>{subject.grade} - {getGradeDescription(subject.grade)} ({getGradePoint(subject.grade)} points)</span>
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
));

const SubjectsList = memo(({
    subjects,
    expandedSubject,
    onToggleSubject
}: {
    subjects: SubjectWithMarks[],
    expandedSubject: number | null,
    onToggleSubject: (index: number) => void
}) => (
    <div className="px-6 my-6 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium text-blue-400 flex items-center sticky top-0 bg-gray-900 py-2 z-10">
            <Book size={18} className="mr-2" />
            Subjects & Marks
        </h3>

        <div className="space-y-4 mt-3">
            {subjects.map((subject, index) => (
                <SubjectDetails
                    key={subject.subject_id}
                    subject={subject}
                    isExpanded={expandedSubject === index}
                    onToggle={onToggleSubject}
                    index={index}
                />
            ))}
        </div>
    </div>
));

const CardHeader = memo(({
    studentData
}: {
    studentData: Student
}) => (
    <div className="relative px-6 py-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 border-b border-blue-600">
        <div className="flex flex-col sm:flex-row items-center justify-between">
            <StudentInfoHeader name={studentData.name} rollNum={studentData.roll_num} />

            <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center">
                <Star className="text-yellow-300" size={28} />
            </div>
        </div>

        <ScoreSummary
            totalScore={studentData.total_marks_scored}
            maxScore={studentData.max_marks_possible}
            cgpa={studentData.cgpa}
        />

        <div className="mt-4 flex justify-end">
            <div className="flex items-center bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2 rounded-full">
                <Award size={16} className="mr-2 text-yellow-300" />
                <span className="text-white font-medium">
                    {getCGPADescription(studentData.cgpa)}
                </span>
            </div>
        </div>
    </div>
));

const CardContent = memo(({
    studentData,
    combinedSubjectData,
    expandedSubject,
    toggleSubject
}: {
    studentData: Student,
    combinedSubjectData: SubjectWithMarks[],
    expandedSubject: number | null,
    toggleSubject: (index: number) => void
}) => (
    <div className="w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        <CardHeader studentData={studentData} />

        <SubjectsList
            subjects={combinedSubjectData}
            expandedSubject={expandedSubject}
            onToggleSubject={toggleSubject}
        />
    </div>
));

StudentInfoHeader.displayName = "StudentInfoHeader";
ScoreSummary.displayName = "ScoreSummary";
SubjectDetails.displayName = "SubjectDetails";
SubjectsList.displayName = "SubjectsList";
CardHeader.displayName = "CardHeader";
CardContent.displayName = "CardContent";

export default function StudentCard({ studentData, subjectsList, open, setIsModalOpen }: StudentCardProps) {
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

    // Combine the data for display
    const combinedSubjectData = useMemo(() => {
        return subjectsList
            .filter(subject => studentData[`sub_${subject.subject_id}`])
            .map(subject => {
                const subKey = `sub_${subject.subject_id}`;
                const markData = parseMarkData(studentData[subKey] as string || "[0, 0, 'F', 0]");

                return {
                    ...subject,
                    internal_marks: markData.internal,
                    external_marks: markData.external,
                    grade: markData.grade,
                    subject_credit: markData.credit,
                    total_marks: markData.internal + markData.external
                };
            });
    }, [studentData, subjectsList]);

    const toggleSubject = useCallback((index: number) => {
        setExpandedSubject(prevState => prevState === index ? null : index);
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setIsModalOpen(false);
        }
    }, [setIsModalOpen]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-transparent border-none shadow-2xl p-0 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
                <DialogHeader className="sr-only">
                    <DialogTitle>Student Card</DialogTitle>
                </DialogHeader>

                <CardContent
                    studentData={studentData}
                    combinedSubjectData={combinedSubjectData}
                    expandedSubject={expandedSubject}
                    toggleSubject={toggleSubject}
                />
            </DialogContent>
        </Dialog>
    );
}