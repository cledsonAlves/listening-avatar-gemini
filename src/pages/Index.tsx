import { useState, useCallback, useEffect } from 'react';
import { Avatar } from '@/components/Avatar';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { useToast } from '@/components/ui/use-toast';
import { getGeminiResponse } from '@/services/gemini';
import { synthesizeSpeech, playAudio } from '@/services/polly';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();

  const startListening = useCallback(async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Erro",
          description: "Falha ao iniciar o reconhecimento de voz. Tente novamente.",
          variant: "destructive",
        });
      };

      recognition.onend = async () => {
        setIsListening(false);
        if (transcript) {
          try {
            setIsSpeaking(true);
            // Get response from Gemini
            const response = await getGeminiResponse(transcript);
            
            // Synthesize and play speech
            const audioData = await synthesizeSpeech(response);
            await playAudio(audioData);
            
            setIsSpeaking(false);
          } catch (error) {
            console.error('Error processing response:', error);
            toast({
              title: "Erro",
              description: "Ocorreu um erro ao processar sua mensagem.",
              variant: "destructive",
            });
            setIsSpeaking(false);
          }
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: "Erro",
        description: "Reconhecimento de voz não é suportado neste navegador.",
        variant: "destructive",
      });
    }
  }, [toast, transcript]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">Assistente IA</h1>
        <p className="text-sm text-muted-foreground">
          Clique no avatar para começar a falar
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