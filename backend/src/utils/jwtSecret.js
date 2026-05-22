/**
 * Single source of truth for signing/verifying JWTs (trim + strip UTF-8 BOM).
 * Render / .env paste often adds a BOM or stray newline — raw vs trimmed broke Google OAuth state.
 */
const getAuthJwtSecret = () => {
  const v = process.env.JWT_SECRET;
  if (typeof v !== 'string') return '';
  return v.trim().replace(/^\uFEFF/, '').replace(/\uFEFF/g, '');
};

module.exports = { getAuthJwtSecret };
