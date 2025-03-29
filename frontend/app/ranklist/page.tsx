import RankListClientSide from '@/components/clientSidePages/Ranklist';

const CosmicRanklistPage: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white p-6 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <RankListClientSide />
    </div>
);


export default CosmicRanklistPage;