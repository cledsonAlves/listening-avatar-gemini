import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getIaraAIResponse } from '@/services/iaraai';
import { AudioInterface } from '@/components/AudioInterface';
import { PinDialog } from '@/components/PinDialog';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

let currentAudio: HTMLAudioElement | null = null;

const playAudioFromUrl = async (audioUrl: string): Promise<void> => {
  try {
    console.log('[Audio] Reproduzindo áudio da URL:', audioUrl);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    await audio.play();
    audio.onended = () => {
      console.log('[Audio] Reprodução finalizada.');
      currentAudio = null;
    };
    audio.onerror = (e) => {
      console.error('[Audio] Erro durante a reprodução:', e);
      currentAudio = null;
    };
  } catch (error) {
    console.error('[Audio] Erro ao reproduzir o áudio:', error);
    currentAudio = null;
    throw error;
  }
};

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    try {
      console.log('[Transcript] Processando:', transcript);
      setIsListening(false);
      setIsSpeaking(true);
      setTranscript('Pensando...');

      const { text, audioUrl } = await getIaraAIResponse(transcript);

      console.log('[API] Resposta recebida:', text);
      setTranscript('Gerando áudio...');

      if (audioUrl) {
        await playAudioFromUrl(audioUrl);
      }

      setIsSpeaking(false);
      setTranscript('');
      setIsListening(true);
    } catch (error) {
      console.error('[Processamento] Erro:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        variant: 'destructive',
      });
      setIsSpeaking(false);
      setTranscript('');
      setIsListening(true);
    }
  }, [toast]);

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
      // Se houver um áudio tocando, para ele
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        setIsSpeaking(false);
      }

      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'pt-BR';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('Estou ouvindo, pode falar...');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const finalTranscript = event.results[current][0].transcript;

          if (event.results[current].isFinal) {
            setTranscript(finalTranscript);
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

  const handleToggleListening = () => {
    if (!isListening) {
      setIsPinDialogOpen(true);
    } else {
      setIsListening(false);
    }
  };

  const handlePinSuccess = () => {
    setIsPinDialogOpen(false);
    setIsListening(true);
  };

  return (
    <>
      <AudioInterface
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={transcript}
        onToggleListening={handleToggleListening}
      />
      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </>
  );
};

export default Index;