import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import './ScrollToTopButton.css';

const SCROLL_THRESHOLD = 300;

function getScrollPosition(target) {
  return target === window
    ? window.scrollY || document.documentElement.scrollTop || 0
    : target.scrollTop;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function ScrollToTopButton({ scrollTargetRef, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = scrollTargetRef?.current || window;
    const updateVisibility = () => {
      setIsVisible(getScrollPosition(target) > SCROLL_THRESHOLD);
    };

    target.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    return () => target.removeEventListener('scroll', updateVisibility);
  }, [scrollTargetRef]);

  const scrollToTop = () => {
    const target = scrollTargetRef?.current || window;
    target.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className={`scroll-top-btn ${className}`.trim()}
      aria-label="Volver arriba"
      title="Volver arriba"
      onClick={scrollToTop}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
