import { getAccessToken } from './googleAuth.ts';

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
  status?: string;
}

/**
 * Fetch upcoming events from the user's primary Google Calendar
 */
export async function listCalendarEvents(maxResults = 25): Promise<CalendarEventItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to access your calendar');
  }

  const now = new Date();
  const timeMin = now.toISOString();

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', maxResults.toString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch Google Calendar events (${res.status})`);
  }

  const data = await res.json();
  return (data.items || []) as CalendarEventItem[];
}

/**
 * Create a new event on user's primary Google Calendar
 */
export async function createCalendarEvent(params: {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  location?: string;
}): Promise<CalendarEventItem> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to add an appointment to your calendar');
  }

  const body = {
    summary: params.summary,
    description: params.description,
    location: params.location || '25 Emma St Caulfield south 3162 (QTR Workshop)',
    start: {
      dateTime: params.startIso,
      timeZone: 'Australia/Melbourne'
    },
    end: {
      dateTime: params.endIso,
      timeZone: 'Australia/Melbourne'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 1440 }
      ]
    }
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to create calendar event (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete an event from user's primary Google Calendar (requires explicit user confirmation in UI)
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to modify your calendar');
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }
  );

  if (!res.ok && res.status !== 204 && res.status !== 410) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to remove event (${res.status})`);
  }

  return true;
}
