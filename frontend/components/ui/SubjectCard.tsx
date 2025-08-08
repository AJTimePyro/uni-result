import { parseMarkData } from "@/lib/resultUtil";
import { motion } from "framer-motion";

export default function SubjectCard({ subjectId, subjectScore, subjectInfo }: { subjectId: string, subjectScore: string, subjectInfo?: Subject }) {
    if (!subjectScore) return null;

    const score = parseMarkData(subjectScore);
    if (!score) return null;

    const subject = subjectInfo || {
        subject_name: "Unknown Subject",
        subject_code: subjectId.replace('sub_', ''),
        max_marks: 100
    };

    const percentage = (score.total_marks / subject.max_marks) * 100;

    const getBgColor = () => {
        switch (score.grade) {
            case 'A+': return 'from-emerald-900/40 to-green-900/40 border-emerald-500/30';
            case 'A': return 'from-green-900/40 to-teal-900/40 border-green-500/30';
            case 'B': return 'from-blue-900/40 to-indigo-900/40 border-blue-500/30';
            case 'C': return 'from-indigo-900/40 to-purple-900/40 border-indigo-500/30';
            case 'D': return 'from-amber-900/40 to-orange-900/40 border-amber-500/30';
            case 'F': return 'from-red-900/40 to-rose-900/40 border-red-500/30';
            default: return 'from-gray-900/40 to-slate-900/40 border-gray-500/30';
        }
    };

    const getTextColor = () => {
        switch (score.grade) {
            case 'A+': return 'text-emerald-200';
            case 'A': return 'text-green-200';
            case 'B': return 'text-blue-200';
            case 'C': return 'text-indigo-200';
            case 'D': return 'text-amber-200';
            case 'F': return 'text-red-200';
            default: return 'text-gray-200';
        }
    };

    return (
        <motion.div
            className={`relative z-10 p-4 text-white rounded-lg bg-gradient-to-br ${getBgColor()} backdrop-blur-md border`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold truncate max-w-3/4" title={subject.subject_name}>
                    {subject.subject_name}
                </h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${score.grade === 'F' ? 'bg-red-900/60 text-red-100' :
                    score.grade === 'A+' ? 'bg-emerald-900/60 text-emerald-100' :
                        'bg-blue-900/60 text-blue-100'
                    }`}>
                    {score.grade}
                </span>
            </div>

            <p className="text-sm text-blue-200 mb-2">{subject.subject_code}</p>

            <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                    <p className="text-xs text-gray-400">Marks</p>
                    <p className={`font-medium ${getTextColor()}`}>{score.total_marks}/{subject.max_marks}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Percentage</p>
                    <p className={`font-medium ${getTextColor()}`}>{percentage.toFixed(2)}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Credit</p>
                    <p className={`font-medium ${getTextColor()}`}>{score.credit}</p>
                </div>
            </div>

            {/* Circular progress indicator */}
            <div className="mt-3 relative h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className={`absolute top-0 left-0 h-full rounded-full ${score.grade === 'F' ? 'bg-red-500' :
                        score.grade === 'A+' ? 'bg-emerald-500' :
                            score.grade === 'A' ? 'bg-green-500' :
                                score.grade === 'B' ? 'bg-blue-500' :
                                    score.grade === 'C' ? 'bg-indigo-500' :
                                        'bg-amber-500'
                        }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
            </div>
        </motion.div>
    );
};