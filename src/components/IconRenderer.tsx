/**
 * Safe Icon Renderer for Lucide Icons
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const AVAILABLE_ICONS = [
  'Gamepad2', 'Video', 'Clock', 'Radio', 'Mic', 'MicOff', 'Volume2', 'VolumeX',
  'Disc', 'Monitor', 'Megaphone', 'ThumbsUp', 'Music', 'Music2', 'Trophy', 'Skull',
  'Flame', 'Bell', 'AlertCircle', 'Smile', 'Sparkles', 'Tv', 'Layers', 'Play',
  'Pause', 'Camera', 'Eye', 'Zap', 'MessageSquare', 'Repeat', 'Settings', 'Smartphone',
  'Usb', 'Wifi', 'Cast', 'Power', 'Headphones', 'DoorClosed', 'Folder', 'Sliders'
];

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-6 h-6', size }) => {
  // Try to find the icon in Lucide
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Radio;

  return <IconComponent className={className} size={size} />;
};
