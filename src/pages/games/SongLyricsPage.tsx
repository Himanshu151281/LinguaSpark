import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, Pause, RotateCcw, Music, Star, Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatCompletion } from '@/lib/groqClient';

interface Song {
  id: string;
  title: string;
  artist: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  genre: string;
  coverUrl: string;
  duration: string;
}

// Mock song data
const songs: Song[] = [
  {
    id: 'despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    language: 'Spanish',
    level: 'intermediate',
    genre: 'Pop',
    coverUrl: 'https://via.placeholder.com/150',
    duration: '3:47'
  },
  {
    id: 'vivir',
    title: 'Vivir Mi Vida',
    artist: 'Marc Anthony',
    language: 'Spanish',
    level: 'beginner',
    genre: 'Salsa',
    coverUrl: 'https://via.placeholder.com/150',
    duration: '4:12'
  },
  {
    id: 'bailando',
    title: 'Bailando',
    artist: 'Enrique Iglesias',
    language: 'Spanish',
    level: 'intermediate',
    genre: 'Pop',
    coverUrl: 'https://via.placeholder.com/150',
    duration: '4:03'
  },
  {
    id: 'corazon',
    title: 'Corazón Sin Cara',
    artist: 'Prince Royce',
    language: 'Spanish',
    level: 'beginner',
    genre: 'Bachata',
    coverUrl: 'https://via.placeholder.com/150',
    duration: '3:25'
  },
  {
    id: 'heaven',
    title: 'Heaven',
    artist: 'Ayumi Hamasaki',
    language: 'Japanese',
    level: 'advanced',
    genre: 'Pop',
    coverUrl: 'https://via.placeholder.com/150',
    duration: '5:12'
  },
  {
    id: 'sukida',
    title: 'Suki da',
    artist: 'Mika Nakashima',
    language: 'Japanese',
    level: 'intermediate',
    genre: 'Pop',
    coverUrl: 'https://via.placeholder.com/150',
    duration: '4:30'
  }
];

// Mock lyrics for Vivir Mi Vida
const mockLyrics = [
  { time: 0, text: 'Voy a reír, voy a bailar', translation: "I'm going to laugh, I'm going to dance" },
  { time: 5, text: 'Vivir mi vida lalalalá', translation: "Live my life lalalalá" },
  { time: 10, text: 'Voy a reír, voy a gozar', translation: "I'm going to laugh, I'm going to enjoy" },
  { time: 15, text: 'Vivir mi vida lalalalá', translation: "Live my life lalalalá" },
  { time: 20, text: 'A veces llega la lluvia', translation: "Sometimes the rain comes" },
  { time: 25, text: 'Para limpiar las heridas', translation: "To clean the wounds" },
  { time: 30, text: 'A veces solo una gota', translation: "Sometimes just a drop" },
  { time: 35, text: 'Puede vencer la sequía', translation: "Can overcome the drought" },
];

const SongLyricsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [activeTab, setActiveTab] = useState('library');
  const [vocabItems, setVocabItems] = useState<{ word: string; translation: string }[]>([]);
  const [isLoadingVocab, setIsLoadingVocab] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song);
    setActiveTab('player');
    setCurrentTime(0);
    setCurrentLyricIndex(0);
    setIsPlaying(false);
    setUserScore(0);
    setVocabItems([]);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsLoadingVocab(true);
    try {
      const lyricsArray = mockLyrics.map(l => l.text);
      const res = await chatCompletion([
        { role: 'system', content: 'You are a language tutor. Extract 5 key vocabulary words or phrases from the following Spanish song lyrics. Return a JSON array of objects with word and translation fields.' },
        { role: 'user', content: JSON.stringify(lyricsArray) }
      ]);
      const parsed: { word: string; translation: string }[] = JSON.parse(res.choices?.[0]?.message?.content || '[]');
      setVocabItems(parsed);
    } catch (e) {
      console.error('Vocabulary extraction error:', e);
    } finally {
      setIsLoadingVocab(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;

          // Check if we need to move to the next lyric
          const nextLyricIndex = mockLyrics.findIndex(lyric => lyric.time > newTime);
          if (nextLyricIndex > 0 && nextLyricIndex - 1 !== currentLyricIndex) {
            setCurrentLyricIndex(nextLyricIndex - 1);
          }

          // End of song simulation
          if (newTime >= 40) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsPlaying(false);

            // Calculate score based on completion
            setUserScore(95);
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }
  };

  const resetSong = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLyricIndex(0);
    setUserScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Navbar /> */}

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Song Lyrics Practice</h1>
            <p className="text-gray-600">Learn language through music and enhance your pronunciation</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="library">Song Library</TabsTrigger>
            <TabsTrigger value="player" disabled={!selectedSong}>Lyrics Player</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <div className="mb-6 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search songs by title, artist, language or genre..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSongs.map((song) => (
                <Card key={song.id} className="card-hover overflow-hidden">
                  <div 
                    className="h-40 bg-gray-200"
                    style={{
                      backgroundImage: `url(${song.coverUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{song.title}</CardTitle>
                        <CardDescription>{song.artist}</CardDescription>
                      </div>
                      <Badge variant={
                        song.level === 'beginner' ? 'outline' :
                        song.level === 'intermediate' ? 'secondary' : 'default'
                      }>
                        {song.level}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{song.language}</span>
                      <span>{song.genre}</span>
                      <span>{song.duration}</span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full flex items-center gap-2"
                      onClick={() => handleSongSelect(song)}
                    >
                      <Music className="h-4 w-4" />
                      Practice Song
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {filteredSongs.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">No songs found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="player">
            {selectedSong && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <div 
                      className="h-60 bg-gray-200"
                      style={{
                        backgroundImage: `url(${selectedSong.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <CardHeader>
                      <CardTitle>{selectedSong.title}</CardTitle>
                      <CardDescription className="text-base">{selectedSong.artist}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedSong.language}
                        </Badge>
                        <Badge variant={
                          selectedSong.level === 'beginner' ? 'outline' :
                          selectedSong.level === 'intermediate' ? 'secondary' : 'default'
                        }>
                          {selectedSong.level}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedSong.genre}
                        </Badge>
                      </div>

                      {userScore > 0 && (
                        <div className="border rounded-lg p-4 bg-green-50 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{userScore}/100</span>
                          </div>
                          <p className="text-sm text-green-800">Great job with the lyrics!</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('library')}
                      >
                        Back to Library
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Lyrics Practice</CardTitle>
                        <div className="text-sm text-gray-500">
                          {formatTime(currentTime)} / {selectedSong.duration}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <Progress 
                        value={(currentTime / 40) * 100} 
                        className="h-2 mb-6" 
                      />

                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-6">
                          {mockLyrics.map((lyric, index) => (
                            <div 
                              key={index} 
                              className={`p-4 border rounded-lg transition-colors ${
                                index === currentLyricIndex && isPlaying
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white'
                              }`}
                            >
                              <p className={`text-lg mb-2 ${
                                index === currentLyricIndex && isPlaying
                                  ? 'font-medium'
                                  : ''
                              }`}>
                                {lyric.text}
                              </p>
                              <p className="text-sm text-gray-600">{lyric.translation}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex justify-center space-x-4">
                        <Button variant="outline" onClick={resetSong} disabled={currentTime === 0}>
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button onClick={togglePlayPause} size="lg" className="px-8">
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="player">
            {selectedSong && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <div 
                      className="h-60 bg-gray-200"
                      style={{
                        backgroundImage: `url(${selectedSong.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <CardHeader>
                      <CardTitle>{selectedSong.title}</CardTitle>
                      <CardDescription className="text-base">{selectedSong.artist}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedSong.language}
                        </Badge>
                        <Badge variant={
                          selectedSong.level === 'beginner' ? 'outline' :
                          selectedSong.level === 'intermediate' ? 'secondary' : 'default'
                        }>
                          {selectedSong.level}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedSong.genre}
                        </Badge>
                      </div>

                      {userScore > 0 && (
                        <div className="border rounded-lg p-4 bg-green-50 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{userScore}/100</span>
                          </div>
                          <p className="text-sm text-green-800">Great job with the lyrics!</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('library')}
                      >
                        Back to Library
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Lyrics Practice</CardTitle>
                        <div className="text-sm text-gray-500">
                          {formatTime(currentTime)} / {selectedSong.duration}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <Progress 
                        value={(currentTime / 40) * 100} 
                        className="h-2 mb-6" 
                      />

                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-6">
                          {mockLyrics.map((lyric, index) => (
                            <div 
                              key={index} 
                              className={`p-4 border rounded-lg transition-colors ${
                                index === currentLyricIndex && isPlaying
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white'
                              }`}
                            >
                              <p className={`text-lg mb-2 ${
                                index === currentLyricIndex && isPlaying
                                  ? 'font-medium'
                                  : ''
                              }`}>
                                {lyric.text}
                              </p>
                              <p className="text-sm text-gray-600">{lyric.translation}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex justify-center space-x-4">
                        <Button variant="outline" onClick={resetSong} disabled={currentTime === 0}>
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button onClick={togglePlayPause} size="lg" className="px-8">
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="player">
            {selectedSong && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <div 
                      className="h-60 bg-gray-200"
                      style={{
                        backgroundImage: `url(${selectedSong.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <CardHeader>
                      <CardTitle>{selectedSong.title}</CardTitle>
                      <CardDescription className="text-base">{selectedSong.artist}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedSong.language}
                        </Badge>
                        <Badge variant={
                          selectedSong.level === 'beginner' ? 'outline' :
                          selectedSong.level === 'intermediate' ? 'secondary' : 'default'
                        }>
                          {selectedSong.level}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedSong.genre}
                        </Badge>
                      </div>

                      {userScore > 0 && (
                        <div className="border rounded-lg p-4 bg-green-50 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{userScore}/100</span>
                          </div>
                          <p className="text-sm text-green-800">Great job with the lyrics!</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('library')}
                      >
                        Back to Library
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Lyrics Practice</CardTitle>
                        <div className="text-sm text-gray-500">
                          {formatTime(currentTime)} / {selectedSong.duration}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <Progress 
                        value={(currentTime / 40) * 100} 
                        className="h-2 mb-6" 
                      />

                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-6">
                          {mockLyrics.map((lyric, index) => (
                            <div 
                              key={index} 
                              className={`p-4 border rounded-lg transition-colors ${
                                index === currentLyricIndex && isPlaying
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white'
                              }`}
                            >
                              <p className={`text-lg mb-2 ${
                                index === currentLyricIndex && isPlaying
                                  ? 'font-medium'
                                  : ''
                              }`}>
                                {lyric.text}
                              </p>
                              <p className="text-sm text-gray-600">{lyric.translation}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex justify-center space-x-4">
                        <Button variant="outline" onClick={resetSong} disabled={currentTime === 0}>
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button onClick={togglePlayPause} size="lg" className="px-8">
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="player">
            {selectedSong && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <div 
                      className="h-60 bg-gray-200"
                      style={{
                        backgroundImage: `url(${selectedSong.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <CardHeader>
                      <CardTitle>{selectedSong.title}</CardTitle>
                      <CardDescription className="text-base">{selectedSong.artist}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedSong.language}
                        </Badge>
                        <Badge variant={
                          selectedSong.level === 'beginner' ? 'outline' :
                          selectedSong.level === 'intermediate' ? 'secondary' : 'default'
                        }>
                          {selectedSong.level}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedSong.genre}
                        </Badge>
                      </div>

                      {userScore > 0 && (
                        <div className="border rounded-lg p-4 bg-green-50 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{userScore}/100</span>
                          </div>
                          <p className="text-sm text-green-800">Great job with the lyrics!</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('library')}
                      >
                        Back to Library
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Lyrics Practice</CardTitle>
                        <div className="text-sm text-gray-500">
                          {formatTime(currentTime)} / {selectedSong.duration}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <Progress 
                        value={(currentTime / 40) * 100} 
                        className="h-2 mb-6" 
                      />

                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-6">
                          {mockLyrics.map((lyric, index) => (
                            <div 
                              key={index} 
                              className={`p-4 border rounded-lg transition-colors ${
                                index === currentLyricIndex && isPlaying
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white'
                              }`}
                            >
                              <p className={`text-lg mb-2 ${
                                index === currentLyricIndex && isPlaying
                                  ? 'font-medium'
                                  : ''
                              }`}>
                                {lyric.text}
                              </p>
                              <p className="text-sm text-gray-600">{lyric.translation}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex justify-center space-x-4">
                        <Button variant="outline" onClick={resetSong} disabled={currentTime === 0}>
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button onClick={togglePlayPause} size="lg" className="px-8">
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Practice History</CardTitle>
                <CardDescription>Your recent song practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                      <div>
                        <p className="font-medium">Despacito</p>
                        <p className="text-sm text-gray-500">Luis Fonsi ft. Daddy Yankee</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Check className="h-3 w-3 mr-1" /> 92%
                      </Badge>
                      <span className="text-sm text-gray-500">Yesterday</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                      <div>
                        <p className="font-medium">Vivir Mi Vida</p>
                        <p className="text-sm text-gray-500">Marc Anthony</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Check className="h-3 w-3 mr-1" /> 87%
                      </Badge>
                      <span className="text-sm text-gray-500">3 days ago</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                      <div>
                        <p className="font-medium">Corazón Sin Cara</p>
                        <p className="text-sm text-gray-500">Prince Royce</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Check className="h-3 w-3 mr-1" /> 75%
                      </Badge>
                      <span className="text-sm text-gray-500">Last week</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SongLyricsPage;
