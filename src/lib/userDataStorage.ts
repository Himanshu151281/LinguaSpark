// src/lib/userDataStorage.ts
// Helper functions to manage user data in localStorage

export interface UserData {
  userName: string;
  language: string;
  streak: number;
  progress: number;
  dailyGoal: number;
  completedLessons: number;
  totalLessons: number;
  lastLoginDate?: string;
  recommendations?: Array<{
    title: string;
    type: string;
    duration: string;
    icon: string;
    link: string;
  }>;
}

const USER_DATA_KEY = 'linguaspark_user_data';

export const saveUserData = (data: Partial<UserData>): void => {
  const existingData = getUserData();
  const updatedData = { ...existingData, ...data };
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
};

export const getUserData = (): UserData => {
  const storedData = localStorage.getItem(USER_DATA_KEY);
  if (storedData) {
    return JSON.parse(storedData) as UserData;
  }
  
  // Default data if nothing is stored
  return {
    userName: "Language Learner",
    language: "english",
    streak: 0,
    progress: 0,
    dailyGoal: 0,
    completedLessons: 0,
    totalLessons: 10,
  };
};

export const initializeUserData = (language: string): UserData => {
  const today = new Date().toISOString().split('T')[0];
  const initialData: UserData = {
    userName: "Language Learner",
    language,
    streak: 1,
    progress: 10,
    dailyGoal: 20,
    completedLessons: 1,
    totalLessons: 10,
    lastLoginDate: today,
    recommendations: [
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
        title: "Conversation: Introductions",
        type: "Practice",
        duration: "15 min",
        icon: "👋",
        link: "/practice/introductions",
      },
    ]
  };
  
  saveUserData(initialData);
  return initialData;
};

export const updateStreak = (): void => {
  const userData = getUserData();
  const today = new Date().toISOString().split('T')[0];
  
  if (userData.lastLoginDate) {
    const lastLogin = new Date(userData.lastLoginDate);
    const currentDate = new Date(today);
    
    // Calculate the difference in days
    const timeDiff = currentDate.getTime() - lastLogin.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff === 1) {
      // Consecutive day, increase streak
      saveUserData({ 
        streak: userData.streak + 1,
        lastLoginDate: today
      });
    } else if (dayDiff > 1) {
      // Streak broken, reset to 1
      saveUserData({ 
        streak: 1,
        lastLoginDate: today
      });
    }
  } else {
    // First login
    saveUserData({ 
      streak: 1,
      lastLoginDate: today
    });
  }
};

export const updateProgress = (additionalProgress: number): void => {
  const userData = getUserData();
  const newProgress = Math.min(100, userData.progress + additionalProgress);
  const newDailyGoal = Math.min(100, userData.dailyGoal + additionalProgress);
  
  saveUserData({ 
    progress: newProgress,
    dailyGoal: newDailyGoal
  });
};

export const completeLesson = (): void => {
  const userData = getUserData();
  const completedLessons = userData.completedLessons + 1;
  
  saveUserData({ 
    completedLessons,
    progress: Math.min(100, userData.progress + 10),
    dailyGoal: Math.min(100, userData.dailyGoal + 20)
  });
}; 