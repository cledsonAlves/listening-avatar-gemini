import { useState, useCallback, useEffect, useRef } from 'react';
import { Avatar } from '@/components/Avatar';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { useToast } from '@/components/ui/use-toast';
import { getGeminiResponse } from '@/services/gemini';
import { getGroqResponse } from '@/services/groq';
import { synthesizeSpeech, playAudio } from '@/services/polly';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bot, Brain, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState('groq'); // Default: Groq habilitado
  const [messages, setMessages] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    try {
      setIsListening(false); // Desativa o microfone enquanto o assistente fala

      setMessages((prevMessages) => {
        const userMessage: Message = { role: 'user', content: transcript };
        const updatedMessages = [...prevMessages, userMessage];

        (async () => {
          const conversationContext = updatedMessages.map(msg => msg.content).join('\n');
          const prompt = `${conversationContext}\n${transcript}`;

          const response = provider === 'gemini' 
            ? await getGeminiResponse(prompt)
            : await getGroqResponse(prompt);

          const assistantMessage: Message = { role: 'assistant', content: response };
          setMessages((msgs) => [...msgs, assistantMessage]);

          // Reproduz áudio
          const audioData = await synthesizeSpeech(response);
          setIsSpeaking(true);
          await playAudio(audioData);
          setIsSpeaking(false);
          setIsListening(true);
        })();

        return updatedMessages;
      });
    } catch (error) {
      console.error('Error processing response:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua mensagem.",
        variant: "destructive",
      });
      setIsSpeaking(false);
    }
  }, [toast, provider]);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        title: "Erro",
        description: "Reconhecimento de voz não é suportado neste navegador.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let timeoutId;

    if (isListening) {
      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = false; // Melhora a precisão
        recognition.lang = 'pt-BR';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const finalTranscript = event.results[current][0].transcript;

          if (event.results[current].isFinal) {
            setTranscript('');
            processTranscript(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Erro",
            description: "Falha no reconhecimento de voz. Tente novamente.",
            variant: "destructive",
          });
        };

        recognition.start();

        timeoutId = setTimeout(() => {
          setIsListening(false);
          recognition.stop();
          toast({
            title: "Timeout",
            description: "Nenhuma fala detectada. Reconhecimento de voz encerrado.",
          });
        }, 60000); // Timeout de 60 segundos

      } catch (error) {
        console.error('Speech recognition error:', error);
        toast({
          title: "Erro",
          description: "Erro ao iniciar reconhecimento de voz.",
          variant: "destructive",
        });
        setIsListening(false);
      }
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      clearTimeout(timeoutId);
    };
  }, [isListening, processTranscript, toast]);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">Iara Hub - Assistente IA</h1>
        <p className="text-sm text-muted-foreground">
          {isListening ? 'Escutando...' : 'Clique no microfone para começar'}
        </p>

        <ToggleGroup
          type="single"
          value={provider}
          onValueChange={(value) => value && setProvider(value)}
          className="justify-center"
        >
          <ToggleGroupItem value="gemini" aria-label="Usar Gemini">
            <Brain className="mr-2" />
            Gemini
          </ToggleGroupItem>
          <ToggleGroupItem value="groq" aria-label="Usar Groq">
            <Bot className="mr-2" />
            Groq
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          className="mt-4"
        >
          {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
          {isListening ? 'Parar' : 'Iniciar'}
        </Button>
      </div>

      <Avatar isListening={isListening} isSpeaking={isSpeaking} />

      <AudioVisualizer isActive={isListening || isSpeaking} />

      {transcript && (
        <div className="glass-panel p-4 rounded-lg max-w-md w-full mx-auto">
          <p className="text-sm text-center">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Index;
