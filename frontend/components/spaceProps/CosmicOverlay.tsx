const CosmicOverlay: React.FC = () => (
    <div className="absolute inset-0 opacity-20">
        <div className="absolute w-40 h-40 bg-blue-500 rounded-full mix-blend-overlay blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-overlay blur-3xl animate-pulse"></div>
    </div>
);

export default CosmicOverlay;