import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isActive: boolean;
}

export const AudioVisualizer = ({ isActive }: AudioVisualizerProps) => {
  const [heights, setHeights] = useState<number[]>(Array(12).fill(2));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(12).fill(2));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => 
        prev.map(() => isActive ? Math.random() * 32 + 4 : 2)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="audio-visualizer">
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn(
            "audio-bar",
            isActive ? "opacity-100" : "opacity-50"
          )}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};