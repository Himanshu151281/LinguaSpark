import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { chatCompletion } from '@/lib/groqClient';
import { getUserData } from '@/lib/userDataStorage';

// Add global styles to ensure UI components render properly
import '@/styles/globals.css';

// Dynamic quiz state and types
interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

// Fallback quiz questions in case API fails
const fallbackQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the main purpose of LinguaSpark?",
    options: [
      { id: "a", text: "Language learning with AI assistance" },
      { id: "b", text: "Video game development" },
      { id: "c", text: "Social media networking" },
      { id: "d", text: "Financial management" }
    ],
    correctAnswer: "a",
    explanation: "LinguaSpark is an AI-powered language learning platform designed to help users learn languages through various interactive activities."
  },
  {
    id: 2,
    question: "Which feature allows users to practice speaking with an AI partner?",
    options: [
      { id: "a", text: "Lesson Hub" },
      { id: "b", text: "Conversation Practice" },
      { id: "c", text: "Game Center" },
      { id: "d", text: "Progress Tracker" }
    ],
    correctAnswer: "b",
    explanation: "The Conversation Practice feature enables users to engage in dialogues with an AI language partner in various scenarios."
  },
  {
    id: 3,
    question: "What can users create in the Comic Creator game?",
    options: [
      { id: "a", text: "Video animations" },
      { id: "b", text: "Music playlists" },
      { id: "c", text: "Visual stories with dialogue" },
      { id: "d", text: "Mathematical equations" }
    ],
    correctAnswer: "c",
    explanation: "In the Comic Creator game, users can create visual stories with dialogue to practice language in a creative context."
  },
  {
    id: 4,
    question: "Which component tracks your learning achievements?",
    options: [
      { id: "a", text: "Dashboard" },
      { id: "b", text: "Lesson Hub" },
      { id: "c", text: "Game Center" },
      { id: "d", text: "Progress Tracker" }
    ],
    correctAnswer: "d",
    explanation: "The Progress Tracker component shows your achievements, skill breakdown, and learning analytics."
  },
  {
    id: 5,
    question: "What happens during the onboarding process in LinguaSpark?",
    options: [
      { id: "a", text: "Immediate language lessons begin" },
      { id: "b", text: "Language selection and proficiency assessment" },
      { id: "c", text: "Payment processing" },
      { id: "d", text: "Video tutorial viewing" }
    ],
    correctAnswer: "b",
    explanation: "During onboarding, users select their target language and complete a proficiency assessment before receiving a personalized learning path."
  }
];

const QuizPage = () => {
  const { toast } = useToast();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userData, setUserData] = useState<{language: string, completedLessons: number}>({
    language: "english",
    completedLessons: 0
  });

  useEffect(() => {
    // Get user data when component mounts
    const data = getUserData();
    setUserData({
      language: data.language || "english",
      completedLessons: data.completedLessons || 0
    });
  }, []);

  const fetchQuizQuestions = async () => {
    setIsLoadingQuiz(true);
    setLoadError(null);
    
    try {
      const lessonProgressText = userData.completedLessons > 0 
        ? `The user has completed ${userData.completedLessons} lessons in ${userData.language}.` 
        : `The user is just starting to learn ${userData.language}.`;

      const res = await chatCompletion([
        { 
          role: 'system', 
          content: `Generate 5 multiple-choice quiz questions about the ${userData.language} language appropriate for a student who has completed ${userData.completedLessons} lessons. ${lessonProgressText} 
          
          For beginners (0-3 lessons), focus on basic vocabulary, greetings, and simple phrases.
          For intermediate (4-7 lessons), include some grammar concepts and more complex vocabulary.
          For advanced (8+ lessons), include idioms, complex grammar, and cultural concepts.
          
          Respond with a valid JSON array of objects with id, question, options (array of {id, text}), correctAnswer, explanation. Do not include markdown formatting or code block markers in your response.` 
        }
      ]);
      
      const content = res.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from API");
      }
      
      // Clean the content from markdown formatting
      let cleanContent = content;
      
      // Remove markdown code block markers (```json and ```)
      cleanContent = cleanContent.replace(/```(json)?|```/g, '');
      
      // Trim whitespace and ensure we have a valid JSON string
      cleanContent = cleanContent.trim();
      
      console.log("Cleaned content for parsing:", cleanContent.substring(0, 100) + "...");
      
      // Try to parse JSON, with error handling
      try {
        const parsed = JSON.parse(cleanContent);
        
        // Validate the structure before setting
        if (Array.isArray(parsed) && parsed.length > 0 && 
            parsed[0].question && Array.isArray(parsed[0].options)) {
          setQuizQuestions(parsed);
          toast({
            description: `Quiz questions for ${userData.language} loaded successfully!`,
            variant: "default"
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError, 'Raw content:', content);
        throw new Error("Could not parse quiz data");
      }
    } catch (e) {
      console.error('Quiz generation error:', e);
      setLoadError(`Failed to load quiz questions: ${e instanceof Error ? e.message : 'Unknown error'}`);
      
      // Use fallback questions instead
      setQuizQuestions(fallbackQuestions);
      toast({
        description: "Using fallback questions due to loading error",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  useEffect(() => {
    // Only fetch questions after we have user data
    if (userData.language) {
      fetchQuizQuestions();
    }
  }, [userData]);

  // If we have an error but also loaded fallback questions
  if (loadError && quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                <span>Quiz Loading Error</span>
              </CardTitle>
              <CardDescription>There was a problem loading the quiz questions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{loadError}</p>
              <Button onClick={fetchQuizQuestions} className="w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                <span>Try Again</span>
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - if no questions available even after loading
  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>No Quiz Questions</CardTitle>
              <CardDescription>Could not load any quiz questions at this time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchQuizQuestions} className="w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                <span>Try Again</span>
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Extra safety check to make sure the current question exists
  const currentQuestion = quizQuestions[currentQuestionIndex];
  console.log("Current quiz data:", { 
    questionCount: quizQuestions.length,
    currentIndex: currentQuestionIndex,
    hasCurrentQuestion: !!currentQuestion
  });
  
  // If no current question is available, show error UI
  if (!currentQuestion) {
    console.error("Current question is undefined. Index:", currentQuestionIndex, "Questions:", quizQuestions);
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Quiz Error</CardTitle>
              <CardDescription>Could not load the current question</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">There was a problem displaying this question. Please try restarting the quiz.</p>
              <Button onClick={restartQuiz} className="w-full mb-2">
                Restart Quiz
              </Button>
              <Button onClick={fetchQuizQuestions} className="w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                <span>Load New Questions</span>
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    setIsAnswerSubmitted(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
      toast({
        description: "Correct answer! Well done!",
        variant: "default"
      });
    } else {
      toast({
        description: "That's not quite right. Try again next time.",
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswers(0);
    setQuizFinished(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar activePage="quiz" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Daily {userData.language.charAt(0).toUpperCase() + userData.language.slice(1)} Quiz</h1>
            <p className="text-gray-600">Test your knowledge with our daily language challenge</p>
          </div>
          
          {loadError && (
            <div className="mt-2 flex items-center text-amber-600 text-sm">
              <AlertTriangle size={16} className="mr-1" />
              <span>Using fallback questions ({loadError})</span>
            </div>
          )}
        </div>

        {quizFinished ? (
          <Card className="max-w-2xl mx-auto shadow-md border border-gray-200">
            <CardHeader className="bg-white rounded-t-lg">
              <CardTitle>Quiz Completed!</CardTitle>
              <CardDescription>Let's see how you did on today's quiz</CardDescription>
            </CardHeader>
            <CardContent className="bg-white p-6">
              <div className="flex flex-col items-center space-y-6">
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
                      stroke={correctAnswers / quizQuestions.length >= 0.7 ? '#4ade80' : '#f97316'}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - correctAnswers / quizQuestions.length)}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">
                      {correctAnswers}/{quizQuestions.length}
                    </span>
                    <span className="text-sm text-gray-500">Score</span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {correctAnswers === quizQuestions.length
                      ? 'Perfect Score! Excellent work!'
                      : correctAnswers / quizQuestions.length >= 0.7
                        ? 'Great job! You did well!'
                        : 'Good effort! Keep practicing!'}
                  </h3>
                  <p className="text-gray-600">
                    You answered {correctAnswers} out of {quizQuestions.length} questions correctly.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 rounded-b-lg border-t">
              <Button onClick={restartQuiz} variant="outline" className="w-full sm:w-auto border border-gray-300">
                Try Again
              </Button>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Back to Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="max-w-3xl mx-auto shadow-md border border-gray-200">
            <CardHeader className="bg-white rounded-t-lg">
              <CardTitle className="flex justify-between items-center">
                <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                <span className="text-sm font-normal text-gray-500">Daily Quiz</span>
              </CardTitle>
              <div className="w-full mt-2">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 bg-white p-6">
              {(() => {
                try {
                  return (
                    <>
                      <div>
                        <h3 className="text-xl font-medium mb-6">{currentQuestion?.question || "Question unavailable"}</h3>
        
                        <div className="space-y-3">
                          {(currentQuestion?.options || []).map((option) => {
                            if (!option || !option.id) return null; // Skip invalid options
                            

                            try {
                              const isSelected = selectedAnswer === option.id;
                              const isCorrect = isAnswerSubmitted && option.id === currentQuestion.correctAnswer;
                              const isIncorrect = isAnswerSubmitted && isSelected && option.id !== currentQuestion.correctAnswer;
        
                              return (
                                <div
                                  key={option.id}
                                  className={`flex items-center border rounded-lg p-4 transition-colors cursor-pointer ${
                                    isSelected && !isAnswerSubmitted
                                      ? 'border-blue-500 bg-blue-50'
                                      : isCorrect
                                        ? 'border-green-500 bg-green-50'
                                        : isIncorrect
                                          ? 'border-red-500 bg-red-50'
                                          : 'border-gray-200'
                                  }`}
                                  onClick={() => {
                                    if (!isAnswerSubmitted) setSelectedAnswer(option.id);
                                  }}
                                >
                                  <div className="mr-3 relative flex items-center justify-center">
                                    <div className={`h-4 w-4 rounded-full border ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
                                      {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <label 
                                    className="flex-1 cursor-pointer"
                                  >
                                    {option.text}
                                  </label>
                                  {isAnswerSubmitted && (
                                    <div className="ml-2">
                                      {isCorrect && (
                                        <Check className="h-5 w-5 text-green-600" />
                                      )}
                                      {isIncorrect && (
                                        <X className="h-5 w-5 text-red-600" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            } catch (err) {
                              console.error("Error rendering option:", err);
                              return null;
                            }
                          })}
                        </div>
                      </div>
        
                      {isAnswerSubmitted && currentQuestion && (
                        <div className={`p-4 rounded-lg ${
                          selectedAnswer === currentQuestion.correctAnswer
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          <p className="font-medium mb-1">
                            {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                          </p>
                          <p>{currentQuestion.explanation}</p>
                        </div>
                      )}
                    </>
                  );
                } catch (error) {
                  console.error("Error rendering quiz content:", error);
                  return (
                    <div className="p-4 text-center">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                      <p className="text-gray-600 mb-4">Something went wrong displaying this question</p>
                      <Button onClick={fetchQuizQuestions} className="mx-auto">
                        Try Again
                      </Button>
                    </div>
                  );
                }
              })()}
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t">
              {isAnswerSubmitted ? (
                <Button onClick={handleNextQuestion} className="w-full bg-blue-600 hover:bg-blue-700">
                  {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              ) : (
                <Button 
                  onClick={handleAnswerSubmit} 
                  disabled={!selectedAnswer}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
