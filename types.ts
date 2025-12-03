
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: number;
  lastLoginAt: number;
}

export interface HostedSite {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  description?: string; // Optional site description
  htmlContent: string;
  createdAt: number;
  updatedAt?: number;
  views: number;
  likes: number;
  favorites: number;
  published: boolean;
  isPublic: boolean; // Controls visibility on Landing Page
  allowSourceDownload: boolean; // Controls if source code can be downloaded
}

export interface UserLike {
  id: string;
  userId: string;
  siteId: string;
  createdAt: number;
}

export interface UserFavorite {
  id: string;
  userId: string;
  siteId: string;
  createdAt: number;
}

export enum AuthMethod {
  EMAIL = 'EMAIL',
  WECHAT = 'WECHAT'
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author?: string;
  isSystem?: boolean;
}

export type ViewState = 'LANDING' | 'DASHBOARD' | 'EDITOR' | 'VIEWER' | 'ADMIN' | 'PROMPTS';
