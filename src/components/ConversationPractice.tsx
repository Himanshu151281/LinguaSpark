import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Avatar from './Avatar';
import { chatCompletion, transcribeAudio, synthesizeSpeech } from '@/lib/groqClient';
import type { Message } from '@/lib/groqClient';
import { Loader2, Volume2, CheckCircle2, AlertCircle, History, ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserData } from '@/lib/userDataStorage';

// Interface for conversation history
interface ConversationHistory {
  id: string;
  date: string;
  scenario: string;
  messages: {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    translation?: string;
    showTranslation?: boolean;
    feedback?: {
      pronunciation: 'good' | 'needs-work';
      grammar: 'good' | 'needs-work';
      corrections?: string[];
      score?: number;
    };
    showFeedback?: boolean;
  }[];
}

const ConversationPractice: React.FC = () => {
  const [messages, setMessages] = useState<{
    id: number;
    sender: 'user' | 'ai';
    text: string;
    translation?: string;
    showTranslation?: boolean;
    feedback?: {
      pronunciation: 'good' | 'needs-work';
      grammar: 'good' | 'needs-work';
      corrections?: string[];
      score?: number;
    };
    showFeedback?: boolean;
  }[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Hola! ¿Cómo estás hoy?',
      translation: 'Hello! How are you today?',
      showTranslation: false,
    },
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('casual');
  const [isLoading, setIsLoading] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<number[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<number[]>([]);
  const [audioPlayingId, setAudioPlayingId] = useState<number | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [practiceLanguage, setPracticeLanguage] = useState('spanish');
  const [responseLanguage, setResponseLanguage] = useState('english');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load conversation history from localStorage on component mount
  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = localStorage.getItem('linguaspark_conversation_history');
      if (savedHistory) {
        try {
          setConversationHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Error loading conversation history:', e);
          setConversationHistory([]);
        }
      }
    };
    
    // Initialize practice language from user data
    const userData = getUserData();
    if (userData.language) {
      setPracticeLanguage(userData.language);
    }
    
    loadHistory();
  }, []);

  // Save current conversation to history when it has 3 or more messages
  useEffect(() => {
    if (messages.length >= 3 && !isLoading) {
      const currentConversationId = sessionStorage.getItem('current_conversation_id') || 
                                   `conv_${Date.now()}`;
      
      // First time saving this conversation, set ID in session storage
      if (!sessionStorage.getItem('current_conversation_id')) {
        sessionStorage.setItem('current_conversation_id', currentConversationId);
      }
      
      const updatedHistory = [...conversationHistory];
      const existingIndex = updatedHistory.findIndex(h => h.id === currentConversationId);
      
      const currentConversation: ConversationHistory = {
        id: currentConversationId,
        date: new Date().toLocaleString(),
        scenario: selectedScenario,
        messages: [...messages]
      };
      
      if (existingIndex >= 0) {
        // Update existing conversation
        updatedHistory[existingIndex] = currentConversation;
      } else {
        // Add new conversation
        updatedHistory.unshift(currentConversation);
      }
      
      // Keep only the last 10 conversations
      const trimmedHistory = updatedHistory.slice(0, 10);
      
      setConversationHistory(trimmedHistory);
      localStorage.setItem('linguaspark_conversation_history', JSON.stringify(trimmedHistory));
    }
  }, [messages, isLoading]);
  
  // Stop audio playback when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  const scenarios = [
    { id: 'casual', name: 'Casual Conversation', icon: '💬' },
    { id: 'restaurant', name: 'At a Restaurant', icon: '🍽️' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'business', name: 'Business Meeting', icon: '💼' },
    { id: 'emergency', name: 'Emergency', icon: '🚨' },
  ];
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    const newUserMessage = { 
      id: messages.length + 1, 
      sender: 'user' as const, 
      text: userInput,
      showFeedback: false
    };
    setMessages([...messages, newUserMessage]);
    setUserInput('');
    
    try {
      // Analyze the user's message for feedback
      setAnalyzingIds(prev => [...prev, newUserMessage.id]);
      const feedbackPromise = chatCompletion([
        { 
          role: 'system', 
          content: `You are a language assistant that analyzes language learners' responses in ${practiceLanguage}. Provide feedback on grammar and pronunciation. Format your response as JSON with keys: pronunciation (good/needs-work), grammar (good/needs-work), corrections (array of recommended corrections), score (0-100).` 
        },
        { role: 'user', content: userInput }
      ]);
      
      // Get the AI's response to continue the conversation
      const payload = [
        { 
          role: 'system', 
          content: `You are an AI language tutor helping users practice ${practiceLanguage}. The user is practicing ${practiceLanguage}, and you should respond in ${responseLanguage}. Keep responses natural, conversational, and appropriate for the scenario: ${scenarios.find(s => s.id === selectedScenario)?.name}.` 
        },
        ...messages.map(msg => ({
          role: (msg.sender === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: msg.text,
        })),
        {
          role: 'user' as const,
          content: userInput
        }
      ];
      
      const response = await chatCompletion(payload);
      
      // Get feedback results
      const feedbackResponse = await feedbackPromise;
      let feedback;
      try {
        feedback = JSON.parse(feedbackResponse.choices?.[0]?.message?.content || '{}');
      } catch (e) {
        console.error('Feedback parsing error:', e);
        feedback = {
          pronunciation: 'good',
          grammar: 'good',
          corrections: [],
          score: 80
        };
      }
      
      // Update the user message with feedback
      setMessages(prev => prev.map(msg => 
        msg.id === newUserMessage.id 
          ? { ...msg, feedback, showFeedback: false } 
          : msg
      ));
      setAnalyzingIds(prev => prev.filter(id => id !== newUserMessage.id));
      
      // Add the AI's response
      const aiText = response.choices?.[0]?.message?.content || 'No response from API';
      const aiResponse = { 
        id: messages.length + 2, 
        sender: 'ai' as const, 
        text: aiText, 
        translation: '', 
        showTranslation: false 
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Play AI response via TTS
      try {
        const audioBuffer = await synthesizeSpeech(aiText);
        const audioBlob = new Blob([audioBuffer]);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setAudioPlayingId(aiResponse.id);
        audio.onended = () => setAudioPlayingId(null);
        audio.play();
      } catch (e) {
        console.error('TTS playback error:', e);
      }
    } catch (error) {
      console.error('Chat API error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleTranslation = async (id: number) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    if (!msg.translation) {
      setTranslatingIds(prev => [...prev, id]);
      try {
        const payload: Message[] = [
          { role: 'system', content: 'Translate the following text to English:' },
          { role: 'user', content: msg.text }
        ];
        const res = await chatCompletion(payload);
        const translated = res.choices?.[0]?.message?.content || '';
        setMessages(prev => prev.map(m => m.id === id ? { ...m, translation: translated, showTranslation: true } : m));
      } catch (e) {
        console.error('Translation error:', e);
      } finally {
        setTranslatingIds(prev => prev.filter(i => i !== id));
      }
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, showTranslation: !m.showTranslation } : m));
    }
  };

  const toggleFeedback = (id: number) => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, showFeedback: !m.showFeedback } : m
    ));
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
        recorder.start();
      } catch (e) {
        console.error('Recording error:', e);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      try {
        const transcription = await transcribeAudio(blob);
        setUserInput(transcription.text || '');
      } catch (e) {
        console.error('Transcription error:', e);
      }
    }
  };

  const playAudioMessage = async (id: number, text: string) => {
    if (audioPlayingId === id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setAudioPlayingId(null);
      }
      return;
    }
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    try {
      const audioBuffer = await synthesizeSpeech(text);
      const audioBlob = new Blob([audioBuffer]);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setAudioPlayingId(id);
      audio.onended = () => setAudioPlayingId(null);
      audio.play();
    } catch (e) {
      console.error('TTS playback error:', e);
    }
  };

  const changeScenario = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setIsLoading(true);
    
    // Clear session storage to start a new conversation
    sessionStorage.removeItem('current_conversation_id');
    
    try {
      const scenarioName = scenarios.find(s => s.id === scenarioId)?.name || 'Casual Conversation';
      
      // Get the AI's initial greeting message in the selected practice language
      const payload = [
        { 
          role: 'system', 
          content: `You are an AI language tutor helping users practice ${practiceLanguage}. 
          Generate a short greeting or opening line for a "${scenarioName}" scenario in ${practiceLanguage}.
          The greeting should be 1-2 sentences only.` 
        },
        { role: 'user', content: 'Start the conversation with an appropriate greeting.' }
      ];
      
      const response = await chatCompletion(payload);
      const aiGreeting = response.choices?.[0]?.message?.content || getDefaultGreeting(scenarioId, practiceLanguage);
      
      // Generate translation if response language is different from practice language
      let translationText = '';
      if (responseLanguage !== practiceLanguage) {
        const translationPayload = [
          { role: 'system', content: `Translate this text from ${practiceLanguage} to ${responseLanguage}:` },
          { role: 'user', content: aiGreeting }
        ];
        const translationResponse = await chatCompletion(translationPayload);
        translationText = translationResponse.choices?.[0]?.message?.content || '';
      }
      
      setMessages([{
        id: 1,
        sender: 'ai',
        text: aiGreeting,
        translation: translationText,
        showTranslation: false,
      }]);
    } catch (error) {
      console.error('Error generating initial message:', error);
      // Fall back to default greeting if API call fails
      setMessages([{
        id: 1,
        sender: 'ai',
        text: getDefaultGreeting(scenarioId, practiceLanguage),
        translation: 'Hello! How can I help you today?',
        showTranslation: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get default greeting
  const getDefaultGreeting = (scenario: string, language: string = practiceLanguage): string => {
    // Default greetings by language and scenario
    const greetings: Record<string, Record<string, string>> = {
      spanish: {
        casual: '¡Hola! ¿Cómo estás hoy?',
        restaurant: 'Bienvenido al restaurante. ¿Le gustaría ver el menú?',
        shopping: '¡Hola! ¿En qué puedo ayudarle hoy?',
        travel: '¿Adónde le gustaría viajar?',
        business: 'Buenos días. Bienvenido a nuestra reunión.',
        emergency: '¿Cuál es su emergencia? ¿Cómo puedo ayudarle?',
      },
      french: {
        casual: 'Bonjour ! Comment allez-vous aujourd\'hui ?',
        restaurant: 'Bienvenue au restaurant. Souhaitez-vous voir le menu ?',
        shopping: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
        travel: 'Où souhaitez-vous voyager ?',
        business: 'Bonjour. Bienvenue à notre réunion.',
        emergency: 'Quelle est votre urgence ? Comment puis-je vous aider ?',
      },
      german: {
        casual: 'Hallo! Wie geht es Ihnen heute?',
        restaurant: 'Willkommen im Restaurant. Möchten Sie die Speisekarte sehen?',
        shopping: 'Hallo! Wie kann ich Ihnen heute helfen?',
        travel: 'Wohin möchten Sie reisen?',
        business: 'Guten Tag. Willkommen zu unserem Meeting.',
        emergency: 'Was ist Ihr Notfall? Wie kann ich Ihnen helfen?',
      },
      italian: {
        casual: 'Ciao! Come stai oggi?',
        restaurant: 'Benvenuto al ristorante. Vuoi vedere il menu?',
        shopping: 'Ciao! Come posso aiutarti oggi?',
        travel: 'Dove vorresti viaggiare?',
        business: 'Buongiorno. Benvenuto alla nostra riunione.',
        emergency: 'Qual è la tua emergenza? Come posso aiutarti?',
      },
      japanese: {
        casual: 'こんにちは！今日の調子はどうですか？',
        restaurant: 'レストランへようこそ。メニューをご覧になりますか？',
        shopping: 'こんにちは！本日はどのようにお手伝いできますか？',
        travel: 'どちらへ旅行されますか？',
        business: 'おはようございます。会議へようこそ。',
        emergency: '緊急事態は何ですか？どのようにお手伝いできますか？',
      },
      chinese: {
        casual: '你好！今天感觉如何？',
        restaurant: '欢迎光临本餐厅。您想看看菜单吗？',
        shopping: '你好！今天我能帮您什么？',
        travel: '您想去哪里旅行？',
        business: '早上好。欢迎参加我们的会议。',
        emergency: '您有什么紧急情况？我能如何帮助您？',
      },
      portuguese: {
        casual: 'Olá! Como está hoje?',
        restaurant: 'Bem-vindo ao restaurante. Gostaria de ver o cardápio?',
        shopping: 'Olá! Como posso ajudá-lo hoje?',
        travel: 'Para onde gostaria de viajar?',
        business: 'Bom dia. Bem-vindo à nossa reunião.',
        emergency: 'Qual é a sua emergência? Como posso ajudá-lo?',
      },
      english: {
        casual: 'Hello! How are you today?',
        restaurant: 'Welcome to the restaurant. Would you like to see the menu?',
        shopping: 'Hello! How can I help you today?',
        travel: 'Where would you like to travel to?',
        business: 'Good morning. Welcome to our meeting.',
        emergency: 'What is your emergency? How can I help you?',
      },
      hindi: {
        casual: 'नमस्ते! आज आप कैसे हैं?',
        restaurant: 'रेस्तरां में आपका स्वागत है। क्या आप मेन्यू देखना चाहेंगे?',
        shopping: 'नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूं?',
        travel: 'आप कहां यात्रा करना चाहते हैं?',
        business: 'सुप्रभात। हमारी मीटिंग में आपका स्वागत है।',
        emergency: 'आपकी आपातकालीन स्थिति क्या है? मैं आपकी कैसे मदद कर सकता हूं?',
      },
      arabic: {
        casual: 'مرحبًا! كيف حالك اليوم؟',
        restaurant: 'مرحبًا بك في المطعم. هل ترغب في رؤية القائمة؟',
        shopping: 'مرحبًا! كيف يمكنني مساعدتك اليوم؟',
        travel: 'إلى أين ترغب في السفر؟',
        business: 'صباح الخير. مرحبًا بك في اجتماعنا.',
        emergency: 'ما هي حالة الطوارئ الخاصة بك؟ كيف يمكنني مساعدتك؟',
      }
    };
    
    // Return greeting for the selected language and scenario, or fallback to default
    return greetings[language]?.[scenario] || greetings.english[scenario] || 'Hello! How can I help you today?';
  };
  
  const loadConversation = (index: number) => {
    const conversation = conversationHistory[index];
    if (conversation) {
      // Set the current conversation ID in session storage
      sessionStorage.setItem('current_conversation_id', conversation.id);
      
      // Load scenario and messages
      setSelectedScenario(conversation.scenario);
      setMessages(conversation.messages);
      
      // Close history panel
      setSelectedHistoryIndex(index);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
      : date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };
  
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
      localStorage.removeItem('linguaspark_conversation_history');
      setConversationHistory([]);
      setSelectedHistoryIndex(null);
    }
  };
  
  // Add language change handlers
  const handlePracticeLanguageChange = (value: string) => {
    setPracticeLanguage(value);
    refreshConversation(value, responseLanguage);
  };
  
  const handleResponseLanguageChange = (value: string) => {
    setResponseLanguage(value);
    refreshConversation(practiceLanguage, value);
  };
  
  // Function to refresh the conversation when language changes
  const refreshConversation = async (practice: string, responseLanguage: string) => {
    setIsLoading(true);
    try {
      // Start a new conversation with the current scenario but new languages
      const scenarioName = scenarios.find(s => s.id === selectedScenario)?.name || 'Casual Conversation';
      
      // Clear session storage to start a new conversation
      sessionStorage.removeItem('current_conversation_id');
      
      const payload = [
        { 
          role: 'system', 
          content: `You are an AI language tutor helping users practice ${practice}. 
          Generate a short greeting or opening line for a "${scenarioName}" scenario in ${practice}.
          The greeting should be 1-2 sentences only.` 
        },
        { role: 'user', content: 'Start the conversation with an appropriate greeting.' }
      ];
      
      const apiResponse = await chatCompletion(payload);
      const aiGreeting = apiResponse.choices?.[0]?.message?.content || getDefaultGreeting(selectedScenario, practice);
      
      // Generate translation if response language is different from practice language
      let translationText = '';
      if (responseLanguage !== practice) {
        const translationPayload = [
          { role: 'system', content: `Translate this text from ${practice} to ${responseLanguage}:` },
          { role: 'user', content: aiGreeting }
        ];
        const translationResponse = await chatCompletion(translationPayload);
        translationText = translationResponse.choices?.[0]?.message?.content || '';
      }
      
      setMessages([{
        id: 1,
        sender: 'ai',
        text: aiGreeting,
        translation: translationText,
        showTranslation: false,
      }]);
    } catch (error) {
      console.error('Error refreshing conversation:', error);
      setMessages([{
        id: 1,
        sender: 'ai',
        text: getDefaultGreeting(selectedScenario, practice),
        translation: 'Hello! How can I help you today?',
        showTranslation: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Conversation Practice
          </h1>
          <p className="text-gray-600">
            Practice your speaking skills with our AI language partner
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="mb-4">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>AI Conversation Partner</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1"
                >
                  <History size={16} />
                  <span>History</span>
                  {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4 border rounded-lg p-3 bg-gray-50">
                <div className="flex flex-col gap-1">
                  <label htmlFor="practiceLanguage" className="text-xs font-medium text-gray-700">Practice Language:</label>
                  <Select 
                    value={practiceLanguage} 
                    onValueChange={handlePracticeLanguageChange}
                  >
                    <SelectTrigger id="practiceLanguage" className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="portuguese">Portuguese</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="korean">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="responseLanguage" className="text-xs font-medium text-gray-700">AI Response Language:</label>
                  <Select 
                    value={responseLanguage} 
                    onValueChange={handleResponseLanguageChange}
                  >
                    <SelectTrigger id="responseLanguage" className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="portuguese">Portuguese</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="korean">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showHistory && (
                <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Previous Conversations</h3>
                    {conversationHistory.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearHistory}>
                        Clear History
                      </Button>
                    )}
                  </div>
                  
                  {conversationHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No conversation history yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {conversationHistory.map((conv, index) => (
                        <div 
                          key={conv.id}
                          className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedHistoryIndex === index ? 'bg-gray-100 border-l-4 border-linguaspark-primary' : ''
                          }`}
                          onClick={() => loadConversation(index)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {scenarios.find(s => s.id === conv.scenario)?.icon || '💬'} 
                              <span className="ml-2 font-medium">{
                                scenarios.find(s => s.id === conv.scenario)?.name || 'Conversation'
                              }</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(conv.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.messages[conv.messages.length - 1]?.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            
              <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto mb-4">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <Avatar name="AI Tutor" className="mr-2" size="sm" />
                    )}
                    
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-linguaspark-primary text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex-1">{message.text}</p>
                        {message.sender === 'ai' && (
                          <button
                            onClick={() => playAudioMessage(message.id, message.text)}
                            className="flex-shrink-0 text-gray-600 hover:text-gray-800 mt-1"
                          >
                            <Volume2 size={16} className={audioPlayingId === message.id ? "animate-pulse" : ""} />
                          </button>
                        )}
                      </div>
                      
                      {message.translation && message.showTranslation && (
                        <p className="text-sm mt-2 opacity-75 border-t pt-1">
                          {message.translation}
                        </p>
                      )}
                      
                      {message.sender === 'user' && message.feedback && message.showFeedback && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Score:</span>
                            <span className={`${message.feedback.score && message.feedback.score > 70 ? 'text-green-200' : 'text-yellow-200'}`}>
                              {message.feedback.score}/100
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Grammar:</span>
                            {message.feedback.grammar === 'good' ? (
                              <CheckCircle2 size={14} className="text-green-200" />
                            ) : (
                              <AlertCircle size={14} className="text-yellow-200" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Pronunciation:</span>
                            {message.feedback.pronunciation === 'good' ? (
                              <CheckCircle2 size={14} className="text-green-200" />
                            ) : (
                              <AlertCircle size={14} className="text-yellow-200" />
                            )}
                          </div>
                          
                          {message.feedback.corrections && message.feedback.corrections.length > 0 && (
                            <div className="mt-1">
                              <span className="font-medium">Suggested improvements:</span>
                              <ul className="list-disc list-inside">
                                {message.feedback.corrections.map((correction, i) => (
                                  <li key={i} className="text-xs">{correction}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {message.translation && (
                          <button
                            onClick={() => toggleTranslation(message.id)}
                            disabled={translatingIds.includes(message.id)}
                            className={`text-xs mt-1 disabled:opacity-50 ${
                              message.sender === 'user' 
                                ? 'text-white/70 hover:text-white' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {translatingIds.includes(message.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin inline-block" />
                            ) : message.showTranslation ? 'Hide translation' : 'Show translation'}
                          </button>
                        )}
                        
                        {message.sender === 'user' && (
                          <button
                            onClick={() => toggleFeedback(message.id)}
                            disabled={analyzingIds.includes(message.id)}
                            className="text-xs mt-1 disabled:opacity-50 text-white/70 hover:text-white"
                          >
                            {analyzingIds.includes(message.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin inline-block" />
                            ) : message.showFeedback ? 'Hide feedback' : 'Show feedback'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {message.sender === 'user' && (
                      <Avatar name="User" className="ml-2" size="sm" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <Button
                  type="button"
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                  className="flex-shrink-0"
                >
                  {isRecording ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="flex-shrink-0 bg-linguaspark-primary hover:bg-linguaspark-primary/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-1">Send</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Conversation Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenarios.map(scenario => (
                  <Button
                    key={scenario.id}
                    variant={selectedScenario === scenario.id ? "default" : "outline"}
                    className={`w-full justify-start ${
                      selectedScenario === scenario.id 
                        ? 'bg-linguaspark-primary hover:bg-linguaspark-primary/90' 
                        : ''
                    }`}
                    onClick={() => changeScenario(scenario.id)}
                  >
                    <span className="mr-2">{scenario.icon}</span>
                    {scenario.name}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Practice Tips</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-linguaspark-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Listen carefully to the AI's pronunciation
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-linguaspark-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Try to respond without looking at translations
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-linguaspark-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Use voice recording to improve pronunciation
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-linguaspark-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Practice different scenarios to expand vocabulary
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-linguaspark-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Check your feedback to improve accuracy
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConversationPractice;
