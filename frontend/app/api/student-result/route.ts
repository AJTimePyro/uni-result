import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rollNumber = searchParams.get("roll_number");

  if (!rollNumber) {
    return NextResponse.json(
      { error: "Roll number is required" },
      { status: 400 }
    );
  }

  try {
    // In a real application, this would query your database
    // For now, generate mock data based on the roll number
    
    // Use roll number to create deterministic values
    const rollSeed = rollNumber.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomBetween = (min: number, max: number) => {
      const rand = Math.sin(rollSeed) * 10000;
      return Math.floor((rand - Math.floor(rand)) * (max - min + 1)) + min;
    };
    
    // Create student name based on roll number prefix
    let departmentCode = "CSE";
    let studentName = "Student";
    
    if (rollNumber.includes("CS")) {
      departmentCode = "CSE";
      studentName = "Cosmic CS Student";
    } else if (rollNumber.includes("EC")) {
      departmentCode = "ECE";
      studentName = "Cosmic EC Student";
    } else if (rollNumber.includes("ME")) {
      departmentCode = "MECH";
      studentName = "Cosmic ME Student";
    }
    
    // Generate CGPA between 7.5 and 9.8
    const cgpa = (7.5 + (randomBetween(0, 23) / 10)).toFixed(1);
    // SGPA slightly different from CGPA
    const sgpa = (parseFloat(cgpa) + (randomBetween(-5, 5) / 10)).toFixed(1);
    
    // Subject data
    const subjectTemplates = [
      { name: "Quantum Computing", code: `${departmentCode}401`, credits: 4 },
      { name: "Astrophysics", code: `${departmentCode}302`, credits: 4 },
      { name: "Galactic Mathematics", code: `${departmentCode}201`, credits: 3 },
      { name: "Space Engineering", code: `${departmentCode}402`, credits: 4 },
      { name: "Cosmic Data Structures", code: `${departmentCode}301`, credits: 3 },
      { name: "Interstellar Algorithms", code: `${departmentCode}403`, credits: 4 },
      { name: "Nebula Networks", code: `${departmentCode}405`, credits: 3 },
      { name: "Planetary Physics", code: `${departmentCode}304`, credits: 4 },
    ];
    
    // Select 5-6 subjects
    const numSubjects = randomBetween(5, 6);
    const selectedSubjectIndexes: number[] = [];
    while (selectedSubjectIndexes.length < numSubjects) {
      const idx = randomBetween(0, subjectTemplates.length - 1);
      if (!selectedSubjectIndexes.includes(idx)) {
        selectedSubjectIndexes.push(idx);
      }
    }
    
    // Generate grades and scores for each subject
    const subjects = selectedSubjectIndexes.map(idx => {
      const subject = subjectTemplates[idx];
      const score = randomBetween(70, 98);
      let grade;
      
      if (score >= 90) grade = "A+";
      else if (score >= 85) grade = "A";
      else if (score >= 80) grade = "A-";
      else if (score >= 75) grade = "B+";
      else if (score >= 70) grade = "B";
      else if (score >= 65) grade = "B-";
      else if (score >= 60) grade = "C+";
      else if (score >= 55) grade = "C";
      else if (score >= 50) grade = "C-";
      else if (score >= 45) grade = "D";
      else grade = "F";
      
      return {
        ...subject,
        grade,
        score,
        maxScore: 100
      };
    });
    
    // Return the result
    return NextResponse.json({
      studentName: studentName,
      rollNumber,
      semester: "Spring 2023",
      program: `B.Tech ${departmentCode}`,
      cgpa: parseFloat(cgpa),
      sgpa: parseFloat(sgpa),
      subjects,
      status: parseFloat(cgpa) >= 5.0 ? 'Pass' : 'Fail',
      dateGenerated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error fetching student result:", error);
    return NextResponse.json(
      { error: "Failed to fetch student result" },
      { status: 500 }
    );
  }
} 