import { useState } from "react";
import StudentCard from "../layouts/StudentCard";

interface RanklistTableProps {
    subjects: Subject[];
    students: Student[];
}

const RanklistTable: React.FC<RanklistTableProps> = ({ subjects, students }: RanklistTableProps) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="bg-indigo-900/30 rounded-2xl overflow-x-auto border border-indigo-700/50">
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
                            className="border-b border-indigo-700/30 hover:bg-indigo-900/20 transition"
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

            {
                isModalOpen &&
                <StudentCard
                    studentData={selectedStudent!}
                    subjectsList={subjects}
                    open={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            }
        </div>
    );
};

export default RanklistTable;