import axios from "axios";

const TTSOpenAI = {
    url: "https://cors-anywhere.herokuapp.com/https://api.ttsopenai.com/uapi/v1/text-to-speech",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_TTS_OPENAI_API_KEY || "tts-ef9db4c5766e6ce72cf4c71f52fb70bd", // Substitua pela sua chave da API TTS OpenAI
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
      return response.data.audio_url; // Supondo que a API retorna uma URL de áudio
    } catch (error) {
      console.error("[TTS OpenAI] Erro ao sintetizar fala:", error);
      throw new Error("Failed to synthesize speech with TTS OpenAI");
    }
  },
};

export const synthesizeSpeech = TTSOpenAI.synthesizeSpeech.bind(TTSOpenAI); // Exporta corretamente
