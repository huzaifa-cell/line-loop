import Link from "next/link";
import { getReviews, moderateReview, deleteReview } from "./actions";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${star <= rating ? 'text-amber-500' : 'text-ink-black/20'}`}>★</span>
      ))}
    </div>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams;
  const reviews = await getReviews(statusFilter);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <div className="text-sm text-ink-black/60">{reviews.length} reviews</div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews${tab.value !== 'all' ? `?status=${tab.value}` : ''}`}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${
              (statusFilter || 'all') === tab.value
                ? 'bg-ink-black text-ivory-mist border-ink-black'
                : 'border-ink-black/30 text-ink-black/60 hover:bg-ink-black/5'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-ivory-mist border border-ink-black p-8 text-center text-sm text-ink-black/60">
            No reviews found{statusFilter ? ` with status "${statusFilter}"` : ''}.
          </div>
        ) : (
          reviews.map((review: any) => {
            let parsedBody = { text: review.body, media: [] as string[] };
            try {
              if (review.body && review.body.startsWith('{')) {
                parsedBody = JSON.parse(review.body);
              }
            } catch (e) {
              // fallback to plain text
            }

            return (
              <div key={review.id} className="bg-ivory-mist border border-ink-black p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating} />
                      <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${
                        review.status === 'approved' ? 'border-green-800 text-green-800' :
                        review.status === 'rejected' ? 'border-thread-red text-thread-red' :
                        'border-amber-600 text-amber-600'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    {review.title && <div className="font-bold">{review.title}</div>}
                    {parsedBody.text && <p className="text-sm text-ink-black/80">{parsedBody.text}</p>}
                    {parsedBody.media && parsedBody.media.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {parsedBody.media.map((url, i) => {
                          const isVideo = url.toLowerCase().match(/\.(mp4|webm|mov)$/);
                          return isVideo ? (
                            <video key={i} src={url} controls className="h-20 w-20 object-cover border border-ink-black/20" />
                          ) : (
                            <img key={i} src={url} alt="Review media" className="h-20 w-20 object-cover border border-ink-black/20" />
                          );
                        })}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-ink-black/50 mt-2">
                      <span>By: {review.profiles?.full_name || review.profiles?.email || review.guest_name || 'Anonymous'}</span>
                      <span>Product: <span className="font-bold text-ink-black/70">{review.products?.title || '—'}</span></span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {review.status === 'pending' && (
                    <>
                      <form action={async () => {
                        "use server";
                        await moderateReview(review.id, 'approved');
                      }}>
                        <button type="submit" className="bg-ink-black text-ivory-mist px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-ink-black/80">
                          Approve
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await moderateReview(review.id, 'rejected');
                      }}>
                        <button type="submit" className="border border-thread-red text-thread-red px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-thread-red/10">
                          Reject
                        </button>
                      </form>
                    </>
                  )}
                  {review.status !== 'pending' && (
                    <form action={async () => {
                      "use server";
                      await moderateReview(review.id, review.status === 'approved' ? 'rejected' : 'approved');
                    }}>
                      <button type="submit" className="border border-ink-black/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-ink-black/5">
                        {review.status === 'approved' ? 'Reject' : 'Approve'}
                      </button>
                    </form>
                  )}
                  <form action={async () => {
                    "use server";
                    await deleteReview(review.id);
                  }}>
                    <button type="submit" className="text-xs font-bold uppercase tracking-widest text-thread-red hover:underline underline-offset-2 px-2 py-1.5">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
