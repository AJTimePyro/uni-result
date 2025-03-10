"use client"
import { useState } from "react";
import { useRouter } from "next/router";

const dummyUniversities = [
  { id: "1", name: "Harvard University" },
  { id: "2", name: "Stanford University" },
  { id: "3", name: "MIT" },
  { id: "4", name: "Oxford University" },
];

export default function UniversitySelect() {
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  // const router = useRouter();

  const handleProceed = () => {
    if (selectedUniversity) {
      // router.push(`/university/${selectedUniversity}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Select Your University</h2>
      <select
        className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
        value={selectedUniversity}
        onChange={(e) => setSelectedUniversity(e.target.value)}
      >
        <option value="" disabled>Select a university</option>
        {dummyUniversities.map((uni) => (
          <option key={uni.id} value={uni.id}>{uni.name}</option>
        ))}
      </select>
      <button
        onClick={handleProceed}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full"
        disabled={!selectedUniversity}
      >
        Proceed
      </button>
    </div>
  );
}
