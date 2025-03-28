import { useQuery } from "@tanstack/react-query";
import RanklistFilterDropdown from "../ui/FilterDropdown";
import { QUERY_KEYS, fetchColleges, fetchDegrees, fetchSessionYears } from "@/queries";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

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

    const handleSelect = (value: string) => {
        setSelectedSessionYear({ year: value, id: data[value] });
        setActiveDropDown(null);
    };

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

    const handleSelect = (value: string) => {
        setSelectedDegree({ degree_name: value, branches: data.find((d) => d.degree_name === value)?.branches || [] });
        setActiveDropDown(null);
    };

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
    }, [selectedDegree.branches.length, setSelectedBranch]);

    const handleSelect = (value: string) => {
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
    };

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
} : CollegeDropDownProps) => {
    const { data = [] } = useQuery<College[]>({
        queryKey: QUERY_KEYS.colleges(degreeID),
        queryFn: () => fetchColleges(degreeID),
        enabled: !!degreeID
    });

    const handleSelect = (value: string) => {
        const clg = data.find(c => c.college_name === value)
        setSelectedCollege({
            college_name: clg?.college_name || "",
            available_semester: clg?.available_semester || [],
            shifts: clg?.shifts || {}
        });
        setActiveDropDown(null);
    }

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

export default function RankListFilters() {
    const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
    const [selectedSessionYear, setSelectedSessionYear] = useState<SessionYear>({ year: "", id: "" });
    const [selectedDegree, setSelectedDegree] = useState<Degree>({ degree_name: "", branches: [] });
    const [selectedBranch, setSelectedBranch] = useState<Branch>({
        branch_name: "",
        id: ""
    });
    const [selectedCollege, setSelectedCollege] = useState<College>({ college_name: "", available_semester: [], shifts: { } });

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
        </>
    );
}