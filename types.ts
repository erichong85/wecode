
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
  htmlContent: string;
  createdAt: number;
  updatedAt?: number;
  views: number;
  published: boolean;
  isPublic: boolean; // Controls visibility on Landing Page
  allowSourceDownload: boolean; // Controls if source code can be downloaded
}

export enum AuthMethod {
  EMAIL = 'EMAIL',
  WECHAT = 'WECHAT'
}

export type ViewState = 'LANDING' | 'DASHBOARD' | 'EDITOR' | 'VIEWER' | 'ADMIN';
