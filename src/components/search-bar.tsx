import React, { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const { searchQuery, setSearchQuery, searchStickers, isSearching } = useAppStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 500);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
    if (debouncedQuery) {
      searchStickers(debouncedQuery);
    }
  }, [debouncedQuery, setSearchQuery, searchStickers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-10">
      <div className="relative group">
        <div className={
          `absolute -inset-1 bg-gradient-to-r from-electric-violet to-electric-cyan rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200
           ${isSearching ? 'animate-pulse opacity-75' : ''}`
        }></div>
        <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <Search className="w-6 h-6 text-white/50 mr-4" />
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            placeholder="Describe the vibe..."
            className="w-full bg-transparent border-none outline-none text-xl text-white placeholder-white/30 font-light"
          />
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Sparkles className="w-6 h-6 text-electric-cyan animate-spin-slow" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
