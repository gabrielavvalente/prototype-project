import { createContext, useContext } from 'react';

// Shared app state: signed-in user, current context (business, plant, pillar),
// and the fixed lists loaded once at start (users, organization, reference — mostly shared
// platform data, see shared/platform/).
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export const SIGNED_IN_USER_KEY = 'event-reporting.userId';

// Set once the user has chosen a pillar (or none) on the entry screen in this browser tab.
export const ENTERED_KEY = 'event-reporting.entered';
