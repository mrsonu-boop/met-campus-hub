# MET Campus Hub

Campus equipment exchange and academic repository for engineering students at
**MET BKC IOE**, following the SPPU curriculum.

A single-page dark-mode app in the Vercel signature aesthetic: rent, sell or
donate calculators, drafter sets, textbooks and lab kits with an on-campus
meetup spot; download faculty-verified unit-wise notes; ask an AI study
assistant about any unit; and confirm every physical handoff with a QR scan
plus a 4-digit PIN before escrow is released.

---

## Stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 15 (App Router, React 19)               |
| Language   | TypeScript (strict)                             |
| Styling    | Tailwind CSS v4 + custom CSS layers             |
| Icons      | `lucide-react`                                  |
| AI         | `@google/genai` → `gemini-2.5-flash`            |
| QR codes   | `qrcode.react`                                  |
| PDFs       | Dependency-free writer in `lib/pdf.ts`          |

---

## Getting started

```bash
npm install
cp .env.example .env.local     # add your Gemini key
npm run dev                    # http://localhost:3000
```

Get a free API key at <https://aistudio.google.com/app/apikey> and put it in
`.env.local`:

```env
GEMINI_API_KEY=your_key_here
```

`.env.local` is gitignored. The rest of the app works without a key — only the
AI drawer reports the failure, and it names the variable you need to set.

| Script          | Purpose                       |
| --------------- | ----------------------------- |
| `npm run dev`   | Dev server with fast refresh  |
| `npm run build` | Production build              |
| `npm start`     | Serve the production build    |
| `npm run lint`  | ESLint (`eslint-config-next`) |

---

## Features

### Gear Exchange

- 12 seeded MET BKC listings: calculators, mini drafters, Nirali/SPUU
  textbooks, lab coats.
- Category pills — All Items, Textbooks, Calculators, Drawing Drafters, Lab
  Coats — plus All / For Rent / For Sale / Free-Donation deal filters.
- Cards show price (`₹50/sem`, `₹200`, `FREE`), condition, seller, branch/year,
  campus meetup spot and relative timestamp.
- **Contact Seller** opens a dialog with the phone number, a `tel:` link and a
  pre-filled WhatsApp deep link.
- **List Resource** publishes a new listing straight into the grid with client
  side validation (title length, 10-digit phone, price rules for donations).

### Knowledge Vault & AI Assistant

- Note sets grouped by branch, semester, subject code and unit
  (e.g. *Data Structures & Algorithms — Unit 3 Trees & Graphs*).
- Every unit carries an upvote count, a faculty **or** topper verification tag,
  page count and size.
- **Download PDF** generates a real, spec-valid PDF 1.4 study pack client-side
  (`lib/pdf.ts` writes the xref table and byte offsets by hand) — no dead links.
- **Ask AI Assistant** opens a right-side drawer scoped to the selected unit. It
  posts to `/api/chat`, streams nothing but shows a typing state, and replays the
  last six turns so follow-up questions resolve. Replies render lightweight
  markdown (headings, bullets, numbering, `**bold**`).

### Verified Exchange & QR Handoff

- Transaction tracker filtered by status: Active, Verified, Disputed, All.
- Live QR code encoding the transaction, item, spot, slot and amount.
- 4-digit PIN verification: a wrong PIN explains what went wrong, a correct one
  flips the transaction to Verified, overlays the QR and releases escrow.
- Disputed transactions can be reopened back into the active queue.
- If a global filter leaves a status queue empty, the tab falls through to the
  next one with content so the list and QR panel never disagree.

### Global filters

Search (`Ctrl + K`), Branch and Year selects apply across **all three tabs**.
`Escape` clears the search.

---

## Project layout

```
app/
  layout.tsx            Root layout — Inter + JetBrains Mono, dark theme, metadata
  page.tsx              Single-page app: state, header, filters, tabs, overlays
  globals.css           Tailwind v4 theme tokens, base styles, card/utility layer
  api/chat/route.ts     Gemini 2.5 Flash endpoint (lazy client, 400/500 handling)
components/
  Header.tsx            Top bar, live badge, CTAs, search + branch/year filters
  GearExchange.tsx      Tab 1 — filters, card grid, empty states
  KnowledgeVault.tsx    Tab 2 — note sets, unit accordions, PDF downloads
  AiDrawer.tsx          Tab 2 — sliding AI chat drawer
  CampusExchange.tsx    Tab 3 — tracker, QR panel, PIN verification
  ContactModal.tsx      Seller contact dialog (+ shared SubmitButton)
  ListResourceModal.tsx New-listing dialog with validation
lib/
  types.ts              Shared domain types
  data.ts               Seed listings, note sets, transactions, filters
  ui.ts                 Category icons, badge styles, price + phone formatting
  pdf.ts                Minimal dependency-free PDF writer
.env.local              GEMINI_API_KEY (gitignored)
```

---

## Design system

| Token         | Value     | Usage                            |
| ------------- | --------- | -------------------------------- |
| Background    | `#09090b` | `bg-zinc-950`, page + body        |
| Card surface  | `#18181b` | `bg-zinc-900`, `.card`           |
| Hairline      | `#27272a` | `border-zinc-800`                |
| Text          | `#ffffff` | Headings                         |
| Secondary     | `#a1a1aa` | `text-zinc-400` metadata         |
| Accent        | `#34d399` | Emerald — available, rent, live  |
| AI highlight  | `#6366f1` / `#8b5cf6` | Indigo → violet gradients |

Radii are `12px` on cards. Type is Inter for UI and JetBrains Mono for IDs,
amounts, PINs and keyboard hints.

---

## API

`POST /api/chat`

```jsonc
{
  "message": "Walk me through AVL rotations",
  "context": "Data Structures & Algorithms (COMP3131) — Unit 3 Trees & Graphs",
  "history": [{ "role": "user", "text": "…" }, { "role": "model", "text": "…" }]
}
```

```jsonc
{ "text": "…" }        // 200
{ "error": "A question is required." }                 // 400, empty message
{ "error": "Failed to process study request" }         // 500
```

The `GoogleGenAI` client is constructed lazily inside the handler, so a missing
key surfaces as a clean 500 instead of breaking the build or the rest of the app.

---

## Notes

- All data is seeded in `lib/data.ts` and held in client state — there is no
  database. Wire the handlers in `app/page.tsx` to your API when you add one.
- Payments are simulated. The escrow step is UI + state only; do not treat it as
  a real payment integration.
- Contact details in the seed data are fictional.
