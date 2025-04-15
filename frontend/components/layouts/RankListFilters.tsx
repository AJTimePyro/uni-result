import { useQuery } from "@tanstack/react-query";
import RanklistFilterDropdown from "../ui/FilterDropdown";
import { QUERY_KEYS, fetchColleges, fetchDegrees, fetchSessionYears } from "@/queries";
import { Dispatch, SetStateAction, memo, useCallback, useEffect, useMemo, useState } from "react";
import CosmicButton from "../ui/CosmicButton";

type DropdownKey = "Session Year" | "Degree" | "Branch" | "College" | "Shift" | "Semester";

interface CommonDropdownProps {
    isActive: boolean;
    setActiveDropDown: (key: DropdownKey | null) => void;
    dropdownKey: DropdownKey;
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
    setSemResultIDs: Dispatch<SetStateAction<Record<string, string>>>;
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

interface RankListFiltersProps {
    isButtonLoading: boolean;
    callBackFetchResult: (requestJson: RankListRequestJSON) => void
}

const SessionYearDropDown = memo(({
    uniID,
    selectedSessionYear,
    setSelectedSessionYear,
    isActive,
    setActiveDropDown,
    dropdownKey,
}: SessionYearDropDownProps) => {
    const { data = {} } = useQuery<Batches>({
        queryKey: QUERY_KEYS.sessionYears(uniID),
        queryFn: () => fetchSessionYears(uniID),
        enabled: !!uniID
    });

    const options = useMemo(() => Object.keys(data), [data]);

    const handleSelect = useCallback((value: string) => {
        setSelectedSessionYear({ year: value, id: data[value] });
        setActiveDropDown(null);
    }, [setSelectedSessionYear, data, setActiveDropDown]);

    const toggleDropdown = useCallback(() => {
        setActiveDropDown(isActive ? null : dropdownKey);
    }, [isActive, setActiveDropDown, dropdownKey]);

    return (
        <RanklistFilterDropdown
            options={options.sort()}
            selectedValue={selectedSessionYear.year}
            label="Session Year"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}, (prevProps, nextProps) =>
    prevProps.uniID === nextProps.uniID &&
    prevProps.selectedSessionYear.year === nextProps.selectedSessionYear.year &&
    prevProps.isActive === nextProps.isActive
);

const DegreeDropDown = memo(({
    batchID,
    selectedDegree,
    setSelectedDegree,
    isActive,
    setActiveDropDown,
    dropdownKey,
}: DegreeDropDownProps) => {
    const { data = [], isSuccess } = useQuery<Degree[]>({
        queryKey: QUERY_KEYS.degrees(batchID),
        queryFn: () => fetchDegrees(batchID),
        enabled: !!batchID
    });

    const options = useMemo(() => data.map((d) => d.degree_name), [data]);

    useEffect(() => {
        if (!selectedDegree.degree_name || !isSuccess) return;

        const degree = data.find((d) => d.degree_name === selectedDegree.degree_name);
        if (degree) {
            setSelectedDegree(degree);
        } else {
            setSelectedDegree({ degree_name: "", branches: [] });
        }
    }, [batchID, data, isSuccess, selectedDegree.degree_name, setSelectedDegree]);

    const handleSelect = useCallback((value: string) => {
        setSelectedDegree({
            degree_name: value,
            branches: data.find((d) => d.degree_name === value)?.branches || []
        });
        setActiveDropDown(null);
    }, [data, setSelectedDegree, setActiveDropDown]);

    const toggleDropdown = useCallback(() => {
        setActiveDropDown(isActive ? null : dropdownKey);
    }, [isActive, setActiveDropDown, dropdownKey]);

    return (
        <RanklistFilterDropdown
            options={options.sort()}
            selectedValue={selectedDegree.degree_name}
            label="Degree"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}, (prevProps, nextProps) =>
    prevProps.batchID === nextProps.batchID &&
    prevProps.selectedDegree.degree_name === nextProps.selectedDegree.degree_name &&
    prevProps.isActive === nextProps.isActive
);

const BranchDropDown = memo(({
    selectedDegree,
    selectedBranch,
    setSelectedBranch,
    isActive,
    setActiveDropDown,
    dropdownKey,
}: BranchDropDownProps) => {
    console.log(selectedDegree.branches)
    const options = useMemo(() =>
        selectedDegree.branches.map(branch => {
            const [key] = Object.keys(branch);
            return `${branch[key][0]} - ${key}`;
        }),
        [selectedDegree.branches]
    );

    useEffect(() => {
        if (selectedDegree.branches.length === 1) {
            const firstBranch = selectedDegree.branches[0];
            const branchName = Object.keys(firstBranch)[0];
            const branchID = firstBranch[branchName];
            setSelectedBranch({
                branch_name: branchName,
                degreeID: branchID[0],
                id: branchID[1]
            });
            return;
        }

        if (!selectedBranch.branch_name) return;

        const branchData = selectedDegree.branches.find(branch =>
            Object.keys(branch)[0] === selectedBranch.branch_name
        );

        if (branchData) {
            const branchName = Object.keys(branchData)[0];
            const branchID = branchData[branchName];
            setSelectedBranch({
                branch_name: branchName,
                degreeID: branchID[0],
                id: branchID[1]
            });
        } else {
            setSelectedBranch({
                branch_name: "",
                degreeID: "",
                id: ""
            });
        }
    }, [selectedDegree.branches, selectedBranch.branch_name, setSelectedBranch]);

    const handleSelect = useCallback((value: string) => {
        const branchData = selectedDegree.branches.find(branch =>
            Object.keys(branch)[0] === value.split(" - ")[1]
        );

        if (branchData) {
            const [branchName, branchID] = Object.entries(branchData)[0];
            if (branchID[0] !== selectedBranch.degreeID) {
                setSelectedBranch({
                    branch_name: branchName,
                    degreeID: branchID[0],
                    id: branchID[1]
                });
                setActiveDropDown(null);
            }
        }
    }, [selectedDegree.branches, selectedBranch.id, setSelectedBranch, setActiveDropDown]);

    const toggleDropdown = useCallback(() => {
        setActiveDropDown(isActive ? null : dropdownKey);
    }, [isActive, setActiveDropDown, dropdownKey]);

    return (
        <RanklistFilterDropdown
            options={options.sort()}
            selectedValue={selectedBranch.branch_name || ""}
            label="Branch"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}, (prevProps, nextProps) =>
    prevProps.selectedDegree.branches === nextProps.selectedDegree.branches &&
    prevProps.selectedBranch.branch_name === nextProps.selectedBranch.branch_name &&
    prevProps.isActive === nextProps.isActive
);

const CollegeDropDown = memo(({
    degreeID,
    selectedCollege,
    setSelectedCollege,
    setSemResultIDs,
    isActive,
    setActiveDropDown,
    dropdownKey,
}: CollegeDropDownProps) => {
    const { data = [], isSuccess } = useQuery<[College[], Record<string, string>]>({
        queryKey: QUERY_KEYS.colleges(degreeID),
        queryFn: () => fetchColleges(degreeID),
        enabled: !!degreeID
    });

    const options = useMemo(() =>
        data[0]?.length ? ["All", ...(data[0]?.map((c) => c.college_name) || [])] : [],
        [data]
    );

    useEffect(() => {
        if (!isSuccess) return;
        setSemResultIDs(data[1] || {})

        if (!selectedCollege.college_name || selectedCollege.college_name === "All" || !isSuccess) return;

        const college = data[0]?.find((c) => c.college_name === selectedCollege.college_name);
        if (college) {
            setSelectedCollege(college);
        } else {
            setSelectedCollege({ college_name: "", available_semester: [], shifts: {} });
        }
    }, [degreeID, data, isSuccess, selectedCollege.college_name, setSelectedCollege]);

    const handleSelect = useCallback((value: string) => {
        if (value === "All") {
            setSelectedCollege({
                college_name: "All",
                available_semester: data[1] ? Object.keys(data[1]).map(Number) : [],
                shifts: {}
            })
        } else {
            const clg = data[0]?.find(c => c.college_name === value);
            setSelectedCollege({
                college_name: clg?.college_name || "",
                available_semester: clg?.available_semester || [],
                shifts: clg?.shifts || {}
            });
        }
        setActiveDropDown(null);
    }, [data, setSelectedCollege, setActiveDropDown]);

    const toggleDropdown = useCallback(() => {
        setActiveDropDown(isActive ? null : dropdownKey);
    }, [isActive, setActiveDropDown, dropdownKey]);

    return (
        <RanklistFilterDropdown
            options={options.sort()}
            selectedValue={selectedCollege.college_name}
            label="College"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}, (prevProps, nextProps) =>
    prevProps.degreeID === nextProps.degreeID &&
    prevProps.selectedCollege.college_name === nextProps.selectedCollege.college_name &&
    prevProps.isActive === nextProps.isActive
);

const ShiftDropDown = memo(({
    selectedCollege,
    selectedCollegeShift,
    setSelectedCollegeShift,
    isActive,
    setActiveDropDown,
    dropdownKey,
}: ShiftDropDownProps) => {
    const options = useMemo(() => {
        const morning = selectedCollege.shifts.M ? ["Morning"] : [];
        const evening = selectedCollege.shifts.E ? ["Evening"] : [];
        return [...morning, ...evening];
    }, [selectedCollege.shifts]);

    useEffect(() => {
        const { M, E } = selectedCollege.shifts;
        if (!!M !== !!E) {  // XOR Operation for high level datastructure
            const clgID = M || E;
            setSelectedCollegeShift({
                shift: M ? 'Morning' : 'Evening',
                collegeID: clgID!,
            });
            return;
        }

        if (!selectedCollegeShift.collegeID) return;

        const clgID = selectedCollege.shifts[selectedCollegeShift.shift === 'Morning' ? 'M' : 'E'];
        if (!clgID) {
            setSelectedCollegeShift({
                shift: "",
                collegeID: ""
            });
            return;
        }

        if (clgID !== selectedCollegeShift.collegeID) {
            setSelectedCollegeShift({
                shift: selectedCollegeShift.shift,
                collegeID: clgID[0]
            });
        }
    }, [selectedCollege.shifts, selectedCollegeShift.collegeID, selectedCollegeShift.shift, setSelectedCollegeShift]);

    const handleSelect = useCallback((value: string) => {
        if (["Morning", "Evening"].includes(value)) {
            const clgID = value === 'Morning' ? selectedCollege.shifts.M : selectedCollege.shifts.E;
            if (!clgID) return;

            setSelectedCollegeShift({
                shift: value as CollegeShift['shift'],
                collegeID: clgID,
                // id: clgShift[1]
            });
            setActiveDropDown(null);
        }
    }, [selectedCollege.shifts, setSelectedCollegeShift, setActiveDropDown]);

    const toggleDropdown = useCallback(() => {
        setActiveDropDown(isActive ? null : dropdownKey);
    }, [isActive, setActiveDropDown, dropdownKey]);

    return (
        <RanklistFilterDropdown
            options={options.sort()}
            selectedValue={selectedCollegeShift.shift}
            label="Shift"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.selectedCollege.shifts) === JSON.stringify(nextProps.selectedCollege.shifts) &&
    prevProps.selectedCollegeShift.shift === nextProps.selectedCollegeShift.shift &&
    prevProps.isActive === nextProps.isActive
);

const SemesterDropDown = memo(({
    selectedCollege,
    selectedSemester,
    setSelectedSemester,
    isActive,
    setActiveDropDown,
    dropdownKey,
}: SemesterDropDownProps) => {
    const options = useMemo(() =>
        selectedCollege.available_semester.map((s) => s.toString()),
        [selectedCollege.available_semester]
    );

    useEffect(() => {
        if (selectedCollege.available_semester.length === 1) {
            setSelectedSemester(selectedCollege.available_semester[0]);
            return;
        }

        if (!selectedSemester) return;

        if (!selectedCollege.available_semester.includes(selectedSemester)) {
            setSelectedSemester(0);
        }
    }, [selectedCollege.available_semester, selectedSemester, setSelectedSemester]);

    const handleSelect = useCallback((value: string) => {
        setSelectedSemester(parseInt(value));
        setActiveDropDown(null);
    }, [setSelectedSemester, setActiveDropDown]);

    const toggleDropdown = useCallback(() => {
        setActiveDropDown(isActive ? null : dropdownKey);
    }, [isActive, setActiveDropDown, dropdownKey]);

    return (
        <RanklistFilterDropdown
            options={options.sort()}
            selectedValue={selectedSemester === 0 ? "" : selectedSemester.toString()}
            label="Semester"
            onSelect={handleSelect}
            isActive={isActive}
            toggleDropdown={toggleDropdown}
        />
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.selectedCollege.available_semester) === JSON.stringify(nextProps.selectedCollege.available_semester) &&
    prevProps.selectedSemester === nextProps.selectedSemester &&
    prevProps.isActive === nextProps.isActive
);

SessionYearDropDown.displayName = "SessionYearDropDown";
BranchDropDown.displayName = "BranchDropDown";
DegreeDropDown.displayName = "DegreeDropDown";
CollegeDropDown.displayName = "CollegeDropDown";
ShiftDropDown.displayName = "ShiftDropDown";
SemesterDropDown.displayName = "SemesterDropDown";

export default function RankListFilters({ isButtonLoading, callBackFetchResult }: RankListFiltersProps) {
    const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
    const [selectedSessionYear, setSelectedSessionYear] = useState<SessionYear>({ year: "", id: "" });
    const [selectedDegree, setSelectedDegree] = useState<Degree>({ degree_name: "", branches: [] });
    const [selectedBranch, setSelectedBranch] = useState<Branch>({
        branch_name: "",
        degreeID: "",
        id: ""
    });
    const [selectedCollege, setSelectedCollege] = useState<College>({ college_name: "", available_semester: [], shifts: {} });
    const [selectedCollegeShift, setSelectedCollegeShift] = useState<CollegeShift>({ shift: "", collegeID: "" });
    const [selectedSemester, setSelectedSemester] = useState<number>(0);
    const [semResultIDs, setSemResultIDs] = useState<Record<string, string>>({});

    const setActiveDropDown = useCallback((dropdown: DropdownKey | null) => {
        setActiveDropdown(dropdown);
    }, []);

    const buttonHandler = () => {
        const requestJson: RankListRequestJSON = {
            college_id: selectedCollegeShift.collegeID,
            degree_doc_id: selectedBranch.id,
            semester_num: selectedSemester,
            result_file_id: semResultIDs[selectedSemester.toString()]
        }
        callBackFetchResult(requestJson)
    }

    return (
        <section className="mx-auto container space-y-5">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SessionYearDropDown
                    uniID={process.env.NEXT_PUBLIC_UNI_GGSIPU || ''}
                    selectedSessionYear={selectedSessionYear}
                    setSelectedSessionYear={setSelectedSessionYear}
                    isActive={activeDropdown === "Session Year"}
                    setActiveDropDown={setActiveDropDown}
                    dropdownKey="Session Year"
                />

                <DegreeDropDown
                    batchID={selectedSessionYear.id || ''}
                    selectedDegree={selectedDegree}
                    setSelectedDegree={setSelectedDegree}
                    isActive={activeDropdown === "Degree"}
                    setActiveDropDown={setActiveDropDown}
                    dropdownKey="Degree"
                />

                <BranchDropDown
                    selectedDegree={selectedDegree}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={setSelectedBranch}
                    isActive={activeDropdown === "Branch"}
                    setActiveDropDown={setActiveDropDown}
                    dropdownKey="Branch"
                />

                <CollegeDropDown
                    degreeID={selectedBranch.id}
                    selectedCollege={selectedCollege}
                    setSelectedCollege={setSelectedCollege}
                    setSemResultIDs={setSemResultIDs}
                    isActive={activeDropdown === "College"}
                    setActiveDropDown={setActiveDropDown}
                    dropdownKey="College"
                />

                <ShiftDropDown
                    selectedCollege={selectedCollege}
                    selectedCollegeShift={selectedCollegeShift}
                    setSelectedCollegeShift={setSelectedCollegeShift}
                    isActive={activeDropdown === "Shift"}
                    setActiveDropDown={setActiveDropDown}
                    dropdownKey="Shift"
                />

                <SemesterDropDown
                    selectedCollege={selectedCollege}
                    selectedSemester={selectedSemester}
                    setSelectedSemester={setSelectedSemester}
                    isActive={activeDropdown === "Semester"}
                    setActiveDropDown={setActiveDropDown}
                    dropdownKey="Semester"
                />
            </section>

            <div className="flex justify-end">
                <CosmicButton disabled={isButtonLoading} loadingText='Fetching...' onClick={buttonHandler}>
                    Search
                </CosmicButton>
            </div>
        </section>
    );
}