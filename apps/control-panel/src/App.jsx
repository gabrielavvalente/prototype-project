import { useState } from 'react';

// Placeholder until the Control Panel screens are built (tasks T017+).
export default function App() {
  const [clicks, setClicks] = useState(0);
  return (
    <main style={{ padding: 'var(--space-4)' }}>
      <h1>Control Panel</h1>
      <button type="button" className="button button--primary" onClick={() => setClicks(clicks + 1)}>
        Clicked {clicks} times
      </button>
    </main>
  );
}
