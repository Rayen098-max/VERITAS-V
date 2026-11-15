import { useEffect } from 'react';

interface PageMetaOptions {
  title?: string;
  description?: string;
}

export function usePageMeta({ title, description }: PageMetaOptions = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} · VERITAS-V`
      : 'VERITAS-V · Explainable Agentic Video Hallucination Verification';

    document.title = fullTitle;

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }
  }, [title, description]);
}
