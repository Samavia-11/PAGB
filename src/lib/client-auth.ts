'use client';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth-token', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return;
  window.location.href = '/login';
};

export const redirectToDashboard = (role: string): void => {
  if (typeof window === 'undefined') return;
  
  const roleRedirects = {
    author: '/dashboard/author',
    reviewer: '/dashboard/reviewer',
    editor: '/dashboard/editor/article-management',
    administrator: '/dashboard/admin'
  };
  
  const redirectPath = roleRedirects[role as keyof typeof roleRedirects] || '/dashboard/author';
  window.location.href = redirectPath;
};
