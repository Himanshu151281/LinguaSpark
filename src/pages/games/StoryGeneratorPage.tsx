import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Check, Clock, Menu, Search, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { chatCompletion, Message } from '@/lib/groqClient';

interface StoryTemplate {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  image: string;
  language: string;
  estimatedTime: string;
  firstParagraph: string;
}

// Mock story templates
const storyTemplates: StoryTemplate[] = [
  // Spanish templates
  {
    id: 'market-adventure',
    title: 'A Day at the Market',
    description: 'Practice shopping vocabulary and simple conversations',
    level: 'beginner',
    tags: ['shopping', 'food', 'numbers'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Spanish',
    estimatedTime: '10 min',
    firstParagraph: 'María va al mercado para comprar frutas y verduras. Ella necesita manzanas, plátanos y tomates. En el mercado, hay muchos vendedores y productos frescos.'
  },
  {
    id: 'lost-tourist',
    title: 'The Lost Tourist',
    description: 'Navigate through a city asking for directions',
    level: 'beginner',
    tags: ['directions', 'city', 'travel'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Spanish',
    estimatedTime: '15 min',
    firstParagraph: 'Carlos es un turista en Madrid. Él quiere visitar el Museo del Prado, pero está perdido. Necesita preguntar a alguien por direcciones.'
  },
  {
    id: 'restaurant-date',
    title: 'Dinner Date',
    description: 'Order food and have conversation at a restaurant',
    level: 'intermediate',
    tags: ['dining', 'food', 'conversation'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Spanish',
    estimatedTime: '20 min',
    firstParagraph: 'Ana y Roberto tienen una cita en un restaurante elegante. Es su primer aniversario y quieren celebrar. El mesero les da el menú y están listos para ordenar.'
  },
  {
    id: 'mystery',
    title: 'The Missing Keys',
    description: 'Solve a simple mystery while learning vocabulary',
    level: 'intermediate',
    tags: ['mystery', 'home', 'objects'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Spanish',
    estimatedTime: '25 min',
    firstParagraph: 'Miguel no puede encontrar sus llaves. Busca en toda la casa: en la sala, en la cocina, en el dormitorio. ¿Dónde pueden estar las llaves?'
  },
  {
    id: 'job-interview',
    title: 'The Job Interview',
    description: 'Practice professional vocabulary and expressions',
    level: 'advanced',
    tags: ['work', 'professional', 'formal'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Spanish',
    estimatedTime: '30 min',
    firstParagraph: 'Laura tiene una entrevista de trabajo importante hoy. Ha preparado su currículum y ha practicado respuestas a posibles preguntas. Está nerviosa pero emocionada.'
  },

  // English templates
  {
    id: 'cafe-visit',
    title: 'Coffee Shop Chat',
    description: 'Order drinks and have a conversation at a café',
    level: 'beginner',
    tags: ['cafe', 'food', 'conversation'],
    image: 'https://via.placeholder.com/300x200',
    language: 'English',
    estimatedTime: '10 min',
    firstParagraph: 'Sarah walks into the coffee shop on Main Street. It\'s a busy morning and the line is long. She needs her caffeine fix before heading to work.'
  },
  {
    id: 'city-tour',
    title: 'Exploring the City',
    description: 'Navigate through a city and talk about landmarks',
    level: 'intermediate',
    tags: ['travel', 'directions', 'landmarks'],
    image: 'https://via.placeholder.com/300x200',
    language: 'English',
    estimatedTime: '15 min',
    firstParagraph: 'Mark is visiting London for the first time. He has a map but feels overwhelmed. There are so many famous places to see: Big Ben, the London Eye, and Buckingham Palace.'
  },

  // German templates
  {
    id: 'berlin-weekend',
    title: 'Weekend in Berlin',
    description: 'Plan activities and explore German culture',
    level: 'intermediate',
    tags: ['travel', 'culture', 'planning'],
    image: 'https://via.placeholder.com/300x200',
    language: 'German',
    estimatedTime: '20 min',
    firstParagraph: 'Lukas und Anna planen ein Wochenende in Berlin. Sie möchten Museen besuchen und die lokale Küche probieren. Der Wetterbericht sagt gutes Wetter voraus.'
  },
  {
    id: 'family-dinner',
    title: 'Family Dinner',
    description: 'Learn food vocabulary and family-related terms',
    level: 'beginner',
    tags: ['family', 'food', 'home'],
    image: 'https://via.placeholder.com/300x200',
    language: 'German',
    estimatedTime: '15 min',
    firstParagraph: 'Die Familie Müller bereitet das Abendessen vor. Oma kocht die Hauptspeise, Opa macht den Salat. Die Kinder decken den Tisch. Es ist ein besonderer Anlass.'
  },

  // Hindi templates
  {
    id: 'market-delhi',
    title: 'Shopping in Delhi',
    description: 'Practice bargaining and shopping vocabulary',
    level: 'beginner',
    tags: ['shopping', 'bargaining', 'city'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Hindi',
    estimatedTime: '15 min',
    firstParagraph: 'राहुल दिल्ली के बाज़ार में खरीदारी करने गया। वह अपनी माँ के लिए एक साड़ी खरीदना चाहता है। बाज़ार में बहुत भीड़ है।'
  },
  {
    id: 'family-festival',
    title: 'Diwali Celebration',
    description: 'Learn about festival traditions and celebrations',
    level: 'intermediate',
    tags: ['festival', 'family', 'traditions'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Hindi',
    estimatedTime: '20 min',
    firstParagraph: 'अमित के परिवार में दिवाली की तैयारियां चल रही हैं। घर को रंगोली और दीयों से सजाया जा रहा है। मिठाइयाँ बनाई जा रही हैं।'
  },

  // Japanese templates
  {
    id: 'tokyo-visit',
    title: 'Day in Tokyo',
    description: 'Navigate through Tokyo and practice everyday phrases',
    level: 'intermediate',
    tags: ['travel', 'city', 'transportation'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Japanese',
    estimatedTime: '25 min',
    firstParagraph: '健太は東京を観光しています。彼は地下鉄で移動し、新しい場所を探索しています。今日は浅草寺に行く予定です。'
  },
  {
    id: 'restaurant-order',
    title: 'Ordering Ramen',
    description: 'Learn food vocabulary and restaurant phrases',
    level: 'beginner',
    tags: ['food', 'restaurant', 'ordering'],
    image: 'https://via.placeholder.com/300x200',
    language: 'Japanese',
    estimatedTime: '15 min',
    firstParagraph: 'ユミは友達と一緒にラーメン屋に来ました。メニューを見ていますが、何を注文するか決められません。店員さんが注文を聞きに来ます。'
  }
];

// Mock story progress data - simulating a story that has been started
const mockStoryContent = [
  { 
    id: 1, 
    text: 'María va al mercado para comprar frutas y verduras. Ella necesita manzanas, plátanos y tomates. En el mercado, hay muchos vendedores y productos frescos.',
    isUserInput: false,
    vocabularyItems: [
      { word: 'mercado', translation: 'market' },
      { word: 'frutas', translation: 'fruits' },
      { word: 'verduras', translation: 'vegetables' },
    ]
  },
  { 
    id: 2, 
    text: 'María se acerca a un puesto de frutas. "Buenos días", dice ella al vendedor.',
    isUserInput: false,
    vocabularyItems: [
      { word: 'puesto', translation: 'stand' },
      { word: 'vendedor', translation: 'seller/vendor' },
    ]
  },
  { 
    id: 3, 
    text: '"Buenos días, señorita. ¿En qué puedo ayudarle hoy?" responde el vendedor con una sonrisa.',
    isUserInput: false,
    vocabularyItems: [
      { word: 'señorita', translation: 'miss' },
      { word: 'ayudarle', translation: 'help you' },
    ]
  },
  { 
    id: 4, 
    text: 'Quiero comprar algunas frutas, por favor. Necesito manzanas y plátanos.',
    isUserInput: true,
    vocabularyItems: [
      { word: 'quiero', translation: 'I want' },
      { word: 'comprar', translation: 'to buy' },
      { word: 'algunas', translation: 'some' },
    ]
  },
  { 
    id: 5, 
    text: '"¡Por supuesto! Tenemos manzanas rojas y verdes. ¿Cuáles prefiere? Los plátanos están muy frescos hoy."',
    isUserInput: false,
    vocabularyItems: [
      { word: 'por supuesto', translation: 'of course' },
      { word: 'rojas', translation: 'red' },
      { word: 'verdes', translation: 'green' },
      { word: 'prefiere', translation: 'prefer' },
      { word: 'frescos', translation: 'fresh' },
    ]
  }
];

const StoryGeneratorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [storyContent, setStoryContent] = useState(mockStoryContent);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [continuations, setContinuations] = useState<{ text: string; vocabularyItems: { word: string; translation: string }[] }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');

  // Filter templates by selected language
  const filteredTemplates = storyTemplates.filter(
    (template) => template.language === selectedLanguage
  );

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    
    // Reset active story when language changes
    if (selectedTemplate) {
      setSelectedTemplate(null);
      setStoryContent([]);
      setActiveTab('templates');
    }
  };

  const handleTemplateSelect = (template: StoryTemplate) => {
    setSelectedTemplate(template);
    // In a real app we might load specific content for this template
    setActiveTab('story');
    // Reset the story to just the first paragraph of the selected template
    setStoryContent([{
      id: 1,
      text: template.firstParagraph,
      isUserInput: false,
      vocabularyItems: [] // In a real app, this would have actual vocabulary items
    }]);
  };
  
  const handleUserInputSubmit = async () => {
    if (!userInput.trim()) return;
    
    // Add user's input to the story and prepare conversation
    const newUserEntry = {
      id: storyContent.length + 1,
      text: userInput,
      isUserInput: true,
      vocabularyItems: [] 
    };
    
    const conversation = [...storyContent, newUserEntry];
    setStoryContent(conversation);
    setUserInput('');
    setIsGenerating(true);
    setContinuations([]);
    try {
      const messages: Message[] = [
        { role: 'system' as Message['role'], content: 'You are a language tutor generating story continuations.' },
        ...conversation.map((part): Message => ({ role: (part.isUserInput ? 'user' : 'assistant') as Message['role'], content: part.text })),
        { role: 'user' as Message['role'], content: 'Provide 2 brief continuation options for this story. Return a JSON array of objects with text and vocabularyItems (array of {word,translation}).' }
      ];
      const res = await chatCompletion(messages);
      const opts = JSON.parse(res.choices?.[0]?.message?.content || '[]');
      setContinuations(opts);
    } catch (e) {
      console.error('Continuation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Navbar /> */}
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Story Generator</h1>
            <p className="text-gray-600">Create interactive stories to practice reading and writing</p>
          </div>

          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="border rounded p-2"
          >
            <option value="Spanish">Spanish</option>
            {/* <option value="French">French</option> */}
            <option value="German">German</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="templates">Story Templates</TabsTrigger>
            <TabsTrigger value="story" disabled={!selectedTemplate}>Interactive Story</TabsTrigger>
            <TabsTrigger value="library">My Stories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="card-hover overflow-hidden">
                  <div 
                    className="h-40 bg-gray-200"
                    style={{
                      backgroundImage: `url(${template.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{template.title}</CardTitle>
                      <Badge variant={
                        template.level === 'beginner' ? 'outline' :
                        template.level === 'intermediate' ? 'secondary' : 'default'
                      }>
                        {template.level}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{template.language}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{template.estimatedTime}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      Start Story
                    </Button>
                  </CardFooter>
                </Card>
              ))}

            </div>
          </TabsContent>
          
          <TabsContent value="story">
            {selectedTemplate && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{selectedTemplate.title}</CardTitle>
                          <CardDescription>{selectedTemplate.description}</CardDescription>
                        </div>
                        <Badge variant={
                          selectedTemplate.level === 'beginner' ? 'outline' :
                          selectedTemplate.level === 'intermediate' ? 'secondary' : 'default'
                        }>
                          {selectedTemplate.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <ScrollArea className="h-[400px] pr-4 mb-4">
                        <div className="space-y-6">
                          {storyContent.map((part) => (
                            <div 
                              key={part.id} 
                              className={`p-4 border rounded-lg ${
                                part.isUserInput 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-white'
                              }`}
                            >
                              <p className={part.isUserInput ? 'font-medium' : ''}>
                                {part.text}
                              </p>
                              
                              {part.vocabularyItems && part.vocabularyItems.length > 0 && (
                                <Collapsible className="mt-3">
                                  <CollapsibleTrigger className="flex items-center gap-1 text-blue-600 text-sm">
                                    <Menu className="h-3 w-3" />
                                    <span>Show vocabulary</span>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="mt-2 space-y-1">
                                      {part.vocabularyItems.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                          <span className="font-medium">{item.word}</span>
                                          <span className="text-gray-600">{item.translation}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="border-t pt-4">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleUserInputSubmit();
                        }}>
                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-gray-600">
                              Continue the story in your own words:
                            </p>
                            <Input
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              placeholder="Type your response..."
                              className="flex-1"
                            />
                            <Button type="submit" disabled={!userInput.trim()}>
                              Submit
                            </Button>
                          </div>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-1">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Story Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Language</p>
                        <p>{selectedTemplate.language}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Level</p>
                        <p className="capitalize">{selectedTemplate.level}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Vocabulary Help</CardTitle>
                      <CardDescription>Common words and phrases for this story</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 border-b">
                          <span className="font-medium">buenos días</span>
                          <span className="text-gray-600">good morning</span>
                        </div>
                        <div className="flex justify-between p-2 border-b">
                          <span className="font-medium">por favor</span>
                          <span className="text-gray-600">please</span>
                        </div>
                        <div className="flex justify-between p-2 border-b">
                          <span className="font-medium">gracias</span>
                          <span className="text-gray-600">thank you</span>
                        </div>
                        <div className="flex justify-between p-2 border-b">
                          <span className="font-medium">cuánto cuesta</span>
                          <span className="text-gray-600">how much</span>
                        </div>
                        <div className="flex justify-between p-2">
                          <span className="font-medium">quiero</span>
                          <span className="text-gray-600">I want</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>My Stories</CardTitle>
                <CardDescription>Your saved and in-progress stories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div>
                        <p className="font-medium">A Day at the Market</p>
                        <p className="text-sm text-gray-500">Spanish • Beginner</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Check className="h-3 w-3 mr-1" /> In Progress
                      </Badge>
                      <Button variant="outline" size="sm">Continue</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div>
                        <p className="font-medium">The Lost Tourist</p>
                        <p className="text-sm text-gray-500">Spanish • Beginner</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Completed
                      </Badge>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      {isGenerating && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      )}
      {continuations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Choose a continuation:</h3>
          <div className="space-y-3">
            {continuations.map((opt, idx) => (
              <Card key={idx} className="p-4 border cursor-pointer hover:bg-gray-50" onClick={() => {
                const newAiEntry = { id: storyContent.length + 1, text: opt.text, isUserInput: false, vocabularyItems: opt.vocabularyItems };
                setStoryContent(prev => [...prev, newAiEntry]);
                setContinuations([]);
              }}>
                <p>{opt.text}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGeneratorPage;
