'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ScreenLayout, MainContent, Header, Card, Button, Heading, Text } from '../ui';

const GENRES = [
  { 
    id: 'eventyr', 
    label: 'Eventyr', 
    emoji: '👸', 
    bgColor: 'bg-blue-100',
    description: 'Prinsesser, slotte og magiske kreaturer'
  },
  { 
    id: 'venskab', 
    label: 'Venskab', 
    emoji: '🐻', 
    bgColor: 'bg-pink-100',
    description: 'Historier om at hjælpe og være venner'
  },
  { 
    id: 'magisk', 
    label: 'Magisk', 
    emoji: '🧙‍♂️', 
    bgColor: 'bg-yellow-100',
    description: 'Troldmænd, tryllestave og magi'
  },
  { 
    id: 'natur', 
    label: 'Natur', 
    emoji: '🌳', 
    bgColor: 'bg-green-100',
    description: 'Skove, dyr og udendørs eventyr'
  },
  { 
    id: 'rummet', 
    label: 'Rummet', 
    emoji: '🚀', 
    bgColor: 'bg-purple-100',
    description: 'Rumrejser og fremmede planeter'
  },
  { 
    id: 'sport', 
    label: 'Sport', 
    emoji: '⚽', 
    bgColor: 'bg-orange-100',
    description: 'Fodbold, løb og sportslige udfordringer'
  },
];

export default function StoryBuilderScreen() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  const handleGenerateStory = async () => {
    if (!selectedGenre) return;
    
    setIsGenerating(true);
    
    // TODO: Implementer AI historie generering
    setTimeout(() => {
      setIsGenerating(false);
      // Navigate til story player
      window.location.href = '/story-player';
    }, 3000);
  };

  const selectedGenreData = GENRES.find(g => g.id === selectedGenre);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => window.location.href = '/home'}
            className="flex items-center space-x-2 px-4 py-2 rounded-playtale border-2 border-gray-200 hover:border-playtale-secondary hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-playtale-secondary" />
            <span className="text-sm font-medium text-playtale-secondary">Hjem</span>
          </button>
          <Heading level={1} size="2xl" color="purple">PlayTale</Heading>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6">
        
        {/* Logo og Title */}
        <div className="text-center mb-8 pt-8">
          <Heading level={1} size="4xl" color="purple">PlayTale</Heading>
          <h1 className="text-3xl font-bold text-playtale-primary mt-4">
            Vælg genre
          </h1>
        </div>

        {/* Genre Grid */}
        <div className="w-full max-w-4xl mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreSelect(genre.id)}
                className={`p-8 rounded-playtale border-4 transition-all transform hover:scale-[1.02] ${
                  selectedGenre === genre.id
                    ? 'border-playtale-secondary shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                } ${genre.bgColor}`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{genre.emoji}</div>
                  <h3 className="text-xl font-bold text-playtale-primary mb-2">
                    {genre.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {genre.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected genre & Generate button */}
        {selectedGenre && (
          <div className="w-full max-w-md">
            <div className="bg-white rounded-playtale p-6 shadow-lg border-2 border-playtale-secondary mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedGenreData?.emoji}</div>
                <h3 className="text-lg font-bold text-playtale-primary mb-1">
                  {selectedGenreData?.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedGenreData?.description}
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-playtale text-white font-medium text-lg transition-all transform ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-playtale-secondary hover:bg-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  <span>Skaber historie...</span>
                </>
              ) : (
                <span>Generer historie</span>
              )}
            </button>

            {isGenerating && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Dette tager normalt 30-60 sekunder
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!selectedGenre && (
          <div className="text-center text-gray-500 max-w-md">
            <p className="text-sm">
              Vælg en genre ovenfor for at starte din magiske historie
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
