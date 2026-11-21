# ShopLedger

## Stack

- Node.js with CommonJS, Express 4, and body-parser for JSON requests.
- Static HTML, CSS, and vanilla JavaScript in `public/`, served by `server.js`.
- Synchronous JSON file storage in `data/db.json`. Shop, GST, and coupon settings live in `config.js`.

## Module map

- `routes/customers.js` lists Khata accounts and records settlements.
- `routes/orders.js` lists, retrieves, places, and cancels orders.
- `routes/products.js` lists and filters products and lists active coupons.
- `routes/reports.js` serves dashboard and GST reconciliation reports, pricing previews, and database export.
- `lib/coupons.js` normalizes codes, validates coupons, and computes discounts.
- `lib/dates.js` formats dates and provides date-key and fiscal-year helpers.
- `lib/inventory.js` looks up products, checks sellable stock, and handles stock updates and summaries.
- `lib/invoice.js` recalculates invoice figures and renders printable HTML.
- `lib/ledger.js` manages Khata balances, order debits and reversals, and settlements.
- `lib/orders.js` creates, retrieves, filters, and cancels order records.
- `lib/pricing.js` computes checkout totals, allocating coupon discounts before line-level GST.
- `lib/reports.js` computes dashboard metrics and compares invoice figures with stored order totals and tax.
- `lib/store.js` reads and writes the JSON database and maintains its audit log.
- `lib/tax.js` resolves GST rates and splits GST into CGST and SGST.

## Commands

- Start the app with `node server.js`.
- Run tests with `node --test`. The repository currently has no test files, and `npm test` is a failing placeholder.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the modules the ticket is about.
3. Tests use in-memory data and never read or write `data/db.json`.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed.

Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
