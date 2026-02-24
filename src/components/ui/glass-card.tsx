import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hoverEffect = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" } : undefined}
      whileTap={hoverEffect ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl transition-colors",
        hoverEffect && "cursor-pointer hover:border-white/20 hover:bg-white/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
