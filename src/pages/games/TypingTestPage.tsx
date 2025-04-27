import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Trophy, Check, RotateCcw, Loader2, Globe } from 'lucide-react';
import { chatCompletion } from '@/lib/groqClient';
import { getUserData } from '@/lib/userDataStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const difficultyLevels = [
  {
    id: 'beginner',
    label: 'Beginner',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
  },
  {
    id: 'advanced',
    label: 'Advanced',
  }
];

const availableLanguages = [
  { id: 'english', name: 'English' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'french', name: 'French' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'japanese', name: 'Japanese' },
  { id: 'chinese', name: 'Chinese' }
];

const TypingTestPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [typingText, setTypingText] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);
  const [userLanguage, setUserLanguage] = useState('english');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get user's selected language on component mount
  useEffect(() => {
    const userData = getUserData();
    if (userData && userData.language) {
      setUserLanguage(userData.language);
    }
  }, []);
  
  useEffect(() => {
    const fetchTypingText = async () => {
      setIsLoadingText(true);
      resetTest();
      try {
        // Use the user's selected language 
        const res = await chatCompletion([
          { role: 'system', content: 'You are a language tutor.' },
          { role: 'user', content: `Generate a ${selectedDifficulty} level ${userLanguage} passage of around 50-70 words for typing practice. The text should fit in a standard paragraph and not be too long.` }
        ]);
        
        const text = res.choices?.[0]?.message?.content.trim() || '';
        // Ensure the text isn't too long to prevent display issues
        const limitedText = text.length > 280 ? text.substring(0, 280) : text;
        setTypingText(limitedText);
      } catch (e) {
        console.error('Typing text error:', e);
        // Fallback text in case of API failure
        const fallbackTexts = {
          english: "The quick brown fox jumps over the lazy dog. Practice your typing skills with this simple sentence.",
          spanish: "El rápido zorro marrón salta sobre el perro perezoso. Practica tus habilidades de mecanografía con esta simple frase.",
          french: "Le rapide renard brun saute par-dessus le chien paresseux. Entraînez vos compétences en dactylographie avec cette phrase simple.",
          hindi: "तेज़ भूरी लोमड़ी आलसी कुत्ते पर कूदती है। इस सरल वाक्य के साथ अपने टाइपिंग कौशल का अभ्यास करें।",
          japanese: "速い茶色のキツネは怠け者の犬を飛び越えます。この単純な文であなたのタイピングスキルを練習しましょう。",
          arabic: "الثعلب البني السريع يقفز فوق الكلب الكسول. تدرب على مهارات الكتابة باستخدام هذه الجملة البسيطة."
        };
        
        setTypingText(fallbackTexts[userLanguage as keyof typeof fallbackTexts] || fallbackTexts.english);
      } finally {
        setIsLoadingText(false);
      }
    };
    fetchTypingText();
  }, [selectedDifficulty, userLanguage]);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      calculateResults();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);
  
  const startTest = () => {
    setIsActive(true);
    setIsFinished(false);
    setUserInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const resetTest = () => {
    setIsActive(false);
    setIsFinished(false);
    setUserInput('');
    setTimer(60);
    setWpm(0);
    setAccuracy(0);
    setErrors(0);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Check if the user has completed typing the text
    if (value === typingText) {
      setIsActive(false);
      setIsFinished(true);
      calculateResults();
    }
  };
  
  const calculateResults = () => {
    // Calculate words per minute
    const words = userInput.trim().split(/\s+/).length;
    const minutes = (60 - timer) / 60;
    const calculatedWpm = Math.round(words / (minutes || 1)); // Avoid division by zero
    
    // Calculate accuracy
    let correctChars = 0;
    const minLength = Math.min(userInput.length, typingText.length);
    
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === typingText[i]) {
        correctChars++;
      }
    }
    
    const calculatedAccuracy = Math.round((correctChars / typingText.length) * 100);
    const calculatedErrors = typingText.length - correctChars;
    
    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    setErrors(calculatedErrors);
  };
  
  // Simplified character rendering with obvious colors and indicators
  const renderText = () => {
    if (!typingText) return <p>Loading text...</p>;
    
    const words = typingText.split(' ');
    const userWords = userInput.split(' ');
    
    return (
      <div className="leading-relaxed">
        {words.map((word, wordIndex) => {
          const userWord = userWords[wordIndex] || '';
          const isCorrectWord = userWord === word;
          const isAttemptedWord = wordIndex < userWords.length;
          
          // Determine background color for the whole word
          let bgColor = 'transparent';
          if (isAttemptedWord) {
            bgColor = isCorrectWord ? 'bg-green-100' : 'bg-red-100';
          }
          
          return (
            <span key={wordIndex} className={`relative inline-block mr-2 mb-8 p-1 rounded ${bgColor}`}>
              {word}
              
              {/* Show error indicator under incorrect words */}
              {isAttemptedWord && !isCorrectWord && (
                <span className="absolute -bottom-6 left-0 text-xs text-white bg-red-600 px-2 py-1 rounded-md font-bold">
                  MISTAKE!
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };
  
  const formattedTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Navbar /> */}
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Typing Test</h1>
            <p className="text-gray-600">
              Improve your typing speed and accuracy in {userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <CardTitle>Typing Challenge</CardTitle>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge variant={isActive ? 'default' : 'outline'} className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formattedTime()}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardDescription>Type the text below as quickly and accurately as possible</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                {isLoadingText ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin h-10 w-10" />
                  </div>
                ) : !isFinished ? (
                  <>
                    {isActive && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span className="font-medium">Time Remaining</span>
                          <span className="font-bold">{formattedTime()}</span>
                        </div>
                        <Progress 
                          value={(timer / 60) * 100} 
                          className={`h-3 ${timer <= 10 ? 'bg-red-500' : timer <= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        />
                      </div>
                    )}
                    <div className="border rounded-lg p-4 mb-4 min-h-[100px] max-h-[200px] overflow-y-auto font-mono text-base leading-relaxed break-words whitespace-pre-wrap">
                      {renderText()}
                    </div>
                    
                    <textarea
                      ref={textareaRef}
                      value={userInput}
                      onChange={handleInputChange}
                      disabled={!isActive || isFinished}
                      placeholder={isActive ? "Start typing..." : "Press 'Start Test' to begin"}
                      className="w-full h-32 p-4 border rounded-lg font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6 py-8">
                    <div className="h-28 w-28 rounded-full bg-green-100 flex items-center justify-center">
                      <Trophy className="h-14 w-14 text-green-600" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-2xl font-bold">Test Completed!</h3>
                      <p className="text-gray-600 mb-6">Here's how you performed:</p>
                      
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="border rounded-lg p-4 text-center">
                          <p className="text-gray-500 text-sm mb-1">Typing Speed</p>
                          <p className="text-3xl font-bold">{wpm}</p>
                          <p className="text-gray-500 text-sm">WPM</p>
                        </div>
                        
                        <div className="border rounded-lg p-4 text-center">
                          <p className="text-gray-500 text-sm mb-1">Accuracy</p>
                          <p className="text-3xl font-bold">{accuracy}%</p>
                          <p className="text-gray-500 text-sm">{errors} errors</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                {!isActive && !isFinished ? (
                  <Button onClick={startTest} className="w-full">
                    Start Test
                  </Button>
                ) : isActive ? (
                  <Button onClick={resetTest} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart Test
                  </Button>
                ) : (
                  <Button onClick={resetTest} className="w-full">
                    Try Again
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Level</CardTitle>
                <CardDescription>Select your difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  {difficultyLevels.map((level) => (
                    <Button
                      key={level.id}
                      variant={selectedDifficulty === level.id ? "default" : "outline"}
                      className={`justify-start ${
                        selectedDifficulty === level.id ? "bg-blue-600" : ""
                      }`}
                      onClick={() => setSelectedDifficulty(level.id)}
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Language
                </CardTitle>
                <CardDescription>Select your practice language</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={userLanguage}
                  onValueChange={(value) => {
                    setUserLanguage(value);
                    // Reset the test when language changes
                    resetTest();
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>Focus on accuracy first, then speed</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>Keep your fingers positioned over the home row</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>Don't look at the keyboard while typing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>Practice regularly to improve your skills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TypingTestPage;
