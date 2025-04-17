import { Dispatch, SetStateAction } from "react";

interface RanklistTableProps {
    students: Student[];
    setSelectedStudent: Dispatch<SetStateAction<Student | null>>
    setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

const RanklistTable: React.FC<RanklistTableProps> = ({ students, setSelectedStudent, setIsModalOpen }: RanklistTableProps) => {
    return (
        <div className="bg-indigo-900/30 rounded-2xl overflow-hidden border border-indigo-700/50">
            <div className="overflow-x-auto w-full">
                <table className="w-full">
                    <colgroup>
                        <col className="w-16 md:w-24" />
                        <col className="w-40 md:w-64" />
                        <col className="w-32 md:w-40" />
                        <col className="w-24 md:w-32" />
                        <col className="w-16 md:w-24" />
                    </colgroup>
                    <thead className="bg-indigo-900/50">
                        <tr>
                            <th className="p-2 md:p-4 text-center">Rank</th>
                            <th className="p-2 md:p-4 text-left"><span className="max-sm:hidden">Stellar</span> Name</th>
                            <th className="p-2 md:p-4 text-left">Cosmic ID</th>
                            <th className="p-2 md:p-4 text-center">Marks</th>
                            <th className="p-2 md:p-4 text-center">CGPA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr
                                key={student.roll_num}
                                className="border-b border-indigo-700/30 hover:bg-indigo-900/20 transition cursor-pointer"
                                onClick={() => {
                                    setSelectedStudent(student);
                                    setIsModalOpen(true);
                                }}
                            >
                                <td className="p-2 md:p-4 font-semibold text-center whitespace-nowrap">
                                    {student.rank <= 3 ? (
                                        <span className="px-2 py-1 rounded-full text-white inline-block">
                                            {student.rank}
                                        </span>
                                    ) : (
                                        student.rank
                                    )}
                                </td>
                                <td className="p-2 md:p-4 text-sm md:text-base">
                                    <div className="break-words">{student.name}</div>
                                </td>
                                <td className="p-2 md:p-4 text-sm md:text-base whitespace-nowrap">
                                    <div className="truncate">{student.roll_num}</div>
                                </td>
                                <td className="p-2 md:p-4 text-sm md:text-base text-center whitespace-nowrap">
                                    {`${student.total_marks_scored}/${student.max_marks_possible}`}
                                </td>
                                <td className="p-2 md:p-4 text-center font-semibold text-sm md:text-base whitespace-nowrap">
                                    {student.cgpa.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RanklistTable;