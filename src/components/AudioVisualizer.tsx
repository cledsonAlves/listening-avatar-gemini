import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isActive: boolean;
  mode: 'user' | 'ai';
}

export const AudioVisualizer = ({ isActive, mode }: AudioVisualizerProps) => {
  const BAR_COUNT = 12;
  const DEFAULT_HEIGHT = 2;

  const [heights, setHeights] = useState<number[]>(Array(BAR_COUNT).fill(DEFAULT_HEIGHT));

  // Função para gerar alturas randomizadas
  const generateRandomHeight = () => Math.random() * 32 + 4;

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(BAR_COUNT).fill(DEFAULT_HEIGHT));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => generateRandomHeight()));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="audio-visualizer flex gap-1 items-center justify-center absolute -bottom-8 left-1/2 transform -translate-x-1/2">
      {heights.map((height, index) => (
        <div
          key={index}
          className={cn(
            'audio-bar w-1 rounded-full transition-all duration-100',
            mode === 'user' ? 'bg-primary' : 'bg-orange-500',
            isActive ? 'opacity-100' : 'opacity-50'
          )}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};