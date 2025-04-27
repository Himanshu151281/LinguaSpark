// src/lib/groqClient.ts
// Helper module to interact with GroqCloud APIs

const API_URL = import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chatCompletion(messages: Message[]) {
  console.log('Making API call to:', `${API_URL}/openai/v1/chat/completions`);
  console.log('Using API Key:', API_KEY ? `${API_KEY.substring(0, 4)}...` : 'Not set');
  
  try {
    const res = await fetch(`${API_URL}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages,
      }),
    });
    
    // Log HTTP status
    console.log('API response status:', res.status, res.statusText);
    
    // Handle non-200 responses
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error response:', errorText);
      return { error: true, status: res.status, message: errorText };
    }
    
    return await res.json();
  } catch (error) {
    console.error('API call failed:', error);
    return { error: true, message: error.toString() };
  }
}

async function transcribeAudio(file: Blob) {
  const form = new FormData();
  form.append('file', file);
  form.append('model', 'whisper-large-v3-turbo');

  const res = await fetch(`${API_URL}/openai/v1/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    body: form,
  });
  return res.json();
}

// Browser's native Web Speech API for TTS
function useBrowserTTS(text: string, voiceName?: string, rate = 1, pitch = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Browser does not support speech synthesis'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if specified and available
    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Set speech rate and pitch
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Set handlers
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  });
}

// Groq TTS API is kept as a backup option, but not used by default
async function synthesizeSpeechGroq(text: string) {
  console.log('TTS API call with text length:', text.length);
  
  // Limit text length to prevent oversized requests
  const limitedText = text.length > 4000 ? text.substring(0, 4000) : text;
  
  try {
    const res = await fetch(`${API_URL}/openai/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'playai-tts',
        input: limitedText,
        voice: 'alloy',  // Specify a voice
        response_format: 'mp3',  // Ensure we get an mp3 file
      }),
    });
    
    // Log HTTP status
    console.log('TTS API response status:', res.status, res.statusText);
    
    // Handle non-200 responses
    if (!res.ok) {
      const errorText = await res.text();
      console.error('TTS API error response:', errorText);
      throw new Error(`TTS API error: ${res.status} ${res.statusText}`);
    }
    
    return await res.arrayBuffer(); // audio data
  } catch (error) {
    console.error('TTS API call failed:', error);
    throw error; // Re-throw to handle in the component
  }
}

// Main TTS function to use - defaults to browser TTS
async function synthesizeSpeech(text: string): Promise<void> {
  // Split content into manageable chunks for better speech synthesis
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Process sentences one by one
  for (let i = 0; i < sentences.length; i++) {
    await useBrowserTTS(sentences[i], undefined, 1, 1);
  }
}

async function reasoning(prompt: string) {
  const res = await fetch(`${API_URL}/openai/v1/reasoning/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-r1-distill-llama-70b',
      prompt,
    }),
  });
  return res.json();
}

async function visionAnalyze(file: Blob) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/openai/v1/vision/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    body: form,
  });
  return res.json();
}

export { chatCompletion, transcribeAudio, synthesizeSpeech, reasoning, visionAnalyze, useBrowserTTS };
