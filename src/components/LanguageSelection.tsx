
import React from 'react';
import { Card } from "@/components/ui/card";

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  badgeClass: string;
}

interface LanguageSelectionProps {
  onSelectLanguage: (language: string) => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelectLanguage }) => {
  const languages: LanguageOption[] = [
    { 
      id: 'english', 
      name: 'English', 
      nativeName: 'English',
      flagEmoji: '🇬🇧', 
      badgeClass: 'language-badge-english' 
    },
    { 
      id: 'hindi', 
      name: 'Hindi', 
      nativeName: 'हिन्दी',
      flagEmoji: '🇮🇳', 
      badgeClass: 'language-badge-hindi' 
    },
    { 
      id: 'spanish', 
      name: 'Spanish', 
      nativeName: 'Español',
      flagEmoji: '🇪🇸', 
      badgeClass: 'language-badge-spanish' 
    },
    { 
      id: 'japanese', 
      name: 'Japanese', 
      nativeName: '日本語',
      flagEmoji: '🇯🇵', 
      badgeClass: 'language-badge-japanese' 
    },
    { 
      id: 'arabic', 
      name: 'Arabic', 
      nativeName: 'العربية',
      flagEmoji: '🇸🇦', 
      badgeClass: 'language-badge-arabic' 
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-center text-2xl font-bold text-linguaspark-dark mb-6">
        Choose a language to begin your journey
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Select the language you want to learn. You can always change this later.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {languages.map((language) => (
          <Card 
            key={language.id}
            className="cursor-pointer card-hover p-6 flex flex-col items-center"
            onClick={() => onSelectLanguage(language.id)}
          >
            <div className="text-4xl mb-2">{language.flagEmoji}</div>
            <h3 className="font-bold text-xl mb-1">{language.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{language.nativeName}</p>
            <span className={`language-badge ${language.badgeClass}`}>
              Learn {language.name}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelection;
