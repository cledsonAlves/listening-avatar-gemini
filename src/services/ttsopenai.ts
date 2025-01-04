import axios from "axios";

const BFF_API_URL = "https://bff-iarahub.vercel.app/api/webhook";

export const synthesizeSpeech = async (text: string): Promise<string> => {
  try {
    const response = await axios.get("https://bff-iarahub.vercel.app/api/webhook", {
      params: { text },
      timeout: 30000, // Timeout de 30 segundos
    });

    if (response.data && response.data.mediaUrl) {
      return response.data.mediaUrl;
    } else {
      throw new Error("URL da mídia não encontrada na resposta do BFF.");
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("Erro: Timeout ao aguardar resposta do BFF.");
    } else {
      console.error("Erro ao sintetizar fala:", error.message);
    }
    throw error;
  }
};

