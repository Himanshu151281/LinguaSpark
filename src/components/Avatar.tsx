
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  image?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  image, 
  className,
  size = 'md' 
}) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center overflow-hidden text-white font-medium',
        !image && 'bg-linguaspark-primary',
        sizeClasses[size],
        className
      )}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
