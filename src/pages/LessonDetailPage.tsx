import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Headphones, Mic, PenTool, CheckCircle, Play, Pause, Volume2, RotateCcw, Info } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { chatCompletion, synthesizeSpeech, useBrowserTTS } from '@/lib/groqClient';
import { getUserData, completeLesson } from '@/lib/userDataStorage';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentItem {
  type: 'reading' | 'listening' | 'speaking' | 'writing';
  title: string;
  content: string;
  completed: boolean;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  duration: string;
  contentItems: ContentItem[];
}

const LessonDetailPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [activeTab, setActiveTab] = useState('reading');
  const [isLoading, setIsLoading] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState('english');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [userSkillLevels, setUserSkillLevels] = useState<Record<string, number>>({});
  
  // TTS related states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  
  useEffect(() => {
    // Get user data
    const userData = getUserData();
    setUserLanguage(userData.language || 'english');
    
    // Get user skill levels if they exist
    const storedSkills = localStorage.getItem('linguaspark_user_skills');
    if (storedSkills) {
      setUserSkillLevels(JSON.parse(storedSkills));
    }
    
    // Retrieve lesson data from localStorage
    const storedLessons = localStorage.getItem('linguaspark_lessons');
    let lessons = [];
    
    if (storedLessons) {
      lessons = JSON.parse(storedLessons);
    }
    
    const foundLesson = lessons.find((l: LessonData) => l.id === lessonId);
    
    if (foundLesson) {
      setLesson(foundLesson);
      // Mark which sections are already completed
      const completed = foundLesson.contentItems
        .filter(item => item.completed)
        .map(item => item.type);
      setCompletedSections(completed);
    } else {
      navigate('/lessons');  // Redirect if lesson not found
    }
    
    setIsLoading(false);
  }, [lessonId, navigate]);
  
  // Function to play the listening content with TTS
  const playListeningContent = async () => {
    // If already playing, stop
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // If there's no content to play, generate it
    if (!generatedContent['listening']) {
      await generateContent('listening');
      return;
    }

    try {
      setIsTTSLoading(true);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Process dialogue for better TTS output
      const content = generatedContent['listening'];
      
      // Extract a reasonable portion for TTS if the content is very long
      const processedContent = content.length > 8000 ? 
        content.substring(0, 8000) + "... (content truncated for speech)" : 
        content;
        
      // Remove asterisks from the content to prevent them from being read aloud
      const cleanedContent = processedContent.replace(/\*/g, '');

      console.log("Using browser TTS for content, length:", cleanedContent.length);
      
      setIsPlaying(true);
      
      // Use the synthesizeSpeech function that now uses browser TTS by default
      await synthesizeSpeech(cleanedContent);
      
      // Speech complete
      setIsPlaying(false);
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      
      // Show error to user
      alert("Text-to-speech failed. Please check your browser settings or try again later.");
    } finally {
      setIsTTSLoading(false);
    }
  };

  // Function to stop TTS audio playback
  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Ensure that audio stops playing when component unmounts
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update tab handler to stop audio when changing tabs
  const handleTabChange = (value: string) => {
    if (value !== 'listening' && isPlaying) {
      stopAudio();
    }
    setActiveTab(value);
  };
  
  const generateContent = async (contentType: string) => {
    if (generatedContent[contentType]) {
      // Content already loaded, just switch to the tab
      setActiveTab(contentType);
      return;
    }
    
    setLoadingSection(contentType);
    
    try {
      if (!lesson) return;
      
      // Determine difficulty based on user skill level
      const skillLevel = userSkillLevels[contentType] || 1;
      const difficultyAdjustment = skillLevel === 1 ? 'beginner' 
                                : skillLevel === 2 ? 'intermediate' 
                                : 'advanced';
      
      // Different prompts based on content type
      let systemPrompt = `You are an expert ${userLanguage} language tutor. `;
      let userPrompt = '';
      
      switch(contentType) {
        case 'reading':
          systemPrompt += `Create a reading passage at ${difficultyAdjustment} level about "${lesson.title}" with vocabulary appropriate for ${lesson.level} learners.`;
          userPrompt = `Write a reading passage (250-300 words) about ${lesson.title} for ${lesson.level} students. Include 5 comprehension questions at the end.`;
          break;
        case 'listening':
          systemPrompt += `Create a dialogue script at ${difficultyAdjustment} level about "${lesson.title}" that could be used for listening practice.`;
          userPrompt = `Write a dialogue between two people discussing ${lesson.title}. Make it appropriate for ${lesson.level} language learners, with clear turns and about 12-15 exchanges total.`;
          break;
        case 'speaking':
          systemPrompt += `Create speaking practice exercises at ${difficultyAdjustment} level for the topic "${lesson.title}".`;
          userPrompt = `Create 5 speaking practice exercises about ${lesson.title} for ${lesson.level} students. Include pronunciation tips and example responses.`;
          break;
        case 'writing':
          systemPrompt += `Create writing exercises at ${difficultyAdjustment} level for the topic "${lesson.title}".`;
          userPrompt = `Create 3 writing prompts about ${lesson.title} for ${lesson.level} students. Include vocabulary suggestions and a sample response for one prompt.`;
          break;
      }
      
      const res = await chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
      
      if (res.choices?.[0]?.message?.content) {
        const content = res.choices[0].message.content;
        setGeneratedContent(prev => ({
          ...prev,
          [contentType]: content
        }));
        
        // Mark this section as completed
        const updatedSections = [...completedSections];
        if (!updatedSections.includes(contentType)) {
          updatedSections.push(contentType);
          setCompletedSections(updatedSections);
          
          // Update user skill level for this content type
          const newSkillLevels = { ...userSkillLevels };
          if (newSkillLevels[contentType] < 5) { // Cap at level 5
            newSkillLevels[contentType] = (newSkillLevels[contentType] || 1) + 0.25; // Small increment
          }
          localStorage.setItem('linguaspark_user_skills', JSON.stringify(newSkillLevels));
          
          // Update lesson progress in localStorage
          const storedLessons = localStorage.getItem('linguaspark_lessons');
          if (storedLessons) {
            const lessons = JSON.parse(storedLessons);
            const lessonIndex = lessons.findIndex((l: LessonData) => l.id === lessonId);
            
            if (lessonIndex >= 0) {
              const updatedLesson = { ...lessons[lessonIndex] };
              const contentIndex = updatedLesson.contentItems.findIndex(
                item => item.type === contentType
              );
              
              if (contentIndex >= 0) {
                updatedLesson.contentItems[contentIndex].completed = true;
                updatedLesson.contentItems[contentIndex].content = content;
                
                // Update progress percentage
                const completedItems = updatedLesson.contentItems.filter(item => item.completed || updatedSections.includes(item.type)).length;
                const newProgress = Math.round((completedItems / updatedLesson.contentItems.length) * 100);
                updatedLesson.progress = newProgress;
                
                lessons[lessonIndex] = updatedLesson;
                localStorage.setItem('linguaspark_lessons', JSON.stringify(lessons));
                
                // If all sections completed, update global progress
                if (newProgress === 100) {
                  completeLesson();
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error generating ${contentType} content:`, error);
      setGeneratedContent(prev => ({
        ...prev,
        [contentType]: `Failed to generate ${contentType} content. Please try again.`
      }));
    } finally {
      setLoadingSection(null);
      setActiveTab(contentType);
    }
  };
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getContentTypeIcon = (type: string) => {
    switch(type) {
      case 'reading': return <BookOpen className="h-5 w-5" />;
      case 'listening': return <Headphones className="h-5 w-5" />;
      case 'speaking': return <Mic className="h-5 w-5" />;
      case 'writing': return <PenTool className="h-5 w-5" />;
    }
  };
  
  const handleCompleteSection = (section: string) => {
    // Mark current section as completed
    const updatedSections = [...completedSections];
    if (!updatedSections.includes(section)) {
      updatedSections.push(section);
      setCompletedSections(updatedSections);
      
      // Find the next section to work on
      const sections = ['reading', 'listening', 'speaking', 'writing'];
      const nextSection = sections.find(s => !updatedSections.includes(s));
      
      // If there's a next section, generate its content and switch to it
      if (nextSection) {
        generateContent(nextSection);
      } else {
        // All sections completed
        completeLesson();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
          <p className="ml-3">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Lesson Not Found</CardTitle>
              <CardDescription>We couldn't find the lesson you're looking for.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/lessons')} className="w-full">
                Return to Lesson Hub
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress = Math.round((completedSections.length / 4) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-gray-600">{lesson.description}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(lesson.level)}`}>
              {lesson.level}
            </span>
            <Badge variant="outline">{lesson.category}</Badge>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lesson Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">
                {progress === 0 
                  ? 'Not started' 
                  : progress === 100 
                    ? 'Completed' 
                    : `${progress}% complete`}
              </span>
              <span className="text-sm font-medium">{completedSections.length}/4 sections</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger 
              value="reading" 
              onClick={() => generateContent('reading')}
              className="relative"
            >
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Reading
                {completedSections.includes('reading') && (
                  <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="listening" 
              onClick={() => generateContent('listening')}
              className="relative"
            >
              <div className="flex items-center">
                <Headphones className="h-4 w-4 mr-2" />
                Listening
                {completedSections.includes('listening') && (
                  <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="speaking" 
              onClick={() => generateContent('speaking')}
              className="relative"
            >
              <div className="flex items-center">
                <Mic className="h-4 w-4 mr-2" />
                Speaking
                {completedSections.includes('speaking') && (
                  <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="writing" 
              onClick={() => generateContent('writing')}
              className="relative"
            >
              <div className="flex items-center">
                <PenTool className="h-4 w-4 mr-2" />
                Writing
                {completedSections.includes('writing') && (
                  <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </div>
            </TabsTrigger>
          </TabsList>
          
          {['reading', 'listening', 'speaking', 'writing'].map(section => (
            <TabsContent key={section} value={section} className="focus:outline-none">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-full mr-2">
                      {getContentTypeIcon(section)}
                    </div>
                    <CardTitle className="capitalize">{section}</CardTitle>
                  </div>
                  <CardDescription>
                    {section === 'reading' && 'Read the passage and answer the questions'}
                    {section === 'listening' && 'Listen to the dialogue and practice comprehension'}
                    {section === 'speaking' && 'Practice your pronunciation with these exercises'}
                    {section === 'writing' && 'Complete these writing prompts to improve your skills'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSection === section ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                      <p className="ml-3">Generating {section} content...</p>
                    </div>
                  ) : generatedContent[section] ? (
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap mb-4">
                      {generatedContent[section]}
                      
                      {/* Add play/pause button for listening section */}
                      {section === 'listening' && (
                        <>
                          <div className="flex justify-center mt-4">
                            <Button 
                              onClick={playListeningContent}
                              disabled={isTTSLoading}
                              className="flex items-center gap-2"
                              variant="outline"
                              size="lg"
                            >
                              {isTTSLoading ? (
                                <>
                                  <Spinner size="sm" />
                                  <span>Preparing audio...</span>
                                </>
                              ) : isPlaying ? (
                                <>
                                  <Pause className="h-5 w-5" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-5 w-5" />
                                  <span>Play Audio</span>
                                </>
                              )}
                            </Button>
                            
                            {isPlaying && (
                              <Button 
                                onClick={stopAudio}
                                variant="ghost"
                                size="icon"
                                className="ml-2"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center py-8">
                      <Button onClick={() => generateContent(section)}>
                        Generate {section.charAt(0).toUpperCase() + section.slice(1)} Content
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/lessons')}>
                    Back to Lesson Hub
                  </Button>
                  {generatedContent[section] && (
                    <Button 
                      onClick={() => handleCompleteSection(section)}
                      disabled={completedSections.includes(section)}
                    >
                      {completedSections.includes(section) ? 'Completed' : 'Mark as Complete'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default LessonDetailPage;