import { formatInr } from '../../lib/trekPricing';

const SIZE_CLASSES = {
  xs: 'text-xs font-semibold',
  sm: 'text-sm font-semibold',
  base: 'text-base font-bold',
};

/** Original price with a diagonal red slash (e-commerce style). */
export default function CrossedPrice({ amount, size = 'xs', className = '' }) {
  return (
    <span className={`relative inline-block text-primaryDark ${SIZE_CLASSES[size] || SIZE_CLASSES.xs} ${className}`}>
      ₹{formatInr(amount)}
      <span
        className="pointer-events-none absolute inset-x-[-6%] top-1/2 h-[2px] -translate-y-1/2 rotate-[-14deg] bg-red-500"
        aria-hidden
      />
    </span>
  );
}
