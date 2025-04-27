import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Check, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { chatCompletion } from '@/lib/groqClient';

// Mock data
const lessonModules = [
  {
    id: "beginner",
    title: "Beginner",
    lessons: [
      { id: "greetings", title: "Basic Greetings", description: "Learn how to say hello and introduce yourself", duration: "15 min", progress: 100, completed: true },
      { id: "numbers", title: "Numbers 1-20", description: "Master counting and basic numbers", duration: "20 min", progress: 75, completed: false },
      { id: "colors", title: "Colors", description: "Learn the names of common colors", duration: "10 min", progress: 0, completed: false },
      { id: "family", title: "Family Members", description: "Vocabulary for family relationships", duration: "25 min", progress: 0, completed: false },
    ]
  },
  {
    id: "intermediate",
    title: "Intermediate",
    lessons: [
      { id: "past-tense", title: "Past Tense Verbs", description: "Learn to talk about past events", duration: "30 min", progress: 0, completed: false },
      { id: "directions", title: "Asking for Directions", description: "Navigate and find your way around", duration: "25 min", progress: 0, completed: false },
      { id: "restaurant", title: "Restaurant Conversations", description: "Order food and have polite conversation", duration: "20 min", progress: 0, completed: false },
    ]
  },
  {
    id: "advanced",
    title: "Advanced",
    lessons: [
      { id: "idioms", title: "Common Idioms", description: "Master expressions native speakers use", duration: "35 min", progress: 0, completed: false },
      { id: "hypotheticals", title: "Hypothetical Situations", description: "Learn to discuss possibilities", duration: "40 min", progress: 0, completed: false },
    ]
  },
];

const LessonHubPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<{id: string; title: string} | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Filter lessons based on search query
  const filteredLessons = searchQuery 
    ? lessonModules.map(module => ({
        ...module,
        lessons: module.lessons.filter(lesson => 
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(module => module.lessons.length > 0)
    : lessonModules;

  const handleStartLesson = async (lessonId: string, title: string) => {
    setSelectedLesson({id: lessonId, title});
    setIsLoadingLesson(true);
    try {
      const res = await chatCompletion([
        { role: 'system', content: 'You are an expert language tutor. Generate a short reading passage and three comprehension questions for the lesson topic.' },
        { role: 'user', content: `Lesson: ${title}` }
      ]);
      setLessonContent(res.choices?.[0]?.message?.content || '');
    } catch (e) {
      console.error('Lesson generation error:', e);
    }
    setIsLoadingLesson(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Lesson Hub</h1>
            <p className="text-gray-600">Structured learning content to master your language</p>
          </div>
          
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search lessons..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="beginner" className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            {lessonModules.map(module => (
              <TabsTrigger key={module.id} value={module.id}>
                {module.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {lessonModules.map(module => (
            <TabsContent key={module.id} value={module.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons
                  .find(m => m.id === module.id)?.lessons
                  .map(lesson => (
                    <Card key={lesson.id} className="card-hover">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          {lesson.completed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Completed
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{lesson.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                        </div>
                        
                        <Progress value={lesson.progress} className="h-2" />
                        <p className="mt-2 text-xs text-gray-500 text-right">{lesson.progress}% complete</p>
                      </CardContent>
                      
                      <CardFooter>
                        <Button
                          className="w-full"
                          disabled={isLoadingLesson && selectedLesson?.id === lesson.id}
                          onClick={() => handleStartLesson(lesson.id, lesson.title)}
                        >
                          {isLoadingLesson && selectedLesson?.id === lesson.id ? (
                            <Loader2 className="animate-spin mx-auto" />
                          ) : (
                            lesson.progress > 0 && lesson.progress < 100 ? 'Continue' : 'Start Lesson'
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                }
              </div>
              
              {filteredLessons.find(m => m.id === module.id)?.lessons.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No lessons found matching your search.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full">
            <h2 className="text-xl font-bold mb-4">{selectedLesson.title}</h2>
            {isLoadingLesson ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <pre className="whitespace-pre-wrap">{lessonContent}</pre>
            )}
            <Button className="mt-4" onClick={() => setSelectedLesson(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonHubPage;
