import axios from 'axios';

export const getIaraAIResponse = async (prompt: string): Promise<{ text: string; audioUrl: string }> => {
  try {
    console.log('[IARA AI] Enviando prompt:', prompt);
    
    const response = await axios.post('https://bff-iarahub.vercel.app/api/openai', {
      prompt: prompt
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[IARA AI] Resposta recebida:', response.data);
    
    // A API já retorna o texto e o áudio sintetizado
    return {
      text: response.data.text,
      audioUrl: response.data.audioUrl
    };
  } catch (error) {
    console.error('[IARA AI] Erro ao obter resposta:', error);
    throw error;
  }
}