import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import LessonHub from '@/components/LessonHub';
import ConversationPractice from '@/components/ConversationPractice';
import GameCenter from '@/components/GameCenter';
import ProgressTracker from '@/components/ProgressTracker';
import { getUserData, initializeUserData, updateStreak, UserData, saveUserData } from '@/lib/userDataStorage';
import { chatCompletion } from '@/lib/groqClient';
import { Spinner } from '@/components/ui/spinner';

const Index = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [activePage, setActivePage] = useState('dashboard');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check localStorage for existing user data on mount
  useEffect(() => {
    const data = getUserData();
    if (data.language) {
      setSelectedLanguage(data.language);
      setIsOnboarded(true);
      setUserData(data);
      updateStreak(); // Update streak based on last login
    }
    setIsLoading(false);
  }, []);
  
  // Function to generate AI recommendations when needed
  const generateRecommendations = async (language: string, level: string = "beginner") => {
    try {
      const res = await chatCompletion([
        { 
          role: 'system', 
          content: `You are a language learning assistant. Generate 3 personalized learning activities for a ${level} ${language} learner. Format as JSON array with fields: title, type (Lesson, Game, Practice), duration (in minutes), icon (emoji), link (URL path).` 
        },
        { role: 'user', content: 'Generate personalized recommendations' }
      ]);
      
      if (res.choices?.[0]?.message?.content) {
        try {
          // Parse the JSON response from the AI
          const content = res.choices[0].message.content;
          // Extract JSON array if it's embedded in text
          const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          return JSON.parse(content);
        } catch (e) {
          console.error('Failed to parse recommendations:', e);
          return [];
        }
      }
    } catch (e) {
      console.error('Failed to generate recommendations:', e);
      return [];
    }
    return [];
  };
  
  const handleOnboardingComplete = async (language: string) => {
    // Initialize user data in localStorage
    const newUserData = initializeUserData(language);
    setSelectedLanguage(language);
    setUserData(newUserData);
    setIsOnboarded(true);
    
    // Try to get AI-generated recommendations
    try {
      const recommendations = await generateRecommendations(language);
      if (recommendations && recommendations.length > 0) {
        // Update user data with AI recommendations
        const updatedData = { ...newUserData, recommendations };
        saveUserData({ recommendations }); // Save recommendations to localStorage
        setUserData(updatedData);
      }
    } catch (e) {
      console.error('Failed to get AI recommendations:', e);
    }
  };
  
  const handleNavigation = (page: string) => {
    setActivePage(page);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-screen">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your language learning journey...</p>
        </div>
      );
    }
    
    if (!isOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }
    
    if (!userData) {
      return <div>Error loading user data</div>;
    }
    
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            userName={userData.userName}
            language={userData.language}
            streak={userData.streak}
            progress={userData.progress}
            dailyGoal={userData.dailyGoal}
            completedLessons={userData.completedLessons}
            totalLessons={userData.totalLessons}
            recommendations={userData.recommendations}
            onNavigate={handleNavigation}
          />
        );
      case 'lessons':
        return <LessonHub />;
      case 'practice':
        return <ConversationPractice />;
      case 'games':
        return <GameCenter />;
      case 'progress':
        return <ProgressTracker />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isOnboarded && (
        <Navbar onNavigate={handleNavigation} activePage={activePage} />
      )}
      <main className="flex-1 bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
