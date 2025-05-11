import { parseMarkData } from "@/lib/resultUtil";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

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

export default function SemesterSummary({ semesterData }: { semesterData: SemesterResult }) {
    function getSubjectsCount(semesterData: SemesterResult) {
        return Object.keys(semesterData).filter(key => key.startsWith('sub_') && semesterData[key]).length;
    }

    function getPassedSubjectsCount(semesterData: SemesterResult) {
        let passedCount = 0;

        Object.keys(semesterData).forEach(key => {
            if (key.startsWith('sub_') && semesterData[key]) {
                const score = parseMarkData(semesterData[key]);
                if (score && score.grade !== 'F') {
                    passedCount++;
                }
            }
        });

        return passedCount;
    }

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
};