import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { chatCompletion } from '@/lib/groqClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import LanguageSelection from './LanguageSelection';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OnboardingProps {
  onComplete: (language: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [assessmentInput, setAssessmentInput] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState('');
  const [learningPath, setLearningPath] = useState('');
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean | null>(null);

  // Check if API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    setApiKeyAvailable(!!apiKey && apiKey.length > 10);
  }, []);

  // Proficiency assessment handler
  const evaluateProficiency = async () => {
    setIsAssessing(true);
    setError(null);
    try {
      const res = await chatCompletion([
        { role: 'system', content: `You are an expert language tutor. Evaluate the proficiency level (A1-C2) and provide a brief justification for this text in ${selectedLanguage}. Format your response with clear sections: 1) Proficiency Level (just the level designation), 2) Brief Assessment (2-3 sentences), 3) Strengths (1-2 bullet points), 4) Areas for Improvement (1-2 bullet points).` },
        { role: 'user', content: assessmentInput }
      ]);
      
      console.log('API Response:', JSON.stringify(res, null, 2));
      
      // Check if the response contains an error from our error handling in groqClient
      if (res.error) {
        setError(`API Error (${res.status || 'Unknown'}): ${res.message || 'Unknown error'}`);
        return;
      }
      
      if (!res.choices?.[0]?.message?.content) {
        // Show the actual error response in the UI but in a more readable format
        const errorMsg = `API response missing expected data. Please ensure your API key is valid and has sufficient permissions.`;
        setError(errorMsg);
        console.error('Invalid API response structure:', JSON.stringify(res));
        return;
      }
      
      setAssessmentResult(res.choices[0].message.content);
    } catch (e) {
      console.error('Proficiency assessment error:', e);
      if (!error) {
        setError(`Error: ${e.message || 'Unknown error occurred'}`);
      }
    } finally {
      setIsAssessing(false);
    }
  };

  // Allow skipping assessment in case of API issues
  const skipAssessment = () => {
    setAssessmentResult(`Proficiency Level: A1 (Beginner)

Brief Assessment: Assessment skipped. Starting with beginner lessons.

Strengths:
• Willingness to learn a new language

Areas for Improvement:
• Building vocabulary and basic grammar skills`);
    setError(null);
  };

  // Learning path generation handler
  const generateLearningPath = async () => {
    setIsGeneratingPath(true);
    setError(null);
    try {
      const res = await chatCompletion([
        { role: 'system', content: `You are an expert language tutor. Based on a learner at proficiency ${assessmentResult || 'A1 (Beginner)'}, generate a roadmap of 5 lessons for learning ${selectedLanguage}, each with a title and brief description.` },
        { role: 'user', content: 'Generate my learning path.' }
      ]);
      
      console.log('Learning Path API Response:', JSON.stringify(res, null, 2));
      
      // Check if the response contains an error from our error handling in groqClient
      if (res.error) {
        setError(`API Error (${res.status || 'Unknown'}): ${res.message || 'Unknown error'}`);
        // Set a default learning path so the user can continue
        setLearningPath(`Default Learning Path for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Beginners:
          
1. Greetings and Introductions - Learn basic greetings and how to introduce yourself.
2. Numbers and Basic Phrases - Master counting and essential everyday expressions.
3. Food and Dining - Vocabulary for ordering food and discussing preferences.
4. Travel and Directions - How to navigate and ask for help while traveling.
5. Daily Routines - Describe your day and everyday activities.`);
        return;
      }
      
      if (!res.choices?.[0]?.message?.content) {
        // Show the actual error response in the UI but in a more readable format
        const errorMsg = `API response missing expected data. Using default learning path instead.`;
        setError(errorMsg);
        console.error('Invalid API response structure:', JSON.stringify(res));
        
        // Set a default learning path so the user can continue
        setLearningPath(`Default Learning Path for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Beginners:
          
1. Greetings and Introductions - Learn basic greetings and how to introduce yourself.
2. Numbers and Basic Phrases - Master counting and essential everyday expressions.
3. Food and Dining - Vocabulary for ordering food and discussing preferences.
4. Travel and Directions - How to navigate and ask for help while traveling.
5. Daily Routines - Describe your day and everyday activities.`);
        return;
      }
      
      setLearningPath(res.choices[0].message.content);
    } catch (e) {
      console.error('Learning path generation error:', e);
      setError(`Error generating learning path: ${e.message || 'Unknown error occurred'}`);
      
      // Set a default learning path so the user can continue
      setLearningPath(`Default Learning Path for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Beginners:
        
1. Greetings and Introductions - Learn basic greetings and how to introduce yourself.
2. Numbers and Basic Phrases - Master counting and essential everyday expressions.
3. Food and Dining - Vocabulary for ordering food and discussing preferences.
4. Travel and Directions - How to navigate and ask for help while traveling.
5. Daily Routines - Describe your day and everyday activities.`);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  useEffect(() => {
    if (step === 3) generateLearningPath();
  }, [step]);

  // Format assessment result for display
  const formatAssessmentResult = (result: string) => {
    if (!result) return null;
    
    // Extract the proficiency level (A1-C2)
    const levelMatch = result.match(/(?:Proficiency Level:|^[A-C][1-2])[^\n]*/i);
    const level = levelMatch ? levelMatch[0].replace(/Proficiency Level:|\s-|:/i, '').trim() : '';
    
    // Split the content into sections
    const sections = result.split(/\n\n|\r\n\r\n/);
    
    return (
      <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        {level && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-linguaspark-primary text-white font-semibold rounded-full text-sm">
              {level}
            </span>
          </div>
        )}
        
        {sections.map((section, index) => {
          const isListSection = section.includes('•') || section.includes('*') || section.includes('-');
          const title = section.split(/\n|:/)[0].trim();
          const content = section.split(/\n|:/).slice(1).join(':').trim();
          
          if (isListSection) {
            // Handle bullet point lists
            const listItems = section.split(/\n/).filter(line => line.trim().match(/^[•*-]/));
            return (
              <div key={index} className="mb-3">
                <h3 className="font-bold text-linguaspark-dark mb-1">{title}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {listItems.map((item, i) => (
                    <li key={i}>{item.replace(/^[•*-]\s*/, '')}</li>
                  ))}
                </ul>
              </div>
            );
          } else if (title.toLowerCase().includes('assessment') || title.toLowerCase().includes('brief')) {
            // Handle the assessment section
            return (
              <div key={index} className="mb-3">
                <h3 className="font-bold text-linguaspark-dark mb-1">{title}</h3>
                <p className="text-gray-700">{content}</p>
              </div>
            );
          } else if (!level && index === 0) {
            // If no level was extracted, handle the first section as the level
            return (
              <div key={index} className="mb-3">
                <span className="inline-block px-3 py-1 bg-linguaspark-primary text-white font-semibold rounded-full text-sm">
                  {section}
                </span>
              </div>
            );
          } else {
            // Handle other sections
            return (
              <div key={index} className="mb-3">
                <p className="text-gray-700">{section}</p>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const steps = [
    {
      title: "Welcome to LinguaSpark",
      description: "Your AI-powered language learning companion",
      content: (
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="inline-block p-3 bg-linguaspark-light rounded-full animate-float">
              <div className="w-20 h-20 bg-linguaspark-primary rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-linguaspark-dark">
            Welcome to LinguaSpark
          </h1>
          <p className="text-gray-600 mb-8">
            Your personalized language learning journey starts here. Powered by AI, 
            LinguaSpark adapts to your learning style and helps you achieve fluency faster.
          </p>
          <Button 
            onClick={() => setStep(1)} 
            className="bg-linguaspark-primary hover:bg-linguaspark-primary/90 text-white"
          >
            Get Started
          </Button>
        </div>
      ),
    },
    {
      title: "Choose Your Language",
      description: "Select the language you want to learn",
      content: (
        <LanguageSelection 
          onSelectLanguage={(language) => {
            setSelectedLanguage(language);
            setStep(2);
          }} 
        />
      ),
    },
    {
      title: "Proficiency Assessment",
      description: "Write a brief paragraph in the selected language",
      content: (
        <div className="max-w-md mx-auto text-center">
          {apiKeyAvailable === false && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No valid Groq API key detected. Please set the VITE_GROQ_API_KEY environment variable.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="mb-4">Please write a brief paragraph in <span className="font-semibold capitalize">{selectedLanguage}</span> about your hobbies:</p>
          <Textarea value={assessmentInput} onChange={(e) => setAssessmentInput(e.target.value)} rows={4} className="w-full mb-4" />
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 justify-center mb-4">
            <Button onClick={evaluateProficiency} disabled={!assessmentInput.trim() || isAssessing || apiKeyAvailable === false} className="bg-linguaspark-primary hover:bg-linguaspark-primary/90 text-white disabled:opacity-50">
              {isAssessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
            </Button>
            
            <Button onClick={skipAssessment} variant="outline" className="text-gray-600">
              Skip Assessment
            </Button>
          </div>
          
          {assessmentResult && formatAssessmentResult(assessmentResult)}
          {assessmentResult && <Button onClick={() => setStep(step + 1)}>Next</Button>}
        </div>
      ),
    },
    {
      title: "Learning Path Created",
      description: "Review your personalized learning roadmap",
      content: (
        <div className="max-w-md mx-auto text-center">
          {isGeneratingPath ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : (
            <pre className="whitespace-pre-wrap text-left">{learningPath}</pre>
          )}
          {!isGeneratingPath && <Button className="mt-4" onClick={() => setStep(step + 1)}>Next</Button>}
        </div>
      ),
    },
    {
      title: "Tutorial",
      description: "Learn how to navigate the platform",
      content: (
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">Platform Tutorial</h2>
          <ul className="text-left list-disc list-inside space-y-2 mb-4">
            <li><strong>Dashboard</strong>: Track your progress and daily goals.</li>
            <li><strong>Lessons</strong>: Access reading passages and exercises.</li>
            <li><strong>Practice</strong>: Have AI-driven conversations and translations.</li>
            <li><strong>Game Center</strong>: Improve skills with fun games like typing tests.</li>
            <li><strong>Progress</strong>: Review your skill breakdown and achievements.</li>
          </ul>
          <Button onClick={() => onComplete(selectedLanguage)} className="bg-linguaspark-primary hover:bg-linguaspark-primary/90 text-white">Start Learning</Button>
        </div>
      ),
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === step 
                  ? 'w-8 bg-linguaspark-primary' 
                  : index < step 
                    ? 'w-8 bg-linguaspark-success' 
                    : 'w-2 bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
        <h2 className="text-center text-xl font-semibold text-linguaspark-dark">
          {currentStep.title}
        </h2>
        <p className="text-center text-gray-500 text-sm">
          {currentStep.description}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        {currentStep.content}
      </div>
    </div>
  );
};

export default Onboarding;
