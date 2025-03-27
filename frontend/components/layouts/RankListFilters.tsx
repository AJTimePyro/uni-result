import { useQuery } from "@tanstack/react-query";
import RanklistFilterDropdown from "../ui/FilterDropdown";
import { QUERY_KEYS, fetchSessionYears } from "@/queries";

const SessionYearDropDown = ({uniID}: {uniID: string}) => {
    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.sessionYears(uniID),
        queryFn: () => fetchSessionYears(uniID),
    })
    
    return <RanklistFilterDropdown options={isLoading ? [] : Object.keys(data)} selectedValue="" label="Session Year" onSelect={() => {}} isActive={false} toggleDropdown={() => {}}/>
}

export default function RankListFilters() {
    return (
        <section>
            <SessionYearDropDown uniID="67dacbdfb86e20f3dcce2506" />
        </section>
    )
}