import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, ShieldAlert } from 'lucide-react';
import Container from '../components/Container';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({
    title: '404 - Not Found',
    description: 'The requested artifact or page could not be located in the VERITAS-V verification space.',
  });

  return (
    <Container size="narrow" className="py-24 text-center select-none">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-mono text-[#F43F5E] mb-6">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>UNVERIFIED ROUTE TARGET</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight mb-4">
        404 <span className="text-[#6D5EF5]">·</span> Signal Lost
      </h1>

      <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
        The requested trajectory does not exist in the causal graph. The link may be broken, or the verification artifact has been relocated.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold text-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-xs hover:border-[#6D5EF5] transition-colors"
        >
          <Compass className="w-4 h-4 text-[#6D5EF5]" />
          <span>Open Dashboard</span>
        </Link>
      </div>
    </Container>
  );
}
