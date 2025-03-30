import TopPerformerCard from "../ui/TopPerformerCard";

interface TopPerformersProps {
    topStudents: Student[];
}

const TopPerformers: React.FC<TopPerformersProps> = ({ topStudents }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topStudents.map((student, index) => (
                <TopPerformerCard 
                    key={student.roll_num} 
                    student={student} 
                    rank={index + 1} 
                />
            ))}
        </div>
    );
};

export default TopPerformers;