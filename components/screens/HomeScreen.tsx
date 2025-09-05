'use client';

import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { ScreenLayout, MainContent, Header, Card, Button, Heading, Text, TopNavigation, BottomNavigation, NavigationLink, ChildSelector, theme } from '../ui';
import { ROUTES } from '../../lib/constants';
import { navigateTo } from '../../lib/utils';
import { authService } from '../../lib/auth';

// Mock data - senere vil dette komme fra database
const mockChildren = [
  { id: '1', name: 'Emma', avatar: '👧🏼' },
  { id: '2', name: 'Anders', avatar: '👦🏻' },
];

export default function HomeScreen() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);
  
  const handleStartNewStory = () => {
    navigateTo(ROUTES.STORY_BUILDER);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigateTo('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      id: 'new-story',
      label: 'Ny historie',
      icon: <Plus className="h-6 w-6" />,
      onClick: handleStartNewStory,
      active: true
    },
    {
      id: 'logout',
      label: 'Log ud', 
      icon: <User className="h-6 w-6" />,
      onClick: handleLogout
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.main }}>
      {/* Header with Navigation */}
      <TopNavigation 
        title="PlayTale"
        rightContent={(
          <>
            <ChildSelector 
              children={mockChildren}
              selectedChild={selectedChild}
              onChildSelect={setSelectedChild}
            />
            <NavigationLink 
              icon={<User className="h-5 w-5" />}
              label="Log ud"
              onClick={handleLogout}
            />
          </>
        )}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero Section - Start ny historie */}
        <Card padding="lg" className="mb-8 text-center">
          <Heading level={1} size="3xl" color="purple" className="mb-4">
            Klar til en ny historie, {selectedChild.name}?
          </Heading>
          <Text color="secondary" size="lg" className="mb-6">
            Lad os skabe en magisk historie sammen!
          </Text>
          <Button
            onClick={handleStartNewStory}
            size="lg"
            className="inline-flex items-center space-x-3 px-8 py-4 text-lg"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <span>Start ny historie</span>
          </Button>
        </Card>

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation items={navigationItems} />
    </div>
  );
}
