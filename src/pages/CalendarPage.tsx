import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User as UserIcon,
  LogOut,
  CalendarDays,
  ShieldCheck,
  Wrench,
  Cpu,
  Boxes
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../utils/googleAuth.ts';
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEventItem
} from '../utils/googleCalendar.ts';
import { GoogleSignInButton } from '../components/GoogleSignInButton.tsx';

interface CalendarPageProps {
  initialSummary?: string;
  initialDescription?: string;
  onNavigateToServices?: () => void;
  onNavigateToCustomPcs?: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  initialSummary,
  initialDescription,
  onNavigateToServices,
  onNavigateToCustomPcs
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // New Event Form State
  const [serviceType, setServiceType] = useState('PC Repair Drop-off');
  const [referenceNum, setReferenceNum] = useState('');
  const [notes, setNotes] = useState(initialDescription || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Destructive Action Confirmation Modal (MANDATORY per Workspace Skill)
  const [eventToDelete, setEventToDelete] = useState<CalendarEventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        fetchEvents();
      },
      () => {
        setUser(null);
        setToken(null);
        setEvents([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventError(null);
    try {
      const items = await listCalendarEvents();
      setEvents(items);
    } catch (err: any) {
      console.error('Failed to load Google Calendar events:', err);
      setEventError(err.message || 'Could not load Google Calendar events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await fetchEvents();
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google Calendar authorization failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setEvents([]);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreatingEvent(true);
    setCreateSuccess(null);
    setEventError(null);

    try {
      // Calculate start and end ISO
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      const summaryText = referenceNum
        ? `QTR Workshop: ${serviceType} [${referenceNum.toUpperCase()}]`
        : `QTR Workshop: ${serviceType}`;

      const descText = [
        `Service: ${serviceType}`,
        referenceNum ? `Reference Number: ${referenceNum.toUpperCase()}` : null,
        `Location: 25 Emma St Caulfield south 3162`,
        `Phone: 0493 711 832`,
        `Hours: Mon–Sat 9am–8pm (Sun by appointment)`,
        notes ? `Customer Notes: ${notes}` : null,
        `\nBooked via QTR Quick Tech Repairs portal.`
      ]
        .filter(Boolean)
        .join('\n');

      await createCalendarEvent({
        summary: summaryText,
        description: descText,
        startIso: startDateTime.toISOString(),
        endIso: endDateTime.toISOString(),
        location: '25 Emma St Caufield south 3162, Australia'
      });

      setCreateSuccess(`Appointment booked and added to your Google Calendar!`);
      setTimeout(() => setCreateSuccess(null), 5000);
      setNotes('');
      setReferenceNum('');
      await fetchEvents();
    } catch (err: any) {
      console.error('Failed to create calendar event:', err);
      setEventError(err.message || 'Failed to add appointment to Google Calendar');
    } finally {
      setCreatingEvent(false);
    }
  };

  // Explicit confirmation required by Google Workspace integration constitution
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeletingEvent(true);
    try {
      await deleteCalendarEvent(eventToDelete.id);
      setEventToDelete(null);
      await fetchEvents();
    } catch (err: any) {
      alert(`Error deleting calendar event: ${err.message || 'Operation failed'}`);
    } finally {
      setDeletingEvent(false);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Google Calendar Integration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Schedule Workshop Drop-offs &amp; Consultations
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Connect your Google Calendar to sync workshop appointments, track estimated completion dates for your custom PC build (Project Eclipse, NITROFORGE X3060, OVERDRIVE), or book a repair drop-off window at 25 Emma St Caulfield South.
          </p>

          {/* Workshop Details Card */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>25 Emma St Caulfield south 3162</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Mon–Sat 9am–8pm (Sun by appointment)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Direct Google Calendar v3 API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Auth / Form on Left, Calendar Events on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Google Sign-in & Booking Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Auth Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span>Google Account Connection</span>
              </h2>
              {user && (
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Connected</span>
                </span>
              )}
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {!user ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign in with your Google account to view your calendar schedule and seamlessly add drop-off slots, consultation sessions, or delivery tracking dates.
                </p>
                <div className="pt-2">
                  <GoogleSignInButton
                    onClick={handleSignIn}
                    loading={authLoading}
                    label="Sign in with Google to use Calendar"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Google Calendar OAuth permissions are requested with permission to see and update your appointments. Tokens are securely kept in memory only.
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user.displayName || 'Google User'}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Book / Add Event Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Book Workshop Appointment</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Schedule your computer drop-off or custom PC consultation at 25 Emma St Caulfield South.
              </p>
            </div>

            {createSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800"
                >
                  <option value="PC Repair Drop-off">Computer Repair Drop-off</option>
                  <option value="Hardware Upgrade Assessment">Hardware Upgrade Assessment (Windows PC / Laptop)</option>
                  <option value="Custom PC Consultation">Custom PC Build Consultation (Project Eclipse / NITROFORGE / OVERDRIVE)</option>
                  <option value="Completed System Pickup">Completed PC / Repair Pickup</option>
                  <option value="Diagnostic Bench Session">Priority Diagnostic Session (Express Service)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order / Service Reference # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. QTR-ORD-1024 or QTR-REP-5020"
                  value={referenceNum}
                  onChange={(e) => setReferenceNum(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-slate-800 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time (Melb AEST/AEDT)</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800"
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:30">5:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workshop Location</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">25 Emma St Caufield south 3162</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Notes / Specifications</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dropping off tower with Ryzen 5 5600X, needs diagnostics..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={!user || creatingEvent}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {creatingEvent ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding to Google Calendar...</span>
                  </>
                ) : !user ? (
                  <span>Sign in above to enable calendar booking</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Google Calendar</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Google Calendar Events Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span>Upcoming Google Calendar Events</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized live from your primary Google Calendar account.
                </p>
              </div>

              {user && (
                <button
                  onClick={fetchEvents}
                  disabled={loadingEvents}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
                >
                  <Loader2 className={`w-3.5 h-3.5 ${loadingEvents ? 'animate-spin' : ''}`} />
                  <span>Refresh Schedule</span>
                </button>
              )}
            </div>

            {eventError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{eventError}</span>
              </div>
            )}

            {!user ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Google Calendar Disconnected</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Sign in with Google to load your upcoming appointments, check your availability, and book drop-off slots at QTR Quick Tech Repairs.
                  </p>
                </div>
                <div className="pt-2">
                  <GoogleSignInButton onClick={handleSignIn} loading={authLoading} />
                </div>
              </div>
            ) : loadingEvents ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Fetching events from your Google Calendar...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">No Upcoming Events Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your primary Google Calendar has no upcoming events scheduled. Use the form on the left to book your workshop drop-off!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {events.map((ev) => {
                  const isQtrEvent =
                    ev.summary?.toLowerCase().includes('qtr') ||
                    ev.location?.toLowerCase().includes('emma st') ||
                    ev.summary?.toLowerCase().includes('repair') ||
                    ev.summary?.toLowerCase().includes('eclipse') ||
                    ev.summary?.toLowerCase().includes('nitroforge') ||
                    ev.summary?.toLowerCase().includes('overdrive');

                  const startDate = ev.start?.dateTime
                    ? new Date(ev.start.dateTime).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })
                    : ev.start?.date || 'All Day';

                  const startTime = ev.start?.dateTime
                    ? new Date(ev.start.dateTime).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'All Day';

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isQtrEvent
                          ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/10'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {isQtrEvent && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
                                QTR Appointment
                              </span>
                            )}
                            <h4 className="font-bold text-slate-900 text-sm">{ev.summary || 'Untitled Event'}</h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                              {startDate} at {startTime}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {ev.location}
                              </span>
                            )}
                          </div>

                          {ev.description && (
                            <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {ev.htmlLink && (
                            <a
                              href={ev.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Open in Google Calendar"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setEventToDelete(ev)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Remove event from calendar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MANDATORY EXPLICIT CONFIRMATION MODAL FOR DESTRUCTIVE GOOGLE WORKSPACE API OPERATIONS */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Delete Google Calendar Event?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{eventToDelete.summary}"</span> from your primary Google Calendar?
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-left space-y-1">
                <div><strong>Event ID:</strong> {eventToDelete.id}</div>
                {eventToDelete.start?.dateTime && (
                  <div><strong>Scheduled:</strong> {new Date(eventToDelete.start.dateTime).toLocaleString()}</div>
                )}
                {eventToDelete.location && (
                  <div><strong>Location:</strong> {eventToDelete.location}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingEvent}
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingEvent}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                {deletingEvent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm &amp; Delete Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
