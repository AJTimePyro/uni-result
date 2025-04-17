'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Award, BookOpen, Star, AlertCircle } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import CosmicButton from '../ui/CosmicButton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, fetchStudentResult } from '@/queries'

// Types
interface Subject {
  name: string;
  code: string;
  credits: number;
  grade: string;
  score: number;
  maxScore: number;
}

interface ResultData {
  studentName: string;
  rollNumber: string;
  semester: string;
  program: string;
  cgpa: number;
  sgpa: number;
  subjects: Subject[];
  status: 'Pass' | 'Fail' | 'Incomplete';
  dateGenerated: string;
}

const exampleRollNumbers = [
  "CS2021001", "EC2021042", "ME2021073", "CS2020015", "EC2022021"
];

// 3D Space background component
const SpaceBackground = () => (
  <div className="fixed inset-0 z-0">
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  </div>
);

export default function Results() {
  const [rollNumber, setRollNumber] = useState('')
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [error, setError] = useState('')
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  // React Query for fetching student results
  const { 
    data: results,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = useQuery<ResultData>({
    queryKey: QUERY_KEYS.studentResult(rollNumber),
    queryFn: () => fetchStudentResult(rollNumber),
    enabled: false, // Don't fetch on component mount
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle success and error states
  useEffect(() => {
    if (results) {
      setShowResultsModal(true);
      setError('');
    }
  }, [results]);

  useEffect(() => {
    if (isError && queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Failed to fetch results. Please try again.';
      setError(errorMessage);
    }
  }, [isError, queryError]);

  // For mobile keyboard detection
  useEffect(() => {
    const handleResize = () => {
      const isKeyboardOpen = window.innerHeight < window.outerHeight * 0.75;
      setIsKeyboardVisible(isKeyboardOpen);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async () => {
    if (!rollNumber.trim()) {
      setError('Please enter a valid roll number');
      return;
    }

    try {
      setError('');
      await refetch();
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch results. Please try again.');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    return (score / maxScore) * 100;
  };

  const getGradeColor = (grade: string) => {
    const gradeMap: Record<string, string> = {
      'A+': 'text-green-400',
      'A': 'text-green-500',
      'A-': 'text-green-600',
      'B+': 'text-blue-400',
      'B': 'text-blue-500',
      'B-': 'text-blue-600',
      'C+': 'text-yellow-400',
      'C': 'text-yellow-500',
      'C-': 'text-yellow-600',
      'D': 'text-orange-500',
      'F': 'text-red-500',
    };
    return gradeMap[grade] || 'text-gray-400';
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 3D Space Background */}
      <SpaceBackground />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-12 pb-20 px-4 min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 text-center"
        >
          Cosmic Academic Results
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-base md:text-xl mb-8 text-white max-w-2xl px-4 text-center"
        >
          Enter your roll number to explore your academic achievements across the cosmic university.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full max-w-xl bg-indigo-900/30 backdrop-blur-md p-6 rounded-xl border border-indigo-500/30 shadow-lg mb-8"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-indigo-300" size={20} />
            </div>
            <input
              id="rollNumber"
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter your roll number (e.g., CS2021001)"
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-indigo-950/50 border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            />
          </div>
          
          {error && (
            <div className="mt-3 text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mt-5 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px #6366f1" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={isLoading}
              className="relative w-full sm:w-auto px-8 py-3 overflow-hidden rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-300 transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                  Searching Cosmos...
                </>
              ) : (
                <>
                  <Search className="mr-2" size={18} />
                  View My Results
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
        
        {!isKeyboardVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="w-full max-w-xl bg-indigo-900/20 backdrop-blur-sm p-6 rounded-xl border border-indigo-700/30"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Search className="mr-2 text-indigo-400" />
              How to Access Your Results
            </h2>
            
            <div className="space-y-4 text-indigo-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-white text-xs font-bold">1</div>
                <p>Enter your complete roll number/registration ID in the search box above</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-white text-xs font-bold">2</div>
                <p>Click "View My Results" to search for your academic records</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-white text-xs font-bold">3</div>
                <p>Your results will display with detailed subject performance, grades, and GPA</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="bg-[#080821]/90 backdrop-blur-md border-indigo-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
              Academic Results
            </DialogTitle>
          </DialogHeader>
          
          {results && (
            <div className="space-y-6 mt-4">
              {/* Student Info */}
              <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-indigo-300 text-sm">Student Name</h3>
                    <p className="text-white text-lg font-semibold">{results.studentName}</p>
                  </div>
                  <div>
                    <h3 className="text-indigo-300 text-sm">Roll Number</h3>
                    <p className="text-white text-lg font-semibold">{results.rollNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-indigo-300 text-sm">Program</h3>
                    <p className="text-white">{results.program}</p>
                  </div>
                  <div>
                    <h3 className="text-indigo-300 text-sm">Semester</h3>
                    <p className="text-white">{results.semester}</p>
                  </div>
                </div>
              </div>
              
              {/* Performance Summary */}
              <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Award className="mr-2 text-yellow-400" />
                  Performance Summary
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-900/50 rounded-lg p-4 text-center">
                    <h4 className="text-indigo-300 text-sm mb-1">SGPA</h4>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
                      {results.sgpa.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-indigo-900/50 rounded-lg p-4 text-center">
                    <h4 className="text-indigo-300 text-sm mb-1">CGPA</h4>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
                      {results.cgpa.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-indigo-900/50 rounded-lg p-4 text-center">
                    <h4 className="text-indigo-300 text-sm mb-1">Status</h4>
                    <p className={`text-xl font-bold ${
                      results.status === 'Pass' ? 'text-green-500' : 
                      results.status === 'Fail' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {results.status}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Subject Results */}
              <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BookOpen className="mr-2 text-indigo-400" />
                  Subject-wise Performance
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-indigo-800/50">
                        <th className="text-left py-3 px-4 text-indigo-300">Subject</th>
                        <th className="text-left py-3 px-4 text-indigo-300">Code</th>
                        <th className="text-center py-3 px-4 text-indigo-300 hidden sm:table-cell">Credits</th>
                        <th className="text-center py-3 px-4 text-indigo-300 hidden md:table-cell">Score</th>
                        <th className="text-center py-3 px-4 text-indigo-300">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.subjects.map((subject: Subject, index: number) => (
                        <tr key={index} className="border-b border-indigo-800/30 hover:bg-indigo-900/40 transition-colors">
                          <td className="py-3 px-4 text-white">{subject.name}</td>
                          <td className="py-3 px-4 text-indigo-300">{subject.code}</td>
                          <td className="py-3 px-4 text-center text-white hidden sm:table-cell">{subject.credits}</td>
                          <td className="py-3 px-4 text-center hidden md:table-cell">
                            <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${calculatePercentage(subject.score, subject.maxScore)}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm mt-1 inline-block">
                              {subject.score}/{subject.maxScore}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${
                              subject.grade === 'F' ? 'bg-red-900/40' : 'bg-indigo-900/50'
                            }`}>
                              <span className={`font-bold ${getGradeColor(subject.grade)}`}>
                                {subject.grade}
                              </span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Footer Info */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-indigo-400 italic">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span>Result generated on: {new Date(results.dateGenerated).toLocaleDateString()}</span>
                </div>
                <p>SGPA calculated based on credit-weighted grade points</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 