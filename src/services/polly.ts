import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const pollyClient = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

export const synthesizeSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const command = new SynthesizeSpeechCommand({
      Engine: "neural",
      LanguageCode: "pt-BR",
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Camila",
    });

    const response = await pollyClient.send(command);
    
    if (!response.AudioStream) {
      throw new Error('No audio stream returned from Polly');
    }

    return await response.AudioStream.transformToByteArray();
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw new Error('Failed to synthesize speech');
  }
};

export const playAudio = async (audioData: ArrayBuffer) => {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(audioData);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
  return new Promise((resolve) => {
    source.onended = resolve;
  });
};