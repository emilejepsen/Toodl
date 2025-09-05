import React from 'react';
import { Library, User, Plus } from 'lucide-react';
import { Heading, Text } from './Typography';
import { Button } from './Button';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

interface TopNavigationProps {
  title?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function TopNavigation({ title, children, rightContent, className = '' }: TopNavigationProps) {
  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {title && (
            <Heading level={1} size="2xl" color="purple">
              {title}
            </Heading>
          )}
          
          {children}
          
          {rightContent && (
            <nav className="flex items-center space-x-6">
              {rightContent}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

interface BottomNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function BottomNavigation({ items, className = '' }: BottomNavigationProps) {
  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 ${className}`}>
      <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center py-3 transition-colors ${
              item.active ? 'text-purple-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {item.icon}
            <Text size="xs" className="mt-1">
              {item.label}
            </Text>
          </button>
        ))}
      </div>
    </nav>
  );
}

interface NavigationLinkProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function NavigationLink({ icon, label, onClick, active = false, className = '' }: NavigationLinkProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 transition-colors ${
        active 
          ? 'text-purple-600' 
          : 'text-gray-600 hover:text-purple-600'
      } ${className}`}
    >
      {icon}
      <Text weight="medium">
        {label}
      </Text>
    </button>
  );
}

interface ChildSelectorProps {
  children: Array<{ id: string; name: string; avatar: string }>;
  selectedChild: { id: string; name: string; avatar: string };
  onChildSelect: (child: { id: string; name: string; avatar: string }) => void;
  className?: string;
}

export function ChildSelector({ children, selectedChild, onChildSelect, className = '' }: ChildSelectorProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Text size="sm" color="secondary">Barn:</Text>
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onChildSelect(child)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border-2 transition-all ${
            selectedChild.id === child.id
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-lg">{child.avatar}</span>
          <Text size="sm" weight="medium">{child.name}</Text>
        </button>
      ))}
    </div>
  );
}