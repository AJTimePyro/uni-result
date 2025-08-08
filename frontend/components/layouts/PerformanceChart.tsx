import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

interface ChartDataPoint {
    semester: number;
    cgpa: number | null;
    percentage: number | null;
}

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/95 px-4 py-3 rounded-md shadow-lg border border-gray-700">
                <p className="text-xs font-medium text-gray-300 mb-1">Semester {label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
                        {entry.name === 'cgpa' ? 'CGPA: ' : 'Percentage: '}
                        <span className="font-medium">
                            {entry.name === 'cgpa' ? entry.value.toFixed(1) : `${entry.value}%`}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom dot for the line chart
const CustomizedDot = (props: any) => {
    const { cx, cy, dataKey, value } = props;

    // Don't render dots for null values
    if (value === null) return null;

    const fill = dataKey === 'cgpa' ? '#a855f7' : '#6366f1';
    const stroke = dataKey === 'cgpa' ? '#d8b4fe' : '#a5b4fc';

    return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="none" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
    );
};

// Custom active dot when hovering
const CustomizedActiveDot = (props: any) => {
    const { cx, cy, dataKey } = props;
    const fill = dataKey === 'cgpa' ? '#d8b4fe' : '#a5b4fc';
    const stroke = dataKey === 'cgpa' ? '#a855f7' : '#6366f1';

    return (
        <svg x={cx - 8} y={cy - 8} width={16} height={16} fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill={fill} stroke={stroke} strokeWidth="2" />
            <circle cx="8" cy="8" r="3" fill={stroke} />
        </svg>
    );
};

export default function PerformanceChart({ studentResult }: { studentResult: Results }) {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

    useEffect(() => {
        const dataMap = new Map<number, ChartDataPoint>();

        // Initialize with all semesters having null values
        Object.keys(studentResult).forEach(semKey => {
            const semNumber = parseInt(semKey);
            if (!studentResult[semKey].error && !isNaN(semNumber)) {
                dataMap.set(semNumber, {
                    semester: semNumber,
                    cgpa: null,
                    percentage: null
                });
            }
        });

        // Fill in actual data where available
        Object.keys(studentResult).forEach(semKey => {
            if (!studentResult[semKey].error && studentResult[semKey].results) {
                const semData = studentResult[semKey].results;
                if (semData) {
                    const semNumber = parseInt(semKey);
                    const existingData = dataMap.get(semNumber) || {
                        semester: semNumber,
                        cgpa: null,
                        percentage: null
                    };

                    const cgpa = parseFloat(semData.cgpa || '0');
                    const totalMarks = parseInt(semData.total_marks_scored || '0');
                    const maxMarks = parseInt(semData.max_marks_possible || '0');
                    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

                    dataMap.set(semNumber, {
                        ...existingData,
                        cgpa: isNaN(cgpa) ? null : cgpa,
                        percentage: isNaN(percentage) ? null : Math.round(percentage)
                    });
                }
            }
        });

        // Convert map to array and sort by semester
        const processedData = Array.from(dataMap.values()).sort((a, b) => a.semester - b.semester);
        setChartData(processedData);
    }, [studentResult]);

    // Check if we have data with values
    const hasValidData = chartData.some(d => d.cgpa !== null || d.percentage !== null);

    return (
        <motion.div
            className="relative z-10 p-6 mb-8 text-white rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-xl font-bold mb-6 text-purple-200">Academic Performance Trends</h2>

            {!hasValidData ? (
                <div className="text-center py-8 text-purple-300">No performance data available</div>
            ) : (
                <div className="flex flex-col space-y-6">
                    {/* Combined line chart */}
                    <div className="h-80">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" opacity={0.2} />
                                    <XAxis
                                        dataKey="semester"
                                        tickFormatter={(tick) => `Sem ${tick}`}
                                        stroke="#d8b4fe"
                                        fontSize={12}
                                        padding={{ left: 20, right: 20 }}
                                    />

                                    {/* Left Y axis for CGPA */}
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        domain={[0, 10]}
                                        stroke="#d8b4fe"
                                        fontSize={12}
                                        tickCount={6}
                                        label={{
                                            value: 'CGPA',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#d8b4fe', fontSize: 12 },
                                            offset: 10
                                        }}
                                    />

                                    {/* Right Y axis for Percentage */}
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, 100]}
                                        stroke="#a5b4fc"
                                        fontSize={12}
                                        tickCount={6}
                                        label={{
                                            value: 'Percentage',
                                            angle: 90,
                                            position: 'insideRight',
                                            style: { fill: '#a5b4fc', fontSize: 12 },
                                            offset: 10
                                        }}
                                        tickFormatter={(tick) => `${tick}%`}
                                    />

                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="top"
                                        height={36}
                                        wrapperStyle={{ paddingTop: '10px' }}
                                        formatter={(value) => {
                                            return value === 'cgpa' ? 'CGPA (0-10)' : 'Percentage (%)';
                                        }}
                                    />

                                    {/* Reference lines */}
                                    <ReferenceLine
                                        y={7}
                                        yAxisId="left"
                                        stroke="#be185d"
                                        strokeDasharray="3 3"
                                        label={{
                                            value: 'Target CGPA',
                                            position: 'insideBottomRight',
                                            fill: '#be185d',
                                            fontSize: 11
                                        }}
                                    />

                                    {/* CGPA Line */}
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="cgpa"
                                        name="cgpa"
                                        stroke="#a855f7"
                                        strokeWidth={3}
                                        connectNulls={true}
                                        dot={<CustomizedDot />}
                                        activeDot={<CustomizedActiveDot />}
                                        animationDuration={1500}
                                    />

                                    {/* Percentage Line */}
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="percentage"
                                        name="percentage"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        connectNulls={true}
                                        dot={<CustomizedDot />}
                                        activeDot={<CustomizedActiveDot />}
                                        animationDuration={1500}
                                        animationBegin={300}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}