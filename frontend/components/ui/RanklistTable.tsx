interface RanklistTableProps {
    students: Student[];
}

const RanklistTable: React.FC<RanklistTableProps> = ({ students }) => {
    const getRankClass = (rank: number): string => {
        switch (rank) {
            case 1: return 'bg-yellow-500';
            case 2: return 'bg-gray-400';
            case 3: return 'bg-orange-500';
            default: return '';
        }
    };

    return (
        <div className="bg-indigo-900/30 rounded-2xl overflow-x-auto border border-indigo-700/50">
            <table className="w-full">
                <thead className="bg-indigo-900/50">
                    <tr>
                        <th className="p-4 text-left">Cosmic Rank</th>
                        <th className="p-4 text-left">Stellar Name</th>
                        <th className="p-4 text-left">Cosmic Identifier</th>
                        <th className="p-4 text-left">Academic Orbit</th>
                        <th className="p-4 text-right">Stellar Achievements</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr
                            key={student.rollNumber}
                            className="border-b border-indigo-700/30 hover:bg-indigo-900/20 transition"
                        >
                            <td className="p-4 font-semibold">
                                {student.rank <= 3 ? (
                                    <span className={`px-3 py-1 rounded-full text-white ${getRankClass(student.rank)}`}>
                                        {student.rank}
                                    </span>
                                ) : (
                                    student.rank
                                )}
                            </td>
                            <td className="p-4">{student.name}</td>
                            <td className="p-4">{student.rollNumber}</td>
                            <td className="p-4">{student.branch}</td>
                            <td className="p-4 text-right font-semibold">{student.cgpa.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RanklistTable;