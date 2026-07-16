require('dotenv').config();

const API_BASE = (process.env.PATCH_API_URL || 'https://gadkille-backend-clean.onrender.com/api').replace(
  /\/$/,
  ''
);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.PATCH_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.PATCH_ADMIN_PASSWORD;
const slug = process.argv[2] || 'harishchandragad-fort';
const originalPrice = Number(process.argv[3] || 1500);

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

async function run() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env (or PATCH_* vars).');
    process.exit(1);
  }
  if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
    console.error('Usage: node src/scripts/patchTrekOriginalPriceViaApi.js [slug] [originalPrice]');
    process.exit(1);
  }

  console.log(`API: ${API_BASE}`);
  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });

  const token = login.token;
  const treks = await request('/trips?all=true', { token });
  const trek = treks.find((item) => item.slug === slug);

  if (!trek) {
    console.error(`Trek not found for slug: ${slug}`);
    process.exit(1);
  }

  const updated = await request(`/trips/${trek._id}`, {
    method: 'PUT',
    token,
    body: { originalPrice },
  });

  console.log(`Updated "${updated.title}" (${updated.slug})`);
  console.log(`  pricePerPerson: ${updated.pricePerPerson}`);
  console.log(`  originalPrice: ${updated.originalPrice ?? '(missing — deploy latest backend first)'}`);

  if (Number(updated.originalPrice) !== originalPrice) {
    console.error('originalPrice was not persisted. Deploy the latest backend on Render, then run again.');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
