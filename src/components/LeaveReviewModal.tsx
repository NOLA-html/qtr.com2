import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [serviceType, setServiceType] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your display name.');
      return;
    }
    if (!text.trim() || text.trim().length < 5) {
      setError('Please write a brief review.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          text: text.trim(),
          serviceType: serviceType.trim() || 'Other'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      onReviewSubmitted?.();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setText('');
    setRating(5);
    setServiceType('');
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-review-title"
    >
      <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 rounded-sm p-1 text-slate-400 transition-opacity hover:text-navy"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-[20px] font-bold text-navy">Thank you for your review</h3>
            <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-slate-600">
              Reviews are published after moderation. Your review has been queued for an administrator to check.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="inline-flex h-10 items-center justify-center rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col space-y-1.5 text-left">
              <h2 id="leave-review-title" className="font-heading text-[20px] font-bold tracking-tight text-navy">
                Leave a review
              </h2>
              <p className="text-[13px] text-slate-600">
                Tell other customers how your QTR purchase or repair went.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="review-name" className="text-[12.5px] font-semibold text-slate-700">
                  Display name
                </label>
                <input
                  id="review-name"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How your name should appear"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[12.5px] font-semibold text-slate-700">Your rating</span>
                <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="flex h-11 w-11 items-center justify-center rounded-md transition hover:bg-slate-100"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-context" className="text-[12.5px] font-semibold text-slate-700">
                  What was it about? <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <select
                  id="review-context"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                >
                  <option value="">Choose a service</option>
                  <option value="Prebuilt PC purchase">Prebuilt PC purchase</option>
                  <option value="Custom build">Custom build</option>
                  <option value="Repair or service">Repair or service</option>
                  <option value="Components">Components</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-body" className="text-[12.5px] font-semibold text-slate-700">
                  Your review
                </label>
                <textarea
                  id="review-body"
                  rows={5}
                  maxLength={1500}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell other customers about your experience — what you bought or had repaired, and how it went."
                  className="flex w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-[13.5px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                />
                <p className="text-right text-[11px] text-slate-500">{text.length}/1500</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-[13.5px] font-semibold text-white shadow transition-colors hover:bg-navy-800 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit review
              </button>

              <p className="text-center text-[11.5px] leading-relaxed text-slate-500">
                Reviews are published after moderation. Your name and words are shown publicly; no contact details are
                collected.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
