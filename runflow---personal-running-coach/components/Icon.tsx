import React from 'react';
import { IconProps } from '../types';

export const Icon: React.FC<IconProps> = ({ name, className = "", filled = false }) => {
  return (
    <span 
      className={`material-symbols-outlined ${filled ? 'fill' : ''} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};