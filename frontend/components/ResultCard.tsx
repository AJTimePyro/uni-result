import React, { useMemo } from 'react';
import CosmicCard from './CosmicCard';
import { IDegree } from '../models/Degree';
import { Subject } from '../types/result';
import { CheckCircle, XCircle } from 'lucide-react';

// Extended subject interface with result-specific properties
interface SubjectWithResult extends Subject {
  // No need to add additional properties as they're in semResults
}

interface ResultCardProps {
  degree?: IDegree;
  subjects?: Subject[];
  semNumber?: number;
  semResults?: Record<string, {
    internal_marks: number;
    external_marks: number;
    status: 'pass' | 'fail';
  }>;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  degree,
  subjects = [],
  semNumber = 1,
  semResults = {},
  className,
}) => {
  const { totalMarks, totalMaxMarks, percentage, totalCredits } = useMemo(() => {
    let totalMarks = 0;
    let totalMaxMarks = 0;
    let totalCredits = 0;

    subjects.forEach((subject) => {
      const result = semResults[subject.subject_id];
      if (result) {
        totalMarks += (result.internal_marks || 0) + (result.external_marks || 0);
        totalMaxMarks += (subject.max_internal_marks || 0) + (subject.max_external_marks || 0);
        totalCredits += subject.subject_credit || 0;
      }
    });

    const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    return {
      totalMarks,
      totalMaxMarks,
      percentage: Math.round(percentage * 100) / 100,
      totalCredits,
    };
  }, [subjects, semResults]);

  return (
    <CosmicCard 
      title={`${degree?.degree_name || 'Degree'} - Semester ${semNumber}`}
      description={degree?.branch_name}
      className={className}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm font-medium">
            Total Credits: <span className="font-bold">{totalCredits}</span>
          </div>
          <div className="text-sm font-medium">
            Total: <span className="font-bold">{totalMarks}/{totalMaxMarks}</span> ({percentage}%)
          </div>
        </div>
      }
    >
      {subjects.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internal
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => {
                const result = semResults[subject.subject_id];
                const internal = result?.internal_marks || 0;
                const external = result?.external_marks || 0;
                const total = internal + external;
                const maxTotal = (subject.max_internal_marks || 0) + (subject.max_external_marks || 0);
                const isPassed = result?.status === 'pass';

                return (
                  <tr key={subject.subject_id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="font-medium">{subject.subject_name}</div>
                      <div className="text-xs text-gray-500">{subject.subject_code}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {internal}/{subject.max_internal_marks}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {external}/{subject.max_external_marks}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {total}/{maxTotal}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {isPassed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No subject data available</div>
      )}
    </CosmicCard>
  );
};

export default ResultCard; 