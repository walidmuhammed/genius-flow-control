
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressRingProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  textSize?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  isLoading?: boolean;
}

export default function ProgressRing({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 8,
  textSize = 'md',
  color = '#f97316', // Genius Orange
  label,
  isLoading = false
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const offset = circumference - (percent / 100) * circumference;
  
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  if (isLoading) {
    return <Skeleton className={`w-[${size}px] h-[${size}px] rounded-full`} />;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="relative">
        {/* Background Circle */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', textSizeClasses[textSize])}>
            {Math.round(percent)}%
          </span>
          {label && (
            <span className="text-xs text-muted-foreground mt-1">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
