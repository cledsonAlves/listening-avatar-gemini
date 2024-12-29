import axios from 'axios';

export const getIaraAIResponse = async (prompt: string): Promise<{ text: string; audioUrl: string }> => {
  try {
    console.log('[IARA AI] Enviando prompt:', prompt);
    
    const response = await axios.post('https://bff-iarahub.vercel.app/api/openai', {
      prompt: prompt
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Importante: especifica que esperamos um buffer
    });

    // Converte o buffer em base64 e cria uma URL do blob
    const audioBlob = new Blob([response.data], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Extrai o texto da resposta do cabeçalho
    const text = response.headers['x-response-text'] || 'Resposta da IARA AI';

    console.log('[IARA AI] Resposta recebida:', { text, audioUrl });
    
    return {
      text,
      audioUrl
    };
  } catch (error) {
    console.error('[IARA AI] Erro ao obter resposta:', error);
    throw error;
  }
}