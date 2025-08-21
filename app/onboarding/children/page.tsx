'use client';

import React, { useState } from 'react';
import PlayTaleLogo from '../../../components/PlayTaleLogo';
import { Plus, ChevronRight, X, ArrowLeft } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'dreng' | 'pige';
  interests: string[];
  readingLevel: 'begynder' | 'øvet' | 'avanceret';
  avatar: string;
}

const INTERESTS = [
  { id: 'eventyr', label: 'Eventyr', emoji: '🏰', color: 'bg-blue-100 text-blue-700' },
  { id: 'dyr', label: 'Dyr', emoji: '🐻', color: 'bg-green-100 text-green-700' },
  { id: 'magisk', label: 'Magisk', emoji: '🪄', color: 'bg-purple-100 text-purple-700' },
  { id: 'rummet', label: 'Rummet', emoji: '🚀', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'sport', label: 'Sport', emoji: '⚽', color: 'bg-orange-100 text-orange-700' },
  { id: 'musik', label: 'Musik', emoji: '🎵', color: 'bg-pink-100 text-pink-700' },
  { id: 'natur', label: 'Natur', emoji: '🌳', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'venskab', label: 'Venskab', emoji: '🤝', color: 'bg-yellow-100 text-yellow-700' },
];

const AVATARS = {
  dreng: ['👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿'],
  pige: ['👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿']
};

export default function ChildrenSetupPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '' as 'dreng' | 'pige' | '',
    interests: [] as string[],
    readingLevel: '' as 'begynder' | 'øvet' | 'avanceret' | '',
    avatar: ''
  });

  const handleAddChild = () => {
    if (formData.name && formData.age && formData.gender && formData.readingLevel && formData.avatar) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as 'dreng' | 'pige',
        interests: formData.interests,
        readingLevel: formData.readingLevel as 'begynder' | 'øvet' | 'avanceret',
        avatar: formData.avatar
      };
      setChildren([...children, newChild]);
      setFormData({
        name: '',
        age: '',
        gender: '',
        interests: [],
        readingLevel: '',
        avatar: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id));
  };

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const canContinue = children.length > 0;
  const formValid = formData.name && formData.age && formData.gender && formData.readingLevel && formData.avatar;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
          <PlayTaleLogo size="sm" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6">
        
        {/* Logo og Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-playtale-primary mb-2">
            Børneprofiler
          </h1>
          <p className="text-gray-600 text-lg">
            Tilføj børn som skal høre historier
          </p>
        </div>

        {/* Children Grid */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            
            {/* Existing children */}
            {children.map((child) => (
              <div
                key={child.id}
                className="relative bg-white rounded-playtale p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => handleRemoveChild(child.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-4xl">{child.avatar}</div>
                  <div className="text-center">
                    <h3 className="font-bold text-playtale-primary text-lg">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {child.age} år • {child.gender === 'dreng' ? 'Dreng' : 'Pige'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {child.readingLevel}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add child button */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-white rounded-playtale p-6 border-2 border-dashed border-gray-300 hover:border-playtale-secondary hover:bg-gray-50 transition-all flex flex-col items-center justify-center space-y-3 min-h-[180px]"
              >
                <div className="w-16 h-16 bg-playtale-secondary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-playtale-secondary" />
                </div>
                <span className="font-medium text-playtale-secondary">
                  Tilføj barn
                </span>
              </button>
            )}
          </div>

          {/* Add child form */}
          {showAddForm && (
            <div className="bg-white rounded-playtale p-6 border-2 border-playtale-secondary shadow-lg mb-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-playtale-primary mb-6">
                Tilføj barn
              </h2>
              
              <div className="space-y-6">
                {/* Name and Age */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Navn *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-playtale focus:outline-none focus:ring-2 focus:ring-playtale-secondary focus:border-transparent"
                      placeholder="F.eks. Emma, Anders..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alder *
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-playtale focus:outline-none focus:ring-2 focus:ring-playtale-secondary focus:border-transparent"
                      placeholder="F.eks. 6"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Køn *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'pige', avatar: '' })}
                      className={`p-4 rounded-playtale border-2 transition-all ${
                        formData.gender === 'pige'
                          ? 'border-playtale-secondary bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-medium">👧 Pige</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'dreng', avatar: '' })}
                      className={`p-4 rounded-playtale border-2 transition-all ${
                        formData.gender === 'dreng'
                          ? 'border-playtale-secondary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-medium">👦 Dreng</div>
                    </button>
                  </div>
                </div>

                {/* Avatar selection */}
                {formData.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vælg avatar *
                    </label>
                    <div className="flex space-x-3">
                      {AVATARS[formData.gender].map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar })}
                          className={`w-12 h-12 text-2xl rounded-playtale border-2 transition-all ${
                            formData.avatar === avatar
                              ? 'border-playtale-secondary bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reading Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Læseniveau *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'begynder', label: 'Begynder', desc: '2-5 år' },
                      { value: 'øvet', label: 'Øvet', desc: '6-9 år' },
                      { value: 'avanceret', label: 'Avanceret', desc: '10+ år' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, readingLevel: level.value as any })}
                        className={`p-3 rounded-playtale border-2 transition-all text-center ${
                          formData.readingLevel === level.value
                            ? 'border-playtale-secondary bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interesser (valgfri)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`flex flex-col items-center p-3 rounded-playtale border-2 transition-all ${
                          formData.interests.includes(interest.id)
                            ? `border-playtale-secondary ${interest.color}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg mb-1">{interest.emoji}</span>
                        <span className="text-xs font-medium">{interest.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleAddChild}
                    disabled={!formValid}
                    className={`flex-1 py-3 px-4 rounded-playtale font-medium transition-all ${
                      formValid
                        ? 'bg-playtale-secondary text-white hover:bg-purple-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Tilføj barn
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        name: '',
                        age: '',
                        gender: '',
                        interests: [],
                        readingLevel: '',
                        avatar: ''
                      });
                    }}
                    className="flex-1 py-3 px-4 rounded-playtale border-2 border-gray-300 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuller
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Continue button */}
          <div className="flex flex-col items-center space-y-4">
            <button
              disabled={!canContinue}
              onClick={() => {
                if (canContinue) {
                  window.location.href = '/home';
                }
              }}
              className={`w-full max-w-md flex items-center justify-center py-4 px-6 rounded-playtale text-white font-medium text-lg transition-all transform ${
                canContinue
                  ? 'bg-playtale-secondary hover:bg-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <span>Færdig med opsætning</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>

            {/* Tilbage knap */}
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="flex items-center space-x-2 px-6 py-3 rounded-playtale border-2 border-gray-200 hover:border-playtale-secondary hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-playtale-secondary" />
              <span className="text-sm font-medium text-playtale-secondary">Tilbage til forældre</span>
            </button>

            {/* Skip option */}
            <button className="text-sm text-gray-500 hover:text-gray-700 underline">
              Spring dette trin over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
