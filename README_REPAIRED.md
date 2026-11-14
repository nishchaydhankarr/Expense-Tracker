# Expense Tracker — repaired frontend

This repair keeps the original project files and reusable components in place, but replaces the incomplete React entry point with a self-contained working frontend. The supplied GitHub ZIP had truncated source files (including App.jsx and several components), so those broken fragments are retained but are no longer imported by the working app.

## Run on Windows
1. Install Node.js 22 LTS (Node 20.19+ is also suitable for Vite 7).
2. Open a terminal in `frontend`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the localhost URL printed by Vite.

## Features in this repaired frontend
- Dashboard with balance, income and expense totals
- Add, edit and delete income/expense transactions
- Category spending breakdown
- Search and filter transactions
- CSV export
- Profile page and clear-data option
- Browser localStorage persistence

## Important limitation
The backend folder in the supplied archive is also incomplete and has no package.json or server entry point. This repaired version therefore runs as a frontend-only demo and stores data in the current browser. It does not provide real user accounts, cloud sync, or MongoDB persistence. Do not enter sensitive financial information.
