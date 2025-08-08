import { motion } from "framer-motion";

interface StudentProfileProps {
    studentActiveSemRes: Student;
    overallCGPA: number | string;
}

const StudentProfile = ({ studentActiveSemRes, overallCGPA }: StudentProfileProps) => (
    <motion.div
        className="relative z-10 flex items-center justify-center p-6 mb-8 text-white rounded-lg bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-indigo-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-indigo-500">
                <div className="w-full h-full flex items-center justify-center bg-indigo-800">
                    <span className="text-2xl font-bold">{studentActiveSemRes.name.charAt(0)}</span>
                </div>
            </div>

            <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-white">{studentActiveSemRes.name}</h1>
                <div className="mt-2 space-y-1 text-indigo-200">
                    <p><span className="text-indigo-400">Roll No:</span> {studentActiveSemRes.roll_num}</p>
                    <p><span className="text-indigo-400">College ID:</span> {studentActiveSemRes.college_id}</p>
                    <p><span className="text-indigo-400">Overall CGPA:</span> {overallCGPA}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

export default StudentProfile;