import { Dispatch, SetStateAction } from "react";
import TopPerformerCard from "../ui/TopPerformerCard";

interface TopPerformersProps {
    topStudents: Student[];
    setSelectedStudent: Dispatch<SetStateAction<Student | null>>;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const TopPerformers: React.FC<TopPerformersProps> = ({ topStudents, setSelectedStudent, setIsModalOpen }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topStudents.map((student, index) => (
                <TopPerformerCard 
                    key={student.roll_num}
                    showStudentModal={() => {
                        setSelectedStudent(student);
                        setIsModalOpen(true);
                    }}
                    student={student} 
                    rank={index + 1} 
                />
            ))}
        </div>
    );
};

export default TopPerformers;