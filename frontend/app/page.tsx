import SpaceScene from '@/components/spaceProps/3DSpace';
import OverlayContent from '@/components/ui/OverlayContent';

export default function Home() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <SpaceScene />
      <OverlayContent />
    </div>
  );
}
