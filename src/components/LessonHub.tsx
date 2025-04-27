import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Headphones, Mic, PenTool, Lock, Star } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { getUserData } from "@/lib/userDataStorage";
import { Link } from 'react-router-dom';

interface ContentItem {
  type: 'reading' | 'listening' | 'speaking' | 'writing';
  title: string;
  content: string;
  completed: boolean;
}

interface LessonProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  progress: number;
  isLocked: boolean;
  contentItems: ContentItem[];
  recommendedNext?: boolean;
  skillPoints?: {
    reading?: number;
    listening?: number;
    speaking?: number;
    writing?: number;
    vocabulary?: number;
    grammar?: number;
  };
}

const LessonHub: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [userProgress, setUserProgress] = useState<number>(0);
  const [userLanguage, setUserLanguage] = useState<string>('english');
  const [userSkillLevels, setUserSkillLevels] = useState<Record<string, number>>({
    reading: 1,
    listening: 1,
    speaking: 1,
    writing: 1,
    vocabulary: 1,
    grammar: 1
  });
  
  // Load user data on mount
  useEffect(() => {
    const userData = getUserData();
    setUserProgress(userData.progress || 0);
    setUserLanguage(userData.language || 'english');
    
    // Get user skill levels if they exist in localStorage
    const storedSkills = localStorage.getItem('linguaspark_user_skills');
    if (storedSkills) {
      setUserSkillLevels(JSON.parse(storedSkills));
    }
    
    // Store lessons in localStorage for access in the detail page
    localStorage.setItem('linguaspark_lessons', JSON.stringify(generateLessons()));
  }, []);
  
  // Generate lessons based on user language and progress
  const generateLessons = (): LessonProps[] => {
    // Language-specific lesson adjustments
    const languageSpecificTitles: Record<string, string[]> = {
      english: ['Common Phrases in English', 'English Slang', 'Business English'],
      spanish: ['Spanish Greetings', 'Ser vs Estar', 'Spanish Food Vocabulary'],
      french: ['French Greetings', 'French Articles', 'Ordering in a French Café'],
      japanese: ['Japanese Greetings', 'Basic Hiragana', 'Japanese Particles'],
      hindi: ['Hindi Greetings', 'Devanagari Script', 'Hindi Pronouns'],
      arabic: ['Arabic Greetings', 'Arabic Script Basics', 'Arabic Pronunciation']
    };
    
    // Get titles specific to the user's language or fall back to English
    const specificTitles = languageSpecificTitles[userLanguage] || languageSpecificTitles.english;
    
    const baseLessons: LessonProps[] = [
      {
        id: 'basics-1',
        title: 'Introduction & Greetings',
        description: `Learn basic greetings and introductions in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '15 min',
        level: 'Beginner',
        category: 'Basics',
        progress: 100,
        isLocked: false,
        contentItems: [
          { type: 'reading', title: 'Greetings Text', content: '', completed: true },
          { type: 'listening', title: 'Dialogue Practice', content: '', completed: true },
          { type: 'speaking', title: 'Pronunciation Guide', content: '', completed: true },
          { type: 'writing', title: 'Writing Exercise', content: '', completed: true }
        ],
        skillPoints: { vocabulary: 2, speaking: 1, listening: 1, reading: 1 }
      },
      {
        id: 'basics-2',
        title: 'Numbers & Counting',
        description: `Master numbers from 1-100 in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '20 min',
        level: 'Beginner',
        category: 'Basics',
        progress: 75,
        isLocked: false,
        contentItems: [
          { type: 'reading', title: 'Number Systems', content: '', completed: true },
          { type: 'listening', title: 'Number Recognition', content: '', completed: true },
          { type: 'speaking', title: 'Saying Numbers', content: '', completed: true },
          { type: 'writing', title: 'Writing Numbers', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 1, speaking: 1, listening: 2, writing: 1 }
      },
      {
        id: 'basics-3',
        title: specificTitles[0],
        description: `Essential phrases for everyday situations in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '25 min',
        level: 'Beginner',
        category: 'Basics',
        progress: 30,
        isLocked: false,
        contentItems: [
          { type: 'reading', title: 'Common Phrases', content: '', completed: true },
          { type: 'listening', title: 'Phrase Recognition', content: '', completed: false },
          { type: 'speaking', title: 'Practice Phrases', content: '', completed: false },
          { type: 'writing', title: 'Using Phrases', content: '', completed: false }
        ],
        recommendedNext: true,
        skillPoints: { vocabulary: 2, speaking: 2, listening: 1, grammar: 1 }
      },
      {
        id: 'conversation-1',
        title: 'At the Restaurant',
        description: `Order food and engage in restaurant dialogue in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '30 min',
        level: 'Intermediate',
        category: 'Conversation',
        progress: 0,
        isLocked: false,
        contentItems: [
          { type: 'reading', title: 'Restaurant Vocabulary', content: '', completed: false },
          { type: 'listening', title: 'Ordering Dialogue', content: '', completed: false },
          { type: 'speaking', title: 'Role Play Practice', content: '', completed: false },
          { type: 'writing', title: 'Create a Dialogue', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 2, speaking: 3, listening: 2, writing: 1 }
      },
      {
        id: 'conversation-2',
        title: 'Shopping Conversations',
        description: `Learn to talk about prices and preferences in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '25 min',
        level: 'Intermediate',
        category: 'Conversation',
        progress: 0,
        isLocked: userProgress < 40, // Lock based on user progress
        contentItems: [
          { type: 'reading', title: 'Shopping Vocabulary', content: '', completed: false },
          { type: 'listening', title: 'Shopping Dialogue', content: '', completed: false },
          { type: 'speaking', title: 'Practice Bargaining', content: '', completed: false },
          { type: 'writing', title: 'Shopping List Exercise', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 2, speaking: 2, listening: 2, grammar: 1 }
      },
      {
        id: 'grammar-1',
        title: 'Basic Sentence Structure',
        description: `Understand how to form simple sentences in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '35 min',
        level: 'Beginner',
        category: 'Grammar',
        progress: 10,
        isLocked: false,
        contentItems: [
          { type: 'reading', title: 'Sentence Basics', content: '', completed: true },
          { type: 'listening', title: 'Identify Sentence Types', content: '', completed: false },
          { type: 'speaking', title: 'Pronunciation Practice', content: '', completed: false },
          { type: 'writing', title: 'Sentence Formation', content: '', completed: false }
        ],
        skillPoints: { grammar: 3, writing: 2, reading: 1, vocabulary: 1 }
      },
      {
        id: 'vocabulary-1',
        title: 'Food & Drinks',
        description: `Learn common food and beverage vocabulary in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '20 min',
        level: 'Beginner',
        category: 'Vocabulary',
        progress: 0,
        isLocked: false,
        contentItems: [
          { type: 'reading', title: 'Food Vocabulary List', content: '', completed: false },
          { type: 'listening', title: 'Food Audio Recognition', content: '', completed: false },
          { type: 'speaking', title: 'Pronunciation Practice', content: '', completed: false },
          { type: 'writing', title: 'Food Description Exercise', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 3, speaking: 1, listening: 1, writing: 1 }
      },
      {
        id: 'culture-1',
        title: 'Cultural Customs',
        description: `Understand important cultural traditions of ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}-speaking regions`,
        duration: '40 min',
        level: 'Intermediate',
        category: 'Culture',
        progress: 0,
        isLocked: userProgress < 60, // Lock based on user progress
        contentItems: [
          { type: 'reading', title: 'Cultural Overview', content: '', completed: false },
          { type: 'listening', title: 'Cultural Dialogues', content: '', completed: false },
          { type: 'speaking', title: 'Cultural Expression', content: '', completed: false },
          { type: 'writing', title: 'Cultural Reflection', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 2, speaking: 1, reading: 3, writing: 2 }
      },
      {
        id: 'advanced-1',
        title: specificTitles[1] || 'Advanced Topics',
        description: `Advanced vocabulary and expressions in ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}`,
        duration: '45 min',
        level: 'Advanced',
        category: 'Vocabulary',
        progress: 0,
        isLocked: userProgress < 80, // Lock based on user progress
        contentItems: [
          { type: 'reading', title: 'Advanced Reading', content: '', completed: false },
          { type: 'listening', title: 'Advanced Listening', content: '', completed: false },
          { type: 'speaking', title: 'Advanced Speaking', content: '', completed: false },
          { type: 'writing', title: 'Advanced Writing', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 3, grammar: 3, reading: 2, writing: 2 }
      },
      {
        id: 'practical-1',
        title: specificTitles[2] || 'Practical Applications',
        description: `Real-world applications of ${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)} in context`,
        duration: '50 min',
        level: 'Advanced',
        category: 'Practical',
        progress: 0,
        isLocked: userProgress < 90, // Lock based on user progress
        contentItems: [
          { type: 'reading', title: 'Authentic Materials', content: '', completed: false },
          { type: 'listening', title: 'Native Speaker Audio', content: '', completed: false },
          { type: 'speaking', title: 'Real Conversation Practice', content: '', completed: false },
          { type: 'writing', title: 'Practical Writing Tasks', content: '', completed: false }
        ],
        skillPoints: { vocabulary: 2, grammar: 2, speaking: 3, listening: 3 }
      }
    ];
    
    return baseLessons;
  };
  
  const lessons = generateLessons();
  
  const filteredLessons = filter === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === filter);

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Lesson Hub
          </h1>
          <p className="text-gray-600">
            Choose a lesson to continue your learning journey in {userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-600">Overall Progress</p>
            <span className="text-sm font-semibold">{userProgress}%</span>
          </div>
          <div className="w-48 h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-full bg-linguaspark-primary rounded-full" 
              style={{ width: `${userProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
          {['Basics', 'Conversation', 'Grammar', 'Vocabulary', 'Culture'].map(category => (
            <TabsTrigger 
              key={category} 
              value={category.toLowerCase()}
              onClick={() => setFilter(category)}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map(lesson => (
          <Card key={lesson.id} className={`card-hover ${lesson.isLocked ? 'opacity-75' : ''} ${lesson.recommendedNext ? 'border-linguaspark-primary border-2' : ''}`}>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{lesson.title}</h3>
                  <div className="flex items-center space-x-2">
                    {lesson.recommendedNext && (
                      <Badge variant="default" className="bg-linguaspark-primary">
                        Recommended
                      </Badge>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(lesson.level)}`}>
                      {lesson.level}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {lesson.duration}
                </div>
                
                {lesson.skillPoints && (
                  <div className="flex flex-wrap mt-2 gap-1">
                    {Object.entries(lesson.skillPoints).map(([skill, points]) => (
                      <div key={skill} className="flex items-center bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-700">
                        {skill.charAt(0).toUpperCase() + skill.slice(1)}
                        <div className="flex ml-1">
                          {Array(points).fill(0).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {lesson.progress === 0 
                      ? 'Not started' 
                      : lesson.progress === 100 
                        ? 'Completed' 
                        : `${lesson.progress}% complete`}
                  </span>
                  <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{lesson.category}</span>
                </div>

                <div className="progress-container mb-4">
                  <div 
                    className={`progress-bar ${lesson.progress === 100 ? 'bg-linguaspark-success' : 'bg-linguaspark-primary'}`}
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>

                {lesson.isLocked ? (
                  <Button 
                    className="w-full"
                    disabled={true}
                  >
                    <span className="flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      Locked
                    </span>
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    variant={lesson.progress > 0 && lesson.progress < 100 ? 'default' : lesson.progress === 100 ? 'outline' : 'default'}
                    asChild
                  >
                    <Link to={`/lessons/${lesson.id}`} target="_blank">
                      {lesson.progress === 0 ? (
                        'Start Lesson'
                      ) : lesson.progress === 100 ? (
                        'Review Lesson'
                      ) : (
                        'Continue'
                      )}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LessonHub;
