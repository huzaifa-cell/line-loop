"use client";

import { useState } from "react";
import { updateOrderStatus, addOrderNote } from "./actions";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-ink-black text-ink-black',
  confirmed: 'border-blue-700 text-blue-700',
  processing: 'border-amber-700 text-amber-700',
  shipped: 'border-purple-700 text-purple-700',
  delivered: 'border-green-800 text-green-800',
  cancelled: 'border-thread-red text-thread-red',
  return_requested: 'border-orange-600 text-orange-600',
  returned: 'border-ink-black/60 text-ink-black/60',
};

export function OrderStatusManager({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setLoading(true);
    try {
      await updateOrderStatus(orderId, status, note || undefined);
      setNote("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none flex-1"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="bg-ink-black text-ivory-mist px-5 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note for this status change (optional)"
        className="w-full bg-transparent border border-ink-black/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none"
      />
    </div>
  );
}

export function OrderNoteForm({ orderId }: { orderId: string }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setLoading(true);
    try {
      await addOrderNote(orderId, note);
      setNote("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add an internal note..."
        className="flex-1 bg-transparent border border-ink-black/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none"
      />
      <button
        type="submit"
        disabled={loading || !note.trim()}
        className="bg-ink-black text-ivory-mist px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Add Note'}
      </button>
    </form>
  );
}

export { STATUS_COLORS };
