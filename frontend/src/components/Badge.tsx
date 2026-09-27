import React from 'react';
import { VerificationStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface BadgeProps {
  verdict: VerificationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerdictBadge: React.FC<BadgeProps> = ({
  verdict,
  size = 'md',
  showIcon = true,
}) => {
  const normVerdict = verdict.toLowerCase();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-mono tracking-wider',
    md: 'text-xs px-2.5 py-1 font-mono tracking-wider',
    lg: 'text-sm px-3 py-1.5 font-mono tracking-wider',
  };

  switch (normVerdict) {
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-semibold badge-verified ${sizeClasses[size]}`}
          title="Evidence confirmed by visual frame inspection"
        >
          {showIcon && <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          VERIFIED
        </span>
      );
    case 'contradicted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-semibold badge-contradicted ${sizeClasses[size]}`}
          title="Claim directly refuted by visual frame evidence (Hallucination Purged)"
        >
          {showIcon && <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          CONTRADICTED
        </span>
      );
    case 'unverified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-semibold badge-unverified ${sizeClasses[size]}`}
          title="Frames exist but claim details remain outside camera FOV or sensor range"
        >
          {showIcon && <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          UNVERIFIED
        </span>
      );
    case 'unverifiable':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-semibold badge-unverifiable ${sizeClasses[size]}`}
          title="Frame files missing or corrupted; mechanical check failed"
        >
          {showIcon && <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          UNVERIFIABLE
        </span>
      );
  }
};
