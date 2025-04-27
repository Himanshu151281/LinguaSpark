import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, BookOpen, Clock, Star, Users, Flame, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { chatCompletion } from '@/lib/groqClient';

const DashboardPage = () => {
  // Mock data - in a real app this would come from API
  const userData = {
    name: "Language Learner",
    language: "Spanish",
    streak: 7,
    progress: 45,
    dailyGoal: 70,
    completedLessons: 3,
    totalLessons: 10,
    timeSpent: "1h 30m",
    vocabularyMastered: 120,
    friendsLearning: 5
  };

  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoadingRecs(true);
      try {
        const res = await chatCompletion([
          { role: 'system', content: 'You are an AI tutor. Based on the following user data, recommend 3 learning activities or modules that would help them advance:' },
          { role: 'user', content: JSON.stringify(userData) }
        ]);
        setRecommendations(res.choices?.[0]?.message?.content || 'No recommendations available.');
      } catch (e) {
        console.error('Recommendations error:', e);
      } finally {
        setIsLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar name={userData.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {userData.name}!</h1>
              <p className="text-gray-600">You're learning {userData.language}</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Flame className="text-orange-500" />
            <span className="font-bold text-lg">{userData.streak} day streak</span>
          </div>
        </div>
        
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
            <CardDescription>You're {userData.progress}% of the way to your daily goal</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={userData.progress} className="h-2" />
            <div className="mt-4 flex justify-between text-sm">
              <span>Current: {userData.progress}%</span>
              <span>Goal: {userData.dailyGoal}%</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lessons Completed</p>
                  <p className="text-xl font-bold">{userData.completedLessons}/{userData.totalLessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Spent Today</p>
                  <p className="text-xl font-bold">{userData.timeSpent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vocabulary Mastered</p>
                  <p className="text-xl font-bold">{userData.vocabularyMastered} words</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Users className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Friends Learning</p>
                  <p className="text-xl font-bold">{userData.friendsLearning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isLoadingRecs ? (
          <Loader2 className="animate-spin mx-auto mb-8" />
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap">{recommendations}</pre>
            </CardContent>
          </Card>
        )}
        
        {/* Quick Access */}
        <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Lesson</CardTitle>
              <CardDescription>Basic Greetings</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link to="/lessons" className="w-full">
                <Button className="w-full">Continue</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Practice Speaking</CardTitle>
              <CardDescription>Perfect your pronunciation</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link to="/practice" className="w-full">
                <Button className="w-full">Start Practice</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Daily Quiz</CardTitle>
              <CardDescription>Test your knowledge</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link to="/progress/quiz" className="w-full">
                <Button className="w-full">Take Quiz</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Recommended Activities */}
        <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/games/typing" className="w-full">
            <Card className="card-hover h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Trophy className="text-blue-600 h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Typing Test</h3>
                <p className="text-sm text-gray-600">Improve your speed and accuracy</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/games/lyrics" className="w-full">
            <Card className="card-hover h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-pink-100 p-4 rounded-full mb-4">
                  <Trophy className="text-pink-600 h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Song Lyrics</h3>
                <p className="text-sm text-gray-600">Learn with music</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/games/stories" className="w-full">
            <Card className="card-hover h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Trophy className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Story Generator</h3>
                <p className="text-sm text-gray-600">Create interactive stories</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/games/comics" className="w-full">
            <Card className="card-hover h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <Trophy className="text-purple-600 h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Comic Creator</h3>
                <p className="text-sm text-gray-600">Learn with visual stories</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
