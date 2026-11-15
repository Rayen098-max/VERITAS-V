import { NavLink } from 'react-router-dom';
import { FileText, ExternalLink, ShieldCheck, GitBranch } from 'lucide-react';
import Container from './Container';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-default)] bg-[var(--bg-secondary)] mt-auto py-12 text-xs transition-colors">
      <Container size="default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-default)] bg-black flex items-center justify-center shadow-xs">
                <img src="/logo.webp" alt="VERITAS-V Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">
                  VERITAS-V
                </span>
                <span className="block text-[11px] text-[var(--text-muted)] font-mono">
                  Multi-Agent Video Hallucination Verification
                </span>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed max-w-md">
              An explainable agentic vision-language framework designed to transform passive video captioning into an audited causal reasoning chain with active frame-grounded hallucination defense.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[11px] font-mono text-[var(--text-secondary)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Built as a BE final-year project</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <NavLink to="/" className="text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  Home Overview
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  Audit Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/new-analysis" className="text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  New Video Verification
                </NavLink>
              </li>
              <li>
                <NavLink to="/pipeline" className="text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  Pipeline Architecture
                </NavLink>
              </li>
              <li>
                <NavLink to="/benchmarks" className="text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  Empirical Benchmarks
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  Research Specification
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Research & Resources */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Specification
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#6D5EF5]" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <NavLink to="/about" className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#6D5EF5] transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Technical Documentation</span>
                </NavLink>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Datasets: MSR-VTT, VideoHallucer</span>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Backends: Qwen2.5-VL / GPT-4o</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)] font-mono">
          <div>
            © {new Date().getFullYear()} VERITAS-V Framework · All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
              v1.0.0-prod
            </span>
            <span>Tabular metrics · Deterministic verification</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
