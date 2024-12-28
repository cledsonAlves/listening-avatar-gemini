import { useState, useEffect } from 'react';
import { Mic, Speaker } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export const Avatar = ({ isListening, isSpeaking }: AvatarProps) => {
  const [pulseSize, setPulseSize] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening || isSpeaking) {
        setPulseSize(prev => (prev === 100 ? 110 : 100));
      } else {
        setPulseSize(100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  return (
    <div className="avatar-container glass-panel" 
         style={{ transform: `scale(${pulseSize}%)` }}>
      <div className="absolute inset-0 flex items-center justify-center">
        {isListening ? (
          <Mic className={cn(
            "w-12 h-12 md:w-16 md:h-16 transition-all duration-500",
            "text-primary/80 animate-pulse"
          )} />
        ) : isSpeaking ? (
          <Speaker className={cn(
            "w-12 h-12 md:w-16 md:h-16 transition-all duration-500",
            "text-primary/80 animate-pulse"
          )} />
        ) : (
          <Mic className="w-12 h-12 md:w-16 md:h-16 text-primary/50" />
        )}
      </div>
    </div>
  );
};