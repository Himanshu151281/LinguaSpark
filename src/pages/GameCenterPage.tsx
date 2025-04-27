import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const games = [
  {
    id: 'typing',
    title: 'Typing Tests',
    description: 'Improve your typing speed and accuracy in your target language',
    color: 'blue',
    icon: '⌨️',
    badges: ['Speed', 'Accuracy', 'Vocabulary'],
    complexity: 'Beginner to Advanced',
    skills: ['Writing', 'Vocabulary']
  },
  {
    id: 'lyrics',
    title: 'Song Lyrics Practice',
    description: 'Learn language through music and enhance your pronunciation',
    color: 'pink',
    icon: '🎵',
    badges: ['Pronunciation', 'Listening', 'Fun'],
    complexity: 'Intermediate',
    skills: ['Listening', 'Speaking']
  },
  {
    id: 'stories',
    title: 'Story Generator',
    description: 'Create and interact with AI-generated stories to practice comprehension',
    color: 'green',
    icon: '📚',
    badges: ['Reading', 'Vocabulary', 'Cultural'],
    complexity: 'Beginner to Advanced',
    skills: ['Reading', 'Vocabulary']
  }
];

const GameCenterPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Navbar /> */}
      
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Game Center</h1>
            <p className="text-gray-600">Learn language through fun, interactive games</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {games.map((game) => (
            <Card key={game.id} className="card-hover overflow-hidden border-t-4"
              style={{ borderTopColor: game.color === 'blue' ? 'hsl(var(--primary))' :
                game.color === 'pink' ? '#ec4899' :
                game.color === 'green' ? '#10b981' :
                '#8b5cf6' // purple
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{game.icon}</span>
                      <span>{game.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">{game.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {game.badges.map((badge) => (
                    <span 
                      key={badge}
                      className={`text-xs px-2 py-1 rounded-full ${
                        game.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        game.color === 'pink' ? 'bg-pink-100 text-pink-800' :
                        game.color === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Complexity</p>
                    <p className="font-medium">{game.complexity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Skills</p>
                    <p className="font-medium">{game.skills.join(', ')}</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Link to={`/games/${game.id}`} className="w-full">
                  <Button className="w-full">Play Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle>Challenge Mode</CardTitle>
            <CardDescription className="text-white text-opacity-90">
              Ready to test your skills? Try our weekly language challenges!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Compete with other learners and earn bonus points by completing special challenges that test multiple language skills at once.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="bg-white text-purple-600 hover:bg-white/90">
              Weekly Challenge
            </Button>
          </CardFooter>
        </Card> */}
      </main>
    </div>
  );
};

export default GameCenterPage;
