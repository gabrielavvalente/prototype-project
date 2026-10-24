import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getAll } from '../data/db.js';
import { isEventVisible } from '../logic/access.js';
import { getPillarColorClass } from '../logic/display.js';
import { searchEvents } from '../logic/eventList.js';
import { findById } from '../logic/lookups.js';
import Icon from './Icon.jsx';

const MAX_RECENT = 5;
const MAX_RESULTS = 20;

// Full-screen search with recent searches and live results (FR-044).
export default function SearchPage() {
  const { user, context, settings, reference, updateSettings } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const recent = settings.recentSearches || [];

  useEffect(() => {
    document.title = 'Search — Event Reporting';
    getAll('events').then((all) => setEvents(all.filter((event) => isEventVisible(user, context, event))));
  }, [user, context]);

  const results = query.trim() ? searchEvents(events, query).slice(0, MAX_RESULTS) : [];

  function remember(text) {
    const cleaned = text.trim();
    if (!cleaned) return;
    const others = recent.filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
    updateSettings({ recentSearches: [cleaned, ...others].slice(0, MAX_RECENT) });
  }

  function openEvent(event) {
    remember(query);
    navigate(`/events/${event.recordNumber || event.id}`);
  }

  // Enter: an exact record number opens that event straight away.
  function handleSubmit(e) {
    e.preventDefault();
    const exact = events.find((event) => event.recordNumber && event.recordNumber.toLowerCase() === query.trim().toLowerCase());
    if (exact) {
      openEvent(exact);
    } else {
      remember(query);
    }
  }

  return (
    <main className="page search-page">
      <h1 className="visually-hidden">Search</h1>
      <form className="search-row" role="search" onSubmit={handleSubmit}>
        <label className="search-field">
          <Icon name="search" />
          <span className="visually-hidden">Search events</span>
          <input
            type="search"
            autoFocus
            placeholder="Search by title or record number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="button" className="button button--link search-cancel" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </form>

      {!query.trim() && (
        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="section-label">
            Recent searches
          </h2>
          {recent.length === 0 ? (
            <p className="field-hint">Your last searches will appear here.</p>
          ) : (
            <ul className="plain-list">
              {recent.map((item) => (
                <li key={item}>
                  <button type="button" className="list-row" onClick={() => setQuery(item)}>
                    <Icon name="search" size={18} />
                    <span>{item}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {query.trim() && (
        <section aria-labelledby="results-title">
          <h2 id="results-title" className="section-label" role="status">
            {results.length === 0 ? 'No event matches your search' : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
          </h2>
          <ul className="plain-list">
            {results.map((event) => {
              const pillar = findById(reference, event.pillarId);
              return (
                <li key={event.id}>
                  <button type="button" className="list-row" onClick={() => openEvent(event)}>
                    <span className={`pillar-dot ${getPillarColorClass(pillar?.code)}`} aria-hidden="true" />
                    <span className="list-row-text">
                      <strong>{event.title || '(no title yet)'}</strong>
                      <span className="field-hint">
                        {event.recordNumber || 'Draft'} · {pillar?.label}
                      </span>
                    </span>
                    <Icon name="chevronRight" size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
