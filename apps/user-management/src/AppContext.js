import { createContext, useContext } from 'react';

// Shared app state: the signed-in user, the platform lists (users, organization, reference) and
// the workflow settings (to show the review groups people belong to).
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export const SIGNED_IN_USER_KEY = 'user-management.userId';
