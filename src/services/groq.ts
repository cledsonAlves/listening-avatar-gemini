const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getGroqResponse = async (prompt: string) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || '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'}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Groq');
    }

    const data = await response.json();
    console.log(data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('Failed to get response from Groq');
  }
};