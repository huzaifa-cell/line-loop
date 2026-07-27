"use client";

import { useState } from "react";
import { saveShippingZone, saveTaxSetting } from "./actions";
import { useRouter } from "next/navigation";

export function ShippingZoneForm({ zone, onClose }: { zone?: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await saveShippingZone(formData);
      if (result.success) { onClose(); router.refresh(); }
      else alert(result.error);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-ink-black bg-ivory-mist p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest">{zone ? 'Edit Zone' : 'New Shipping Zone'}</h3>
        <button type="button" onClick={onClose} className="text-xs text-ink-black/60 hover:text-ink-black">✕</button>
      </div>
      <input type="hidden" name="zoneId" value={zone?.id || 'new'} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Zone Name *</label>
          <input name="name" required defaultValue={zone?.name || ''} placeholder="Pakistan Domestic" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Countries (comma-separated) *</label>
          <input name="countries" required defaultValue={zone?.countries?.join(', ') || ''} placeholder="PK, IN" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Flat Rate (Rs) *</label>
          <input name="flatRate" type="number" step="0.01" required defaultValue={zone?.flat_rate || ''} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Free Shipping Above (Rs)</label>
          <input name="freeShippingThreshold" type="number" step="0.01" defaultValue={zone?.free_shipping_threshold || ''} placeholder="Optional" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Status</label>
          <select name="isActive" defaultValue={zone?.is_active !== false ? 'true' : 'false'} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-ink-black text-ivory-mist px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 disabled:opacity-50">{loading ? 'Saving...' : 'Save Zone'}</button>
      </div>
    </form>
  );
}

export function TaxSettingForm({ tax, onClose }: { tax?: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await saveTaxSetting(formData);
      if (result.success) { onClose(); router.refresh(); }
      else alert(result.error);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-ink-black bg-ivory-mist p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest">{tax ? 'Edit Tax' : 'New Tax Setting'}</h3>
        <button type="button" onClick={onClose} className="text-xs text-ink-black/60 hover:text-ink-black">✕</button>
      </div>
      <input type="hidden" name="taxId" value={tax?.id || 'new'} />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Region *</label>
          <input name="region" required defaultValue={tax?.region || ''} placeholder="Punjab, Pakistan" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Tax Rate (%) *</label>
          <input name="ratePercent" type="number" step="0.01" required defaultValue={tax?.rate_percent || ''} placeholder="17" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Status</label>
          <select name="isActive" defaultValue={tax?.is_active !== false ? 'true' : 'false'} className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-ink-black text-ivory-mist px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 disabled:opacity-50">{loading ? 'Saving...' : 'Save Tax'}</button>
      </div>
    </form>
  );
}
