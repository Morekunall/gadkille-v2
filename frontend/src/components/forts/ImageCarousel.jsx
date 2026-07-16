import { useCallback, useEffect, useState } from 'react';
import { useHorizontalSwipe } from '../../lib/useHorizontalSwipe';

export default function ImageCarousel({
  images = [],
  resolveUrl = (url) => url,
  alt = 'Gallery image',
  className = '',
  autoPlayMs = 5000,
  labels = { prev: 'Previous image', next: 'Next image', slide: 'View image' },
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const hasMultiple = count > 1;

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setIndex((prev) => (prev + 1) % count);
  }, [count, hasMultiple]);

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setIndex((prev) => (prev - 1 + count) % count);
  }, [count, hasMultiple]);

  const swipeHandlers = useHorizontalSwipe(goNext, goPrev);

  useEffect(() => {
    if (!hasMultiple || !autoPlayMs) return undefined;
    const id = window.setInterval(goNext, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, goNext, hasMultiple, index]);

  const currentUrl = resolveUrl(images[index] || images[0] || '');

  return (
    <div
      className={`relative overflow-hidden touch-pan-y select-none ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
    >
      <div
        className="absolute inset-0 cursor-grab bg-cover bg-center transition-all duration-500 active:cursor-grabbing"
        style={{ backgroundImage: currentUrl ? `url(${currentUrl})` : undefined }}
        {...(hasMultiple ? swipeHandlers : {})}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-lg text-white backdrop-blur-sm transition hover:bg-black/55 sm:flex"
            aria-label={labels.prev}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-lg text-white backdrop-blur-sm transition hover:bg-black/55 sm:flex"
            aria-label={labels.next}
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex max-w-[90%] -translate-x-1/2 flex-wrap justify-center gap-1.5 px-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className="flex h-6 w-6 items-center justify-center"
                aria-label={`${labels.slide} ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === index ? 'h-2 w-4 bg-white' : 'h-2 w-2 bg-white/50'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
