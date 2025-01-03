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
      responseType: 'arraybuffer',
      timeout: 30000 // 30 segundos de timeout
    });

    const audioBlob = new Blob([response.data], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const text = prompt;

    console.log('[IARA AI] Áudio URL gerada:', audioUrl);
    
    return {
      text,
      audioUrl
    };
  } catch (error) {
    console.error('[IARA AI] Erro ao obter resposta:', error);
    throw error;
  }
}