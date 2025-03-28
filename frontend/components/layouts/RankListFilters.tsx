import { useQuery } from "@tanstack/react-query";
import RanklistFilterDropdown from "../ui/FilterDropdown";
import { QUERY_KEYS, fetchColleges, fetchDegrees, fetchSessionYears } from "@/queries";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

interface CommonDropdownProps {
    isActive: boolean;
    setActiveDropDown: Dispatch<SetStateAction<DropdownKey | null>>;
    toggleDropdown: (key: DropdownKey) => void;
}

interface SessionYearDropDownProps extends CommonDropdownProps {
    uniID: string;
    selectedSessionYear: SessionYear;
    setSelectedSessionYear: Dispatch<SetStateAction<SessionYear>>;
}

interface DegreeDropDownProps extends CommonDropdownProps {
    batchID: string;
    selectedDegree: Degree;
    setSelectedDegree: Dispatch<SetStateAction<Degree>>;
}

interface BranchDropDownProps extends CommonDropdownProps {
    selectedDegree: Degree;
    selectedBranch: Branch;
    setSelectedBranch: Dispatch<SetStateAction<Branch>>;
}

interface CollegeDropDownProps extends CommonDropdownProps {
    degreeID: string;
    selectedCollege: College;
    setSelectedCollege: Dispatch<SetStateAction<College>>;
}

interface ShiftDropDownProps extends CommonDropdownProps {
    selectedCollege: College;
    selectedCollegeShift: CollegeShift;
    setSelectedCollegeShift: Dispatch<SetStateAction<CollegeShift>>;
}

interface SemesterDropDownProps extends CommonDropdownProps {
    selectedCollege: College;
    selectedSemester: number;
    setSelectedSemester: Dispatch<SetStateAction<number>>;
}

const SessionYearDropDown = ({
    uniID,
    selectedSessionYear,
    setSelectedSessionYear,
    isActive,
    setActiveDropDown,
    toggleDropdown,
}: SessionYearDropDownProps) => {
    const { data = {} } = useQuery<Batches>({
        queryKey: QUERY_KEYS.sessionYears(uniID),
        queryFn: () => fetchSessionYears(uniID),
        enabled: !!uniID
    });

    const handleSelect = useCallback((value: string) => {
        setSelectedSessionYear({ year: value, id: data[value] });
        setActiveDropDown(null);
    }, [setSelectedSessionYear, setActiveDropDown, data]);

    return (
        <RanklistFilterDropdown
            options={Object.keys(data)}
            selectedValue={selectedSessionYear.year}
            label="Session Year"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
};

const DegreeDropDown = ({
    batchID,
    selectedDegree,
    setSelectedDegree,
    isActive,
    setActiveDropDown,
    toggleDropdown,
}: DegreeDropDownProps) => {
    const { data = [] } = useQuery<Degree[]>({
        queryKey: QUERY_KEYS.sessionYears(batchID),
        queryFn: () => fetchDegrees(batchID),
        enabled: !!batchID
    });

    const handleSelect = useCallback((value: string) => {
        setSelectedDegree({ degree_name: value, branches: data.find((d) => d.degree_name === value)?.branches || [] });
        setActiveDropDown(null);
    }, [setSelectedDegree, setActiveDropDown, data]);

    return (
        <RanklistFilterDropdown
            options={data.map((d) => d.degree_name)}
            selectedValue={selectedDegree.degree_name}
            label="Degree"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
};

const BranchDropDown = ({
    selectedDegree,
    selectedBranch,
    setSelectedBranch,
    isActive,
    setActiveDropDown,
    toggleDropdown
}: BranchDropDownProps) => {
    useEffect(() => {
        if (selectedDegree.branches.length === 1) {
            const [branchName, branchID] = Object.entries(selectedDegree.branches[0])[0];
            setSelectedBranch({
                branch_name: branchName,
                id: branchID
            });
        }
    }, [selectedDegree.branches, setSelectedBranch]);

    const handleSelect = useCallback((value: string) => {
        const branchData = selectedDegree.branches.find(branch =>
            Object.keys(branch)[0] === value
        );

        if (branchData) {
            const [branchName, branchID] = Object.entries(branchData)[0];
            if (branchID !== selectedBranch.id) {
                setSelectedBranch({
                    branch_name: branchName,
                    id: branchID
                });
                setActiveDropDown(null);
            }
        }
    }, [selectedDegree.branches, selectedBranch.id, setSelectedBranch, setActiveDropDown]);

    const options = useMemo(() =>
        selectedDegree.branches.map((branch) => Object.keys(branch)[0]),
        [selectedDegree.branches]
    );

    return (
        <RanklistFilterDropdown
            options={options}
            selectedValue={selectedBranch.branch_name || ""}
            label="Branch"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
};

const CollegeDropDown = ({
    degreeID,
    selectedCollege,
    setSelectedCollege,
    isActive,
    setActiveDropDown,
    toggleDropdown
}: CollegeDropDownProps) => {
    const { data = [] } = useQuery<College[]>({
        queryKey: QUERY_KEYS.colleges(degreeID),
        queryFn: () => fetchColleges(degreeID),
        enabled: !!degreeID
    });

    const handleSelect = useCallback((value: string) => {
        const clg = data.find(c => c.college_name === value)
        setSelectedCollege({
            college_name: clg?.college_name || "",
            available_semester: clg?.available_semester || [],
            shifts: clg?.shifts || {}
        });
        setActiveDropDown(null);
    }, [setSelectedCollege, setActiveDropDown, data]);

    return (
        <RanklistFilterDropdown
            options={data.map((c) => c.college_name)}
            selectedValue={selectedCollege.college_name}
            label="College"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}

const ShiftDropDown = ({
    selectedCollege,
    selectedCollegeShift,
    setSelectedCollegeShift,
    isActive,
    setActiveDropDown,
    toggleDropdown
}: ShiftDropDownProps) => {
    useEffect(() => {
        // XOR Operation but for high level datastructure
        const { M, E } = selectedCollege.shifts;
        if (!!M !== !!E) {
            const clgShift = M || E;
            setSelectedCollegeShift({
                shift: M ? 'Morning' : 'Evening',
                collegeID: clgShift![0],
                id: clgShift![1]
            })
        }
    }, [selectedCollege.shifts, setSelectedCollegeShift])

    const handleSelect = useCallback((value: string) => {
        if (["Morning", "Evening"].includes(value)) {
            const clgShift = value === 'Morning' ? selectedCollege.shifts.M : selectedCollege.shifts.E;
            setSelectedCollegeShift({
                shift: value as CollegeShift['shift'],
                collegeID: clgShift![0],
                id: clgShift![1]
            })
            setActiveDropDown(null);
        }
    }, [selectedCollege.shifts, setSelectedCollegeShift, setActiveDropDown]);

    const options = useMemo(() => {
        const morning = selectedCollege.shifts.M ? ["Morning"] : [];
        const evening = selectedCollege.shifts.E ? ["Evening"] : [];
        return [...morning, ...evening];
    }, [selectedCollege.shifts]);

    return (
        <RanklistFilterDropdown
            options={options}
            selectedValue={selectedCollegeShift.shift}
            label="Shift"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    )
}

const SemesterDropDown = ({
    selectedCollege,
    selectedSemester,
    setSelectedSemester,
    isActive,
    setActiveDropDown,
    toggleDropdown
}: SemesterDropDownProps) => {
    useEffect(() => {
        if (selectedCollege.available_semester.length === 1) {
            setSelectedSemester(selectedCollege.available_semester[0]);
        }
    }, [selectedCollege.available_semester.length]);

    const handleSelect = useCallback((value: string) => {
        setSelectedSemester(parseInt(value));
        setActiveDropDown(null);
    }, [setSelectedSemester, setActiveDropDown]);

    return (
        <RanklistFilterDropdown
            options={selectedCollege.available_semester.map((s) => s.toString())}
            selectedValue={selectedSemester === 0 ? "" : selectedSemester.toString()}
            label="Semester"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    )
}

export default function RankListFilters() {
    const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
    const [selectedSessionYear, setSelectedSessionYear] = useState<SessionYear>({ year: "", id: "" });
    const [selectedDegree, setSelectedDegree] = useState<Degree>({ degree_name: "", branches: [] });
    const [selectedBranch, setSelectedBranch] = useState<Branch>({
        branch_name: "",
        id: ""
    });
    const [selectedCollege, setSelectedCollege] = useState<College>({ college_name: "", available_semester: [], shifts: {} });
    const [selectedCollegeShift, setSelectedCollegeShift] = useState<CollegeShift>({ shift: "", collegeID: "", id: "" });
    const [selectedSemester, setSelectedSemester] = useState<number>(0);

    const toggleDropdown = (key: DropdownKey) => setActiveDropdown((prev) => (prev === key ? null : key));

    return (
        <>
            <SessionYearDropDown
                uniID={process.env.NEXT_PUBLIC_GGSIPU_ID || ''}
                selectedSessionYear={selectedSessionYear}
                setSelectedSessionYear={setSelectedSessionYear}
                isActive={activeDropdown === "Session Year"}
                setActiveDropDown={setActiveDropdown}
                toggleDropdown={toggleDropdown}
            />

            <DegreeDropDown
                batchID={selectedSessionYear.id || ''}
                selectedDegree={selectedDegree}
                setSelectedDegree={setSelectedDegree}
                isActive={activeDropdown === "Degree"}
                setActiveDropDown={setActiveDropdown}
                toggleDropdown={toggleDropdown}
            />

            <BranchDropDown
                selectedDegree={selectedDegree}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
                isActive={activeDropdown === "Branch"}
                setActiveDropDown={setActiveDropdown}
                toggleDropdown={toggleDropdown}
            />

            <CollegeDropDown
                degreeID={selectedBranch.id}
                selectedCollege={selectedCollege}
                setSelectedCollege={setSelectedCollege}
                isActive={activeDropdown === "College"}
                setActiveDropDown={setActiveDropdown}
                toggleDropdown={toggleDropdown}
            />

            <ShiftDropDown
                selectedCollege={selectedCollege}
                selectedCollegeShift={selectedCollegeShift}
                setSelectedCollegeShift={setSelectedCollegeShift}
                isActive={activeDropdown === "Shift"}
                setActiveDropDown={setActiveDropdown}
                toggleDropdown={toggleDropdown}
            />

            <SemesterDropDown
                selectedCollege={selectedCollege}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                isActive={activeDropdown === "Semester"}
                setActiveDropDown={setActiveDropdown}
                toggleDropdown={toggleDropdown}
            />
        </>
    );
}