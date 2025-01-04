import { useState, useCallback } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface AudioInterfaceProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  onToggleListening: () => void;
}

export const AudioInterface = ({
  isListening,
  isSpeaking,
  transcript,
  onToggleListening
}: AudioInterfaceProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">Iara Hub - Assistente IA</h1>
        <p className="text-sm text-muted-foreground">
          {isSpeaking ? 'Respondendo...' : isListening ? 'Escutando...' : 'Clique no microfone para começar'}
        </p>

        <Button
          onClick={onToggleListening}
          variant={isListening ? 'destructive' : 'default'}
          className="mt-4"
          disabled={isSpeaking}
        >
          {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
          {isListening ? 'Parar' : 'Iniciar'}
        </Button>
      </div>

      <div className="relative">
        <Avatar className={isListening ? 'animate-pulse' : ''} />
        <AudioVisualizer 
          isActive={isListening || isSpeaking} 
          mode={isListening ? 'user' : 'ai'} 
        />
      </div>

      {transcript && (
        <div className="glass-panel p-4 rounded-lg max-w-md w-full mx-auto">
          <p className="text-sm text-center">{transcript}</p>
        </div>
      )}
    </div>
  );
};