import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface GameProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  level: string;
  isPopular: boolean;
}

const GameCenter: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [typingTest, setTypingTest] = useState({
    text: 'El rápido zorro marrón salta sobre el perro perezoso.',
    userInput: '',
    startTime: 0,
    endTime: 0,
    isComplete: false,
    wpm: 0,
    accuracy: 0,
  });
  const [storyWords, setStoryWords] = useState<string[]>([
    'casa', 'perro', 'libro', 'amigo', 'ciudad', 'grande'
  ]);
  const [generatedStory, setGeneratedStory] = useState('');
  const [storyImage, setStoryImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  
  // Available languages for typing test
  const languages = [
    { id: 'english', name: 'English', text: 'The quick brown fox jumps over the lazy dog. Practice your typing skills with this simple sentence.' },
    { id: 'spanish', name: 'Spanish', text: 'El rápido zorro marrón salta sobre el perro perezoso. Practica tus habilidades de mecanografía con esta simple frase.' },
    { id: 'french', name: 'French', text: 'Le rapide renard brun saute par-dessus le chien paresseux. Entraînez vos compétences en dactylographie avec cette phrase simple.' },
    { id: 'hindi', name: 'Hindi', text: 'तेज़ भूरी लोमड़ी आलसी कुत्ते पर कूदती है। इस सरल वाक्य के साथ अपने टाइपिंग कौशल का अभ्यास करें।' },
    { id: 'japanese', name: 'Japanese', text: '速い茶色のキツネは怠け者の犬を飛び越えます。この単純な文であなたのタイピングスキルを練習しましょう。' },
  ];

  const games: GameProps[] = [
    {
      id: 'typing-test',
      title: 'Typing Test',
      description: 'Improve your typing speed and accuracy in the target language',
      icon: '⌨️',
      category: 'Typing',
      level: 'All Levels',
      isPopular: true
    },
    {
      id: 'story-generator',
      title: 'Story Generator',
      description: 'Create a story using key vocabulary words',
      icon: '📚',
      category: 'Creative',
      level: 'Intermediate',
      isPopular: true
    },
    {
      id: 'song-lyrics',
      title: 'Song Lyrics Practice',
      description: 'Learn language through popular songs',
      icon: '🎵',
      category: 'Audio',
      level: 'All Levels',
      isPopular: false
    },
    {
      id: 'word-match',
      title: 'Word Match',
      description: 'Match words with their translations',
      icon: '🔤',
      category: 'Vocabulary',
      level: 'Beginner',
      isPopular: true
    },
    {
      id: 'comic-creator',
      title: 'Comic Creator',
      description: 'Create comics in your target language',
      icon: '💬',
      category: 'Creative',
      level: 'Intermediate',
      isPopular: false
    },
    {
      id: 'sentence-shuffle',
      title: 'Sentence Shuffle',
      description: 'Rearrange words to form correct sentences',
      icon: '🔀',
      category: 'Grammar',
      level: 'Beginner',
      isPopular: true
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (typingTest.startTime && !typingTest.isComplete) {
      setTimer(60);
      setTimerActive(true);
      
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            // Time's up
            clearInterval(interval as NodeJS.Timeout);
            setTimerActive(false);
            
            // Calculate results when timer ends
            const endTime = Date.now();
            const timeInMinutes = (endTime - typingTest.startTime) / 60000;
            const wordCount = typingTest.text.split(' ').length;
            const wpm = Math.round(wordCount / timeInMinutes);
            
            // Calculate accuracy
            let correctChars = 0;
            for (let i = 0; i < typingTest.text.length; i++) {
              if (i < typingTest.userInput.length && typingTest.userInput[i] === typingTest.text[i]) {
                correctChars++;
              }
            }
            const accuracy = Math.round((correctChars / typingTest.text.length) * 100);
            
            setTypingTest(prev => ({
              ...prev,
              isComplete: true,
              endTime,
              wpm,
              accuracy
            }));
            
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      setTimerActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [typingTest.startTime, typingTest.isComplete]);
  
  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    const selectedLang = languages.find(l => l.id === lang);
    if (selectedLang) {
      setTypingTest(prev => ({
        ...prev,
        text: selectedLang.text,
        isComplete: false,
        userInput: '',
        startTime: 0
      }));
    }
    setTimer(60);
    setTimerActive(false);
  };

  const startTypingTest = () => {
    setTypingTest({
      ...typingTest,
      startTime: Date.now(),
      isComplete: false,
      userInput: '',
      wpm: 0,
      accuracy: 0
    });
  };

  const handleTypingInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userInput = e.target.value;
    setTypingTest(prev => ({
      ...prev,
      userInput
    }));

    // Check if the test is complete
    if (userInput.length >= typingTest.text.length) {
      const endTime = Date.now();
      const timeInMinutes = (endTime - typingTest.startTime) / 60000;
      const wordCount = typingTest.text.split(' ').length;
      const wpm = Math.round(wordCount / timeInMinutes);
      
      // Calculate accuracy
      let correctChars = 0;
      for (let i = 0; i < typingTest.text.length; i++) {
        if (i < userInput.length && userInput[i] === typingTest.text[i]) {
          correctChars++;
        }
      }
      const accuracy = Math.round((correctChars / typingTest.text.length) * 100);
      
      setTypingTest(prev => ({
        ...prev,
        isComplete: true,
        endTime,
        wpm,
        accuracy
      }));
    }
  };

  const generateStory = () => {
    // Start loading state
    setIsGenerating(true);
    
    // In a real app, this would call an API to generate a story and an image
    // Here we're simulating the story generation with a delay
    setTimeout(() => {
      const story = `
        En una pequeña ${storyWords[0]} vivía un ${storyWords[1]} muy feliz. Todos los días, leía un ${storyWords[2]} 
        interesante. Su ${storyWords[3]} le visitaba con frecuencia. Juntos exploraban la ${storyWords[4]} 
        que era muy ${storyWords[5]} y tenían muchas aventuras.
      `;
      
      // Generate a dynamic image URL using placeholders with terms from the story
      const imageUrl = `https://source.unsplash.com/800x450/?${storyWords.join(',')}`; 
      
      setGeneratedStory(story);
      setStoryImage(imageUrl);
      setIsGenerating(false);
    }, 1500);  // Simulate API delay
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Game Center
          </h1>
          <p className="text-gray-600">
            Learn while having fun with our language games
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Game</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {games.map(game => (
                  <Button
                    key={game.id}
                    variant={selectedGame === game.id ? "default" : "outline"}
                    className={`w-full justify-start ${
                      selectedGame === game.id 
                        ? 'bg-linguaspark-primary hover:bg-linguaspark-primary/90' 
                        : ''
                    }`}
                    onClick={() => setSelectedGame(game.id)}
                  >
                    <span className="mr-2">{game.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between">
                        <span>{game.title}</span>
                        {game.isPopular && (
                          <span className="bg-linguaspark-accent/20 text-linguaspark-accent text-xs px-1.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-70">{game.level}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {!selectedGame ? (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mb-4 text-5xl">🎮</div>
                <h2 className="text-2xl font-bold mb-2">Select a Game</h2>
                <p className="text-gray-600 mb-6">
                  Choose a game from the list to start playing and improve your language skills.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {games.filter(game => game.isPopular).map(game => (
                    <Button
                      key={game.id}
                      variant="outline"
                      className="flex flex-col h-auto py-4"
                      onClick={() => setSelectedGame(game.id)}
                    >
                      <span className="text-2xl mb-2">{game.icon}</span>
                      <span className="text-sm">{game.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ) : selectedGame === 'typing-test' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">⌨️</span>
                  Typing Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <p className="text-gray-600 mb-4">
                    Type the text below as quickly and accurately as you can. Your speed (WPM) and accuracy will be measured.
                  </p>
                  
                  {/* Language Selection Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Language
                    </label>
                    <Select 
                      value={selectedLanguage} 
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-full sm:w-[240px]">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Time Remaining Display */}
                  {typingTest.startTime && !typingTest.isComplete && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Time Remaining</span>
                        <span className="font-bold">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <Progress 
                        value={(timer / 60) * 100} 
                        className={`h-3 ${timer <= 10 ? 'bg-red-500' : timer <= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      />
                    </div>
                  )}
                  
                  {/* Typing Text with Mistake Highlighting */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="font-medium leading-relaxed">
                      {typingTest.text.split('').map((char, index) => {
                        // Determine character styling based on user input
                        let className = '';
                        if (index < typingTest.userInput.length) {
                          className = typingTest.userInput[index] === char 
                            ? 'text-green-600 font-medium' 
                            : 'text-red-600 font-medium bg-red-100 underline';
                        }
                        
                        return (
                          <span key={index} className={className}>
                            {char}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                  
                  <textarea
                    className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-linguaspark-primary"
                    rows={3}
                    value={typingTest.userInput}
                    onChange={handleTypingInputChange}
                    placeholder="Start typing here..."
                    disabled={!typingTest.startTime || typingTest.isComplete}
                  />
                </div>
                
                {typingTest.isComplete ? (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Your Results:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-linguaspark-light p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Speed</p>
                        <p className="text-2xl font-bold text-linguaspark-primary">{typingTest.wpm} WPM</p>
                      </div>
                      <div className="bg-linguaspark-light p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Accuracy</p>
                        <p className="text-2xl font-bold text-linguaspark-primary">{typingTest.accuracy}%</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <Button
                  onClick={startTypingTest}
                  className="bg-linguaspark-primary hover:bg-linguaspark-primary/90"
                >
                  {typingTest.startTime && !typingTest.isComplete ? 'Restart Test' : 'Start Test'}
                </Button>
              </CardContent>
            </Card>
          ) : selectedGame === 'story-generator' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">📚</span>
                  Story Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <p className="text-gray-600 mb-4">
                    Generate a story using key vocabulary words to practice using them in context.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Vocabulary Words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {storyWords.map((word, index) => (
                        <div key={index} className="bg-linguaspark-light text-linguaspark-primary px-3 py-1 rounded-full text-sm">
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-linguaspark-primary mb-4" />
                    <p className="text-gray-600">Creating your story and illustration...</p>
                  </div>
                ) : generatedStory ? (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Your Story:</h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      {storyImage && (
                        <div className="w-full h-64 mb-4 overflow-hidden">
                          <img 
                            src={storyImage} 
                            alt="Story illustration" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Story+Illustration';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="whitespace-pre-line">{generatedStory}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <div className="flex space-x-4">
                  <Button
                    onClick={generateStory}
                    className="bg-linguaspark-primary hover:bg-linguaspark-primary/90"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Story'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedStory('');
                      setStoryImage('');
                    }}
                    disabled={!generatedStory || isGenerating}
                  >
                    New Words
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mb-4 text-5xl">
                  {games.find(g => g.id === selectedGame)?.icon || '🎮'}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {games.find(g => g.id === selectedGame)?.title || 'Game'}
                </h2>
                <p className="text-gray-600 mb-6">
                  This game is coming soon! Please check back later or try another game.
                </p>
                <Button
                  onClick={() => setSelectedGame(null)}
                  className="bg-linguaspark-primary hover:bg-linguaspark-primary/90"
                >
                  Choose Another Game
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCenter;
