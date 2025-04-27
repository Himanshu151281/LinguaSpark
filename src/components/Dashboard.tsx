import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface Recommendation {
  title: string;
  type: string;
  duration: string;
  icon: string;
  link: string;
}

interface DashboardProps {
  userName: string;
  language: string;
  streak: number;
  progress: number;
  dailyGoal: number;
  completedLessons: number;
  totalLessons: number;
  recommendations?: Recommendation[];
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  language,
  streak,
  progress,
  dailyGoal,
  completedLessons,
  totalLessons,
  recommendations = [],
  onNavigate,
}) => {
  // Use provided recommendations or fallback to defaults if empty
  const displayRecommendations = recommendations.length > 0 ? recommendations : [
    {
      title: "Basic Greetings",
      type: "Lesson",
      duration: "5 min",
      icon: "🗣️",
      link: "/lessons/basic-greetings",
    },
    {
      title: "Numbers Practice",
      type: "Game",
      duration: "10 min",
      icon: "🔢",
      link: "/games/numbers",
    },
    {
      title: "Conversation: At a Restaurant",
      type: "Practice",
      duration: "15 min",
      icon: "🍽️",
      link: "/practice/restaurant",
    },
  ];

  const formatLanguageName = (lang: string) => {
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  };
  
  const handleNavigation = (path: string) => {
    if (!onNavigate) return;
    
    // Extract the section from the path (e.g., /lessons/basic -> lessons)
    const section = path.split('/')[1];
    onNavigate(section);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">
            Continue your {formatLanguageName(language)} learning journey
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center">
          <div className="flex items-center mr-6">
            <div className="bg-orange-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-gray-500">Streak</p>
              <p className="font-bold">{streak} days</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-gray-500">Daily Goal</p>
              <p className="font-bold">{dailyGoal}% complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar bg-linguaspark-primary" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Lessons Completed</span>
                <span className="text-sm font-medium">{completedLessons}/{totalLessons}</span>
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar bg-linguaspark-secondary" 
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between space-x-4">
              <Button 
                onClick={() => handleNavigation('/lessons')} 
                className="flex-1 bg-linguaspark-primary hover:bg-linguaspark-primary/90"
              >
                Continue Learning
              </Button>
              <Button 
                onClick={() => handleNavigation('/progress')}
                variant="outline" 
                className="flex-1 border-linguaspark-primary text-linguaspark-primary hover:bg-linguaspark-light"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E6E6E6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#38B2AC"
                    strokeWidth="3"
                    strokeDasharray={`${dailyGoal}, 100`}
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-linguaspark-primary">{dailyGoal}%</span>
                  <span className="text-xs text-gray-500">Complete</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => handleNavigation('/practice')}
              className="w-full bg-linguaspark-secondary hover:bg-linguaspark-secondary/90"
            >
              Practice Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recommended for You</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-linguaspark-primary hover:text-linguaspark-primary/90 hover:bg-linguaspark-light"
            onClick={() => handleNavigation('/lessons')}
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayRecommendations.map((item, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="bg-linguaspark-light h-12 w-12 rounded-lg flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{item.duration}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{item.type}</p>
                    <button 
                      onClick={() => handleNavigation(item.link)}
                      className="text-sm text-linguaspark-primary hover:text-linguaspark-primary/90 font-medium text-left"
                    >
                      Start Now →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleNavigation('/practice/conversation')}
            className="h-auto flex flex-col items-center justify-center p-4 border-2 hover:bg-linguaspark-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-linguaspark-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            <span>Practice Conversation</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleNavigation('/games/vocabulary')}
            className="h-auto flex flex-col items-center justify-center p-4 border-2 hover:bg-linguaspark-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-linguaspark-accent" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span>Play Vocabulary Game</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleNavigation('/lessons/daily')}
            className="h-auto flex flex-col items-center justify-center p-4 border-2 hover:bg-linguaspark-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-linguaspark-secondary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Daily Lesson</span>
          </Button>
          
          <Link to="/quiz" className="w-full">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center p-4 border-2 hover:bg-linguaspark-light w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-linguaspark-error" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>Take a Quiz</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
