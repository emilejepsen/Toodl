import React from 'react';
import { X, Edit3 } from 'lucide-react';
import { theme } from '../../lib/theme';
import { Card, Heading, Text } from './';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  onClick?: () => void;
}

export function Avatar({ 
  src, 
  alt = 'Avatar', 
  size = 'base', 
  fallback,
  className = '',
  onClick 
}: AvatarProps) {
  const sizeClass = theme.components.avatar.sizes[size];
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallback) {
      e.currentTarget.src = fallback;
    }
  };

  const baseClasses = `${sizeClass} rounded-full object-cover transition-all duration-200`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:ring-2 hover:ring-purple-300 hover:scale-105' : '';

  return (
    <div className={`${sizeClass} relative ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {src ? (
        <img 
          src={src}
          alt={alt}
          onError={handleImageError}
          className={`${baseClasses} ${interactiveClasses} ${className}`}
        />
      ) : (
        <div className={`${baseClasses} ${interactiveClasses} bg-gray-200 flex items-center justify-center ${className}`}>
          <span className="text-gray-500 font-medium">
            {alt.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

interface FamilyMemberCardProps {
  member: {
    id: string;
    name: string;
    relation: string;
    avatarUrl: string;
    color: string;
  };
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  relationOptions: ReadonlyArray<{ readonly id: string; readonly label: string; readonly gender?: string }>;
  className?: string;
}

export function FamilyMemberCard({ member, onRemove, onEdit, relationOptions, className = '' }: FamilyMemberCardProps) {
  const relationLabel = relationOptions.find(r => r.id === member.relation)?.label;

  return (
    <Card 
      padding="sm"
      className={`flex flex-col items-center justify-center relative h-full ${className}`}
      minHeightVariant="gridItem"
      style={{ backgroundColor: member.color }}
    >
      {onEdit && (
        <button 
          onClick={() => onEdit(member.id)}
          className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 bg-white bg-opacity-60 rounded-full p-1 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      )}
      
      {onRemove && (
        <button 
          onClick={() => onRemove(member.id)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white bg-opacity-60 rounded-full p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <Avatar 
        src={member.avatarUrl}
        alt={`${member.name} avatar`}
        size="lg"
        className="mb-4"
      />
      
      <Heading level={3} size="xl" className="text-slate-700 mb-1">
        {member.name}
      </Heading>
      <Text color="secondary" className="capitalize">
        {relationLabel}
      </Text>
    </Card>
  );
}