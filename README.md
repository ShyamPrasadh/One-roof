# One Roof Building Solutions — online store

Customer app (mobile-first, installable web app) and admin app, in one Next.js project.

- Customer: `/` (shop), `/product/[id]`, `/cart`, `/checkout`, `/orders`, `/login`, `/register`
- Admin: `/admin` (sign in at `/admin/login`) — dashboard, orders, products & stock, settings
- Invoice: `/invoice/[id]` — GST invoice, print or save as PDF from the browser

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Default admin login (change it before going live):

- Phone: `9999999999`
- Password: `admin@123`

Set these before the first run to use your own values: `ADMIN_PHONE`, `ADMIN_PASSWORD`, `SESSION_SECRET`.

## Current state

Implemented: catalogue with categories and search, stock that goes down on order and comes back on cancel,
retail and contractor accounts (phone + password, optional GSTIN), cart, checkout with cash on delivery,
distance-based delivery fee with minimum order (delivery only, pickup has none), GST breakdown
(CGST/SGST within Tamil Nadu, IGST otherwise), GST invoices, order status tracking, admin
order/product/stock/settings management.

Still to connect or set:

- **Database:** data is stored in `data/db.json` for now (git-ignored). Supabase is the planned
  database for production; `src/lib/store.ts` is the only file that needs to change.
- **Online payment:** Razorpay is not connected. The option is shown as "coming soon".
- **Store location:** `Settings → Store latitude/longitude` is an approximate placeholder. Set the exact location.
- **Delivery pricing:** base ₹40, ₹10/km, minimum ₹500 and 25 km maximum are placeholders. Change them in Settings.
- **Products:** the six products in the seed data are samples. Replace prices, GST rates and HSN codes.
- **App icons:** the web app manifest has no icons yet, so the "install" prompt needs icon files added.
