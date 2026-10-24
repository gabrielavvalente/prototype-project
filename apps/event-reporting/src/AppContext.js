import { createContext, useContext } from 'react';

// Shared app state: signed-in user, current context (business, plant, pillar),
// and the fixed lists loaded once at start (users, organization, reference).
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export const SIGNED_IN_USER_KEY = 'event-reporting.userId';
