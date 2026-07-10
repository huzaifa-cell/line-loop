/**
 * LINE&LOOP — Journal entries (editorial long-form content).
 *
 * Static data; will move to a file-based or Supabase store when the admin
 * dashboard lands. Shaped for easy migration: id, slug, title, excerpt, body,
 * coverImage, author, date, tags.
 */

export interface JournalEntry {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  coverImage: string;
  author: string;
  date: string;
  tags: string[];
}

export const journalEntries: JournalEntry[] = [
  {
    id: "j01",
    slug: "the-sixteen-stages-of-ajrakh",
    title: "The Sixteen Stages of Ajrakh",
    excerpt:
      "A single piece of Ajrakh cloth moves through sixteen dye stages — each one a layer of meaning pressed into the fibre by hand.",
    body: [
      "Ajrakh is not a print. It is a conversation between cloth, dye, and time. A single length of cloth can move through sixteen separate stages — each one adding, resisting, or revealing colour — before it is finished. The Khatri families of Sindh have practiced this conversation for generations, and we are honoured to work with them.",
      "The process begins with raw cotton or silk, washed in the river to remove starch and impurities. Then comes the first resist — a hand-carved teak block dipped in a lime-and-gum paste, pressed firmly onto the cloth. Where the paste lands, no dye will take. This is the skeleton of the pattern.",
      "Next, the first dye bath — indigo, the oldest dye known to humanity. The cloth is plunged, held, and drawn out to oxidise from yellow-green to the deep blue that gives Ajrakh its name (azrakh, from the Arabic for blue). Then a second resist, a mordant print, a madder bath for red, another resist, another wash. Each stage is a deliberate layer.",
      "Between every dye bath, the cloth is dried in the sun, washed in the river, and beaten against stone to set the colour. The rhythm is slow — a single complex Ajrakh can take three weeks to complete. There are no shortcuts. The cloth knows when it is rushed.",
      "What emerges is a pattern that lives in the fibre itself — not on top of it, but inside it. The blues are deep where the indigo layered, the reds are warm where the madder took, and the whites are the negative space of the resist. It is a record of every hand that touched it, every stage it passed through.",
      "When you wear an Ajrakh piece from LINE&LOOP, you are wearing that record. Sixteen stages. Three weeks. Four generations of knowledge. And the patient, deliberate hands of the Khatri families who made it.",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80",
    author: "The LINE&LOOP Studio",
    date: "2026-06-15",
    tags: ["ajrakh", "block-print", "natural-dye", "process"],
  },
  {
    id: "j02",
    slug: "chikankari-the-quiet-embroidery",
    title: "Chikankari: The Quiet Embroidery",
    excerpt:
      "Lucknowi chikankari is embroidery that whispers. No mirrors, no sequins — just white thread on white cloth, building texture through shadow.",
    body: [
      "Chikankari is the art of restraint. It does not announce itself. There are no mirrors, no sequins, no gold thread. Just white cotton thread on white cotton cloth, building texture through shadow and negative space.",
      "The embroidery begins with a block-printed outline on the cloth — a guide that will wash away once the stitching is done. The artisan then works through the pattern using a variety of stitches, each chosen for its texture: the flat, smooth ranmahal; the delicate murri, which forms a tiny rice-grain shape; the jali, or net, which creates an open lattice by drawing threads from the fabric itself.",
      "A single chikankari panel can take a week or more, depending on the density of the pattern. The artisan holds the cloth stretched over a small wooden hoop in one hand, and the needle moves in small, precise movements that are almost invisible to the casual observer. The work demands patience and a steady hand — the thread is fine, the stitches are small, and there is no room for error.",
      "What makes chikankari special is not technical complexity alone — it is the relationship between the embroidery and the cloth. The stitches create a texture that is felt before it is seen. Shadow-work, or bakhia, is stitched from the back of the cloth so that the design appears as a delicate shadow on the front. The cloth becomes its own light.",
      "At LINE&LOOP, we work with a collective of chikankari artisans in Lucknow who have been practicing this craft for generations. Each piece is embroidered by hand, one stitch at a time, on soft mulmul cotton. The result is a garment that is quiet, considered, and deeply personal — the kind of piece that improves with wear.",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1583391733981-3d1c0e9a8d9e?auto=format&fit=crop&w=2000&q=80",
    author: "The LINE&LOOP Studio",
    date: "2026-05-28",
    tags: ["chikankari", "embroidery", "process"],
  },
  {
    id: "j03",
    slug: "why-we-make-to-order",
    title: "Why We Make to Order",
    excerpt:
      "We don't keep stock. Every piece is cut and stitched after you order it. Here's why — and what it means for you.",
    body: [
      "When you place an order with LINE&LOOP, nothing happens immediately — at least, nothing you can see. There is no warehouse shelf with your size already on it. Instead, your order travels to our atelier, where the cloth is cut, the seams are stitched, and the finishing is done by hand. Then it ships.",
      "This takes longer. We tell you 7–10 working days, and we mean it. But the trade-off is worth it, and here's why.",
      "First, nothing is wasted. In conventional fashion, brands produce in bulk — guessing what will sell, producing thousands of units, and marking down or destroying what doesn't move. We produce exactly what is ordered. The cloth we buy is the cloth we use. The offcuts become smaller pieces, or are saved for repairs.",
      "Second, the quality is higher. When a garment is made to order, the tailor knows it has a name attached. They are not stitching for a warehouse — they are stitching for you. The seams are checked, the fit is verified, and the finish is deliberate. There is no rush, because there is no production quota.",
      "Third, it keeps the work with the makers. Made-to-order means our artisans have steady, predictable work rather than seasonal spikes and layoffs. They are paid fairly, year-round, for work that is valued. This is not charity — it is simply a better model.",
      "We know the wait can feel long. But we believe that a garment made slowly, by someone who knows your name, is worth it. And we think you'll feel the difference the moment you put it on.",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1599391443912-70916ab4f977?auto=format&fit=crop&w=2000&q=80",
    author: "The LINE&LOOP Studio",
    date: "2026-05-10",
    tags: ["made-to-order", "sustainability", "craft"],
  },
  {
    id: "j04",
    slug: "the-truth-about-natural-dyes",
    title: "The Truth About Natural Dyes",
    excerpt:
      "Natural dyes are not a marketing claim. They are unpredictable, labour-intensive, and they change with time. That's the point.",
    body: [
      "Natural dyes are fashionable now. Brands mention them in marketing copy, and consumers associate them with sustainability and authenticity. But the truth about natural dyes is more complicated — and more interesting — than a label.",
      "A natural dye is any colour derived from a plant, mineral, or insect source. Indigo from the indigofera plant. Madder red from the root of the madder plant. Maroon from logwood. Yellow from turmeric or pomegranate rind. These dyes have been used for millennia, long before synthetic aniline dyes were invented in the 1850s.",
      "What makes natural dyes difficult is their unpredictability. The same indigo plant can produce different shades of blue depending on the soil it grew in, the weather during the growing season, and the age of the dye vat. A madder bath that yields a deep red in one batch might produce a softer terracotta in the next. The dyer must work with the material, not against it.",
      "This unpredictability is also what makes natural dyes beautiful. A synthetic dye produces a flat, uniform colour — every metre identical. A natural dye produces a colour with depth and variation, with subtle shifts in tone that reveal the hand of the dyer. No two pieces are exactly alike.",
      "Natural dyes also change with time. Indigo fades gently with washing and sunlight — not to a paler blue, but to a softer, more complex one. Madder settles into a warmer, earthier red. This is not wear; it is character. The cloth is alive, and it ages the way wood ages — gaining depth rather than losing it.",
      "At LINE&LOOP, we use natural dyes because we believe in this character. We don't promise uniformity. We promise that your garment will be unique, that its colour will evolve, and that the hands that dyed it knew what they were doing. That, to us, is the whole point.",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1564257577154-757c5c3d8e8d?auto=format&fit=crop&w=2000&q=80",
    author: "The LINE&LOOP Studio",
    date: "2026-04-22",
    tags: ["natural-dye", "sustainability", "process"],
  },
];

export function getJournalEntries(): JournalEntry[] {
  return journalEntries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getJournalEntry(slug: string): JournalEntry | undefined {
  return journalEntries.find((e) => e.slug === slug);
}
