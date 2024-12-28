import { useState, useCallback, useEffect } from 'react';
import { Avatar } from '@/components/Avatar';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();

  const startListening = useCallback(async () => {
    try {
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Failed to start listening. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        // Here you would call Gemini API with the transcript
        // Then call AWS Polly with the response
        // For now, we'll simulate it
        simulateResponse();
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const simulateResponse = () => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Click the avatar to start speaking
        </p>
      </div>

      <button
        onClick={startListening}
        disabled={isListening}
        className="transform transition-transform duration-300 hover:scale-105 focus:outline-none"
      >
        <Avatar isListening={isListening} isSpeaking={isSpeaking} />
      </button>

      <AudioVisualizer isActive={isListening || isSpeaking} />

      {transcript && (
        <div className="glass-panel p-4 rounded-lg max-w-md w-full mx-auto mt-8">
          <p className="text-sm text-center">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Index;