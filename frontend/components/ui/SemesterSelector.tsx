import { motion } from "framer-motion";

interface SemesterSelectorProps {
    activeSemester: number;
    setActiveSemester: (sem: number) => void;
    studentResult: StudentData;
}

export default function SemesterSelector ({ activeSemester, setActiveSemester, studentResult }: SemesterSelectorProps) {
    const availableSemesters = Object.keys(studentResult.results)
        .filter(semKey => !studentResult.results[semKey].error)
        .map(semKey => parseInt(semKey));

    return (
        <motion.div
            className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {availableSemesters.map((sem) => (
                <button
                    key={sem}
                    onClick={() => setActiveSemester(sem)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeSemester === sem
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-900/40 hover:bg-indigo-800/40 text-indigo-200 backdrop-blur-md'
                        }`}
                >
                    Semester {sem}
                </button>
            ))}
        </motion.div>
    );
};
