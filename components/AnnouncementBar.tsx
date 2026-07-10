/**
 * Site-wide top message strip — full-width brand-red band.
 * The color band itself is the container; no padding wrapper, no border.
 */
export default function AnnouncementBar() {
  return (
    <div className="bg-brand-red text-ink-black w-full text-center">
      <p className="caption py-[9px] px-5">
        Complimentary hand-finished gift wrap on every order · Made to order in
        small batches in Pakistan
      </p>
    </div>
  );
}
