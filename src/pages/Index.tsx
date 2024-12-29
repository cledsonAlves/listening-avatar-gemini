import { useState, useCallback, useEffect, useRef } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { useToast } from '@/hooks/use-toast';
import { getGeminiResponse } from '@/services/gemini';
import { getGroqResponse } from '@/services/groq';
import { getIaraAIResponse } from '@/services/iaraai';
import { synthesizeSpeech as synthesizeWithPolly } from '@/services/polly';
import { synthesizeSpeech as synthesizeWithTTSOpenAI } from '@/services/ttsopenai';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { ProviderSelector } from '@/components/ProviderSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const playAudioFromUrl = async (audioUrl: string): Promise<void> => {
  try {
    console.log('[Audio] Reproduzindo áudio da URL:', audioUrl);
    const audio = new Audio(audioUrl);
    await audio.play();
    audio.onended = () => console.log('[Audio] Reprodução finalizada.');
    audio.onerror = (e) => console.error('[Audio] Erro durante a reprodução:', e);
  } catch (error) {
    console.error('[Audio] Erro ao reproduzir o áudio:', error);
    throw error;
  }
};

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState('groq');
  const [ttsProvider, setTTSProvider] = useState<'polly' | 'ttsopenai' | 'iaraai'>('polly');
  const [messages, setMessages] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    try {
      console.log('[Transcript] Processando:', transcript);
      setIsListening(false);
      setIsSpeaking(true);

      setMessages((prevMessages) => {
        const userMessage: Message = { role: 'user', content: transcript };
        const updatedMessages = [...prevMessages, userMessage];

        (async () => {
          try {
            const conversationContext = updatedMessages.map(msg => msg.content).join('\n');
            const prompt = `${conversationContext}\n${transcript}`;

            console.log('[API] Solicitando resposta...');
            let response: string;
            let audioUrl: string | null = null;

            if (provider === 'iaraai') {
              const iaraResponse = await getIaraAIResponse(prompt);
              response = iaraResponse.text;
              audioUrl = iaraResponse.audioUrl;
              console.log('[IARA AI] Áudio URL recebida:', audioUrl);
            } else {
              response = provider === 'gemini' 
                ? await getGeminiResponse(prompt)
                : await getGroqResponse(prompt);
              
              if (ttsProvider === 'polly') {
                console.log('[TTS] Utilizando Polly...');
                const audioData = await synthesizeWithPolly(response);
                const blob = new Blob([audioData], { type: 'audio/mpeg' });
                audioUrl = URL.createObjectURL(blob);
              } else if (ttsProvider === 'ttsopenai') {
                console.log('[TTS] Utilizando TTS OpenAI...');
                audioUrl = await synthesizeWithTTSOpenAI(response);
              }
            }

            console.log('[API] Resposta recebida:', response);
            const assistantMessage: Message = { role: 'assistant', content: response };
            setMessages(msgs => [...msgs, assistantMessage]);

            if (audioUrl) {
              await playAudioFromUrl(audioUrl);
            }

            setIsSpeaking(false);
            setIsListening(true);
          } catch (error) {
            console.error('[Processamento] Erro:', error);
            toast({
              title: 'Erro',
              description: 'Ocorreu um erro ao processar sua mensagem.',
              variant: 'destructive',
            });
            setIsSpeaking(false);
          }
        })();

        return updatedMessages;
      });
    } catch (error) {
      console.error('[Transcript] Erro durante o processamento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao processar sua mensagem.',
        variant: 'destructive',
      });
      setIsSpeaking(false);
    }
  }, [toast, provider, ttsProvider]);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        title: 'Erro',
        description: 'Reconhecimento de voz não é suportado neste navegador.',
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let timeoutId: NodeJS.Timeout;

    if (isListening) {
      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = false;
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
          console.error('Erro no reconhecimento de voz:', event.error);
          setIsListening(false);
          toast({
            title: 'Erro',
            description: 'Falha no reconhecimento de voz. Tente novamente.',
            variant: 'destructive',
          });
        };

        recognition.start();

        timeoutId = setTimeout(() => {
          setIsListening(false);
          recognition.stop();
          toast({
            title: 'Timeout',
            description: 'Nenhuma fala detectada. Reconhecimento de voz encerrado.',
          });
        }, 60000);
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento de voz:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao iniciar reconhecimento de voz.',
          variant: 'destructive',
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

        <ProviderSelector
          provider={provider}
          onProviderChange={setProvider}
          ttsProvider={ttsProvider}
          onTTSProviderChange={(value) => setTTSProvider(value as 'polly' | 'ttsopenai' | 'iaraai')}
        />

        <Button
          onClick={toggleListening}
          variant={isListening ? 'destructive' : 'default'}
          className="mt-4"
        >
          {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
          {isListening ? 'Parar' : 'Iniciar'}
        </Button>
      </div>

      <div className="relative">
        <Avatar className={isListening ? 'animate-pulse' : ''} />
        <AudioVisualizer isActive={isListening || isSpeaking} />
      </div>

      {transcript && (
        <div className="glass-panel p-4 rounded-lg max-w-md w-full mx-auto">
          <p className="text-sm text-center">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Index;