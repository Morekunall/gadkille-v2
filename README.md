## Gadkille – Fort Tourism MERN Starter

Modern MERN-based fort tourism platform: discover historic forts, view routes, book stays/guides/vehicles, and manage everything via user and admin dashboards.

### Folder structure

- **backend** – Node/Express API with MongoDB (Mongoose), JWT auth, bcrypt, forts CRUD
- **frontend** – Vite + React + React Router + Tailwind UI, auth context, UI context, multilingual toggle

### Backend setup

1. `cd backend`
2. Install deps: `npm install`
3. Create `.env` (next to `package.json`):

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=gadkille
JWT_SECRET=your_strong_secret_here
CLIENT_URL=http://localhost:5173
```

4. Run dev server: `npm run dev`

Key files:

- `src/server.js` – Express app, CORS, routes
- `src/config/db.js` – Mongo connection
- `src/models` – `User`, `Fort`, `Booking`, `Vendor`
- `src/routes/authRoutes.js` – register/login (JWT + bcrypt)
- `src/routes/fortRoutes.js` – public fort listing + admin CRUD
- `src/middleware/authMiddleware.js` – `protect` + `adminOnly`

**Admin user:** for now, create one manually in MongoDB with `role: 'admin'` or update a user document; logging in with that account gives access to `/admin` routes in the UI and `/api/forts` admin endpoints.

### Frontend setup

1. `cd frontend`
2. Install deps: `npm install`
3. Create `.env` file:

```bash
VITE_API_URL=http://localhost:5000/api
```

4. Run dev server: `npm run dev` (default `http://localhost:5173`)

Key front-end pieces:

- Tailwind/theme: `tailwind.config.js`, `index.css` (primary colors, soft background, shadows)
- Routing: `src/App.jsx` with routes for home, fort details, auth, user/admin dashboards
- State:
  - `src/context/AuthContext.jsx` – JWT auth, login/register/logout, axios defaults
  - `src/context/UiContext.jsx` – English/Marathi toggle, toast notifications
- Layout:
  - `src/components/layout/Navbar.jsx` – premium nav, language switch, login/register, dashboard links
  - `src/components/layout/Footer.jsx`
  - `src/components/layout/Layout.jsx` – wraps pages + global toast
- Routing guard: `src/components/routing/ProtectedRoute.jsx` – user and admin-only protection
- Pages:
  - `src/pages/HomePage.jsx` – hero with fort imagery, search bar, featured fort cards
  - `src/pages/FortDetailsPage.jsx` – routes (bus/train/private/trek), facilities, placeholders for map & weather
  - `src/pages/auth/LoginPage.jsx` and `RegisterPage.jsx`
  - `src/pages/dashboard/UserDashboardPage.jsx` – placeholders for bookings, receipts, saved forts
  - `src/pages/dashboard/AdminDashboardPage.jsx` – placeholders for analytics, forts/vendors/users management

### Next steps / where to extend

- **Bookings:** create booking routes (CRUD) and connect them to dashboard UIs (stay/guide/vehicle forms with date pickers and availability).
- **Vendors:** expose CRUD endpoints for `Vendor` and attach to admin dashboard cards.
- **Map:** embed Google Maps or Mapbox in `FortDetailsPage` using `fort.mapCoordinates`.
- **Weather:** integrate a weather API (e.g., OpenWeather) and show real-time conditions for each fort.
- **SEO:** use React Helmet (or Vite plugins) for meta tags and fort-specific SEO-friendly URLs (`/fort/raigad-fort`).

