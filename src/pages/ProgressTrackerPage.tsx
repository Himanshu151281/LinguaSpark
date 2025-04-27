
import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

// Mock data for charts
const weeklyActivity = [
  { name: 'Mon', minutes: 15 },
  { name: 'Tue', minutes: 30 },
  { name: 'Wed', minutes: 10 },
  { name: 'Thu', minutes: 45 },
  { name: 'Fri', minutes: 25 },
  { name: 'Sat', minutes: 60 },
  { name: 'Sun', minutes: 35 },
];

const skillsData = [
  { name: 'Reading', progress: 75 },
  { name: 'Writing', progress: 45 },
  { name: 'Listening', progress: 60 },
  { name: 'Speaking', progress: 30 },
  { name: 'Grammar', progress: 50 },
  { name: 'Vocabulary', progress: 65 },
];

const achievementsData = [
  { id: 1, title: 'First Lesson', description: 'Completed your first lesson', date: '2023-06-15', unlocked: true },
  { id: 2, title: '7-Day Streak', description: 'Studied for 7 days in a row', date: '2023-06-21', unlocked: true },
  { id: 3, title: '100 Words', description: 'Learned 100 vocabulary words', date: '2023-07-02', unlocked: true },
  { id: 4, title: 'Conversation Master', description: 'Complete 10 conversation practices', date: null, unlocked: false },
  { id: 5, title: 'Perfect Quiz', description: 'Score 100% on a quiz', date: null, unlocked: false },
];

const ProgressTrackerPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Progress Tracker</h1>
            <p className="text-gray-600">Track your learning journey and achievements</p>
          </div>
          
          <Link to="/progress/quiz">
            <Button>Take Daily Quiz</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Your language learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - 45 / 100)}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">45%</span>
                    <span className="text-sm text-gray-500">Level 5</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                You've completed 45% of the beginner course
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Streak</CardTitle>
              <CardDescription>Your learning consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 text-orange-600">
                  <span className="text-3xl font-bold">7</span>
                </div>
                <p className="mt-2 font-medium">Day Streak</p>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weeklyActivity.map((day) => (
                  <div key={day.name} className="flex flex-col items-center">
                    <div
                      className={`h-2 w-full rounded-full ${
                        day.minutes > 0 ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    ></div>
                    <span className="text-xs mt-1">{day.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Keep it up! You're building a great habit.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Time Spent Learning</CardTitle>
              <CardDescription>This week's activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} unit="m" />
                    <Tooltip 
                      formatter={(value) => [`${value} minutes`, 'Time Spent']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      }}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Total: 220 minutes this week
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills Proficiency</CardTitle>
                <CardDescription>Your progress in different language skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillsData.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-500">{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Milestones in your language learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievementsData.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`border rounded-lg p-4 ${
                        achievement.unlocked ? 'bg-white' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-300 text-gray-500'
                        }`}>
                          {achievement.unlocked ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-lg">?</span>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h4 className={`text-lg font-medium ${
                            !achievement.unlocked && 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Unlocked: {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vocabulary">
            <Card>
              <CardHeader>
                <CardTitle>Vocabulary Progress</CardTitle>
                <CardDescription>Words and phrases you've learned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-8">
                  <div className="inline-flex flex-col items-center">
                    <div className="text-4xl font-bold">120</div>
                    <p className="text-sm text-gray-500">Words Learned</p>
                  </div>
                  <div className="h-12 w-px bg-gray-200 mx-8"></div>
                  <div className="inline-flex flex-col items-center">
                    <div className="text-4xl font-bold">85</div>
                    <p className="text-sm text-gray-500">Words Mastered</p>
                  </div>
                </div>
                
                <Card className="bg-gray-50 border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recently Learned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      <li className="py-2 flex justify-between">
                        <div>
                          <p className="font-medium">gracias</p>
                          <p className="text-sm text-gray-600">thank you</p>
                        </div>
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                          Mastered
                        </Badge>
                      </li>
                      <li className="py-2 flex justify-between">
                        <div>
                          <p className="font-medium">buenos días</p>
                          <p className="text-sm text-gray-600">good morning</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                          Learning
                        </Badge>
                      </li>
                      <li className="py-2 flex justify-between">
                        <div>
                          <p className="font-medium">por favor</p>
                          <p className="text-sm text-gray-600">please</p>
                        </div>
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                          Mastered
                        </Badge>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProgressTrackerPage;
