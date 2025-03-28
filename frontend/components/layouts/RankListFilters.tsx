import { useQuery } from "@tanstack/react-query";
import RanklistFilterDropdown from "../ui/FilterDropdown";
import { QUERY_KEYS, fetchDegrees, fetchSessionYears } from "@/queries";
import { Dispatch, SetStateAction, useState } from "react";

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

export default function RankListFilters() {
    const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
    const [selectedSessionYear, setSelectedSessionYear] = useState<SessionYear>({ year: "", id: "" });
    const [selectedDegree, setSelectedDegree] = useState<Degree>({ degree_name: "", branches: [] });

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
        </>
    );
}