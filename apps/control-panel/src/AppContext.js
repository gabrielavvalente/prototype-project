import { createContext, useContext } from 'react';

// Shared app state: the signed-in user and the platform lists (users, organization, reference).
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export const SIGNED_IN_USER_KEY = 'control-panel.userId';
