import axios from "axios";

const TTSOpenAI = {
  url: "/api/ttsopenai",
  headers: {
    "Content-Type": "application/json",
  },

  async synthesizeSpeech(text: string): Promise<string | null> {
    console.log(`[TTS OpenAI] Iniciando a síntese de fala para o texto: "${text}"`);
    const data = {
      model: "tts-1",
      voice_id: "OA001",
      speed: 1,
      input: text,
    };

    try {
      const response = await axios.post(this.url, data, {
        headers: this.headers,
      });

      console.log("[TTS OpenAI] Resposta recebida:", response.data);
      return response.data.audio_url;
    } catch (error) {
      console.error("[TTS OpenAI] Erro ao sintetizar fala:", error);
      throw new Error("Failed to synthesize speech with TTS OpenAI");
    }
  },
};

export const synthesizeSpeech = TTSOpenAI.synthesizeSpeech.bind(TTSOpenAI);