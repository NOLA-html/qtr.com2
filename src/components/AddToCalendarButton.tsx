import React, { useState } from 'react';
import { Calendar, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { googleSignIn, getAccessToken } from '../utils/googleAuth.ts';
import { createCalendarEvent } from '../utils/googleCalendar.ts';

interface AddToCalendarButtonProps {
  title: string;
  description: string;
  daysFromNow?: number;
  timeHour?: number;
  durationMinutes?: number;
  location?: string;
  buttonText?: string;
  className?: string;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  title,
  description,
  daysFromNow = 2,
  timeHour = 10,
  durationMinutes = 60,
  location = '25 Emma St Caufield south 3162 (QTR Workshop)',
  buttonText = 'Add to Google Calendar',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdd = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }

      if (!token) {
        // Google Sign-In popup was closed or cancelled by user; reset state cleanly
        return;
      }

      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + daysFromNow);
      eventDate.setHours(timeHour, 0, 0, 0);

      const endDate = new Date(eventDate.getTime() + durationMinutes * 60000);

      const created = await createCalendarEvent({
        summary: title,
        description,
        startIso: eventDate.toISOString(),
        endIso: endDate.toISOString(),
        location
      });

      setSuccessLink(created.htmlLink || 'https://calendar.google.com');
    } catch (err: any) {
      console.error('Add to calendar error:', err);
      setErrorMsg(err.message || 'Could not add event to Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  if (successLink) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>Added to your Google Calendar!</span>
        <a
          href={successLink}
          target="_blank"
          rel="noreferrer"
          className="text-emerald-700 underline flex items-center gap-1 font-bold ml-1 hover:text-emerald-900"
        >
          <span>View</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 ${
          className ? className : 'bg-navy hover:bg-navy-800 text-white shadow-sm'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
        ) : (
          <Calendar className="w-4 h-4 text-brand-blue" />
        )}
        <span>{loading ? 'Adding Event...' : buttonText}</span>
      </button>
      {errorMsg && <span className="text-[11px] text-rose-600">{errorMsg}</span>}
    </div>
  );
};
