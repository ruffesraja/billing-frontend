import React from 'react';

// Base icon component with consistent styling and better defaults
const BaseIcon = ({ children, className = "w-5 h-5", color = "#374151", strokeWidth = 2, ...props }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

// Navigation Icons with better default colors
export const HomeIcon = ({ className, color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} {...props}>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </BaseIcon>
);

export const UsersIcon = ({ className, color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} {...props}>
    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </BaseIcon>
);

export const PackageIcon = ({ className, color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} {...props}>
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </BaseIcon>
);

export const FileTextIcon = ({ className, color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} {...props}>
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </BaseIcon>
);

export const TestIcon = ({ className, color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} {...props}>
    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </BaseIcon>
);

// Action Icons with high contrast colors
export const DeleteIcon = ({ className = "w-5 h-5", color = "#dc2626", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2.5} {...props}>
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </BaseIcon>
);

export const EditIcon = ({ className = "w-5 h-5", color = "#2563eb", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </BaseIcon>
);

export const ViewIcon = ({ className = "w-5 h-5", color = "#059669", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const AddIcon = ({ className = "w-5 h-5", color = "#059669", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2.5} {...props}>
    <path d="M12 5v14m-7-7h14" />
  </BaseIcon>
);

export const SearchIcon = ({ className = "w-5 h-5", color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </BaseIcon>
);

export const FilterIcon = ({ className = "w-5 h-5", color = "#374151", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </BaseIcon>
);

export const DownloadIcon = ({ className = "w-5 h-5", color = "#3b82f6", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </BaseIcon>
);

export const PrintIcon = ({ className = "w-5 h-5", color = "#64748b", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <polyline points="6,9 6,2 18,2 18,9" />
    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </BaseIcon>
);

// Status Icons
export const CheckIcon = ({ className = "w-5 h-5", color = "#10b981", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2.5} {...props}>
    <polyline points="20,6 9,17 4,12" />
  </BaseIcon>
);

export const XIcon = ({ className = "w-5 h-5", color = "#ef4444", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2.5} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

export const AlertIcon = ({ className = "w-5 h-5", color = "#f59e0b", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </BaseIcon>
);

export const InfoIcon = ({ className = "w-5 h-5", color = "#3b82f6", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
);

// Menu Icons
export const MenuIcon = ({ className = "w-6 h-6", color = "currentColor", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2.5} {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </BaseIcon>
);

export const CloseIcon = ({ className = "w-6 h-6", color = "currentColor", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2.5} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

// Utility Icons
export const RefreshIcon = ({ className = "w-5 h-5", color = "#64748b", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <polyline points="23,4 23,10 17,10" />
    <polyline points="1,20 1,14 7,14" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  </BaseIcon>
);

export const SettingsIcon = ({ className = "w-5 h-5", color = "#64748b", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </BaseIcon>
);

// Financial Icons
export const DollarSignIcon = ({ className = "w-8 h-8", color = "#10b981", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </BaseIcon>
);

export const TrendingUpIcon = ({ className = "w-5 h-5", color = "#10b981", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
    <polyline points="17,6 23,6 23,12" />
  </BaseIcon>
);

export const TrendingDownIcon = ({ className = "w-5 h-5", color = "#ef4444", ...props }) => (
  <BaseIcon className={className} color={color} strokeWidth={2} {...props}>
    <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" />
    <polyline points="17,18 23,18 23,12" />
  </BaseIcon>
);

// Loading Icon
export const LoadingIcon = ({ className = "w-5 h-5", color = "#3b82f6", ...props }) => (
  <BaseIcon className={`${className} animate-spin`} color={color} strokeWidth={2} {...props}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </BaseIcon>
);

export default {
  // Navigation
  HomeIcon,
  UsersIcon,
  PackageIcon,
  FileTextIcon,
  TestIcon,
  
  // Actions
  DeleteIcon,
  EditIcon,
  ViewIcon,
  AddIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  PrintIcon,
  
  // Status
  CheckIcon,
  XIcon,
  AlertIcon,
  InfoIcon,
  
  // Menu
  MenuIcon,
  CloseIcon,
  
  // Utility
  RefreshIcon,
  SettingsIcon,
  
  // Financial
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  
  // Loading
  LoadingIcon
};
