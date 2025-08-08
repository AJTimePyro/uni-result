import SpaceScene from "../spaceProps/3DSpace";

export default function Background({ children }: { children: React.ReactNode }) {
    return (
        <section>
            <div className="fixed inset-0 z-0">
                <SpaceScene />
            </div>

            <main className="relative z-10 min-h-screen w-full overflow-y-auto">
                {children}
            </main>
        </section>
    )
}