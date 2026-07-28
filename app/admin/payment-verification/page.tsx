import Link from "next/link";
import { getPendingBankTransfers, processBankTransfer } from "./actions";
import ScreenshotViewer from "./ScreenshotViewer";

export default async function PaymentVerificationPage() {
  const transfers = await getPendingBankTransfers();
  
  // Extract all hashes to find duplicates
  const hashes = transfers.map((t: any) => t.bank_transfer_screenshot_hash).filter(Boolean);
  const findDuplicates = (arr: string[]) => arr.filter((item, index) => arr.indexOf(item) !== index);
  const duplicateHashes = new Set(findDuplicates(hashes));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Payment Verification Queue</h1>
      </div>

      <div className="bg-ivory-mist border border-ink-black">
        <table className="w-full text-left text-sm">
          <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Order Number</th>
              <th className="px-6 py-4 font-bold">Customer</th>
              <th className="px-6 py-4 font-bold">Amount Due</th>
              <th className="px-6 py-4 font-bold">Reference / Screenshot</th>
              <th className="px-6 py-4 font-bold">Hold Expires</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-black/20">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-ink-black/60">
                  Queue is empty.
                </td>
              </tr>
            ) : (
              transfers.map((transfer: any) => {
                const customerEmail = transfer.profiles?.email || transfer.guest_email;
                const isDuplicate = duplicateHashes.has(transfer.bank_transfer_screenshot_hash);
                
                return (
                  <tr key={transfer.id} className="hover:bg-warm-parchment/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{transfer.order_number}</td>
                    <td className="px-6 py-4">{customerEmail}</td>
                    <td className="px-6 py-4 font-mono font-bold text-base">
                      Rs {transfer.bank_transfer_amount_due}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{transfer.bank_transfer_reference}</div>
                      <ScreenshotViewer path={transfer.bank_transfer_screenshot_path} />
                      {isDuplicate && (
                        <div className="mt-2 text-xs font-bold text-thread-red border border-thread-red px-2 py-1 uppercase inline-block">
                          Flag: Duplicate Image Upload
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60">
                        {new Date(transfer.payment_hold_expires_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <form className="inline" action={async () => {
                        "use server";
                        await processBankTransfer(transfer.id, 'approve');
                      }}>
                        <button type="submit" className="border border-ink-black bg-ink-black text-ivory-mist px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-ink-black/80">
                          Approve
                        </button>
                      </form>
                      <form className="inline" action={async () => {
                        "use server";
                        await processBankTransfer(transfer.id, 'reject');
                      }}>
                        <button type="submit" className="border border-thread-red bg-thread-red text-ivory-mist px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-thread-red/80">
                          Reject
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
