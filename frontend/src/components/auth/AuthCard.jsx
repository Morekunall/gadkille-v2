const inputClass =
  'w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2.5 text-sm text-gray-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const buttonClass =
  'mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60';

function AuthCard({ title, subtitle, children, footer }) {
  const hasHeader = Boolean(title || subtitle);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-soft">
        {hasHeader && (
          <div className="bg-gradient-to-br from-primary/10 via-softBg to-accent/10 px-6 py-5 sm:px-8">
            {title ? (
              <h1 className="text-xl font-semibold tracking-tight text-primaryDark sm:text-2xl">{title}</h1>
            ) : null}
            {subtitle ? (
              <p className={`text-sm text-gray-600 ${title ? 'mt-1.5' : ''}`}>{subtitle}</p>
            ) : null}
          </div>
        )}
        <div className={hasHeader ? 'px-6 py-6 sm:px-8' : 'px-6 py-8 sm:px-8'}>{children}</div>
        {footer ? (
          <div className="border-t border-gray-100 bg-softBg/40 px-6 py-4 text-center text-sm text-gray-600 sm:px-8">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { AuthCard as default, inputClass, labelClass, buttonClass };
