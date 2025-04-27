
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkillProgress {
  name: string;
  level: number;
  color: string;
}

interface VocabularyItem {
  word: string;
  translation: string;
  mastery: 'learned' | 'familiar' | 'mastered';
  lastPracticed: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  total: number;
}

const ProgressTracker: React.FC = () => {
  const skills: SkillProgress[] = [
    { name: 'Reading', level: 65, color: 'bg-blue-500' },
    { name: 'Writing', level: 45, color: 'bg-green-500' },
    { name: 'Listening', level: 70, color: 'bg-purple-500' },
    { name: 'Speaking', level: 55, color: 'bg-orange-500' },
    { name: 'Vocabulary', level: 60, color: 'bg-pink-500' },
    { name: 'Grammar', level: 40, color: 'bg-yellow-500' },
  ];
  
  const vocabulary: VocabularyItem[] = [
    { 
      word: 'hola', 
      translation: 'hello', 
      mastery: 'mastered',
      lastPracticed: '2023-04-25' 
    },
    { 
      word: 'gracias', 
      translation: 'thank you', 
      mastery: 'mastered',
      lastPracticed: '2023-04-24' 
    },
    { 
      word: 'libro', 
      translation: 'book', 
      mastery: 'familiar',
      lastPracticed: '2023-04-23' 
    },
    { 
      word: 'manzana', 
      translation: 'apple', 
      mastery: 'familiar',
      lastPracticed: '2023-04-22' 
    },
    { 
      word: 'casa', 
      translation: 'house', 
      mastery: 'mastered',
      lastPracticed: '2023-04-21' 
    },
    { 
      word: 'ventana', 
      translation: 'window', 
      mastery: 'learned',
      lastPracticed: '2023-04-20' 
    },
    { 
      word: 'puerta', 
      translation: 'door', 
      mastery: 'learned',
      lastPracticed: '2023-04-19' 
    },
    { 
      word: 'comida', 
      translation: 'food', 
      mastery: 'familiar',
      lastPracticed: '2023-04-18' 
    },
  ];
  
  const achievements: Achievement[] = [
    {
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Practice for 7 consecutive days',
      icon: '🔥',
      earned: true,
      progress: 7,
      total: 7,
    },
    {
      id: 'vocab-50',
      title: 'Vocabulary Builder',
      description: 'Learn 50 new words',
      icon: '📚',
      earned: false,
      progress: 32,
      total: 50,
    },
    {
      id: 'perfect-lesson',
      title: 'Perfect Lesson',
      description: 'Complete a lesson with no mistakes',
      icon: '🌟',
      earned: true,
      progress: 1,
      total: 1,
    },
    {
      id: 'conversation-master',
      title: 'Conversation Master',
      description: 'Complete 10 conversation practices',
      icon: '💬',
      earned: false,
      progress: 4,
      total: 10,
    },
    {
      id: 'grammar-expert',
      title: 'Grammar Expert',
      description: 'Complete all grammar lessons',
      icon: '📝',
      earned: false,
      progress: 3,
      total: 10,
    },
  ];
  
  const masteryColors = {
    learned: 'bg-yellow-100 text-yellow-800',
    familiar: 'bg-blue-100 text-blue-800',
    mastered: 'bg-green-100 text-green-800'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Progress Tracker
          </h1>
          <p className="text-gray-600">
            Track your learning journey and achievements
          </p>
        </div>
      </div>

      <Tabs defaultValue="skills" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{skill.name}</h3>
                      <div className="flex items-center">
                        <span className="font-semibold">{skill.level}%</span>
                        <div className="ml-2 h-3 w-3 rounded-full bg-gray-200">
                          <div className={`h-full rounded-full ${skill.color}`} style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="progress-container">
                      <div className={`progress-bar ${skill.color}`} style={{ width: `${skill.level}%` }}></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">CEFR Level Estimation</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                    <div className="h-full bg-linguaspark-primary" style={{ width: '30%' }}></div>
                  </div>
                  <span className="ml-4 font-medium">A2</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>A1</span>
                  <span>A2</span>
                  <span>B1</span>
                  <span>B2</span>
                  <span>C1</span>
                  <span>C2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vocabulary">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-linguaspark-light p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total Words</p>
                  <p className="text-2xl font-bold text-linguaspark-primary">150</p>
                </div>
                <div className="bg-linguaspark-light p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Mastered</p>
                  <p className="text-2xl font-bold text-green-500">48</p>
                </div>
                <div className="bg-linguaspark-light p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Need Review</p>
                  <p className="text-2xl font-bold text-yellow-500">24</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translation</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mastery</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Practiced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vocabulary.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">{item.word}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.translation}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${masteryColors[item.mastery]}`}>
                            {item.mastery.charAt(0).toUpperCase() + item.mastery.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.lastPracticed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`border rounded-lg p-4 ${achievement.earned ? 'border-linguaspark-primary bg-linguaspark-light/50' : 'border-gray-200'}`}>
                    <div className="flex items-start">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${achievement.earned ? 'bg-linguaspark-primary/20' : 'bg-gray-100'}`}>
                        {achievement.icon}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center mb-1">
                          <h3 className="font-bold">{achievement.title}</h3>
                          {achievement.earned && (
                            <span className="ml-2 bg-linguaspark-primary text-white text-xs px-2 py-0.5 rounded-full">
                              Earned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center">
                          <div className="w-full mr-2">
                            <div className="progress-container h-1.5">
                              <div 
                                className={`progress-bar ${achievement.earned ? 'bg-linguaspark-primary' : 'bg-gray-300'}`} 
                                style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{achievement.progress}/{achievement.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracker;
