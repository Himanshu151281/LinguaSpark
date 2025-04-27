
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Menu, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  correct?: boolean;
  correction?: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const scenarios: Scenario[] = [
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    description: 'Practice ordering food and making requests',
    difficulty: 'beginner',
    tags: ['dining', 'food', 'service']
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    description: 'Practice checking into a hotel and asking about amenities',
    difficulty: 'beginner',
    tags: ['travel', 'accommodation']
  },
  {
    id: 'doctors',
    title: 'Doctor\'s Appointment',
    description: 'Describe symptoms and understand medical advice',
    difficulty: 'intermediate',
    tags: ['health', 'medical']
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice answering common interview questions',
    difficulty: 'advanced',
    tags: ['career', 'professional']
  }
];

const ConversationPracticePage = () => {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const filteredScenarios = scenarios.filter(scenario => 
    scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scenario.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startScenario = (scenario: Scenario) => {
    setCurrentScenario(scenario);
    setActiveTab('conversation');
    
    // Initialize conversation with AI greeting
    setMessages([
      {
        id: '1',
        text: `Hello! Welcome to our ${scenario.title.toLowerCase()} conversation practice. I'll play the role of the ${
          scenario.id === 'restaurant' ? 'waiter' : 
          scenario.id === 'hotel' ? 'receptionist' : 
          scenario.id === 'doctors' ? 'doctor' : 'interviewer'
        }. How can I help you today?`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      // In a real app, AI would analyze this and provide feedback
      correct: Math.random() > 0.3, // Simulate correctness
      correction: Math.random() > 0.7 ? "I'd like to order a coffee, please." : undefined
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: currentScenario?.id === 'restaurant' 
          ? "Certainly! Would you like to see our menu?" 
          : "I'll be happy to help you with that. Could you provide more details?",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const resetConversation = () => {
    setCurrentScenario(null);
    setMessages([]);
    setActiveTab('scenarios');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Conversation Practice</h1>
            <p className="text-gray-600">Practice real-world conversations with our AI language partner</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="conversation" disabled={!currentScenario}>Conversation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenarios">
            <div className="mb-6 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scenarios..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map(scenario => (
                <Card key={scenario.id} className="card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{scenario.title}</CardTitle>
                      <Badge variant={
                        scenario.difficulty === 'beginner' ? 'outline' :
                        scenario.difficulty === 'intermediate' ? 'secondary' : 'default'
                      }>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {scenario.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => startScenario(scenario)}>
                      Start Conversation
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredScenarios.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No scenarios found matching your search.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="conversation">
            {currentScenario && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentScenario.title}</CardTitle>
                      <CardDescription>{currentScenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium mb-2">Difficulty</p>
                      <Badge variant={
                        currentScenario.difficulty === 'beginner' ? 'outline' :
                        currentScenario.difficulty === 'intermediate' ? 'secondary' : 'default'
                      } className="mb-4">
                        {currentScenario.difficulty}
                      </Badge>
                      
                      <p className="text-sm font-medium mb-2">Suggested Phrases</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>"Excuse me, I'd like to..."</li>
                        <li>"Could you please tell me..."</li>
                        <li>"I was wondering if..."</li>
                        <li>"Thank you for your help."</li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={resetConversation}>
                        Exit Conversation
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <Card className="flex flex-col h-[70vh]">
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">Language Partner</CardTitle>
                          <CardDescription>Your AI conversation assistant</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                              message.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                              <p>{message.text}</p>
                              {message.sender === 'user' && typeof message.correct !== 'undefined' && (
                                <div className={`mt-2 text-xs flex items-center ${
                                  message.correct ? 'text-blue-100' : 'text-red-100'
                                }`}>
                                  {message.correct ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" /> Correct
                                    </>
                                  ) : (
                                    <>
                                      <span>Suggestion: {message.correction}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }} className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={!inputValue.trim()}>
                          Send
                        </Button>
                      </form>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="text-center py-10">
              <p className="text-gray-500">Your past conversations will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ConversationPracticePage;
