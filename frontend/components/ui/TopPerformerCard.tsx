import { motion } from "framer-motion";
import { Orbit, Rocket, Star, Telescope } from "lucide-react";
import CosmicOverlay from "../spaceProps/CosmicOverlay";

interface TopPerformerCardProps {
    student: Student;
    rank: number;
}

interface StudentHeaderProps {
    student: Student;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ student }) => (
    <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
        <p className="text-sm text-indigo-200">{student.roll_num}</p>
    </div>
);

const StudentAchievementCard: React.FC<StudentHeaderProps> = ({ student }) => {
    const getConstellation = () => {
        switch (student.rank) {
            case 1: return "Orion";
            case 2: return "Cassiopeia";
            case 3: return "Ursa Major";
            default: return null;
        }
    };

    return (
        <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Star className="text-yellow-300" size={20} />
                    <span className="text-white">CGPA</span>
                </div>
                <span className="text-lg font-bold text-white">{student.cgpa.toFixed(2)}</span>
            </div>

            <div className="mt-2 text-sm text-indigo-300">
                {getConstellation()} Constellation
            </div>
        </div>
    );
}

const TopPerformerCard: React.FC<TopPerformerCardProps> = ({ student, rank }) => {
    const getRankBadgeClass = (index: number): string => {
        switch (index) {
            case 1: return 'bg-yellow-500';
            case 2: return 'bg-gray-400';
            case 3: return 'bg-orange-500';
            default: return '';
        }
    };

    const getConstellationIcon = (index: number) => {
        switch (index) {
            case 1: return <Telescope size={24} />;
            case 2: return <Rocket size={24} />;
            case 3: return <Orbit size={24} />;
            default: return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay: (rank - 1) * 0.2,
                type: "spring",
                stiffness: 100
            }}
            className="relative bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-2xl p-6 overflow-hidden border border-indigo-700/50 shadow-2xl"
        >
            <CosmicOverlay />

            <div className={`absolute top-4 left-4 w-12 h-12 flex items-center justify-center ${getRankBadgeClass(rank)} text-white font-bold rounded-full shadow-lg z-10`}>
                {rank}
            </div>

            <div className="absolute top-4 right-4 text-white/50">
                {getConstellationIcon(rank)}
            </div>

            <div className="relative z-10">
                <StudentHeader student={student} />
                <StudentAchievementCard student={student} />
            </div>
        </motion.div>
    );
};

export default TopPerformerCard;