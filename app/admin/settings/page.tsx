import { getShippingZones, getTaxSettings } from "./actions";
import { SettingsManager } from "./SettingsManager";

export default async function AdminSettingsPage() {
  const [shippingZones, taxSettings] = await Promise.all([
    getShippingZones(),
    getTaxSettings()
  ]);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-black/60 mt-2">Manage shipping zones and tax rates for your store.</p>
      </div>

      <SettingsManager shippingZones={shippingZones} taxSettings={taxSettings} />
    </div>
  );
}
