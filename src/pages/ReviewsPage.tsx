import React, { useState, useEffect } from 'react';
import { ChevronRight, MessageSquare, Star } from 'lucide-react';
import { LeaveReviewModal } from '../components/LeaveReviewModal.tsx';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews.filter((r: any) => r.approved));
        }
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="qtr-wrap py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1 text-[11.5px] text-slate-500"
          >
            <a href="/" className="hover:text-brand-blue">
              Home
            </a>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
              <span className="text-slate-700">Reviews</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Customer reviews</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Reviews from QTR customers
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Every review below was submitted by a customer and published after moderation. We don't write reviews, edit
            them, or display an average score until there are enough genuine ones to be meaningful.
          </p>
        </div>
      </div>

      <section id="reviews" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="qtr-wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-brand-blue" />
                <span className="qtr-label text-brand-blue">Reviews</span>
              </div>
              <h2 className="mt-4 text-[32px] font-extrabold leading-[1.1] text-[#164E63] sm:text-[44px]">
                What Our Customers Say
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-[13px] font-semibold text-navy shadow-sm transition-colors hover:bg-slate-50"
            >
              <MessageSquare className="w-[15px] h-[15px] text-brand-blue" />
              Leave a Review
            </button>
          </div>

          <div className="mt-10">
            {!loading && reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-brand-blue">
                  <Star className="w-[22px] h-[22px]" strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 font-heading text-[19px] font-bold text-navy">
                  No reviews published yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-600">
                  We've only just opened the review book. If you've bought a PC or had a repair with QTR, yours would be
                  the first one here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-[13px] font-semibold text-white shadow transition-colors hover:bg-navy-800"
                >
                  <MessageSquare className="w-[15px] h-[15px]" />
                  Write the first review
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11.5px] text-slate-500">{rev.date}</span>
                      </div>
                      <p className="mt-4 text-[13.5px] leading-relaxed text-slate-700">"{rev.text}"</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[12px]">
                      <span className="font-heading font-bold text-navy">{rev.name}</span>
                      {rev.serviceType && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {rev.serviceType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <LeaveReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
};
