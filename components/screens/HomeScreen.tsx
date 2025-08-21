'use client';

import React, { useState } from 'react';
import { Plus, Library, User, Clock, Star, Book } from 'lucide-react';
import { ScreenLayout, MainContent, Header, Card, Button, Heading, Text } from '../ui';

// Mock data - senere vil dette komme fra database
const mockChildren = [
  { id: '1', name: 'Emma', avatar: '👧🏼' },
  { id: '2', name: 'Anders', avatar: '👦🏻' },
];

const mockRecentStories = [
  { 
    id: '1', 
    title: 'Den magiske skov', 
    childName: 'Emma', 
    genre: 'Eventyr',
    lastRead: '2 timer siden',
    thumbnail: '🌲'
  },
  { 
    id: '2', 
    title: 'Rumrejsen til Mars', 
    childName: 'Anders', 
    genre: 'Rummet',
    lastRead: 'I går',
    thumbnail: '🚀'
  },
];

export default function HomeScreen() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);
  
  const handleStartNewStory = () => {
    window.location.href = '/story-builder';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Heading level={1} size="2xl" color="purple">PlayTale</Heading>
            
            {/* Child selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Barn:</span>
              {mockChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-playtale border-2 transition-all ${
                    selectedChild.id === child.id
                      ? 'border-playtale-secondary bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{child.avatar}</span>
                  <span className="font-medium text-sm">{child.name}</span>
                </button>
              ))}
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-playtale-primary transition-colors">
                <Library className="h-5 w-5" />
                <span className="font-medium">Bibliotek</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-playtale-primary transition-colors">
                <User className="h-5 w-5" />
                <span className="font-medium">Profil</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero Section - Start ny historie */}
        <div className="bg-white rounded-playtale shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-playtale-primary mb-4">
              Klar til en ny historie, {selectedChild.name}?
            </h1>
            <p className="text-gray-600 mb-6">
              Lad os skabe en magisk historie sammen!
            </p>
            <button
              onClick={handleStartNewStory}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-playtale-secondary text-white rounded-playtale font-medium text-lg hover:bg-purple-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <span>Start ny historie</span>
            </button>
          </div>
        </div>

        {/* Seneste historier - single column */}
        <div className="bg-white rounded-playtale p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-playtale-primary flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Seneste historier</span>
            </h2>
            <button className="text-sm text-playtale-secondary hover:underline">
              Se alle
            </button>
          </div>
          
          {/* Fortsæt hvor I slap - highlighted */}
          <div className="mb-6 bg-yellow-50 rounded-playtale p-4 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Fortsæt hvor I slap</h3>
                  <p className="text-sm text-gray-600">
                    I har startet "Den magiske skov" - vil I fortsætte?
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white rounded-playtale border-2 border-yellow-300 hover:bg-yellow-100 transition-colors font-medium text-sm">
                Fortsæt
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {mockRecentStories.length > 0 ? (
              mockRecentStories.map((story) => (
                <button
                  key={story.id}
                  className="w-full p-4 bg-gray-50 rounded-playtale hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{story.thumbnail}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{story.title}</h3>
                      <p className="text-sm text-gray-500">
                        {story.childName} • {story.genre} • {story.lastRead}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Book className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Ingen historier endnu</p>
                <p className="text-sm">Start din første historie ovenfor!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-3 gap-1">
          <button className="flex flex-col items-center py-3 text-playtale-primary">
            <Plus className="h-6 w-6" />
            <span className="text-xs mt-1">Ny historie</span>
          </button>
          <button className="flex flex-col items-center py-3 text-gray-600">
            <Library className="h-6 w-6" />
            <span className="text-xs mt-1">Bibliotek</span>
          </button>
          <button className="flex flex-col items-center py-3 text-gray-600">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
