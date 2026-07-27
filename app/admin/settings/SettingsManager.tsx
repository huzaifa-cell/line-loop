"use client";

import { useState } from "react";
import { ShippingZoneForm, TaxSettingForm } from "./SettingsForms";
import { deleteShippingZone, deleteTaxSetting } from "./actions";
import { useRouter } from "next/navigation";

export function SettingsManager({ shippingZones, taxSettings }: { shippingZones: any[], taxSettings: any[] }) {
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [showNewZone, setShowNewZone] = useState(false);
  
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [showNewTax, setShowNewTax] = useState(false);

  const router = useRouter();

  const handleDeleteZone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping zone?")) return;
    try {
      await deleteShippingZone(id);
      router.refresh();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteTax = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tax setting?")) return;
    try {
      await deleteTaxSetting(id);
      router.refresh();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-12">
      {/* Shipping Zones */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-ink-black pb-4">
          <h2 className="text-xl font-bold tracking-tight">Shipping Zones</h2>
          {!showNewZone && (
            <button onClick={() => setShowNewZone(true)} className="bg-ink-black text-ivory-mist px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80">Add Zone</button>
          )}
        </div>

        {showNewZone && <ShippingZoneForm onClose={() => setShowNewZone(false)} />}

        <div className="bg-ivory-mist border border-ink-black">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-bold">Zone Name</th>
                <th className="px-6 py-4 font-bold">Countries</th>
                <th className="px-6 py-4 font-bold">Flat Rate</th>
                <th className="px-6 py-4 font-bold">Free Shipping Above</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-black/20">
              {shippingZones.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-ink-black/60">No shipping zones configured.</td></tr>
              ) : (
                shippingZones.map((zone: any) => (
                  editingZoneId === zone.id ? (
                    <tr key={zone.id}><td colSpan={6} className="p-0"><ShippingZoneForm zone={zone} onClose={() => setEditingZoneId(null)} /></td></tr>
                  ) : (
                    <tr key={zone.id} className={`hover:bg-warm-parchment/50 transition-colors ${!zone.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-bold">{zone.name}</td>
                      <td className="px-6 py-4 text-ink-black/70">{zone.countries.join(', ')}</td>
                      <td className="px-6 py-4 font-bold">Rs {Number(zone.flat_rate).toLocaleString()}</td>
                      <td className="px-6 py-4">{zone.free_shipping_threshold ? `Rs ${Number(zone.free_shipping_threshold).toLocaleString()}` : '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${zone.is_active ? 'border-green-800 text-green-800' : 'border-ink-black/40 text-ink-black/40'}`}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => setEditingZoneId(zone.id)} className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2">Edit</button>
                        <button onClick={() => handleDeleteZone(zone.id)} className="text-xs font-bold uppercase tracking-widest text-thread-red hover:underline underline-offset-2">Delete</button>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tax Settings */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-ink-black pb-4">
          <h2 className="text-xl font-bold tracking-tight">Tax Settings</h2>
          {!showNewTax && (
            <button onClick={() => setShowNewTax(true)} className="bg-ink-black text-ivory-mist px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80">Add Tax Setting</button>
          )}
        </div>

        {showNewTax && <TaxSettingForm onClose={() => setShowNewTax(false)} />}

        <div className="bg-ivory-mist border border-ink-black">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-bold">Region</th>
                <th className="px-6 py-4 font-bold">Tax Rate</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-black/20">
              {taxSettings.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-ink-black/60">No tax settings configured.</td></tr>
              ) : (
                taxSettings.map((tax: any) => (
                  editingTaxId === tax.id ? (
                    <tr key={tax.id}><td colSpan={4} className="p-0"><TaxSettingForm tax={tax} onClose={() => setEditingTaxId(null)} /></td></tr>
                  ) : (
                    <tr key={tax.id} className={`hover:bg-warm-parchment/50 transition-colors ${!tax.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-bold">{tax.region}</td>
                      <td className="px-6 py-4 font-bold">{Number(tax.rate_percent)}%</td>
                      <td className="px-6 py-4">
                        <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${tax.is_active ? 'border-green-800 text-green-800' : 'border-ink-black/40 text-ink-black/40'}`}>
                          {tax.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => setEditingTaxId(tax.id)} className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2">Edit</button>
                        <button onClick={() => handleDeleteTax(tax.id)} className="text-xs font-bold uppercase tracking-widest text-thread-red hover:underline underline-offset-2">Delete</button>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
