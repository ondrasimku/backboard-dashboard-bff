import { cookies } from 'next/headers';

export const getAuthToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

export const requireAuth = async (): Promise<string> => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Unauthorized: No authentication token found');
  }
  
  return token;
};

