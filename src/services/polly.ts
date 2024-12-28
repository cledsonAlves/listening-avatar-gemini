import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const pollyClient = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || 'AKIA4T4OCLRRIEQHUEE5',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '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',
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
      throw new Error("No audio stream returned from Polly");
    }

    // transformToByteArray() retorna Uint8Array
    const uint8Array = await response.AudioStream.transformToByteArray();

    // Precisamos do ArrayBuffer para decodeAudioData
    return uint8Array.buffer;
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    throw new Error("Failed to synthesize speech");
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