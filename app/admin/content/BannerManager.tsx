"use client";

import { useState } from "react";
import { saveBanner } from "./actions";
import { useRouter } from "next/navigation";

const PLACEMENTS = [
  { value: 'homepage_hero', label: 'Homepage Hero' },
  { value: 'announcement_bar', label: 'Announcement Bar' },
  { value: 'category_banner', label: 'Category Banner' },
];

export function BannerForm({ banner, onClose }: { banner?: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await saveBanner(formData);
      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert(result.error || "Failed to save banner");
      }
    } catch (err: any) {
      alert(err.message || "Error saving banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-ink-black bg-ivory-mist p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest">
          {banner ? 'Edit Banner' : 'New Banner'}
        </h3>
        <button onClick={onClose} className="text-xs text-ink-black/60 hover:text-ink-black">✕ Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="bannerId" value={banner?.id || 'new'} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Placement *</label>
            <select name="placement" required defaultValue={banner?.placement || ''} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none">
              <option value="">Select placement...</option>
              {PLACEMENTS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Status</label>
            <select name="isLive" defaultValue={banner?.is_live ? 'true' : 'false'} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none">
              <option value="false">Draft</option>
              <option value="true">Live</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Headline</label>
          <input name="headline" defaultValue={banner?.headline || ''} placeholder="Summer Sale — Up to 40% off" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Subtext</label>
          <textarea name="subtext" rows={2} defaultValue={banner?.subtext || ''} placeholder="Limited time offer on selected items" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">CTA Label</label>
            <input name="ctaLabel" defaultValue={banner?.cta_label || ''} placeholder="Shop Now" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">CTA URL</label>
            <input name="ctaUrl" defaultValue={banner?.cta_url || ''} placeholder="/shop" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Starts At</label>
            <input name="startsAt" type="datetime-local" defaultValue={banner?.starts_at?.slice(0, 16) || ''} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Ends At</label>
            <input name="endsAt" type="datetime-local" defaultValue={banner?.ends_at?.slice(0, 16) || ''} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-ink-black text-ivory-mist px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function BannerManager({ banners }: { banners: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Content & Banners</h1>
        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="bg-ink-black text-ivory-mist px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors"
          >
            Add Banner
          </button>
        )}
      </div>

      {showNew && <BannerForm onClose={() => setShowNew(false)} />}

      {banners.length === 0 && !showNew ? (
        <div className="bg-ivory-mist border border-ink-black p-8 text-center text-sm text-ink-black/60">
          No banners found. Create one above.
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner: any) => (
            <div key={banner.id}>
              {editingId === banner.id ? (
                <BannerForm banner={banner} onClose={() => setEditingId(null)} />
              ) : (
                <div className="bg-ivory-mist border border-ink-black p-6 flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="border border-ink-black/30 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                        {banner.placement.replace(/_/g, ' ')}
                      </span>
                      <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${
                        banner.is_live ? 'border-green-800 text-green-800' : 'border-ink-black/40 text-ink-black/40'
                      }`}>
                        {banner.is_live ? 'Live' : 'Draft'}
                      </span>
                      {banner.starts_at && (
                        <span className="text-[10px] text-ink-black/50">
                          {new Date(banner.starts_at).toLocaleDateString()} — {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString() : '∞'}
                        </span>
                      )}
                    </div>
                    {banner.headline && <div className="font-bold text-lg">{banner.headline}</div>}
                    {banner.subtext && <p className="text-sm text-ink-black/70">{banner.subtext}</p>}
                    {banner.cta_label && (
                      <div className="text-xs text-ink-black/50">
                        CTA: <span className="font-bold">{banner.cta_label}</span> → {banner.cta_url || '—'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 ml-4 shrink-0">
                    <button
                      onClick={() => setEditingId(banner.id)}
                      className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
