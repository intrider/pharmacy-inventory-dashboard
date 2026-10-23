# PharmaFlow

PharmaFlow is a React inventory dashboard for pharmacy stock control and multi-store medicine transfers. It is a frontend-only demo that persists data in the browser with `localStorage`.

## Features

- Dashboard statistics calculated from live inventory and transfer records
- Medicine inventory CRUD with search, category/store filters, and validation
- Low-stock highlighting plus expired and soon-to-expire lot indicators
- Store-wise batch balances for Main Store, OP Pharmacy, and IP Pharmacy
- Stock transfers with pending/completed workflow and business-rule checks
- Transfer history with search and store/status filters
- Toast notifications, confirmation dialogs, and a responsive admin layout

## Tech stack

- React 19 + Vite
- JavaScript (ES6+)
- HTML5 / CSS3 (no Tailwind)
- Lucide React icons
- Browser `localStorage`
- Vercel-ready static build

## Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

Sample medicines, lots, and transfers load automatically the first time the app runs. Later visits reuse saved browser data. To restore the demo dataset, clear `pharmaflow-data-v1` from Application → Local Storage, then refresh.

## Limitations

- There is no backend, authentication, or multi-user sync.
- Data lives only in the current browser.
- Transfer workflow is limited to Pending and Completed.
- This is a screening/demo application, not a clinical production system.

## Publish source code on GitHub

1. Create a new GitHub repository (for example `pharmaflow`).
2. In the project folder:

```bash
git init
git add .
git commit -m "Add PharmaFlow pharmacy inventory dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/pharmaflow.git
git push -u origin main
```

Do not commit `node_modules` or `dist`. They are already listed in `.gitignore`.

## Deploy on Vercel

1. Push the project to GitHub.
2. Sign in at [vercel.com](https://vercel.com) and import the repository.
3. Keep the default Vite settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. Vercel will host the static `dist` folder.

CLI alternative after installing Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Testing checklist

- [ ] Dashboard totals match inventory lots and pending transfers
- [ ] Add a medicine with valid values and see it in Inventory
- [ ] Reject empty required fields, negative prices, and invalid quantities
- [ ] Edit a lot and confirm the table updates
- [ ] Delete a lot only after confirmation
- [ ] Search by medicine name/ID and filter by category and store
- [ ] Low-stock, expired, and soon-to-expire rows are visually distinct
- [ ] Create a pending transfer without changing stock
- [ ] Completing a transfer decreases source stock and increases destination stock by the same quantity
- [ ] Completing the same transfer twice is blocked
- [ ] Expired batches and oversize quantities cannot be transferred
- [ ] Source and destination stores must be different
- [ ] Transfer History search and filters work
- [ ] Refresh the browser and confirm data is still present
- [ ] Layout remains usable on desktop, tablet, and mobile widths
