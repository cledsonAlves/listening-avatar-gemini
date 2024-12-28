import { useState, useCallback, useEffect } from 'react';
import { Avatar } from '@/components/Avatar';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { useToast } from '@/components/ui/use-toast';
import { getGeminiResponse } from '@/services/gemini';
import { getGroqResponse } from '@/services/groq';
import { synthesizeSpeech, playAudio } from '@/services/polly';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bot, Brain, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript) return;

    try {
      setIsSpeaking(true);
      
      // Add user message to history
      const userMessage: Message = { role: 'user', content: transcript };
      setMessages(prev => [...prev, userMessage]);

      // Get response from selected provider with conversation history
      const conversationContext = messages.map(msg => msg.content).join('\n');
      const prompt = `${conversationContext}\n${transcript}`;
      
      const response = provider === 'gemini' 
        ? await getGeminiResponse(prompt)
        : await getGroqResponse(prompt);
      
      // Add assistant response to history
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

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
  }, [toast, provider, messages]);

  useEffect(() => {
    let recognition: any;

    if (isListening) {
      try {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          
          if (event.results[current].isFinal) {
            setTranscript(transcript);
            processTranscript(transcript);
            setTranscript('');
          } else {
            setTranscript(transcript);
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
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast({
          title: "Erro",
          description: "Reconhecimento de voz não é suportado neste navegador.",
          variant: "destructive",
        });
        setIsListening(false);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, processTranscript, toast]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">Assistente IA</h1>
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

      <div className="transform transition-transform duration-300 hover:scale-105">
        <Avatar isListening={isListening} isSpeaking={isSpeaking} />
      </div>

      <AudioVisualizer isActive={isListening || isSpeaking} />

      {transcript && (
        <div className="glass-panel p-4 rounded-lg max-w-md w-full mx-auto">
          <p className="text-sm text-center">{transcript}</p>
        </div>
      )}

      <div className="max-w-md w-full mx-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-8' 
                : 'bg-gray-100 mr-8'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;