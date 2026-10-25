import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, TextInput, Title } from '@mantine/core';
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
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const recent = settings.recentSearches || [];

  useEffect(() => {
    document.title = 'Search — Event Reporting';
    setQuery(searchParams.get('q') || '');
    getAll('events').then((all) => setEvents(all.filter((event) => isEventVisible(user, context, event))));
  }, [user, context, searchParams]);

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
    <main className="page page--wide page--with-nav search-page">
      <Stack gap="xl">
      <Title order={1}>Search events</Title>
      <form className="search-row" role="search" onSubmit={handleSubmit}>
        <TextInput
          className="search-input"
          size="md"
          autoFocus
          leftSection={<Icon name="search" />}
          placeholder="Search by title or record number…"
          aria-label="Search events"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="button" variant="default" onClick={() => navigate(-1)}>Cancel</Button>
      </form>

      {!query.trim() && (
        <section aria-labelledby="recent-title" className="search-section">
          <Title id="recent-title" order={2} size="h3">
            Recent searches
          </Title>
          {recent.length === 0 ? (
            <Text c="dimmed" mt="md">Your last searches will appear here.</Text>
          ) : (
            <Stack gap="xs" mt="md">
              {recent.map((item) => (
                <Card key={item} withBorder padding="sm" radius="md">
                  <Button type="button" variant="subtle" color="gray" leftSection={<Icon name="search" size={18} />} className="recent-search" onClick={() => setQuery(item)}>
                    {item}
                  </Button>
                </Card>
              ))}
            </Stack>
          )}
        </section>
      )}

      {query.trim() && (
        <section aria-labelledby="results-title" className="search-section">
          <Title id="results-title" order={2} size="h3" role="status">
            {results.length === 0 ? 'No event matches your search' : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
          </Title>
          <Stack gap="xs" mt="md">
            {results.map((event) => {
              const pillar = findById(reference, event.pillarId);
              return (
                <Card key={event.id} withBorder padding="sm" radius="md" className="search-result">
                  <Button type="button" variant="subtle" color="gray" fullWidth onClick={() => openEvent(event)}>
                    <Group wrap="nowrap" className="search-result-content">
                      <span className={`pillar-dot ${getPillarColorClass(pillar?.code)}`} aria-hidden="true" />
                      <Stack gap={2} className="search-result-copy">
                        <Text fw={600} ta="left">{event.title || '(no title yet)'}</Text>
                        <Text size="sm" c="dimmed" ta="left">{event.recordNumber || 'Draft'} · {pillar?.label}</Text>
                      </Stack>
                      <span className="search-result-arrow" aria-hidden="true"><Icon name="chevronRight" size={18} /></span>
                    </Group>
                  </Button>
                </Card>
              );
            })}
          </Stack>
        </section>
      )}
      </Stack>
    </main>
  );
}
