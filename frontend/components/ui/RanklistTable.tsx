import { useState } from "react";
import StudentCard from "../layouts/StudentCard";

interface RanklistTableProps {
    subjects: Subject[];
    students: Student[];
}

const RanklistTable: React.FC<RanklistTableProps> = ({ subjects, students }: RanklistTableProps) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    //box view for small screens 
    const renderMobileCard = () => {
        return students.slice(3).map((student) => (
            <div
                key={student.roll_num}
                className="bg-indigo-900/20 p-4 rounded-lg mb-3 border border-indigo-700/30 hover:bg-indigo-900/40 transition cursor-pointer"
                onClick={() => {
                    setSelectedStudent(student);
                    setIsModalOpen(true);
                }}
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium">{student.name}</span>
                    <span className={`font-bold ${student.rank <= 10 ? "text-purple-400" : ""}`}>
                        Rank: {student.rank}
                    </span>
                </div>
                <div className="text-sm text-indigo-300">{student.roll_num}</div>
                <div className="flex justify-between mt-2 text-sm">
                    <span>Marks: {student.total_marks_scored}/{student.max_marks_possible}</span>
                    <span className="font-semibold">CGPA: {student.cgpa.toFixed(2)}</span>
                </div>
            </div>
        ));
    }

    //table view for larger screens
    const renderTable = () => {
        return (
            <table className="w-full">
                <thead className="bg-indigo-900/50">
                    <tr>
                        <th className="p-4 text-left">Cosmic Rank</th>
                        <th className="p-4 text-left">Stellar Name</th>
                        <th className="p-4 text-left">Cosmic Identifier</th>
                        <th className="p-4 text-left">Marks</th>
                        <th className="p-4 text-right">CGPA</th>
                    </tr>
                </thead>
                <tbody>
                    {students.slice(3).map((student) => (
                        <tr
                            key={student.roll_num}
                            className="border-b border-indigo-700/30 hover:bg-indigo-900/20 transition cursor-pointer"
                            onClick={() => {
                                setSelectedStudent(student);
                                setIsModalOpen(true);
                            }}
                        >
                            <td className="p-4 font-semibold">
                                {student.rank <= 3 ? (
                                    <span className="px-3 py-1 rounded-full text-white">
                                        {student.rank}
                                    </span>
                                ) : (
                                    student.rank
                                )}
                            </td>
                            <td className="p-4">{student.name}</td>
                            <td className="p-4">{student.roll_num}</td>
                            <td className="p-4">{`${student.total_marks_scored}/${student.max_marks_possible}`}</td>
                            <td className="p-4 text-right font-semibold">{student.cgpa.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    return (
        <div className="bg-indigo-900/30 rounded-2xl border border-indigo-700/50">

            <div className="hidden md:block overflow-x-auto">
                {renderTable()}
            </div>

            <div className="md:hidden p-4">
                <h3 className="text-lg font-semibold mb-4 text-center text-indigo-300">Student Rankings</h3>
                {renderMobileCard()}
            </div>

            {isModalOpen && (
                <StudentCard
                    studentData={selectedStudent!}
                    subjectsList={subjects}
                    open={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}
        </div>
    );
};

export default RanklistTable;