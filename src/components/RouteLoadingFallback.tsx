import { motion } from 'framer-motion';

export default function RouteLoadingFallback() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 select-none">
      <div className="relative w-16 h-16 flex items-center justify-center mb-4">
        {/* Orbit Pulse Ring */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-[#6D5EF5]/40"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-transparent border-t-[#6D5EF5] border-r-[#10B981]"
        />
        <div className="absolute w-4 h-4 rounded-full bg-[#6D5EF5]/20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]" />
        </div>
      </div>
      <p className="text-xs font-mono text-[var(--text-muted)] animate-pulse tracking-wide">
        CALIBRATING MULTI-AGENT RUNTIME...
      </p>
    </div>
  );
}
